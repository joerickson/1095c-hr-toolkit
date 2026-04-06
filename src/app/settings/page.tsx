import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AppLayout from "@/components/AppLayout";
import SettingsTabs from "./SettingsTabs";
import { redirect } from "next/navigation";
import type { UserWithAuth } from "./userActions";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/checklist");
  }

  const { data: settings } = await supabase
    .from("app_settings")
    .select("*")
    .single();

  // Fetch all users via admin client for User Management tab
  const adminClient = createAdminClient();

  const [profilesResult, authUsersResult] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: true }),
    adminClient.auth.admin.listUsers(),
  ]);

  const authMap = new Map(
    (authUsersResult.data?.users ?? []).map((u) => [u.id, u])
  );

  const users: UserWithAuth[] = (profilesResult.data ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    role: p.role,
    created_at: p.created_at,
    last_sign_in_at: authMap.get(p.id)?.last_sign_in_at ?? null,
  }));

  return (
    <AppLayout>
      <SettingsTabs settings={settings} userId={user!.id} users={users} />
    </AppLayout>
  );
}
