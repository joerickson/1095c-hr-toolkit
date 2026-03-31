import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import WizardClient from "./WizardClient";

export default async function WizardPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("app_settings")
    .select("*")
    .single();

  const { data: { user } } = await supabase.auth.getUser();

  // Recent sessions
  const { data: sessions } = await supabase
    .from("wizard_sessions")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <AppLayout>
      <WizardClient
        settings={settings}
        userId={user!.id}
        recentSessions={sessions || []}
      />
    </AppLayout>
  );
}
