import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import FilingClient from "./FilingClient";

export default async function FilingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Load app settings (including extension_filed flag)
  const { data: settings } = await supabase
    .from("app_settings")
    .select("tax_year, company_name, extension_filed")
    .single();

  // Try to load filing phases — gracefully handle missing table
  let phases = null;
  let phasesError = false;
  try {
    const { data, error } = await supabase
      .from("filing_phases")
      .select("*")
      .order("phase_number");
    if (error) {
      // Check if table doesn't exist
      if (error.message?.includes("relation") || error.code === "42P01") {
        phasesError = true;
      }
    } else {
      phases = data;
    }
  } catch {
    phasesError = true;
  }

  // Try to load checklist progress
  let progress = null;
  if (!phasesError) {
    const { data } = await supabase
      .from("filing_checklist_progress")
      .select("*");
    progress = data;
  }

  // Try to load open issues count
  let blockingIssues = 0;
  let warningIssues = 0;
  let infoIssues = 0;
  if (!phasesError) {
    const { data: issues } = await supabase
      .from("filing_issues")
      .select("severity, status")
      .eq("status", "open");
    if (issues) {
      blockingIssues = issues.filter((i) => i.severity === "blocking").length;
      warningIssues = issues.filter((i) => i.severity === "warning").length;
      infoIssues = issues.filter((i) => i.severity === "informational").length;
    }
  }

  return (
    <AppLayout>
      <FilingClient
        userId={user!.id}
        initialPhases={phases}
        initialProgress={progress}
        tablesReady={!phasesError}
        blockingIssues={blockingIssues}
        warningIssues={warningIssues}
        infoIssues={infoIssues}
        defaultTaxYear={settings?.tax_year ?? 2025}
        extensionFiled={settings?.extension_filed ?? true}
      />
    </AppLayout>
  );
}
