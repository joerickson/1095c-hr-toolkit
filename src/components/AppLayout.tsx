import Navigation from "./Navigation";
import EligibilityAlerts from "./EligibilityAlerts";
import { ToastProvider } from "./Toast";
import { createClient } from "@/lib/supabase/server";
import type { EligibilityDashboardRow } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let alertRows: EligibilityDashboardRow[] = [];

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";

    // Fetch eligibility alerts — gracefully skip if table doesn't exist yet
    try {
      const { data } = await supabase
        .from("eligibility_dashboard")
        .select(
          "employee_id, full_name, warning_crossed_threshold, warning_offer_not_sent, warning_offer_expired, warning_approaching_threshold, in_admin_period, days_until_coverage_must_start, offer_deadline, offer_status"
        );
      if (data) alertRows = data as EligibilityDashboardRow[];
    } catch {
      // eligibility_module.sql not yet applied — no alerts shown
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation userEmail={user?.email} isAdmin={isAdmin} />
        {alertRows.length > 0 && <EligibilityAlerts rows={alertRows} />}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
