import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import OffersClient from "./OffersClient";
import type { EligibilityDashboardRow, OfferLetter } from "@/lib/types";

export default async function OffersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let queue: EligibilityDashboardRow[] = [];
  let allOffers: OfferLetter[] = [];

  try {
    // Employees who completed measurement as full-time and have not yet received an offer
    const { data: dashData } = await supabase
      .from("eligibility_dashboard")
      .select("*")
      .order("full_name");
    if (dashData) queue = dashData as EligibilityDashboardRow[];

    const { data: offersData } = await supabase
      .from("offer_letters")
      .select("*")
      .order("offer_date", { ascending: false });
    if (offersData) allOffers = offersData as OfferLetter[];
  } catch {
    // Migration not yet applied
  }

  return (
    <AppLayout>
      <OffersClient
        dashboardRows={queue}
        allOffers={allOffers}
        userId={user!.id}
      />
    </AppLayout>
  );
}
