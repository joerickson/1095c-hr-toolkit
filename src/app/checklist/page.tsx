import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import ChecklistClient from "./ChecklistClient";

export default async function ChecklistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Load settings for tax year display
  const { data: settings } = await supabase
    .from("app_settings")
    .select("tax_year, company_name")
    .single();

  const taxYear = settings?.tax_year ?? new Date().getFullYear();

  // Load user's progress
  const { data: progress } = await supabase
    .from("audit_checklist_progress")
    .select("*")
    .eq("user_id", user!.id)
    .eq("tax_year", taxYear);

  const completedKeys = new Set(
    (progress || [])
      .filter((p) => p.is_complete)
      .map((p) => p.checklist_item_key)
  );

  return (
    <AppLayout>
      <ChecklistClient
        initialCompleted={Array.from(completedKeys)}
        userId={user!.id}
        taxYear={taxYear}
        companyName={settings?.company_name ?? "RBM Services Inc."}
      />
    </AppLayout>
  );
}
