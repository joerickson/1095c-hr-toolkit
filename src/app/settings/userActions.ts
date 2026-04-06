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

export interface AccessLogEntry {
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

export async function listUsers(): Promise<UserWithAuth[]> {
  await requireAdmin();

  const adminClient = createAdminClient();

  const [profilesResult, authUsersResult] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: true }),
    adminClient.auth.admin.listUsers(),
  ]);

  if (profilesResult.error) throw profilesResult.error;
  if (authUsersResult.error) throw authUsersResult.error;

  const authMap = new Map(
    (authUsersResult.data?.users ?? []).map((u) => [u.id, u])
  );

  return (profilesResult.data ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    role: p.role,
    created_at: p.created_at,
    last_sign_in_at: authMap.get(p.id)?.last_sign_in_at ?? null,
  }));
}

export async function changeUserRole(
  userId: string,
  newRole: "admin" | "hr_user"
): Promise<void> {
  const callerId = await requireAdmin();
  if (callerId === userId) throw new Error("Cannot change your own role");

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) throw error;
}

export async function resetUserPassword(email: string): Promise<void> {
  await requireAdmin();

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (error) throw error;
}

export async function removeUser(userId: string): Promise<void> {
  const callerId = await requireAdmin();
  if (callerId === userId) throw new Error("Cannot remove your own account");

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) throw error;
}

export async function inviteUser(
  email: string,
  fullName: string,
  role: "admin" | "hr_user"
): Promise<void> {
  await requireAdmin();

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name: fullName, role },
    }
  );

  if (error) throw error;

  // The handle_new_user() trigger creates the profile row but doesn't set role.
  // Update the profile to ensure correct role and full_name.
  if (data.user) {
    await adminClient
      .from("profiles")
      .update({ role, full_name: fullName })
      .eq("id", data.user.id);
  }
}

export async function getAccessLog(): Promise<AccessLogEntry[]> {
  await requireAdmin();

  const adminClient = createAdminClient();
  const entries: AccessLogEntry[] = [];

  // Wizard sessions
  const { data: wizardSessions } = await adminClient
    .from("wizard_sessions")
    .select("created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (wizardSessions) {
    for (const s of wizardSessions) {
      entries.push({
        user_name:
          (s.profiles as { full_name: string | null }[] | null)?.[0]?.full_name ??
          null,
        action: "Ran wizard",
        timestamp: s.created_at,
      });
    }
  }

  // Checklist completions
  const { data: checklistItems } = await adminClient
    .from("audit_checklist_progress")
    .select("completed_at, profiles(full_name)")
    .eq("is_complete", true)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(50);

  if (checklistItems) {
    for (const item of checklistItems) {
      entries.push({
        user_name:
          (item.profiles as { full_name: string | null }[] | null)?.[0]?.full_name ??
          null,
        action: "Completed checklist item",
        timestamp: item.completed_at as string,
      });
    }
  }

  entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return entries.slice(0, 50);
}

export async function updateProfileName(fullName: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (error) throw error;
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Users can only reset their own password
  if (user.email !== email) throw new Error("Unauthorized");

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (error) throw error;
}
