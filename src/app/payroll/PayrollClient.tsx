"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import {
  getPayPeriodDates,
  formatPayPeriod,
  getPayPeriodNumber,
  getHoursStatusColor,
  PAY_PERIOD_CHECKLIST,
  parseHoursCSV,
  ACA_CONFIG,
} from "@/lib/aca-calculations";
import type {
  EligibilityDashboardRow,
  Employee,
  PayPeriodChecklistRecord,
} from "@/lib/types";

interface Props {
  initialDashboard: EligibilityDashboardRow[];
  variableEmployees: Pick<Employee, "id" | "first_name" | "last_name" | "employee_type" | "employment_status">[];
  userId: string;
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: "In Progress",
  complete: "Complete",
  pending_offer: "Offer Needed",
  offer_sent: "Offer Sent",
  enrolled: "Enrolled",
  declined: "Declined",
  not_full_time: "Not Full-Time",
};

const STATUS_COLORS: Record<string, string> = {
  in_progress: "bg-blue-100 text-blue-800",
  complete: "bg-gray-100 text-gray-700",
  pending_offer: "bg-orange-100 text-orange-800",
  offer_sent: "bg-purple-100 text-purple-800",
  enrolled: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  not_full_time: "bg-gray-100 text-gray-600",
};

const HOURS_COLORS = {
  green: "text-green-700 bg-green-50",
  amber: "text-amber-700 bg-amber-50",
  red: "text-red-700 bg-red-50",
  gray: "text-gray-500",
};

type Tab = "dashboard" | "hours" | "board";

