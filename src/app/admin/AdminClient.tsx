"use client";

import { Fragment, useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
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
      const label = newRole === "admin" ? t("users.roles.admin") : t("users.roles.hr_user");
      showToast(`${user?.full_name || user?.email} is now ${label}`, "success");
    } else {
      showToast(result.error || tErrors("generic"), "error");
    }
  }

  async function handleResetPassword(user: UserWithAuth) {
    if (!user.email) return;
    setActionLoading(user.id);
    const result = await resetUserPassword(user.email);
    setActionLoading(null);
    if (result.success) {
      showToast(t("users.passwordResetSent", { email: user.email }), "success");
    } else {
      showToast(result.error || tErrors("generic"), "error");
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
      showToast(t("users.userRemoved", { name: user.full_name || user.email }), "success");
    } else {
      showToast(result.error || tErrors("generic"), "error");
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
      setInviteError(result.error || t("invite.inviteFailed"));
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
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Service key warning banner */}
      {!serviceKeyConfigured && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">{tErrors("setupRequired")}</p>
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
                {tErrors("missingServiceKey")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex">
          <button onClick={() => handleTabChange("users")} className={tabClass("users")}>
            {t("tabs.users")}
          </button>
          <button onClick={() => handleTabChange("invite")} className={tabClass("invite")}>
            {t("tabs.invite")}
          </button>
          <button onClick={() => handleTabChange("activity")} className={tabClass("activity")}>
            {t("tabs.activity")}
          </button>
        </nav>
      </div>

      {/* TAB: Users */}
      {activeTab === "users" && (
        <div>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: t("stats.totalUsers"), value: totalUsers },
              { label: t("stats.admins"), value: adminCount },
              { label: t("stats.hrUsers"), value: hrCount },
              { label: t("stats.pending"), value: invitedCount },
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
                    {t("users.columns.user")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tCommon("email")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.columns.role")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.columns.joined")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.columns.lastSignIn")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("users.columns.status")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tCommon("actions")}
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
                            {user.role === "admin" ? t("users.roles.admin") : t("users.roles.hr_user")}
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
                            {isActive ? t("users.status.active") : t("users.status.invited")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isSelf ? (
                            <span
                              className="text-xs text-gray-400 italic"
                              title={t("users.cannotModifySelf")}
                            >
                              {t("users.cannotModifySelf")}
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
                                {t("users.changeRole")}
                              </button>
                              <button
                                disabled={isLoading || !user.email || !serviceKeyConfigured}
                                onClick={() => handleResetPassword(user)}
                                className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              >
                                {t("users.resetPassword")}
                              </button>
                              <button
                                disabled={isLoading || !serviceKeyConfigured}
                                onClick={() => setRemoveConfirm(user)}
                                className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                              >
                                {t("users.removeUser")}
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
                                {t("users.changeRoleConfirm", {
                                  name: user.full_name || user.email,
                                  role: pendingRoleChange.newRole === "admin" ? t("users.roles.admin") : t("users.roles.hr_user"),
                                })}
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
                                {tCommon("confirm")}
                              </button>
                              <button
                                onClick={() => setPendingRoleChange(null)}
                                className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
                              >
                                {tCommon("cancel")}
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
                      {tCommon("noData")}
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
                    {t("invite.successTitle", { email: inviteSuccess })}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("invite.successDescription")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInviteSuccess(null)}
                className="btn-primary px-5"
              >
                {t("invite.inviteAnother")}
              </button>
            </div>
          ) : (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">{t("invite.title")}</h2>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("invite.fields.fullName")} <span className="text-red-500">*</span>
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
                    {t("invite.fields.email")} <span className="text-red-500">*</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("invite.fields.role")}</label>
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
                        <div className="font-medium text-sm text-gray-900">{t("users.roles.hr_user")}</div>
                        <div className="text-xs text-gray-500">
                          {t("invite.roleOptions.hr_user")}
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
                        <div className="font-medium text-sm text-gray-900">{t("users.roles.admin")}</div>
                        <div className="text-xs text-gray-500">
                          {t("invite.roleOptions.admin")}
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
                    {inviting ? t("invite.sending") : t("invite.sendButton")}
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
              <h2 className="font-semibold text-gray-900">{t("activity.title")}</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {t("activity.subtitle")}
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
              {loadingActivity ? tCommon("loading") : tCommon("update")}
            </button>
          </div>

          {loadingActivity ? (
            <div className="py-12 text-center text-gray-400 text-sm">{tCommon("loading")}</div>
          ) : activityLog === null ? (
            <div className="py-12 text-center text-gray-400 text-sm">{tCommon("loading")}</div>
          ) : activityLog.length === 0 ? (
            <div className="rounded-lg border border-gray-200 py-12 text-center text-gray-400 text-sm">
              {t("activity.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("activity.columns.user")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("activity.columns.action")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("activity.columns.dateTime")}
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
              {t("users.removeConfirmTitle", { name: removeConfirm.full_name || removeConfirm.email })}
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              {t("users.removeConfirmDescription")}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRemoveConfirm(null)}
                className="btn-secondary px-4 py-2 text-sm"
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={handleRemoveUser}
                className="px-4 py-2 text-sm rounded-md font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                {t("users.removeButton")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
