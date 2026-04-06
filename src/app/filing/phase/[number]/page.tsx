import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import PhaseClient from "./PhaseClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ year?: string }>;
}

export default async function PhasePage({ params, searchParams }: Props) {
  const { number } = await params;
  const { year: yearParam } = await searchParams;

  const phaseNum = Number(number);
  if (![1, 2, 3, 4].includes(phaseNum)) notFound();

  const taxYear = yearParam ? Number(yearParam) : 2025;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Load user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  // Load phase info
  const { data: phase } = await supabase
    .from("filing_phases")
    .select("*")
    .eq("tax_year", taxYear)
    .eq("phase_number", phaseNum)
    .single();

  // Load checklist progress for this year
  const { data: progress } = await supabase
    .from("filing_checklist_progress")
    .select("*")
    .eq("tax_year", taxYear);

  return (
    <AppLayout>
      <PhaseClient
        userId={user!.id}
        userRole={profile?.role ?? "hr_user"}
        phaseNumber={phaseNum as 1 | 2 | 3 | 4}
        taxYear={taxYear}
        initialPhase={phase ?? null}
        initialProgress={progress ?? []}
      />
    </AppLayout>
  );
}
