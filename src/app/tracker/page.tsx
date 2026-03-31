import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import TrackerClient from "./TrackerClient";

export default async function TrackerPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: employees } = await supabase
    .from("employee_1095c_status")
    .select("*")
    .order("last_name");

  const { data: settings } = await supabase
    .from("app_settings")
    .select("tax_year, mec_monthly_premium, safe_harbor_method")
    .single();

  return (
    <AppLayout>
      <TrackerClient
        initialEmployees={employees || []}
        isAdmin={isAdmin}
        userId={user!.id}
        settings={settings}
      />
    </AppLayout>
  );
}
