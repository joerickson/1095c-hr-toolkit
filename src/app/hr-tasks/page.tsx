import AppLayout from "@/components/AppLayout";
import { getHrTaskProgress } from "@/app/actions/hr-tasks";
import HrTasksClient from "./HrTasksClient";

export default async function HrTasksPage() {
  const electionsCompleted = await getHrTaskProgress("benefit_elections_completed");

  return (
    <AppLayout>
      <HrTasksClient initialElectionsCompleted={electionsCompleted} />
    </AppLayout>
  );
}
