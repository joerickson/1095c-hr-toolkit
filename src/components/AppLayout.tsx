import Navigation from "./Navigation";
import EligibilityAlerts from "./EligibilityAlerts";
import { ToastProvider } from "./Toast";
import { IntlProvider } from "@/providers/IntlProvider";
import type { Language } from "@/providers/IntlProvider";
import { createClient } from "@/lib/supabase/server";
import type { EligibilityDashboardRow } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let userFullName: string | null = null;
  let alertRows: EligibilityDashboardRow[] = [];
  let navTaxYear = new Date().getFullYear();
  let navExtensionFiled = false;
  let preferredLanguage: Language = 'en';

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, preferred_language")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
    userFullName = profile?.full_name ?? null;
    if (profile?.preferred_language === 'es') {
      preferredLanguage = 'es';
    }

    // Load settings for nav deadline display
    const { data: navSettings } = await supabase
      .from("app_settings")
      .select("tax_year, extension_filed")
      .single();
    if (navSettings) {
      navTaxYear = navSettings.tax_year ?? navTaxYear;
      navExtensionFiled = navSettings.extension_filed ?? false;
    }

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
    <IntlProvider initialLanguage={preferredLanguage}>
      <ToastProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation
            userEmail={user?.email}
            userFullName={userFullName}
            isAdmin={isAdmin}
            taxYear={navTaxYear}
            extensionFiled={navExtensionFiled}
            initialLanguage={preferredLanguage}
          />
          {alertRows.length > 0 && <EligibilityAlerts rows={alertRows} />}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </ToastProvider>
    </IntlProvider>
  );
}
