import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import AuditChecklistClient from "./AuditChecklistClient";

export default async function AuditChecklistPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Load existing checklist state for this user
  const { data: states } = await supabase
    .from("user_checklist_states")
    .select("item_id, is_checked")
    .eq("user_id", user.id);

  const checkedIds = new Set(
    (states ?? []).filter((s) => s.is_checked).map((s) => s.item_id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav userEmail={user.email} />
      <AuditChecklistClient userId={user.id} initialCheckedIds={Array.from(checkedIds)} />
    </div>
  );
}
