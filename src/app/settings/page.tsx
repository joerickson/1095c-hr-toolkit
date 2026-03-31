import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Check admin role
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

  return (
    <AppLayout>
      <SettingsClient settings={settings} userId={user!.id} />
    </AppLayout>
  );
}
