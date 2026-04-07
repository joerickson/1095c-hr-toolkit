import Navigation from "./Navigation";
import EligibilityAlerts from "./EligibilityAlerts";
import { ToastProvider } from "./Toast";
import AskMia from "./mia/AskMia";
import { createClient } from "@/lib/supabase/server";
import { IntlProvider } from "@/providers/IntlProvider";
import type { EligibilityDashboardRow } from "@/lib/types";
import type { Language } from "@/providers/IntlProvider";

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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name, preferred_language")
      .eq("id", user.id)
      .single();

    if (profile?.role) {
      // Primary query succeeded with valid role data
      isAdmin = profile.role === "admin";
      userFullName = profile.full_name ?? null;
      if (profile.preferred_language === 'es') preferredLanguage = 'es';
    } else {
      // Primary query returned no role — try without preferred_language.
      // This handles: column not yet added, RLS error, or any other failure.
      if (profileError) {
        console.error('[AppLayout] profile query error:', profileError.code, profileError.message, 'uid:', user.id);
      }
      const { data: basicProfile, error: basicError } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();
      if (basicError) {
        console.error('[AppLayout] fallback query error:', basicError.code, basicError.message, 'uid:', user.id);
      }
      isAdmin = basicProfile?.role === "admin";
      userFullName = basicProfile?.full_name ?? null;
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
          <Navigation userEmail={user?.email} userFullName={userFullName} isAdmin={isAdmin} taxYear={navTaxYear} extensionFiled={navExtensionFiled} initialLanguage={preferredLanguage} />
          {alertRows.length > 0 && <EligibilityAlerts rows={alertRows} />}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
        {user && (
          <AskMia
            taxYear={navTaxYear}
            language={preferredLanguage}
            userName={userFullName?.split(' ')[0] ?? undefined}
          />
        )}
      </ToastProvider>
    </IntlProvider>
  );
}
