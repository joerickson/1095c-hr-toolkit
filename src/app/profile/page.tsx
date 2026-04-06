import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/AppLayout";
import ProfileClient from "./ProfileClient";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <AppLayout>
      <ProfileClient
        userId={user.id}
        initialFullName={profile?.full_name ?? ""}
        email={user.email ?? ""}
        role={profile?.role ?? "hr_user"}
      />
    </AppLayout>
  );
}
