import { createClient } from "@/lib/supabase/server";
import { isAdminClientConfigured, createAdminClient } from "@/lib/supabase/admin";
import AppLayout from "@/components/AppLayout";
import AdminClient from "./AdminClient";
import Link from "next/link";
import type { UserWithAuth } from "@/app/actions/users";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Middleware handles this, but as a fallback
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-4">You need to be signed in to view this page.</p>
          <Link href="/login" className="btn-primary px-5">
            Sign In
          </Link>
        </div>
      </AppLayout>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="card p-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-500 mb-6">
              You need administrator access to view this page.
            </p>
            <Link href="/" className="text-navy-700 hover:underline text-sm">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const serviceKeyConfigured = isAdminClientConfigured();

  let initialUsers: UserWithAuth[] = [];
  if (serviceKeyConfigured) {
    try {
      const adminClient = createAdminClient();
      const [profilesResult, authUsersResult] = await Promise.all([
        adminClient
          .from("profiles")
          .select("id, full_name, email, role, created_at")
          .order("created_at", { ascending: true }),
        adminClient.auth.admin.listUsers(),
      ]);

      const authMap = new Map(
        (authUsersResult.data?.users ?? []).map((u) => [u.id, u])
      );

      initialUsers = (profilesResult.data ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        role: p.role,
        created_at: p.created_at,
        last_sign_in_at: authMap.get(p.id)?.last_sign_in_at ?? null,
      }));
    } catch {
      // Will show error state in client
    }
  }

  return (
    <AppLayout>
      <AdminClient
        currentUserId={user.id}
        initialUsers={initialUsers}
        serviceKeyConfigured={serviceKeyConfigured}
      />
    </AppLayout>
  );
}
