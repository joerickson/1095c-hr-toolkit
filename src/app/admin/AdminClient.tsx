"use client";

import { Fragment, useState } from "react";
import { useToast } from "@/components/Toast";
import {
  changeUserRole,
  resetUserPassword,
  removeUser,
  inviteUser,
  getUsers,
  getActivityLog,
  type UserWithAuth,
  type ActivityLogEntry,
} from "@/app/actions/users";

type Tab = "users" | "invite" | "activity";

interface Props {
  currentUserId: string;
  initialUsers: UserWithAuth[];
  serviceKeyConfigured: boolean;
}

function getInitials(fullName: string | null, email: string | null): string {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName[0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

function Avatar({ fullName, email, size = 36 }: { fullName: string | null; email: string | null; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "#1a3a5c",
        fontSize: size * 0.36,
      }}
    >
      {getInitials(fullName, email)}
    </div>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminClient({
  currentUserId,
  initialUsers,
  serviceKeyConfigured,
}: Props) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [users, setUsers] = useState<UserWithAuth[]>(initialUsers);

  // Actions state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // Inline change-role confirmation per row
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string;
    newRole: "admin" | "hr_user";
  } | null>(null);
  // Remove confirmation modal
  const [removeConfirm, setRemoveConfirm] = useState<UserWithAuth | null>(null);

  // Invite tab
  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    role: "hr_user" as "admin" | "hr_user",
  });
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Activity log tab
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[] | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  async function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === "activity" && activityLog === null && !loadingActivity) {
      setLoadingActivity(true);
      const result = await getActivityLog();
      setLoadingActivity(false);
      if (result.success) {
        setActivityLog(result.data ?? []);
      } else {
        showToast("Failed to load activity log: " + result.error, "error");
        setActivityLog([]);
      }
    }
  }

  async function handleChangeRole(userId: string, newRole: "admin" | "hr_user") {
    setPendingRoleChange(null);
    setActionLoading(userId);
    const user = users.find((u) => u.id === userId);
    const result = await changeUserRole(userId, newRole);
    setActionLoading(null);
    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      const label = newRole === "admin" ? "Admin" : "HR User";
      showToast(`${user?.full_name || user?.email} is now ${label}`, "success");
    } else {
      showToast(result.error || "Failed to change role", "error");
    }
  }

  async function handleResetPassword(user: UserWithAuth) {
    if (!user.email) return;
    setActionLoading(user.id);
    const result = await resetUserPassword(user.email);
    setActionLoading(null);
    if (result.success) {
      showToast(`Password reset email sent to ${user.email}`, "success");
    } else {
      showToast(result.error || "Failed to send reset email", "error");
    }
  }

  async function handleRemoveUser() {
    if (!removeConfirm) return;
    const user = removeConfirm;
    setRemoveConfirm(null);
    setActionLoading(user.id);
    const result = await removeUser(user.id);
    setActionLoading(null);
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      showToast(`${user.full_name || user.email} has been removed`, "success");
    } else {
      showToast(result.error || "Failed to remove user", "error");
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
    setInviting(true);
    const result = await inviteUser(inviteForm.email, inviteForm.fullName, inviteForm.role);
    setInviting(false);
    if (result.success) {
      setInviteSuccess(inviteForm.email);
      setInviteForm({ fullName: "", email: "", role: "hr_user" });
      // Refresh user list
      const updated = await getUsers();
      if (updated.success && updated.data) setUsers(updated.data);
    } else {
      setInviteError(result.error || "Failed to send invitation");
    }
  }

  // Stats
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const hrCount = users.filter((u) => u.role === "hr_user").length;
  const invitedCount = users.filter((u) => !u.last_sign_in_at).length;

  const tabClass = (tab: Tab) =>
    `px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? "border-navy-600 text-navy-700"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage users, view activity, and configure access
        </p>
      </div>

      {/* Service key warning banner */}
      {!serviceKeyConfigured && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Setup Required</p>
              <p className="text-amber-700 text-sm mt-1">
                The <code className="bg-amber-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> environment variable is not configured.
              </p>
              <ol className="mt-2 text-sm text-amber-700 list-decimal list-inside space-y-0.5">
                <li>Go to Supabase → Settings → API</li>
                <li>Copy the <strong>service_role</strong> key</li>
                <li>
                  Add to <code className="bg-amber-100 px-1 rounded">.env.local</code> as:{" "}
                  <code className="bg-amber-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY=your_key_here</code>
                </li>
                <li>Also add to Vercel environment variables</li>
              </ol>
              <p className="text-amber-700 text-sm mt-2">
                User management will not work until this is configured.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex">
          <button onClick={() => handleTabChange("users")} className={tabClass("users")}>
            Users
          </button>
          <button onClick={() => handleTabChange("invite")} className={tabClass("invite")}>
            Invite
          </button>
          <button onClick={() => handleTabChange("activity")} className={tabClass("activity")}>
            Activity Log
          </button>
        </nav>
      </div>

      {/* TAB: Users */}
      {activeTab === "users" && (
        <div>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Users", value: totalUsers },
              { label: "Admins", value: adminCount },
              { label: "HR Users", value: hrCount },
              { label: "Invited / Pending", value: invitedCount },
            ].map((stat) => (
              <div key={stat.label} className="card text-center py-4">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Users table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sign In
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isActive = !!user.last_sign_in_at;
                  const isLoading = actionLoading === user.id;
                  const isPendingRole =
                    pendingRoleChange?.userId === user.id;

                  return (
                    <Fragment key={user.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar fullName={user.full_name} email={user.email} size={32} />
                            <span className="font-medium text-gray-900 whitespace-nowrap">
                              {user.full_name || "—"}
                              {isSelf && (
                                <span className="ml-1.5 text-xs text-gray-400">(you)</span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "HR User"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(user.last_sign_in_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {isActive ? "Active" : "Invited"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isSelf ? (
                            <span
                              className="text-xs text-gray-400 italic"
                              title="Cannot modify your own account"
                            >
                              Cannot modify own account
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                disabled={isLoading || !serviceKeyConfigured}
                                onClick={() =>
                                  setPendingRoleChange(
                                    isPendingRole
                                      ? null
                                      : {
                                          userId: user.id,
                                          newRole:
                                            user.role === "admin" ? "hr_user" : "admin",
                                        }
                                  )
                                }
                                className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                Change Role
                              </button>
                              <button
                                disabled={isLoading || !user.email || !serviceKeyConfigured}
                                onClick={() => handleResetPassword(user)}
                                className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                Reset Password
                              </button>
                              <button
                                disabled={isLoading || !serviceKeyConfigured}
                                onClick={() => setRemoveConfirm(user)}
                                className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {/* Inline role change confirmation */}
                      {isPendingRole && pendingRoleChange && (
                        <tr className="bg-blue-50">
                          <td colSpan={7} className="px-4 py-2.5">
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-700">
                                Change{" "}
                                <strong>{user.full_name || user.email}</strong> to{" "}
                                <strong>
                                  {pendingRoleChange.newRole === "admin" ? "Admin" : "HR User"}
                                </strong>
                                ?
                              </span>
                              <button
                                onClick={() =>
                                  handleChangeRole(
                                    pendingRoleChange.userId,
                                    pendingRoleChange.newRole
                                  )
                                }
                                className="px-3 py-1 bg-navy-700 text-white text-xs rounded hover:bg-navy-800 transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setPendingRoleChange(null)}
                                className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Invite */}
      {activeTab === "invite" && (
        <div className="max-w-lg">
          {inviteSuccess ? (
            <div className="card p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    Invitation sent to {inviteSuccess}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    They will receive an email with a link to set their password and access the app.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInviteSuccess(null)}
                className="btn-primary px-5"
              >
                Invite Another Person
              </button>
            </div>
          ) : (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Invite a Team Member</h2>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteForm.fullName}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-navy-500"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-navy-500"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        inviteForm.role === "hr_user"
                          ? "bg-navy-50 border-navy-400"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="hr_user"
                        checked={inviteForm.role === "hr_user"}
                        onChange={() =>
                          setInviteForm((prev) => ({ ...prev, role: "hr_user" }))
                        }
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-medium text-sm text-gray-900">HR User</div>
                        <div className="text-xs text-gray-500">
                          Can use all filing features and view all data
                        </div>
                      </div>
                    </label>
                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        inviteForm.role === "admin"
                          ? "bg-navy-50 border-navy-400"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={inviteForm.role === "admin"}
                        onChange={() =>
                          setInviteForm((prev) => ({ ...prev, role: "admin" }))
                        }
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-medium text-sm text-gray-900">Admin</div>
                        <div className="text-xs text-gray-500">
                          Can also manage users, settings, and delete data
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {inviteError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                    {inviteError}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={inviting || !serviceKeyConfigured}
                    className="btn-primary px-5"
                  >
                    {inviting ? "Sending…" : "Send Invitation"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB: Activity Log */}
      {activeTab === "activity" && (
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="font-semibold text-gray-900">Activity Log</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Best-effort log built from existing data — not a comprehensive audit trail.
                Showing most recent 100 records.
              </p>
            </div>
            <button
              onClick={async () => {
                setLoadingActivity(true);
                const result = await getActivityLog();
                setLoadingActivity(false);
                if (result.success) {
                  setActivityLog(result.data ?? []);
                } else {
                  showToast("Failed to load activity log", "error");
                }
              }}
              disabled={loadingActivity}
              className="text-sm text-navy-700 hover:underline disabled:opacity-50 flex-shrink-0 ml-4"
            >
              {loadingActivity ? "Loading…" : "Refresh"}
            </button>
          </div>

          {loadingActivity ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading activity log…</div>
          ) : activityLog === null ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading activity log…</div>
          ) : activityLog.length === 0 ? (
            <div className="rounded-lg border border-gray-200 py-12 text-center text-gray-400 text-sm">
              No activity yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {activityLog.map((entry, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar fullName={entry.user_name} email={null} size={28} />
                          <span className="font-medium text-gray-900">
                            {entry.user_name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{entry.action}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDateTime(entry.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Remove User Modal */}
      {removeConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Remove {removeConfirm.full_name || removeConfirm.email}?
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              They will immediately lose access to the app.
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Their checklist progress and filing data will be preserved for audit purposes.
            </p>
            <p className="text-sm text-gray-600 mb-5 font-medium">
              This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRemoveConfirm(null)}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveUser}
                className="px-4 py-2 text-sm rounded-md font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
