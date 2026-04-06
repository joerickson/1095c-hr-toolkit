import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import AccessClient from "./AccessClient";

interface Props {
  searchParams: Promise<{ year?: string }>;
}

export default async function AccessPage({ searchParams }: Props) {
  const { year: yearParam } = await searchParams;
  const taxYear = yearParam ? Number(yearParam) : 2025;

  const supabase = await createClient();

  // Load checklist progress (for assigned_to data)
  const { data: progress } = await supabase
    .from("filing_checklist_progress")
    .select("*")
    .eq("tax_year", taxYear);

  return (
    <AppLayout>
      <AccessClient taxYear={taxYear} initialProgress={progress ?? []} />
    </AppLayout>
  );
}
