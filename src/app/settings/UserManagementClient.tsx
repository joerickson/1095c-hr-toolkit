"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import {
  changeUserRole,
  resetUserPassword,
  removeUser,
  inviteUser,
  listUsers,
  getAccessLog,
  type UserWithAuth,
  type AccessLogEntry,
} from "./userActions";

type DialogState =
  | { type: "changeRole"; user: UserWithAuth; newRole: "admin" | "hr_user" }
  | { type: "resetPassword"; user: UserWithAuth }
  | { type: "removeUser"; user: UserWithAuth }
  | null;

interface Props {
  initialUsers: UserWithAuth[];
  currentUserId: string;
}

export default function UserManagementClient({
  initialUsers,
  currentUserId,
}: Props) {
  const { showToast } = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    role: "hr_user" as "admin" | "hr_user",
  });
  const [inviting, setInviting] = useState(false);

  const [accessLog, setAccessLog] = useState<AccessLogEntry[] | null>(null);
  const [loadingLog, setLoadingLog] = useState(false);

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

  async function confirmAction() {
    if (!dialog) return;
    const d = dialog;
    setDialog(null);
    setActionLoading(d.user.id);

    try {
      if (d.type === "changeRole") {
        await changeUserRole(d.user.id, d.newRole);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === d.user.id ? { ...u, role: d.newRole } : u
          )
        );
        const label = d.newRole === "admin" ? "Admin" : "HR User";
        showToast(
          `${d.user.full_name || d.user.email} is now ${label}`,
          "success"
        );
      } else if (d.type === "resetPassword") {
        await resetUserPassword(d.user.email!);
        showToast(
          `Password reset email sent to ${d.user.email}`,
          "success"
        );
      } else if (d.type === "removeUser") {
        await removeUser(d.user.id);
        setUsers((prev) => prev.filter((u) => u.id !== d.user.id));
        showToast(
          `${d.user.full_name || d.user.email} has been removed`,
          "success"
        );
      }
    } catch (e) {
      showToast((e as Error).message || "Action failed", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      await inviteUser(inviteForm.email, inviteForm.fullName, inviteForm.role);
      showToast(`Invitation sent to ${inviteForm.email}`, "success");
      setInviteForm({ fullName: "", email: "", role: "hr_user" });
      // Refresh user list to show invited user
      const updated = await listUsers();
      setUsers(updated);
    } catch (e) {
      showToast((e as Error).message || "Failed to send invitation", "error");
    } finally {
      setInviting(false);
    }
  }

  async function loadAccessLog() {
    setLoadingLog(true);
    try {
      const log = await getAccessLog();
      setAccessLog(log);
    } catch (e) {
      showToast("Failed to load access log", "error");
    } finally {
      setLoadingLog(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Section A: Active Users */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Active Users
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          All users with access to this toolkit.
        </p>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Joined
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

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {user.full_name || "—"}
                      {isSelf && (
                        <span className="ml-1.5 text-xs text-gray-400">
                          (you)
                        </span>
                      )}
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
                          title="You cannot modify your own account"
                        >
                          Cannot modify own account
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            disabled={isLoading}
                            onClick={() =>
                              setDialog({
                                type: "changeRole",
                                user,
                                newRole:
                                  user.role === "admin" ? "hr_user" : "admin",
                              })
                            }
                            className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            Change Role
                          </button>
                          <button
                            disabled={isLoading || !user.email}
                            onClick={() =>
                              setDialog({ type: "resetPassword", user })
                            }
                            className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            Reset Password
                          </button>
                          <button
                            disabled={isLoading}
                            onClick={() =>
                              setDialog({ type: "removeUser", user })
                            }
                            className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section B: Invite New User */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Invite New User
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Send an invitation email to give someone access to the toolkit.
        </p>

        <div className="card max-w-lg">
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={inviteForm.fullName}
                onChange={(e) =>
                  setInviteForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-navy-500"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={inviteForm.role}
                onChange={(e) =>
                  setInviteForm((prev) => ({
                    ...prev,
                    role: e.target.value as "admin" | "hr_user",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-navy-500"
              >
                <option value="hr_user">HR User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={inviting}
                className="btn-primary px-5"
              >
                {inviting ? "Sending…" : "Send Invitation"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Section C: Access Log */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-900">Access Log</h2>
          {accessLog === null && (
            <button
              onClick={loadAccessLog}
              disabled={loadingLog}
              className="text-sm text-navy-700 hover:underline disabled:opacity-50"
            >
              {loadingLog ? "Loading…" : "Load Access Log"}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Recent user activity — last 50 records, most recent first.
        </p>

        {accessLog !== null && (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            {accessLog.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No activity recorded yet.
              </div>
            ) : (
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
                  {accessLog.map((entry, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {entry.user_name || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {entry.action}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDateTime(entry.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {dialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            {dialog.type === "changeRole" && (
              <>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Change {dialog.user.full_name || dialog.user.email} to{" "}
                  {dialog.newRole === "admin" ? "Admin" : "HR User"}?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {dialog.newRole === "admin"
                    ? "Admins can manage users and settings."
                    : "HR Users can use all filing features."}
                </p>
              </>
            )}
            {dialog.type === "resetPassword" && (
              <>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Reset password for{" "}
                  {dialog.user.full_name || dialog.user.email}?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  A password reset email will be sent to {dialog.user.email}.
                </p>
              </>
            )}
            {dialog.type === "removeUser" && (
              <>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Remove {dialog.user.full_name || dialog.user.email}?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  They will lose all access immediately. Their checklist
                  progress and data will be preserved.
                </p>
              </>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDialog(null)}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-sm rounded-md font-medium text-white transition-colors ${
                  dialog.type === "removeUser"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-navy-700 hover:bg-navy-800"
                }`}
              >
                {dialog.type === "changeRole"
                  ? "Change Role"
                  : dialog.type === "resetPassword"
                  ? "Send Reset Email"
                  : "Remove User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
