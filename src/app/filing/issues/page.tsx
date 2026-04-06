import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import IssuesClient from "./IssuesClient";

export default async function FilingIssuesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: issues } = await supabase
    .from("filing_issues")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: settings } = await supabase
    .from("app_settings")
    .select("tax_year")
    .single();

  return (
    <AppLayout>
      <IssuesClient
        userId={user!.id}
        initialIssues={issues ?? []}
        defaultTaxYear={settings?.tax_year ?? 2025}
      />
    </AppLayout>
  );
}
