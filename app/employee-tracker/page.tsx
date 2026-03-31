import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import EmployeeTrackerClient from "./EmployeeTrackerClient";
import type { Employee } from "@/lib/types";

export default async function EmployeeTrackerPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .eq("user_id", user.id)
    .order("last_name", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav userEmail={user.email} />
      <EmployeeTrackerClient
        userId={user.id}
        initialEmployees={(employees ?? []) as Employee[]}
      />
    </div>
  );
}
