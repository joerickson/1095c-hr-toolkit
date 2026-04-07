import AppLayout from "@/components/AppLayout";
import HrTasksClient from "./HrTasksClient";
import { getHrTaskProgress } from "@/app/actions/hr-tasks";

export default async function HrTasksPage() {
  const electionCount = await getHrTaskProgress("benefit_elections");

  return (
    <AppLayout>
      <HrTasksClient initialElectionCount={electionCount} />
    </AppLayout>
  );
}
