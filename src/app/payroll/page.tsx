import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import PayrollClient from "./PayrollClient";
import type { EligibilityDashboardRow, Employee } from "@/lib/types";

export default async function PayrollPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  // Fetch eligibility dashboard (may not exist if migration not applied)
  let dashboardRows: EligibilityDashboardRow[] = [];
  try {
    const { data } = await supabase
      .from("eligibility_dashboard")
      .select("*")
      .order("full_name");
    if (data) dashboardRows = data as EligibilityDashboardRow[];
  } catch {
    // Migration not yet applied
  }

  // Fetch variable/part-time employees for hours entry
  const { data: variableEmployees } = await supabase
    .from("employees")
    .select("id, first_name, last_name, employee_type, employment_status")
    .in("employee_type", ["variable", "part_time", "seasonal"])
    .eq("employment_status", "active")
    .order("last_name");

  return (
    <AppLayout>
      <PayrollClient
        initialDashboard={dashboardRows}
        variableEmployees={(variableEmployees ?? []) as Pick<Employee, "id" | "first_name" | "last_name" | "employee_type" | "employment_status">[]}
        userId={user!.id}
      />
    </AppLayout>
  );
}
