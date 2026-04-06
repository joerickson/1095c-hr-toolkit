"use client";

import React, { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import {
  getFilingChecklist,
  ROLE_METADATA,
  type WinTeamRole,
} from "@/lib/filing-checklist-items";

interface ProgressRow {
  item_key: string;
  assigned_to?: string | null;
  assigned_at?: string | null;
  is_complete: boolean;
}

interface Props {
  taxYear: number;
  initialProgress: ProgressRow[];
}

const PHASE_NAMES: Record<number, string> = {
  1: "Phase 1 — Audit Prior Year WinTeam Setup",
  2: "Phase 2 — Fix Issues and Roll Forward",
  3: "Phase 3 — Data Catch-Up",
  4: "Phase 4 — Generate, Verify, and File",
};

const PERMISSION_LEVEL_LABEL: Record<string, string> = {
  read: "Read",
  read_write: "Read/Write",
  admin: "Admin",
};

function RoleBadge({ role }: { role: WinTeamRole }) {
  const meta = ROLE_METADATA[role];
  const icon = role === "winteam_admin" ? "🔒" : role === "team_software_support" ? "📞" : "👤";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${meta.badgeClass}`}>
      {icon} {meta.label}
    </span>
  );
}

export default function AccessClient({ taxYear, initialProgress }: Props) {
  const { showToast } = useToast();
  const supabase = createClient();
  const checklist = getFilingChecklist(taxYear);

  // Assignments state
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialProgress.forEach((p) => {
      if (p.assigned_to) map[p.item_key] = p.assigned_to;
    });
    return map;
  });

  // Pre-flight checklist state (persisted locally only — browser storage)
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [namedFields, setNamedFields] = useState<Record<string, string>>({});

  const saveAssignment = useCallback(
    async (key: string, assignedTo: string) => {
      const progress = initialProgress.find((p) => p.item_key === key);
      await supabase
        .from("filing_checklist_progress")
        .upsert(
          {
            tax_year: taxYear,
            item_key: key,
            assigned_to: assignedTo || null,
            assigned_at: assignedTo ? new Date().toISOString() : null,
            is_complete: progress?.is_complete ?? false,
          },
          { onConflict: "tax_year,item_key" }
        );
    },
    [supabase, taxYear, initialProgress]
  );

  // Count tasks per role
  const tasksByRole = checklist.reduce<Record<WinTeamRole, number>>(
    (acc, item) => {
      acc[item.access_required.winteam_role] = (acc[item.access_required.winteam_role] ?? 0) + 1;
      return acc;
    },
    { standard_hr: 0, hr_manager: 0, winteam_admin: 0, team_software_support: 0 }
  );

  const roleOrder: WinTeamRole[] = ["standard_hr", "hr_manager", "winteam_admin", "team_software_support"];

  const winteamGrantInstructions: Record<WinTeamRole, string> = {
    standard_hr: "Grant access in WinTeam via SYS > User Setup > assign to INS Benefits by Employee and Employee Master File groups.",
    hr_manager: "Grant access in WinTeam via SYS > User Setup > assign report permissions for INS: Employee 1095-C Report.",
    winteam_admin: "Grant via SYS > User Setup > assign Administrator role or SYS group access.",
    team_software_support: "Contact TEAM Software support directly to arrange assistance.",
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-8 print:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <a href="/filing" className="text-navy-600 hover:text-navy-800 text-sm">
              ← Filing Assistant
            </a>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Access Plan</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review who needs what WinTeam access before starting the {taxYear} filing process.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="btn-secondary text-sm print:hidden"
        >
          🖨 Print Access Plan
        </button>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-bold text-gray-900">Access Plan — {taxYear} 1095-C Filing</h1>
        <p className="text-sm text-gray-500">RBM Services Inc.</p>
      </div>

      {/* A. Header Summary — Role Cards */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">WinTeam Access Roles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roleOrder.map((role) => {
            const meta = ROLE_METADATA[role];
            const count = tasksByRole[role] ?? 0;
            const icon = role === "winteam_admin" ? "🔒" : role === "team_software_support" ? "📞" : "👤";
            return (
              <div
                key={role}
                className={`rounded-xl border-2 p-4 ${meta.borderClass} bg-white`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{icon}</span>
                  <span className={`text-sm font-bold ${meta.textClass}`}>{meta.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{count}</p>
                <p className="text-xs text-gray-500 mb-3">tasks</p>
                <p className="text-xs text-gray-600 leading-relaxed">{meta.description}</p>
                <div className={`mt-3 pt-3 border-t ${meta.borderClass}`}>
                  <p className="text-xs text-gray-500 italic leading-relaxed">
                    {winteamGrantInstructions[role]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* B. Access by Phase Tables */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Access Requirements by Phase</h2>
        <div className="space-y-6">
          {([1, 2, 3, 4] as const).map((phase) => {
            const phaseItems = checklist.filter((i) => i.phase === phase);
            return (
              <div key={phase} className="card overflow-hidden p-0">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-sm">{PHASE_NAMES[phase]}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-white">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-2/5">Task</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Who Can Do It</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">WinTeam Modules</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Delegate?</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36 print:hidden">Assign To</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {phaseItems.map((item) => {
                        const access = item.access_required;
                        return (
                          <tr key={item.key} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="text-xs font-medium text-gray-900 leading-snug">{item.label}</p>
                              {assignments[item.key] && (
                                <p className="text-xs text-gray-400 mt-0.5">→ {assignments[item.key]}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <RoleBadge role={access.winteam_role} />
                            </td>
                            <td className="px-4 py-3">
                              {access.modules.length === 0 ? (
                                <span className="text-xs text-gray-400 italic">None (app only)</span>
                              ) : (
                                <div className="space-y-1">
                                  {access.modules.map((m, idx) => (
                                    <div key={idx} className="text-xs text-gray-700">
                                      <span className="font-mono">{m.module}</span>
                                      <span className="text-gray-400 ml-1">({PERMISSION_LEVEL_LABEL[m.permission_level]})</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {access.can_delegate ? (
                                <span className="text-xs text-green-700 font-medium">✓ Yes</span>
                              ) : (
                                <span className="text-xs text-red-600 font-medium">✗ No</span>
                              )}
                            </td>
                            <td className="px-4 py-3 print:hidden">
                              <input
                                type="text"
                                placeholder="Name..."
                                value={assignments[item.key] ?? ""}
                                onChange={(e) =>
                                  setAssignments((prev) => ({ ...prev, [item.key]: e.target.value }))
                                }
                                onBlur={(e) => saveAssignment(item.key, e.target.value)}
                                className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-navy-500"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* C. Permissions Pre-Flight Checklist */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Pre-Flight Permissions Checklist</h2>
        <p className="text-sm text-gray-500 mb-4">
          Before you begin, confirm these people have the right WinTeam access. Check each item off as you verify it.
          {checkedCount > 0 && (
            <span className="ml-2 text-green-700 font-medium">{checkedCount} / 9 verified</span>
          )}
        </p>

        <div className="card space-y-6">
          {/* WinTeam Admin */}
          <div>
            <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-1.5">
              🔒 WinTeam Administrator
            </h3>
            <div className="space-y-3 pl-2">
              <ChecklistRow
                id="admin_identified"
                checked={!!checked["admin_identified"]}
                onToggle={() => setChecked((p) => ({ ...p, admin_identified: !p.admin_identified }))}
              >
                <span>WinTeam Administrator identified:</span>
                <input
                  type="text"
                  placeholder="Name"
                  value={namedFields["admin_name"] ?? ""}
                  onChange={(e) => setNamedFields((p) => ({ ...p, admin_name: e.target.value }))}
                  className="ml-2 text-xs border-b border-gray-300 focus:border-red-400 focus:outline-none bg-transparent w-40"
                />
                <span className="text-xs text-gray-400 ml-1">(person who will do admin-level steps)</span>
              </ChecklistRow>

              <ChecklistRow
                id="admin_access"
                checked={!!checked["admin_access"]}
                onToggle={() => setChecked((p) => ({ ...p, admin_access: !p.admin_access }))}
              >
                <span>WinTeam Administrator has access to:</span>
                <ul className="mt-1 pl-4 text-xs text-gray-600 space-y-0.5 list-disc">
                  <li>SYS: Company Setup</li>
                  <li>INS: Benefit Setup</li>
                  <li>INS: Eligibility Setup</li>
                  <li>INS: Eligibility Testing Wizard</li>
                  <li>INS: Employee 1095-C Report (Electronic File)</li>
                </ul>
              </ChecklistRow>
            </div>
          </div>

          {/* HR Manager */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-1.5">
              👤 HR Manager / Power User
            </h3>
            <div className="space-y-3 pl-2">
              <ChecklistRow
                id="manager_identified"
                checked={!!checked["manager_identified"]}
                onToggle={() => setChecked((p) => ({ ...p, manager_identified: !p.manager_identified }))}
              >
                <span>HR Manager identified:</span>
                <input
                  type="text"
                  placeholder="Name"
                  value={namedFields["manager_name"] ?? ""}
                  onChange={(e) => setNamedFields((p) => ({ ...p, manager_name: e.target.value }))}
                  className="ml-2 text-xs border-b border-gray-300 focus:border-purple-400 focus:outline-none bg-transparent w-40"
                />
                <span className="text-xs text-gray-400 ml-1">(person who will run reports and manage packages)</span>
              </ChecklistRow>

              <ChecklistRow
                id="manager_access"
                checked={!!checked["manager_access"]}
                onToggle={() => setChecked((p) => ({ ...p, manager_access: !p.manager_access }))}
              >
                <span>HR Manager has access to:</span>
                <ul className="mt-1 pl-4 text-xs text-gray-600 space-y-0.5 list-disc">
                  <li>INS: Employee 1095-C Report (Preview/Print)</li>
                  <li>INS: Benefits by Employee (Read/Write)</li>
                  <li>Employee Master File (Read/Write)</li>
                </ul>
              </ChecklistRow>
            </div>
          </div>

          {/* HR Staff */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-1.5">
              👤 Standard HR Staff
            </h3>
            <div className="space-y-3 pl-2">
              <ChecklistRow
                id="staff_identified"
                checked={!!checked["staff_identified"]}
                onToggle={() => setChecked((p) => ({ ...p, staff_identified: !p.staff_identified }))}
              >
                <span>HR Staff identified for data entry:</span>
                <input
                  type="text"
                  placeholder="Names (comma-separated)"
                  value={namedFields["staff_names"] ?? ""}
                  onChange={(e) => setNamedFields((p) => ({ ...p, staff_names: e.target.value }))}
                  className="ml-2 text-xs border-b border-gray-300 focus:border-blue-400 focus:outline-none bg-transparent w-56"
                />
              </ChecklistRow>

              <ChecklistRow
                id="staff_access"
                checked={!!checked["staff_access"]}
                onToggle={() => setChecked((p) => ({ ...p, staff_access: !p.staff_access }))}
              >
                <span>HR Staff have access to:</span>
                <ul className="mt-1 pl-4 text-xs text-gray-600 space-y-0.5 list-disc">
                  <li>INS: Benefits by Employee (Read/Write)</li>
                  <li>Employee Master File (Read/Write)</li>
                </ul>
              </ChecklistRow>
            </div>
          </div>

          {/* Credentials */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">IRS Filing Credentials</h3>
            <div className="space-y-3 pl-2">
              <ChecklistRow
                id="tcc_located"
                checked={!!checked["tcc_located"]}
                onToggle={() => setChecked((p) => ({ ...p, tcc_located: !p.tcc_located }))}
              >
                <div>
                  <p>TCC (Transmitter Control Code) located</p>
                  <div className="flex flex-wrap gap-4 mt-1">
                    <span className="text-xs text-gray-500">
                      Stored at:{" "}
                      <input
                        type="text"
                        placeholder="Location"
                        value={namedFields["tcc_location"] ?? ""}
                        onChange={(e) => setNamedFields((p) => ({ ...p, tcc_location: e.target.value }))}
                        className="text-xs border-b border-gray-300 focus:border-gray-500 focus:outline-none bg-transparent w-32"
                      />
                    </span>
                    <span className="text-xs text-gray-500">
                      Held by:{" "}
                      <input
                        type="text"
                        placeholder="Name"
                        value={namedFields["tcc_holder"] ?? ""}
                        onChange={(e) => setNamedFields((p) => ({ ...p, tcc_holder: e.target.value }))}
                        className="text-xs border-b border-gray-300 focus:border-gray-500 focus:outline-none bg-transparent w-32"
                      />
                    </span>
                  </div>
                </div>
              </ChecklistRow>

              <ChecklistRow
                id="fire_creds"
                checked={!!checked["fire_creds"]}
                onToggle={() => setChecked((p) => ({ ...p, fire_creds: !p.fire_creds }))}
              >
                <div>
                  <p>FIRE system credentials (username/password) located</p>
                  <div className="mt-1">
                    <span className="text-xs text-gray-500">
                      Held by:{" "}
                      <input
                        type="text"
                        placeholder="Name"
                        value={namedFields["fire_holder"] ?? ""}
                        onChange={(e) => setNamedFields((p) => ({ ...p, fire_holder: e.target.value }))}
                        className="text-xs border-b border-gray-300 focus:border-gray-500 focus:outline-none bg-transparent w-32"
                      />
                    </span>
                  </div>
                </div>
              </ChecklistRow>

              <ChecklistRow
                id="team_portal_creds"
                checked={!!checked["team_portal_creds"]}
                onToggle={() => setChecked((p) => ({ ...p, team_portal_creds: !p.team_portal_creds }))}
              >
                <div>
                  <p>TEAM Software e-file portal credentials <span className="text-gray-400">(if using their service)</span></p>
                  <div className="mt-1">
                    <span className="text-xs text-gray-500">
                      Held by:{" "}
                      <input
                        type="text"
                        placeholder="Name or N/A"
                        value={namedFields["team_portal_holder"] ?? ""}
                        onChange={(e) => setNamedFields((p) => ({ ...p, team_portal_holder: e.target.value }))}
                        className="text-xs border-b border-gray-300 focus:border-gray-500 focus:outline-none bg-transparent w-32"
                      />
                    </span>
                  </div>
                </div>
              </ChecklistRow>
            </div>
          </div>
        </div>
      </section>

      {/* Print button at bottom */}
      <div className="print:hidden">
        <button
          onClick={() => window.print()}
          className="btn-primary"
        >
          🖨 Print Access Plan
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Print this page and distribute to your team before starting Phase 1.
        </p>
      </div>
    </div>
  );
}

function ChecklistRow({
  id,
  checked,
  onToggle,
  children,
}: {
  id: string;
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-navy-600 focus:ring-navy-500 flex-shrink-0 cursor-pointer"
      />
      <label
        htmlFor={id}
        className={`text-sm cursor-pointer leading-snug ${checked ? "text-gray-400 line-through" : "text-gray-700"}`}
      >
        {children}
      </label>
    </div>
  );
}
