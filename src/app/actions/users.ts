"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface UserWithAuth {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface ActivityLogEntry {
  user_name: string | null;
  action: string;
  timestamp: string;
}

async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");
  return user.id;
}

export async function getUsers(): Promise<{
  success: boolean;
  error?: string;
  data?: UserWithAuth[];
}> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const [profilesResult, authUsersResult] = await Promise.all([
      adminClient
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: true }),
      adminClient.auth.admin.listUsers(),
    ]);

    if (profilesResult.error) return { success: false, error: profilesResult.error.message };
    if (authUsersResult.error) return { success: false, error: authUsersResult.error.message };

    const authMap = new Map(
      (authUsersResult.data?.users ?? []).map((u) => [u.id, u])
    );

    const data: UserWithAuth[] = (profilesResult.data ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      role: p.role,
      created_at: p.created_at,
      last_sign_in_at: authMap.get(p.id)?.last_sign_in_at ?? null,
    }));

    return { success: true, data };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function changeUserRole(
  userId: string,
  newRole: "admin" | "hr_user"
): Promise<{ success: boolean; error?: string }> {
  try {
    const callerId = await requireAdmin();
    if (callerId === userId) return { success: false, error: "Cannot change your own role" };

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function resetUserPassword(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://rbmhr.com/auth/callback",
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function removeUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const callerId = await requireAdmin();
    if (callerId === userId) return { success: false, error: "Cannot remove your own account" };

    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function inviteUser(
  email: string,
  fullName: string,
  role: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    // Check if email already exists in profiles
    const { data: existing } = await adminClient
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) return { success: false, error: "This email already has an account" };

    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, role },
      redirectTo: "https://rbmhr.com/auth/callback",
    });

    if (error) return { success: false, error: error.message };

    if (data.user) {
      await adminClient
        .from("profiles")
        .update({ role, full_name: fullName })
        .eq("id", data.user.id);
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function getActivityLog(): Promise<{
  success: boolean;
  error?: string;
  data?: ActivityLogEntry[];
}> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();
    const entries: ActivityLogEntry[] = [];

    // Source 1: audit_checklist_progress
    try {
      const { data } = await adminClient
        .from("audit_checklist_progress")
        .select("checklist_item_key, completed_at, user_id, profiles!user_id(full_name)")
        .eq("is_complete", true)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(100);

      if (data) {
        for (const row of data) {
          entries.push({
            user_name: (row.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
            action: `Completed checklist item: ${(row as { checklist_item_key?: string }).checklist_item_key ?? ""}`,
            timestamp: (row as { completed_at: string }).completed_at,
          });
        }
      }
    } catch { /* table may not exist */ }

    // Source 2: filing_checklist_progress
    try {
      const { data } = await adminClient
        .from("filing_checklist_progress")
        .select("item_key, completed_at, user_id, profiles!user_id(full_name)")
        .eq("is_complete", true)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(100);

      if (data) {
        for (const row of data) {
          entries.push({
            user_name: (row.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
            action: `Completed filing step: ${(row as { item_key?: string }).item_key ?? ""}`,
            timestamp: (row as { completed_at: string }).completed_at,
          });
        }
      }
    } catch { /* table may not exist */ }

    // Source 3: wizard_sessions
    try {
      const { data } = await adminClient
        .from("wizard_sessions")
        .select("created_at, user_id, result_line14, profiles!user_id(full_name)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        for (const row of data) {
          const line14 = (row as { result_line14?: string | null }).result_line14;
          entries.push({
            user_name: (row.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
            action: `Ran code lookup wizard — Line 14: ${line14 ?? "?"}`,
            timestamp: row.created_at,
          });
        }
      }
    } catch { /* table may not exist */ }

    // Source 4: filing_issues created
    try {
      const { data } = await adminClient
        .from("filing_issues")
        .select("title, created_at, created_by, profiles!created_by(full_name)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        for (const row of data) {
          entries.push({
            user_name: (row.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
            action: `Logged issue: ${(row as { title?: string }).title ?? ""}`,
            timestamp: row.created_at,
          });
        }
      }
    } catch { /* table may not exist */ }

    // Source 5: filing_issues resolved
    try {
      const { data } = await adminClient
        .from("filing_issues")
        .select("title, resolved_at, resolved_by, profiles!resolved_by(full_name)")
        .not("resolved_at", "is", null)
        .order("resolved_at", { ascending: false })
        .limit(100);

      if (data) {
        for (const row of data) {
          const resolvedAt = (row as { resolved_at?: string | null }).resolved_at;
          if (resolvedAt) {
            entries.push({
              user_name: (row.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
              action: `Resolved issue: ${(row as { title?: string }).title ?? ""}`,
              timestamp: resolvedAt,
            });
          }
        }
      }
    } catch { /* table may not exist */ }

    entries.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return { success: true, data: entries.slice(0, 100) };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
