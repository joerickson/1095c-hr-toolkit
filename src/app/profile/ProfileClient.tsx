"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { updateProfileName, sendPasswordResetEmail } from "@/app/settings/userActions";

interface Props {
  userId: string;
  initialFullName: string;
  email: string;
  role: string;
}

export default function ProfileClient({
  userId: _userId,
  initialFullName,
  email,
  role,
}: Props) {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(initialFullName);
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileName(fullName);
      showToast("Display name updated.", "success");
    } catch (err) {
      showToast((err as Error).message || "Failed to update name", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    setSendingReset(true);
    try {
      await sendPasswordResetEmail(email);
      showToast(`Password reset email sent to ${email}`, "success");
    } catch (err) {
      showToast(
        (err as Error).message || "Failed to send reset email",
        "error"
      );
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Display Name */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Display Name</h2>
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-navy-500"
                placeholder="Your full name"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-5"
              >
                {saving ? "Saving…" : "Update Name"}
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="text-sm text-gray-900 mt-1">{email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <span
                className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  role === "admin"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {role === "admin" ? "Admin" : "HR User"}
              </span>
              <p className="text-xs text-gray-400 mt-1">
                Role is managed by your administrator.
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-2">Change Password</h2>
          <p className="text-sm text-gray-500 mb-4">
            We&apos;ll send a password reset link to your email address.
          </p>
          <button
            onClick={handlePasswordReset}
            disabled={sendingReset}
            className="btn-primary px-5"
          >
            {sendingReset ? "Sending…" : "Send Password Reset Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
