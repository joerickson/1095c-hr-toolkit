"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import type { EmployeeStatus } from "@/lib/types";

interface FilingStatusRow {
  id: string;
  employee_id: string;
  tax_year: number;
  benefit_package_assigned: boolean;
  stability_start_date_set: boolean;
  plan_enrolled: "P1" | "P2" | "P3" | "declined" | null;
  election_entered_winteam: boolean;
  dependents_reviewed: boolean;
  spouse_ssn_on_file: boolean | null;
  all_dependent_info_complete: boolean;
  is_ready: boolean;
  blocking_issues: string[] | null;
  last_reviewed_at: string | null;
  last_reviewed_by: string | null;
}

interface Props {
  userId: string;
  taxYear: number;
  initialEmployees: EmployeeStatus[];
  initialFilingStatus: FilingStatusRow[];
}

const PLAN_LABELS: Record<string, string> = {
  P1: "Plan 1 — MEC",
  P2: "Plan 2 — Self-Insured",
  P3: "Plan 3 — Select Health",
  declined: "Declined",
};

export default function FilingEmployeesClient({
  userId,
  taxYear,
  initialEmployees,
  initialFilingStatus,
}: Props) {
  const tTracker = useTranslations("tracker");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();
  const supabase = createClient();

  const [employees] = useState<EmployeeStatus[]>(initialEmployees);
  const [filingStatus, setFilingStatus] = useState<FilingStatusRow[]>(initialFilingStatus);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "ready" | "not_ready" | "not_reviewed">("all");
  const [initializingAll, setInitializingAll] = useState(false);
  const [markingReady, setMarkingReady] = useState<string | null>(null);
  const [initializingOne, setInitializingOne] = useState<string | null>(null);

  // Map employeeId -> filing status
  const statusMap = new Map(filingStatus.map((s) => [s.employee_id, s]));

  async function refreshStatus() {
    const { data } = await supabase
      .from("employee_filing_status")
      .select("*")
      .eq("tax_year", taxYear);
    if (data) setFilingStatus(data as FilingStatusRow[]);
  }

  async function initializeEmployee(emp: EmployeeStatus) {
    setInitializingOne(emp.id);
    const { error } = await supabase.from("employee_filing_status").upsert(
      {
        employee_id: emp.id,
        tax_year: taxYear,
        plan_enrolled: emp.plan_enrolled ?? null,
        is_ready: false,
        blocking_issues: [],
      },
      { onConflict: "employee_id,tax_year" }
    );
    setInitializingOne(null);
    if (error) {
      showToast("Failed to initialize employee.", "error");
    } else {
      await refreshStatus();
    }
  }

  async function initializeAll() {
    const missing = employees.filter((e) => !statusMap.has(e.id));
    if (missing.length === 0) {
      showToast("All employees are already initialized.", "info");
      return;
    }
    setInitializingAll(true);
    const rows = missing.map((emp) => ({
      employee_id: emp.id,
      tax_year: taxYear,
      plan_enrolled: emp.plan_enrolled ?? null,
      is_ready: false,
      blocking_issues: [],
    }));
    const { error } = await supabase
      .from("employee_filing_status")
      .upsert(rows, { onConflict: "employee_id,tax_year" });
    setInitializingAll(false);
    if (error) {
      showToast("Failed to initialize employees.", "error");
    } else {
      showToast(`Initialized ${missing.length} employees.`, "success");
      await refreshStatus();
    }
  }

  async function markReady(employeeId: string) {
    setMarkingReady(employeeId);
    const { error } = await supabase
      .from("employee_filing_status")
      .update({
        is_ready: true,
        last_reviewed_at: new Date().toISOString(),
        last_reviewed_by: userId,
      })
      .eq("employee_id", employeeId)
      .eq("tax_year", taxYear);
    setMarkingReady(null);
    if (error) {
      showToast("Failed to mark employee ready.", "error");
    } else {
      showToast("Employee marked ready.", "success");
      await refreshStatus();
    }
  }

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    if (q && !emp.full_name.toLowerCase().includes(q)) return false;
    const fs = statusMap.get(emp.id);
    if (filterStatus === "ready") return fs?.is_ready === true;
    if (filterStatus === "not_ready") return fs && !fs.is_ready;
    if (filterStatus === "not_reviewed") return !fs;
    return true;
  });

  const stats = {
    total: employees.length,
    ready: filingStatus.filter((s) => s.is_ready).length,
    notReady: filingStatus.filter((s) => !s.is_ready).length,
    notReviewed: employees.filter((e) => !statusMap.has(e.id)).length,
    missingSsn: employees.filter((e) => e.issue_missing_ssn).length,
    missingDependents: employees.filter(
      (e) => e.issue_no_dependents_entered && (e.plan_enrolled === "P1" || e.plan_enrolled === "P2")
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1">
            <a href="/filing" className="text-navy-600 hover:text-navy-800 text-sm">
              ← Filing Assistant
            </a>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{tTracker("title")}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {tTracker("subtitle")}
          </p>
        </div>
        <button
          onClick={initializeAll}
          disabled={initializingAll}
          className="btn-secondary text-sm disabled:opacity-50"
        >
          {initializingAll ? tCommon("loading") : tTracker("addEmployee")}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: tTracker("stats.total"), value: stats.total, color: "text-gray-900" },
          { label: tTracker("stats.ready"), value: stats.ready, color: "text-green-700" },
          { label: tTracker("stats.issues"), value: stats.notReady, color: stats.notReady > 0 ? "text-amber-700" : "text-gray-400" },
          { label: tTracker("stats.missingSSN"), value: stats.missingSsn, color: stats.missingSsn > 0 ? "text-red-700" : "text-gray-400" },
          { label: "Missing Deps", value: stats.missingDependents, color: stats.missingDependents > 0 ? "text-amber-700" : "text-gray-400" },
          { label: tTracker("stats.part3Required"), value: stats.notReviewed, color: stats.notReviewed > 0 ? "text-blue-700" : "text-gray-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center py-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder={tTracker("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 w-52"
          />
          <div className="flex gap-2">
            {(["all", "ready", "not_ready", "not_reviewed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterStatus === f
                    ? "bg-navy-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f === "all" ? tCommon("all") : f === "ready" ? tTracker("status.ready") : f === "not_ready" ? tTracker("stats.issues") : tTracker("filterByStatus")}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} employees</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tTracker("columns.name")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tTracker("columns.plan")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tTracker("columns.line14")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tTracker("columns.line16")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tTracker("columns.part3")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tTracker("columns.ssn")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tTracker("columns.dob")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tTracker("columns.dependents")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tCommon("status")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{tCommon("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((emp) => {
                const fs = statusMap.get(emp.id);
                const isReady = fs?.is_ready ?? false;
                const isNotReviewed = !fs;

                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{emp.full_name}</div>
                      <div className="text-xs text-gray-400">{emp.employment_status}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {emp.plan_enrolled ? PLAN_LABELS[emp.plan_enrolled] ?? emp.plan_enrolled : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-800">{emp.line14_code || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-800">{emp.line16_code || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {emp.part3_required ? (
                        <span className="badge-info">Required</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {emp.issue_missing_ssn ? (
                        <span className="badge-critical">Missing</span>
                      ) : (
                        <span className="text-green-600 text-xs">✓</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {emp.issue_missing_dob ? (
                        <span className="badge-required">Missing</span>
                      ) : (
                        <span className="text-green-600 text-xs">✓</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-600">
                      {emp.dependent_count > 0 ? emp.dependent_count : (
                        emp.issue_no_dependents_entered && (emp.plan_enrolled === "P1" || emp.plan_enrolled === "P2")
                          ? <span className="badge-required">Needed</span>
                          : <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isNotReviewed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                          {tTracker("filterByStatus")}
                        </span>
                      ) : isReady ? (
                        <span className="badge-success">{tTracker("status.ready")} ✓</span>
                      ) : (
                        <span className="badge-required">{tTracker("stats.issues")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isNotReviewed ? (
                        <button
                          onClick={() => initializeEmployee(emp)}
                          disabled={initializingOne === emp.id}
                          className="text-xs text-navy-600 hover:text-navy-800 font-medium disabled:opacity-50"
                        >
                          {initializingOne === emp.id ? "..." : tCommon("add")}
                        </button>
                      ) : !isReady ? (
                        <button
                          onClick={() => markReady(emp.id)}
                          disabled={markingReady === emp.id}
                          className="text-xs text-green-700 hover:text-green-900 font-medium disabled:opacity-50"
                        >
                          {markingReady === emp.id ? "..." : tCommon("markComplete")}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {fs?.last_reviewed_at
                            ? new Date(fs.last_reviewed_at).toLocaleDateString()
                            : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-gray-500">
              No employees found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
