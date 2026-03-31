import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import EmployeeEligibilityClient from "./EmployeeEligibilityClient";
import { notFound } from "next/navigation";
import type { Employee, MeasurementPeriod, PayPeriodHours, EligibilityEvent, OfferLetter } from "@/lib/types";

interface Props {
  params: { id: string };
}

export default async function EmployeeEligibilityPage({ params }: Props) {
  const supabase = await createClient();

  // Fetch employee
  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!employee) notFound();

  // Fetch measurement periods
  let measurementPeriods: MeasurementPeriod[] = [];
  let payPeriodHours: PayPeriodHours[] = [];
  let eligibilityEvents: EligibilityEvent[] = [];
  let offerLetters: OfferLetter[] = [];

  try {
    const [mpRes, pphRes, eeRes, olRes] = await Promise.all([
      supabase
        .from("measurement_periods")
        .select("*")
        .eq("employee_id", params.id)
        .order("measurement_start", { ascending: false }),
      supabase
        .from("pay_period_hours")
        .select("*")
        .eq("employee_id", params.id)
        .order("pay_period_start", { ascending: false })
        .limit(24),
      supabase
        .from("eligibility_events")
        .select("*")
        .eq("employee_id", params.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("offer_letters")
        .select("*")
        .eq("employee_id", params.id)
        .order("offer_date", { ascending: false }),
    ]);
    if (mpRes.data) measurementPeriods = mpRes.data as MeasurementPeriod[];
    if (pphRes.data) payPeriodHours = pphRes.data as PayPeriodHours[];
    if (eeRes.data) eligibilityEvents = eeRes.data as EligibilityEvent[];
    if (olRes.data) offerLetters = olRes.data as OfferLetter[];
  } catch {
    // Tables may not exist yet
  }

  return (
    <AppLayout>
      <EmployeeEligibilityClient
        employee={employee as Employee}
        measurementPeriods={measurementPeriods}
        payPeriodHours={payPeriodHours}
        eligibilityEvents={eligibilityEvents}
        offerLetters={offerLetters}
      />
    </AppLayout>
  );
}
