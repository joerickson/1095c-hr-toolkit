import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import WinTeamGuideClient from "./WinTeamGuideClient";

export default async function WinTeamGuidePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav userEmail={user.email} />
      <WinTeamGuideClient />
    </div>
  );
}
