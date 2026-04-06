import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import FilingEmployeesClient from "./FilingEmployeesClient";

export default async function FilingEmployeesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: settings } = await supabase
    .from("app_settings")
    .select("tax_year")
    .single();

  const taxYear = settings?.tax_year ?? 2025;

  // Load all employees from the tracker view
  const { data: employees } = await supabase
    .from("employee_1095c_status")
    .select("*")
    .order("last_name");

  // Load employee_filing_status rows for this year
  const { data: filingStatus } = await supabase
    .from("employee_filing_status")
    .select("*")
    .eq("tax_year", taxYear);

  return (
    <AppLayout>
      <FilingEmployeesClient
        userId={user!.id}
        taxYear={taxYear}
        initialEmployees={employees ?? []}
        initialFilingStatus={filingStatus ?? []}
      />
    </AppLayout>
  );
}
