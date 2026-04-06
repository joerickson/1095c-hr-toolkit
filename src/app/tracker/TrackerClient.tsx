"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { useTranslations } from "next-intl";
import EmployeeModal from "@/components/tracker/EmployeeModal";
import DependentModal from "@/components/tracker/DependentModal";
import type { EmployeeStatus, AppSettings } from "@/lib/types";

interface Props {
  initialEmployees: EmployeeStatus[];
  isAdmin: boolean;
  userId: string;
  settings: Pick<AppSettings, "tax_year" | "mec_monthly_premium" | "safe_harbor_method"> | null;
}

const PLAN_LABELS: Record<string, string> = {
  P1: "Plan 1 — MEC",
  P2: "Plan 2 — Self-Insured",
  P3: "Plan 3 — Select Health",
  declined: "Declined",
};

export default function TrackerClient({ initialEmployees, isAdmin, userId, settings }: Props) {
  const [employees, setEmployees] = useState<EmployeeStatus[]>(initialEmployees);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<EmployeeStatus | null>(null);
  const [dependentEmployee, setDependentEmployee] = useState<EmployeeStatus | null>(null);
  const [sortField, setSortField] = useState<"full_name" | "plan_enrolled" | "line14_code">("full_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { showToast } = useToast();
  const supabase = createClient();
  const t = useTranslations("tracker");
  const tc = useTranslations("common");

  async function refreshEmployees() {
    const { data } = await supabase
      .from("employee_1095c_status")
      .select("*")
      .order("last_name");
    if (data) setEmployees(data as EmployeeStatus[]);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete employee "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) {
      showToast("Failed to delete employee.", "error");
    } else {
      showToast(`${name} deleted.`, "success");
      await refreshEmployees();
    }
  }

  function handleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const filtered = employees
    .filter((e) => {
      const q = search.toLowerCase();
      if (q && !e.full_name.toLowerCase().includes(q)) return false;
      if (filterStatus !== "all" && e.employment_status !== filterStatus) return false;
      if (filterPlan !== "all" && e.plan_enrolled !== filterPlan) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

  const stats = {
    total: employees.length,
    ready: employees.filter((e) => e.is_ready).length,
    issues: employees.filter((e) => !e.is_ready).length,
    part3: employees.filter((e) => e.part3_required).length,
    missingSsn: employees.filter((e) => e.issue_missing_ssn).length,
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <span className="ml-1 text-gray-400">
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("subtitle")} · {tc("taxYear")} {settings?.tax_year ?? 2025}
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          {t("addEmployee")}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: t("stats.total"), value: stats.total, color: "bg-blue-50 border-blue-200 text-blue-800" },
          { label: t("stats.ready"), value: stats.ready, color: "bg-green-50 border-green-200 text-green-800" },
          { label: t("stats.issues"), value: stats.issues, color: stats.issues > 0 ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600" },
          { label: t("stats.part3Required"), value: stats.part3, color: "bg-amber-50 border-amber-200 text-amber-800" },
          { label: t("stats.missingSSN"), value: stats.missingSsn, color: stats.missingSsn > 0 ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-lg p-3 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1 min-w-[200px]"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">{tc("all")} Statuses</option>
            <option value="active">{t("employmentStatus.active")}</option>
            <option value="terminated">{t("employmentStatus.terminated")}</option>
            <option value="leave_of_absence">{t("employmentStatus.leave_of_absence")}</option>
          </select>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">{t("filterByPlan")}</option>
            <option value="P1">{t("plans.P1")}</option>
            <option value="P2">{t("plans.P2")}</option>
            <option value="P3">{t("plans.P3")}</option>
            <option value="declined">{t("plans.declined")}</option>
          </select>
          <span className="text-sm text-gray-500 self-center">
            {filtered.length} of {employees.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("full_name")}
                >
                  {t("columns.name")} <SortIcon field="full_name" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("columns.plan")}</th>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("line14_code")}
                >
                  {t("columns.line14")} <SortIcon field="line14_code" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("columns.line16")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("columns.part3")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("columns.ssn")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("columns.dob")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("columns.dependents")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Stability</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("columns.status")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-400">
                    {employees.length === 0
                      ? "No employees yet. Click '+ Add Employee' to get started."
                      : tc("noResults")}
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div>{emp.full_name}</div>
                      {emp.employment_status !== "active" && (
                        <span className="text-xs text-gray-400 capitalize">
                          {emp.employment_status.replace("_", " ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {emp.plan_enrolled ? PLAN_LABELS[emp.plan_enrolled] ?? emp.plan_enrolled : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-navy-700">{emp.line14_code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-navy-700">{emp.line16_code}</span>
                    </td>
                    <td className="px-4 py-3">
                      {emp.part3_required ? (
                        <span className="badge-required">{t("status.required")}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">{t("status.notRequired")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {emp.ssn_on_file ? (
                        <span className="text-green-600 font-medium">✓</span>
                      ) : (
                        <span className="text-red-500 font-medium">✕</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {emp.dob_on_file ? (
                        <span className="text-green-600 font-medium">✓</span>
                      ) : (
                        <span className="text-red-500 font-medium">✕</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {emp.part3_required ? (
                        <span
                          className={`font-medium ${
                            Number(emp.dependent_count) === 0 ? "text-amber-500" : "text-green-600"
                          }`}
                        >
                          {Number(emp.dependent_count)} {Number(emp.dependent_count) === 0 ? "⚠" : ""}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {emp.stability_start_date ? (
                        <span className="text-green-600 text-xs">{emp.stability_start_date}</span>
                      ) : (
                        <span className="text-amber-500 text-xs">Missing ⚠</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {emp.is_ready ? (
                        <span className="badge-success">{t("status.ready")}</span>
                      ) : (
                        <span className="badge-critical">{t("status.issues")}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditEmployee(emp)}
                          className="text-navy-600 hover:text-navy-800 text-xs font-medium"
                        >
                          {tc("edit")}
                        </button>
                        {emp.part3_required && (
                          <button
                            onClick={() => setDependentEmployee(emp)}
                            className="text-amber-600 hover:text-amber-800 text-xs font-medium"
                          >
                            {t("columns.dependents")}
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(emp.id, emp.full_name)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            {tc("delete")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <EmployeeModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            refreshEmployees();
            showToast("Employee added.", "success");
          }}
          userId={userId}
        />
      )}

      {editEmployee && (
        <EmployeeModal
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
          onSaved={() => {
            setEditEmployee(null);
            refreshEmployees();
            showToast("Employee updated.", "success");
          }}
          userId={userId}
        />
      )}

      {dependentEmployee && (
        <DependentModal
          employee={dependentEmployee}
          onClose={() => {
            setDependentEmployee(null);
            refreshEmployees();
          }}
        />
      )}
    </div>
  );
}
