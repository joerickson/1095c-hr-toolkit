"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { calcCoverageStartDate } from "@/lib/aca-calculations";
import type { EligibilityDashboardRow, OfferLetter } from "@/lib/types";

interface Props {
  dashboardRows: EligibilityDashboardRow[];
  allOffers: OfferLetter[];
  userId: string;
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateInput(d: Date): string {
  return d.toISOString().split("T")[0];
}

const PLAN_LABELS: Record<string, string> = {
  P1: "Plan 1 — MEC ($145/mo)",
  P2: "Plan 2 — Self-Insured",
  P3: "Plan 3 — Select Health",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  sent: "bg-purple-100 text-purple-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  expired: "bg-gray-200 text-gray-600",
};

type Tab = "queue" | "all_offers";

interface GenerateForm {
  employeeId: string;
  employeeName: string;
  measurementPeriodId: string | null;
  periodType: "standard" | "initial";
  hireDate: string | null;
  measurementEndDate: string | null;
  offerDate: string;
  offerDeadline: string;
  coverageStartDate: string;
}

interface ResponseForm {
  offerId: string;
  employeeName: string;
  response: "accepted" | "declined" | "no_response" | "";
  planSelected: "P1" | "P2" | "P3" | "";
  waiverOnFile: boolean;
  notes: string;
}

export default function OffersClient({ dashboardRows, allOffers, userId }: Props) {
  const supabase = createClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("queue");
  const [offers, setOffers] = useState<OfferLetter[]>(allOffers);
  const [dashboard, setDashboard] = useState<EligibilityDashboardRow[]>(dashboardRows);

  // Generate offer modal
  const [generateForm, setGenerateForm] = useState<GenerateForm | null>(null);
  const [generating, setGenerating] = useState(false);

  // Record response modal
  const [responseForm, setResponseForm] = useState<ResponseForm | null>(null);
  const [recording, setRecording] = useState(false);

  // Print offer modal
  const [printOffer, setPrintOffer] = useState<{ offer: OfferLetter; row: EligibilityDashboardRow | undefined } | null>(null);

  async function refreshData() {
    try {
      const [dashRes, offRes] = await Promise.all([
        supabase.from("eligibility_dashboard").select("*").order("full_name"),
        supabase.from("offer_letters").select("*").order("offer_date", { ascending: false }),
      ]);
      if (dashRes.data) setDashboard(dashRes.data as EligibilityDashboardRow[]);
      if (offRes.data) setOffers(offRes.data as OfferLetter[]);
    } catch {
      // ignore
    }
  }

  function openGenerateForm(row: EligibilityDashboardRow) {
    const today = new Date();
    const measurementEnd = row.measurement_end ? new Date(row.measurement_end) : null;
    const hireDate = row.hire_date ? new Date(row.hire_date) : undefined;
    const periodType = row.period_type ?? "standard";

    let coverageStart: Date;
    try {
      coverageStart = calcCoverageStartDate(periodType, measurementEnd ?? today, hireDate);
    } catch {
      coverageStart = new Date(today.getFullYear() + 1, 0, 1);
    }

    // Offer deadline: 30 days from today, but never after coverage start - 1 day
    const deadlineFromToday = addDays(today, 30);
    const deadlineMax = addDays(coverageStart, -1);
    const offerDeadline = deadlineFromToday < deadlineMax ? deadlineFromToday : deadlineMax;

    setGenerateForm({
      employeeId: row.employee_id,
      employeeName: row.full_name,
      measurementPeriodId: row.current_measurement_period_id,
      periodType,
      hireDate: row.hire_date,
      measurementEndDate: row.measurement_end,
      offerDate: toDateInput(today),
      offerDeadline: toDateInput(offerDeadline),
      coverageStartDate: toDateInput(coverageStart),
    });
  }

  async function handleGenerateOffer() {
    if (!generateForm) return;
    setGenerating(true);

    const { data: offer, error } = await supabase
      .from("offer_letters")
      .insert({
        employee_id: generateForm.employeeId,
        measurement_period_id: generateForm.measurementPeriodId,
        offer_date: generateForm.offerDate,
        offer_deadline: generateForm.offerDeadline,
        coverage_start_date: generateForm.coverageStartDate,
        plans_offered: ["P1", "P2", "P3"],
        status: "sent",
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      showToast("Failed to create offer letter: " + error.message, "error");
      setGenerating(false);
      return;
    }

    // Log eligibility event
    await supabase.from("eligibility_events").insert({
      employee_id: generateForm.employeeId,
      measurement_period_id: generateForm.measurementPeriodId,
      event_type: "offer_generated",
      event_date: generateForm.offerDate,
      description: `Offer letter generated. Coverage start: ${generateForm.coverageStartDate}. Deadline: ${generateForm.offerDeadline}.`,
      triggered_by: "hr_user",
      created_by: userId,
      snapshot: {
        coverage_start_date: generateForm.coverageStartDate,
        offer_deadline: generateForm.offerDeadline,
        plans_offered: ["P1", "P2", "P3"],
      },
    });

    // Update measurement period status
    if (generateForm.measurementPeriodId) {
      await supabase
        .from("measurement_periods")
        .update({ status: "offer_sent", offer_sent_date: generateForm.offerDate, updated_by: userId })
        .eq("id", generateForm.measurementPeriodId);
    }

    showToast(`Offer letter created for ${generateForm.employeeName}.`, "success");

    // Open print preview
    const row = dashboard.find((r) => r.employee_id === generateForm.employeeId);
    setPrintOffer({ offer: offer as OfferLetter, row });

    setGenerateForm(null);
    setGenerating(false);
    await refreshData();
  }

  function openResponseForm(offer: OfferLetter) {
    const row = dashboard.find((r) => r.employee_id === offer.employee_id);
    setResponseForm({
      offerId: offer.id,
      employeeName: row?.full_name ?? "Unknown Employee",
      response: offer.response ?? "",
      planSelected: offer.plan_selected ?? "",
      waiverOnFile: offer.waiver_on_file,
      notes: offer.notes ?? "",
    });
  }

  async function handleRecordResponse() {
    if (!responseForm || !responseForm.response) return;
    setRecording(true);

    const updates: Partial<OfferLetter> = {
      response: responseForm.response,
      response_date: new Date().toISOString().split("T")[0],
      status: responseForm.response === "accepted" ? "accepted" : "declined",
      notes: responseForm.notes || null,
      waiver_on_file: responseForm.waiverOnFile,
    };
    if (responseForm.response === "accepted" && responseForm.planSelected) {
      updates.plan_selected = responseForm.planSelected as "P1" | "P2" | "P3";
    }
    if (responseForm.waiverOnFile) {
      updates.waiver_date = new Date().toISOString().split("T")[0];
    }

    const { data: updatedOffer, error } = await supabase
      .from("offer_letters")
      .update(updates)
      .eq("id", responseForm.offerId)
      .select()
      .single();

    if (error) {
      showToast("Failed to record response: " + error.message, "error");
      setRecording(false);
      return;
    }

    // Find employee_id from current offers
    const currentOffer = offers.find((o) => o.id === responseForm.offerId);
    if (currentOffer) {
      const eventType =
        responseForm.response === "accepted"
          ? "offer_accepted"
          : responseForm.response === "declined"
          ? "offer_declined"
          : "offer_no_response";

      await supabase.from("eligibility_events").insert({
        employee_id: currentOffer.employee_id,
        measurement_period_id: currentOffer.measurement_period_id,
        event_type: eventType,
        event_date: new Date().toISOString().split("T")[0],
        description: `Response recorded: ${responseForm.response}${responseForm.planSelected ? `, Plan: ${responseForm.planSelected}` : ""}${responseForm.waiverOnFile ? ", Waiver on file" : ""}`,
        triggered_by: "hr_user",
        created_by: userId,
        snapshot: {
          response: responseForm.response,
          plan_selected: responseForm.planSelected || null,
          waiver_on_file: responseForm.waiverOnFile,
        },
      });

      // Update measurement period
      if (currentOffer.measurement_period_id) {
        await supabase
          .from("measurement_periods")
          .update({
            status: responseForm.response === "accepted" ? "enrolled" : "declined",
            offer_response: responseForm.response,
            offer_response_date: new Date().toISOString().split("T")[0],
            plan_selected: responseForm.planSelected || null,
            updated_by: userId,
          })
          .eq("id", currentOffer.measurement_period_id);
      }
    }

    showToast("Response recorded successfully.", "success");
    setResponseForm(null);
    setRecording(false);
    await refreshData();
  }

  // Queue: employees who are full-time determined with no offer sent
  const offerQueue = dashboard.filter(
    (r) =>
      (r.measurement_status === "pending_offer" || r.warning_offer_not_sent) &&
      !r.offer_letter_id
  );

  // Sort by urgency (days until coverage)
  const sortedQueue = [...offerQueue].sort((a, b) => {
    const da = a.days_until_coverage_must_start ?? 999;
    const db = b.days_until_coverage_must_start ?? 999;
    return da - db;
  });

  // Check for important timing alerts
  const standardAlertRows = dashboard.filter((r) => {
    if (r.period_type !== "standard" || !r.in_admin_period) return false;
    const today = new Date();
    const nov15 = new Date(today.getFullYear(), 10, 15); // Nov 15
    return today >= nov15 && !r.offer_letter_id;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offer Letters</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate and track benefit offers for newly eligible employees
          </p>
        </div>
      </div>

      {/* Timing alerts */}
      {standardAlertRows.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-4 text-sm text-red-700">
          ⚠ It&apos;s past November 15 — {standardAlertRows.length} standard measurement employee{standardAlertRows.length > 1 ? "s" : ""} still need{standardAlertRows.length === 1 ? "s" : ""} offer letters sent before coverage starts January 1.
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          {(
            [
              { id: "queue", label: `Offer Queue${sortedQueue.length > 0 ? ` (${sortedQueue.length})` : ""}` },
              { id: "all_offers", label: `All Offers${offers.length > 0 ? ` (${offers.length})` : ""}` },
            ] as { id: Tab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-navy-600 text-navy-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab: Offer Queue ── */}
      {activeTab === "queue" && (
        <div>
          {sortedQueue.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No employees in the offer queue.</p>
              <p className="text-sm mt-1">
                Employees appear here when their measurement period completes and they averaged ≥ 30 hrs/week.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {sortedQueue.length} employee{sortedQueue.length > 1 ? "s" : ""} need{sortedQueue.length === 1 ? "s" : ""} an offer letter. Sorted by urgency.
              </p>
              <div className="space-y-3">
                {sortedQueue.map((row) => {
                  const daysLeft = row.days_until_coverage_must_start;
                  const isUrgent = daysLeft !== null && daysLeft <= 30;

                  return (
                    <div
                      key={row.employee_id}
                      className={`card flex items-center justify-between gap-4 flex-wrap border ${
                        isUrgent ? "border-red-200 bg-red-50" : "border-gray-200"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/payroll/employees/${row.employee_id}`}
                            className="font-semibold text-gray-900 hover:text-navy-600 hover:underline"
                          >
                            {row.full_name}
                          </Link>
                          <span className="text-xs text-gray-500 capitalize">
                            {row.period_type} measurement
                          </span>
                          {isUrgent && (
                            <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-0.5 rounded-full">
                              {daysLeft} days until coverage must start
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 space-x-3">
                          <span>Avg: {row.avg_hours_per_week?.toFixed(1) ?? "—"} hrs/wk</span>
                          <span>Total: {row.total_hours_worked?.toFixed(0) ?? "—"} hrs</span>
                          <span>Measurement ended: {formatDate(row.measurement_end)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => openGenerateForm(row)}
                        className="btn-primary text-sm flex-shrink-0"
                      >
                        Generate Offer
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab: All Offers ── */}
      {activeTab === "all_offers" && (
        <div>
          {offers.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <p>No offer letters on record yet.</p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Employee</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Offer Date</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Deadline</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Coverage Start</th>
                    <th className="text-center px-4 py-2 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Plan Selected</th>
                    <th className="text-center px-4 py-2 font-medium text-gray-600">Waiver</th>
                    <th className="text-center px-4 py-2 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {offers.map((offer) => {
                    const row = dashboard.find((r) => r.employee_id === offer.employee_id);
                    const isExpired =
                      offer.status === "pending" &&
                      new Date(offer.offer_deadline) < new Date();
                    const displayStatus = isExpired ? "expired" : offer.status;
                    return (
                      <tr key={offer.id} className={`hover:bg-gray-50 ${isExpired ? "bg-red-50" : ""}`}>
                        <td className="px-4 py-2 font-medium">
                          <Link
                            href={`/payroll/employees/${offer.employee_id}`}
                            className="hover:text-navy-600 hover:underline"
                          >
                            {row?.full_name ?? "Unknown"}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-gray-600">{formatDate(offer.offer_date)}</td>
                        <td className={`px-4 py-2 ${isExpired ? "text-red-600 font-medium" : "text-gray-600"}`}>
                          {formatDate(offer.offer_deadline)}
                        </td>
                        <td className="px-4 py-2 text-gray-600">{formatDate(offer.coverage_start_date)}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[displayStatus] ?? "bg-gray-100 text-gray-600"}`}>
                            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {offer.plan_selected ? PLAN_LABELS[offer.plan_selected] : "—"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {offer.waiver_on_file ? (
                            <span className="text-green-600 text-xs">✓</span>
                          ) : offer.response === "declined" ? (
                            <span className="text-red-600 text-xs">✗</span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {(offer.status === "pending" || offer.status === "sent") && (
                            <button
                              onClick={() => openResponseForm(offer)}
                              className="text-xs text-navy-600 hover:underline"
                            >
                              Record Response
                            </button>
                          )}
                          {(offer.status === "pending" || offer.status === "sent") && (
                            <button
                              onClick={() => setPrintOffer({ offer, row })}
                              className="text-xs text-gray-500 hover:underline ml-2"
                            >
                              Print
                            </button>
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

      {/* ── Generate Offer Modal ── */}
      {generateForm && (
        <Modal title={`Generate Offer — ${generateForm.employeeName}`} onClose={() => setGenerateForm(null)}>
          <div className="space-y-4">
            {/* Timing rules info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-xs text-blue-700">
              {generateForm.periodType === "standard" ? (
                <>
                  <strong>Standard measurement:</strong> Offer must be sent Nov 1 – Nov 30. Coverage starts January 1.
                </>
              ) : (
                <>
                  <strong>Initial measurement:</strong> Coverage must start no later than 13 months + 1 day from hire date.
                  The 90-day waiting period begins from the full-time determination date.
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Date</label>
                <input
                  type="date"
                  value={generateForm.offerDate}
                  onChange={(e) => setGenerateForm((f) => f && { ...f, offerDate: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Response Deadline</label>
                <input
                  type="date"
                  value={generateForm.offerDeadline}
                  onChange={(e) => setGenerateForm((f) => f && { ...f, offerDeadline: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Start Date</label>
              <input
                type="date"
                value={generateForm.coverageStartDate}
                onChange={(e) => setGenerateForm((f) => f && { ...f, coverageStartDate: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Plans Being Offered</p>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-navy-600 flex-shrink-0 flex items-center justify-center text-white text-xs">✓</span>
                  Plan 1 — MEC ($145.00/mo employee-only)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-navy-600 flex-shrink-0 flex items-center justify-center text-white text-xs">✓</span>
                  Plan 2 — Self-Insured
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-navy-600 flex-shrink-0 flex items-center justify-center text-white text-xs">✓</span>
                  Plan 3 — Select Health
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setGenerateForm(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleGenerateOffer} disabled={generating} className="btn-primary">
                {generating ? "Creating…" : "Create Offer Letter"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Record Response Modal ── */}
      {responseForm && (
        <Modal title={`Record Response — ${responseForm.employeeName}`} onClose={() => setResponseForm(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Response</label>
              <select
                value={responseForm.response}
                onChange={(e) =>
                  setResponseForm((f) => f && { ...f, response: e.target.value as typeof f.response })
                }
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              >
                <option value="">Select…</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="no_response">No Response</option>
              </select>
            </div>

            {responseForm.response === "accepted" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Selected</label>
                <select
                  value={responseForm.planSelected}
                  onChange={(e) =>
                    setResponseForm((f) => f && { ...f, planSelected: e.target.value as typeof f.planSelected })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                >
                  <option value="">Select plan…</option>
                  <option value="P1">Plan 1 — MEC</option>
                  <option value="P2">Plan 2 — Self-Insured</option>
                  <option value="P3">Plan 3 — Select Health</option>
                </select>
                <p className="text-xs text-amber-600 mt-1">
                  ⚡ Remember to enter this election in WinTeam INS: Benefits by Employee.
                </p>
              </div>
            )}

            {(responseForm.response === "declined" || responseForm.response === "no_response") && (
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={responseForm.waiverOnFile}
                    onChange={(e) =>
                      setResponseForm((f) => f && { ...f, waiverOnFile: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-navy-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Signed waiver on file</span>
                </label>
                {!responseForm.waiverOnFile && (
                  <p className="text-xs text-red-600 mt-1">
                    A signed waiver is required for declined offers. This protects the employer if the IRS questions a marketplace subsidy.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                rows={2}
                value={responseForm.notes}
                onChange={(e) => setResponseForm((f) => f && { ...f, notes: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                placeholder="Any additional notes…"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setResponseForm(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleRecordResponse}
                disabled={recording || !responseForm.response}
                className="btn-primary"
              >
                {recording ? "Saving…" : "Save Response"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Print Offer Modal ── */}
      {printOffer && (
        <Modal title="Offer Letter Preview" onClose={() => setPrintOffer(null)} wide>
          <PrintableOffer offer={printOffer.offer} row={printOffer.row} />
          <div className="flex justify-end gap-3 mt-4 print:hidden">
            <button onClick={() => setPrintOffer(null)} className="btn-secondary">Close</button>
            <button onClick={() => window.print()} className="btn-primary">Print / Save PDF</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        className={`bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function PrintableOffer({
  offer,
  row,
}: {
  offer: OfferLetter;
  row: EligibilityDashboardRow | undefined;
}) {
  const name = row?.full_name ?? "Employee";
  const coverageStart = new Date(offer.coverage_start_date).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const deadline = new Date(offer.offer_deadline).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const offerDate = new Date(offer.offer_date).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="text-sm space-y-4 text-gray-800 print:text-black">
      <div className="text-center border-b pb-4">
        <p className="font-bold text-base">ABC Janitorial Services LLC</p>
        <p className="text-gray-500">ACA Benefit Offer Letter</p>
      </div>

      <div>
        <p><strong>Date:</strong> {offerDate}</p>
        <p><strong>To:</strong> {name}</p>
        <p><strong>Re:</strong> Health Insurance Benefit Offer</p>
      </div>

      <p>
        Based on a review of your hours worked over the past measurement period, you have been determined to be a full-time employee
        for ACA purposes averaging 30 or more hours per week. You are hereby offered the following health insurance coverage,
        effective <strong>{coverageStart}</strong>.
      </p>

      <div>
        <p className="font-semibold mb-2">Plans Available:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li><strong>Plan 1 — MEC:</strong> Minimum Essential Coverage, $145.00/month employee-only premium</li>
          <li><strong>Plan 2 — Self-Insured:</strong> Comprehensive coverage, see HR for premium details</li>
          <li><strong>Plan 3 — Select Health:</strong> Network plan, see HR for premium details</li>
        </ul>
      </div>

      <p>
        <strong>Response deadline: {deadline}.</strong> Please complete the enrollment form and return it to HR by this date.
        If you choose to decline coverage, you must sign a waiver form.
      </p>

      <p className="text-xs text-gray-500">
        This offer is made pursuant to the Employer Shared Responsibility provisions of IRC §4980H.
        Your coverage under the selected plan will begin {coverageStart} and continue through the end of the stability period.
      </p>

      <div className="mt-6 pt-4 border-t space-y-4">
        <div>
          <p className="font-medium mb-1">Employee Election:</p>
          <div className="space-y-1">
            {["Plan 1 — MEC", "Plan 2 — Self-Insured", "Plan 3 — Select Health", "I decline coverage"].map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input type="radio" name="election" className="h-4 w-4" />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-gray-500 mb-4">Employee Signature</p>
            <div className="border-b border-gray-400 h-6" />
            <p className="text-xs text-gray-500 mt-1">Signature &amp; Date</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-4">HR Representative</p>
            <div className="border-b border-gray-400 h-6" />
            <p className="text-xs text-gray-500 mt-1">Signature &amp; Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}
