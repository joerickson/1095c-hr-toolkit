"use client";

import { useState } from "react";
import SettingsClient from "./SettingsClient";
import UserManagementClient from "./UserManagementClient";
import type { AppSettings } from "@/lib/types";
import type { UserWithAuth } from "./userActions";

interface Props {
  settings: AppSettings | null;
  userId: string;
  users: UserWithAuth[];
}

type Tab = "aca" | "users";

export default function SettingsTabs({ settings, userId, users }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("aca");

  const tabClass = (tab: Tab) =>
    `pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? "border-navy-600 text-navy-700"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`;

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          <button onClick={() => setActiveTab("aca")} className={tabClass("aca")}>
            ACA Settings
          </button>
          <button onClick={() => setActiveTab("users")} className={tabClass("users")}>
            User Management
          </button>
        </nav>
      </div>

      {activeTab === "aca" && (
        <SettingsClient settings={settings} userId={userId} />
      )}
      {activeTab === "users" && (
        <UserManagementClient initialUsers={users} currentUserId={userId} />
      )}
    </div>
  );
}