export default function PayrollClient({ initialDashboard, variableEmployees, userId }: Props) {
  const supabase = createClient();
  const { showToast } = useToast();

  const [dashboard, setDashboard] = useState<EligibilityDashboardRow[]>(initialDashboard);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [checklist, setChecklist] = useState<PayPeriodChecklistRecord[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(false);

  // Hours entry state
  const [hoursMap, setHoursMap] = useState<Record<string, string>>({});
  const [savingHours, setSavingHours] = useState(false);

  // CSV import state
  const [csvMode, setCsvMode] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvPreview, setCsvPreview] = useState<ReturnType<typeof parseHoursCSV> | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);

  // Current pay period
  const today = new Date();
  const { start: ppStart, end: ppEnd } = getPayPeriodDates(today);
  const ppLabel = formatPayPeriod(ppStart, ppEnd);
  const ppNumber = getPayPeriodNumber(ppStart);
  const taxYear = ppStart.getFullYear();
  const ppStartStr = ppStart.toISOString().split("T")[0];

  // Load checklist on mount
  useEffect(() => {
    loadChecklist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadChecklist() {
    setChecklistLoading(true);
    try {
      const { data } = await supabase
        .from("pay_period_checklist")
        .select("*")
        .eq("pay_period_start", ppStartStr);

      if (!data || data.length === 0) {
        // Initialize checklist for this pay period
        const items = PAY_PERIOD_CHECKLIST.map((item) => ({
          pay_period_start: ppStartStr,
          tax_year: taxYear,
          checklist_item_key: item.key,
          is_complete: false,
        }));
        const { data: inserted } = await supabase
          .from("pay_period_checklist")
          .upsert(items, { onConflict: "pay_period_start,checklist_item_key" })
          .select("*");
        setChecklist((inserted ?? []) as PayPeriodChecklistRecord[]);
      } else {
        setChecklist(data as PayPeriodChecklistRecord[]);
      }
    } catch {
      // Table may not exist yet
    } finally {
      setChecklistLoading(false);
    }
  }

  async function toggleChecklistItem(key: string, currentValue: boolean) {
    const { error } = await supabase
      .from("pay_period_checklist")
      .update({
        is_complete: !currentValue,
        completed_by: !currentValue ? userId : null,
        completed_at: !currentValue ? new Date().toISOString() : null,
      })
      .eq("pay_period_start", ppStartStr)
      .eq("checklist_item_key", key);

    if (error) {
      showToast("Failed to update checklist.", "error");
    } else {
      setChecklist((prev) =>
        prev.map((item) =>
          item.checklist_item_key === key
            ? { ...item, is_complete: !currentValue }
            : item
        )
      );
    }
  }

  async function saveHours() {
    const entries = Object.entries(hoursMap).filter(([, v]) => v !== "" && !isNaN(parseFloat(v)));
    if (entries.length === 0) {
      showToast("No hours to save.", "warning");
      return;
    }
    setSavingHours(true);
    const ppEndStr = ppEnd.toISOString().split("T")[0];
    const rows = entries.map(([employeeId, hours]) => ({
      employee_id: employeeId,
      pay_period_start: ppStartStr,
      pay_period_end: ppEndStr,
      pay_period_number: ppNumber,
      tax_year: taxYear,
      hours_worked: parseFloat(hours),
      aca_countable_hours: parseFloat(hours),
      hours_type: "regular",
      data_source: "manual",
      created_by: userId,
    }));

    const { error } = await supabase
      .from("pay_period_hours")
      .upsert(rows, { onConflict: "employee_id,pay_period_start,hours_type" });

    if (error) {
      showToast("Failed to save hours: " + error.message, "error");
    } else {
      showToast(`Saved hours for ${entries.length} employee${entries.length > 1 ? "s" : ""}.`, "success");
      setHoursMap({});
      refreshDashboard();
    }
    setSavingHours(false);
  }

  async function refreshDashboard() {
    try {
      const { data } = await supabase
        .from("eligibility_dashboard")
        .select("*")
        .order("full_name");
      if (data) setDashboard(data as EligibilityDashboardRow[]);
    } catch {
      // ignore
    }
  }

  function handleCsvParse() {
    const result = parseHoursCSV(csvText);
    setCsvPreview(result);
  }

  async function handleCsvImport() {
    if (!csvPreview || csvPreview.rows.length === 0) return;
    setCsvImporting(true);

    // Match rows to employees
    const ppEndStr = ppEnd.toISOString().split("T")[0];
    const rows: object[] = [];
    const unmatched: string[] = [];

    for (const row of csvPreview.rows) {
      // Find matching employee by last_name + first_name
      const match = variableEmployees.find(
        (e) =>
          e.last_name.toLowerCase() === row.last_name.toLowerCase() &&
          e.first_name.toLowerCase() === row.first_name.toLowerCase()
      );
      if (!match) {
        unmatched.push(`${row.last_name}, ${row.first_name}`);
        continue;
      }
      rows.push({
        employee_id: match.id,
        pay_period_start: row.pay_period_start,
        pay_period_end: ppEndStr,
        pay_period_number: getPayPeriodNumber(new Date(row.pay_period_start)),
        tax_year: parseInt(row.pay_period_start.split("-")[0]),
        hours_worked: row.total_hours,
        aca_countable_hours: row.total_hours,
        hours_type: "regular",
        data_source: "csv_import",
        imported_at: new Date().toISOString(),
        created_by: userId,
      });
    }

    if (rows.length > 0) {
      const { error } = await supabase
        .from("pay_period_hours")
        .upsert(rows, { onConflict: "employee_id,pay_period_start,hours_type" });
      if (error) {
        showToast("Import failed: " + error.message, "error");
        setCsvImporting(false);
        return;
      }
    }

    let msg = `Imported ${rows.length} record${rows.length !== 1 ? "s" : ""}.`;
    if (unmatched.length > 0) {
      msg += ` ${unmatched.length} row${unmatched.length > 1 ? "s" : ""} not matched: ${unmatched.join(", ")}`;
    }
    showToast(msg, rows.length > 0 ? "success" : "warning");
    setCsvMode(false);
    setCsvText("");
    setCsvPreview(null);
    refreshDashboard();
    setCsvImporting(false);
  }

  // Summary stats
  const crossedThreshold = dashboard.filter((r) => r.warning_crossed_threshold).length;
  const inAdmin = dashboard.filter((r) => r.in_admin_period).length;
  const pendingOffers = dashboard.filter((r) => r.warning_offer_not_sent).length;
  const expiredOffers = dashboard.filter((r) => r.warning_offer_expired).length;
  const approachingThreshold = dashboard.filter((r) => r.warning_approaching_threshold).length;

  const checklistComplete = checklist.filter((i) => i.is_complete).length;
  const checklistTotal = checklist.length || PAY_PERIOD_CHECKLIST.length;

  const variableRows = dashboard.filter(
    (r) => r.employee_type !== "full_time"
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pay Period Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {ppLabel} · Period {ppNumber} of 24
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          {(
            [
              { id: "dashboard", label: "Overview & Checklist" },
              { id: "hours", label: "Hours Entry" },
              { id: "board", label: "Status Board" },
            ] as { id: Tab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-navy-600 text-navy-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab: Overview & Checklist ── */}
      {activeTab === "dashboard" && (
        <div className="space-y-8">
          {/* Section A: Stat Cards */}
          <div>
            <h2 className="text-base font-semibold text-gray-700 mb-3">This Pay Period at a Glance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Crossed 30 hr/wk"
                value={crossedThreshold}
                color={crossedThreshold > 0 ? "red" : "green"}
                href="/payroll?tab=board"
              />
              <StatCard
                label="In Admin Period"
                value={inAdmin}
                color={inAdmin > 0 ? "amber" : "green"}
                href="/payroll/offers"
              />
              <StatCard
                label="Offers Not Sent"
                value={pendingOffers}
                color={pendingOffers > 0 ? "red" : "green"}
                href="/payroll/offers"
              />
              <StatCard
                label="Expired Offers"
                value={expiredOffers}
                color={expiredOffers > 0 ? "red" : "green"}
                href="/payroll/offers"
              />
            </div>
            {approachingThreshold > 0 && (
              <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                ⚡ {approachingThreshold} employee{approachingThreshold > 1 ? "s" : ""} averaging 25–29 hrs/week — monitor closely
              </p>
            )}
          </div>

          {/* Section B: Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-700">
                Pay Period Checklist
              </h2>
              <span className="text-sm text-gray-500">
                {checklistComplete}/{checklistTotal} complete
              </span>
            </div>

            {checklistLoading ? (
              <p className="text-sm text-gray-400">Loading checklist…</p>
            ) : (
              <div className="card divide-y divide-gray-100">
                {PAY_PERIOD_CHECKLIST.map((item) => {
                  const record = checklist.find((c) => c.checklist_item_key === item.key);
                  const isComplete = record?.is_complete ?? false;
                  return (
                    <div key={item.key} className="flex items-start gap-3 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isComplete}
                        onChange={() => toggleChecklistItem(item.key, isComplete)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-navy-600 cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isComplete ? "line-through text-gray-400" : "text-gray-800"}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Hours Entry ── */}
      {activeTab === "hours" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-700">
              Hours Entry — {ppLabel}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCsvMode(!csvMode)}
                className="btn-secondary text-sm"
              >
                {csvMode ? "Manual Entry" : "CSV Import"}
              </button>
            </div>
          </div>

          {/* ACA Hours Tooltip */}
          <details className="bg-blue-50 border border-blue-200 rounded-md px-4 py-3 text-sm text-blue-800">
            <summary className="font-medium cursor-pointer">What hours count for ACA? (click to expand)</summary>
            <ul className="mt-2 space-y-0.5 list-disc list-inside text-blue-700">
              <li>Regular hours worked</li>
              <li>Overtime hours</li>
              <li>Paid time off (vacation, sick, personal)</li>
              <li>Holiday pay</li>
              <li>FMLA leave</li>
              <li>Jury duty pay &amp; military leave pay</li>
              <li>On-call hours if employee must remain on premises</li>
            </ul>
            <p className="mt-2 font-medium">
              Full-time threshold: {ACA_CONFIG.hoursPerSemiMonthlyPeriod} hrs per semi-monthly period = {ACA_CONFIG.hoursPerWeekThreshold} hrs/week average
            </p>
          </details>

          {!csvMode ? (
            /* Manual entry table */
            <div>
              {variableEmployees.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No variable-hour or part-time active employees found.{" "}
                  <Link href="/tracker" className="text-navy-600 hover:underline">
                    Add employees in the Employee Tracker.
                  </Link>
                </p>
              ) : (
                <>
                  <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Employee</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Type</th>
                          <th className="text-center px-4 py-2 font-medium text-gray-600">Avg hrs/wk</th>
                          <th className="text-center px-4 py-2 font-medium text-gray-600">
                            Hours — {ppLabel}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {variableEmployees.map((emp) => {
                          const dashRow = dashboard.find((r) => r.employee_id === emp.id);
                          const avg = dashRow?.avg_hours_per_week ?? null;
                          const colorKey = getHoursStatusColor(avg);
                          return (
                            <tr key={emp.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium text-gray-900">
                                <Link
                                  href={`/payroll/employees/${emp.id}`}
                                  className="hover:text-navy-600 hover:underline"
                                >
                                  {emp.last_name}, {emp.first_name}
                                </Link>
                              </td>
                              <td className="px-4 py-2 text-gray-500 capitalize">
                                {emp.employee_type.replace("_", " ")}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {avg !== null ? (
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${HOURS_COLORS[colorKey]}`}
                                  >
                                    {avg.toFixed(1)} hrs/wk
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">No data</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="200"
                                  step="0.5"
                                  placeholder="0"
                                  value={hoursMap[emp.id] ?? ""}
                                  onChange={(e) =>
                                    setHoursMap((prev) => ({ ...prev, [emp.id]: e.target.value }))
                                  }
                                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-1 focus:ring-navy-400 focus:border-navy-400"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={saveHours}
                      disabled={savingHours}
                      className="btn-primary"
                    >
                      {savingHours ? "Saving…" : "Save Hours"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* CSV import */
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Paste your CSV export below. Expected format:
                </p>
                <pre className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs text-gray-600 overflow-x-auto">
{`employee_last_name,employee_first_name,pay_period_start,hours_regular,hours_pto,hours_other
Smith,John,2026-03-01,62.5,0,0
Johnson,Maria,2026-03-01,70.0,0,0`}
                </pre>
              </div>
              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Paste CSV here…"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-navy-400 focus:border-navy-400"
              />
              <button onClick={handleCsvParse} className="btn-secondary">
                Preview Import
              </button>

              {csvPreview && (
                <div className="space-y-3">
                  {csvPreview.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
                      <p className="text-sm font-medium text-red-700 mb-1">Errors found:</p>
                      <ul className="text-xs text-red-600 list-disc list-inside space-y-0.5">
                        {csvPreview.errors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  )}

                  {csvPreview.rows.length > 0 && (
                    <>
                      <p className="text-sm font-medium text-gray-700">
                        Preview — {csvPreview.rows.length} row{csvPreview.rows.length !== 1 ? "s" : ""}:
                      </p>
                      <div className="card overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                              <th className="text-left px-3 py-2 font-medium text-gray-600">Pay Period Start</th>
                              <th className="text-right px-3 py-2 font-medium text-gray-600">Regular</th>
                              <th className="text-right px-3 py-2 font-medium text-gray-600">PTO</th>
                              <th className="text-right px-3 py-2 font-medium text-gray-600">Other</th>
                              <th className="text-right px-3 py-2 font-medium text-gray-600">Total (ACA)</th>
                              <th className="text-center px-3 py-2 font-medium text-gray-600">Match</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {csvPreview.rows.map((row, i) => {
                              const match = variableEmployees.find(
                                (e) =>
                                  e.last_name.toLowerCase() === row.last_name.toLowerCase() &&
                                  e.first_name.toLowerCase() === row.first_name.toLowerCase()
                              );
                              return (
                                <tr key={i} className={match ? "" : "bg-red-50"}>
                                  <td className="px-3 py-2">{row.last_name}, {row.first_name}</td>
                                  <td className="px-3 py-2">{row.pay_period_start}</td>
                                  <td className="px-3 py-2 text-right">{row.hours_regular}</td>
                                  <td className="px-3 py-2 text-right">{row.hours_pto}</td>
                                  <td className="px-3 py-2 text-right">{row.hours_other}</td>
                                  <td className="px-3 py-2 text-right font-medium">{row.total_hours.toFixed(1)}</td>
                                  <td className="px-3 py-2 text-center">
                                    {match ? (
                                      <span className="text-green-600 text-xs">✓ Matched</span>
                                    ) : (
                                      <span className="text-red-600 text-xs">✗ No match</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={handleCsvImport}
                          disabled={csvImporting}
                          className="btn-primary"
                        >
                          {csvImporting ? "Importing…" : "Confirm Import"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Status Board ── */}
      {activeTab === "board" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-700" id="eligibility-board">
              Measurement Period Status Board
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> &lt;25 hrs/wk</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> 25–29 hrs/wk</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> 30+ hrs/wk</span>
            </div>
          </div>

          {variableRows.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <p>No variable-hour, part-time, or seasonal employees with measurement periods.</p>
              <Link href="/tracker" className="text-navy-600 hover:underline text-sm mt-2 inline-block">
                Set up employees in the Employee Tracker
              </Link>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Employee</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Period Type</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Measurement Dates</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Hours YTD</th>
                    <th className="text-center px-4 py-2 font-medium text-gray-600">Avg hrs/wk</th>
                    <th className="text-center px-4 py-2 font-medium text-gray-600">Days Left</th>
                    <th className="text-center px-4 py-2 font-medium text-gray-600">Status</th>
                    <th className="text-center px-4 py-2 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {variableRows.map((row) => {
                    const colorKey = getHoursStatusColor(row.avg_hours_per_week ?? null);
                    const statusLabel = STATUS_LABELS[row.measurement_status ?? ""] ?? "—";
                    const statusColor = STATUS_COLORS[row.measurement_status ?? ""] ?? "bg-gray-100 text-gray-600";

                    return (
                      <tr key={row.employee_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">
                          <Link
                            href={`/payroll/employees/${row.employee_id}`}
                            className="hover:text-navy-600 hover:underline"
                          >
                            {row.full_name}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-gray-600 capitalize">
                          {row.period_type ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-gray-600 text-xs">
                          {row.measurement_start && row.measurement_end
                            ? `${row.measurement_start} → ${row.measurement_end}`
                            : "Not started"}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-700">
                          {row.total_hours_worked != null
                            ? row.total_hours_worked.toFixed(1)
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {row.avg_hours_per_week != null ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${HOURS_COLORS[colorKey]}`}
                            >
                              {row.avg_hours_per_week.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center text-gray-600">
                          {row.days_remaining_in_measurement ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          {row.measurement_status === "pending_offer" ? (
                            <Link
                              href="/payroll/offers"
                              className="text-xs text-white bg-navy-600 hover:bg-navy-700 px-2 py-1 rounded"
                            >
                              Generate Offer
                            </Link>
                          ) : (
                            <Link
                              href={`/payroll/employees/${row.employee_id}`}
                              className="text-xs text-navy-600 hover:underline"
                            >
                              View Details
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: number;
  color: "red" | "amber" | "green";
  href: string;
}) {
  const colorMap = {
    red: "text-red-700 bg-red-50 border-red-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    green: "text-green-700 bg-green-50 border-green-200",
  };
  return (
    <Link
      href={href}
      className={`card border rounded-lg p-4 flex flex-col items-center hover:shadow-md transition-shadow ${colorMap[color]}`}
    >
      <span className="text-3xl font-bold">{value}</span>
      <span className="text-xs font-medium mt-1 text-center">{label}</span>
    </Link>
  );
}
