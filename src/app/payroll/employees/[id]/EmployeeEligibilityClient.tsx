"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  Employee,
  MeasurementPeriod,
  PayPeriodHours,
  EligibilityEvent,
  OfferLetter,
} from "@/lib/types";
import { ACA_CONFIG, getHoursStatusColor } from "@/lib/aca-calculations";

interface Props {
  employee: Employee;
  measurementPeriods: MeasurementPeriod[];
  payPeriodHours: PayPeriodHours[];
  eligibilityEvents: EligibilityEvent[];
  offerLetters: OfferLetter[];
}

const PLAN_LABELS: Record<string, string> = {
  P1: "Plan 1 — MEC",
  P2: "Plan 2 — Self-Insured",
  P3: "Plan 3 — Select Health",
  declined: "Declined",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  measurement_started: "Measurement Started",
  measurement_completed: "Measurement Completed",
  full_time_determination: "Full-Time Determination",
  part_time_determination: "Part-Time Determination",
  waiting_period_started: "Waiting Period Started",
  waiting_period_completed: "Waiting Period Completed",
  offer_generated: "Offer Generated",
  offer_sent: "Offer Sent",
  offer_accepted: "Offer Accepted",
  offer_declined: "Offer Declined",
  offer_no_response: "Offer No Response",
  coverage_started: "Coverage Started",
  coverage_ended: "Coverage Ended",
  stability_period_started: "Stability Period Started",
  stability_period_ended: "Stability Period Ended",
  hours_threshold_warning: "Hours Warning",
  hours_threshold_crossed: "Threshold Crossed",
  manual_override: "Manual Override",
  note_added: "Note Added",
};

const EVENT_COLORS: Record<string, string> = {
  full_time_determination: "bg-red-100 text-red-700",
  offer_accepted: "bg-green-100 text-green-700",
  offer_declined: "bg-orange-100 text-orange-700",
  hours_threshold_crossed: "bg-red-100 text-red-700",
  coverage_started: "bg-green-100 text-green-700",
};

const OFFER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function HoursBarChart({ hours }: { hours: PayPeriodHours[] }) {
  const sorted = [...hours].sort(
    (a, b) => new Date(a.pay_period_start).getTime() - new Date(b.pay_period_start).getTime()
  );
  if (sorted.length === 0) {
    return <p className="text-gray-400 text-sm py-8 text-center">No hours data yet.</p>;
  }

  const maxH = Math.max(...sorted.map((h) => h.hours_worked), ACA_CONFIG.hoursPerSemiMonthlyPeriod + 10);
  const thresholdPct = (ACA_CONFIG.hoursPerSemiMonthlyPeriod / maxH) * 100;

  return (
    <div className="relative w-full overflow-x-auto">
      <div className="min-w-[400px]">
        <div className="relative flex items-end gap-1 h-40 px-2">
          {/* Threshold line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-red-400 pointer-events-none"
            style={{ bottom: `${thresholdPct}%` }}
          >
            <span className="absolute right-0 -top-4 text-xs text-red-500 font-medium">
              {ACA_CONFIG.hoursPerSemiMonthlyPeriod} hrs
            </span>
          </div>

          {sorted.map((h, i) => {
            const pct = (h.hours_worked / maxH) * 100;
            const colorKey = getHoursStatusColor(h.hours_worked * (24 / 52));
            const barColor =
              colorKey === "red" ? "bg-red-400" : colorKey === "amber" ? "bg-amber-400" : "bg-blue-400";
            const label = new Date(h.pay_period_start).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${label}: ${h.hours_worked} hrs`}>
                <div className="w-full flex flex-col justify-end h-32">
                  <div
                    className={`w-full rounded-t transition-all ${barColor}`}
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                <span className="text-gray-400 text-xs" style={{ fontSize: "9px" }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-2 text-center">
          Dashed line = {ACA_CONFIG.hoursPerSemiMonthlyPeriod} hrs/period ({ACA_CONFIG.hoursPerWeekThreshold} hrs/week threshold)
        </p>
      </div>
    </div>
  );
}

function PeriodTimeline({
  period,
  today,
}: {
  period: MeasurementPeriod;
  today: Date;
}) {
  const segments = [
    {
      label: "Measurement",
      start: period.measurement_start,
      end: period.measurement_end,
      color: "bg-blue-400",
    },
    period.admin_start && period.admin_end
      ? {
          label: "Admin",
          start: period.admin_start,
          end: period.admin_end,
          color: "bg-amber-400",
        }
      : null,
    period.stability_start && period.stability_end
      ? {
          label: "Stability",
          start: period.stability_start,
          end: period.stability_end,
          color: "bg-green-400",
        }
      : null,
  ].filter(Boolean) as { label: string; start: string; end: string; color: string }[];

  const allDates = segments.flatMap((s) => [new Date(s.start), new Date(s.end)]);
  const minTime = Math.min(...allDates.map((d) => d.getTime()));
  const maxTime = Math.max(...allDates.map((d) => d.getTime()));
  const totalSpan = maxTime - minTime;

  function pct(date: string): number {
    return ((new Date(date).getTime() - minTime) / totalSpan) * 100;
  }

  const todayPct = Math.min(100, Math.max(0, ((today.getTime() - minTime) / totalSpan) * 100));

  return (
    <div className="relative w-full pt-6 pb-8">
      <div className="relative h-8 bg-gray-100 rounded-full overflow-visible">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={`absolute h-full rounded-full ${seg.color} opacity-80 flex items-center justify-center`}
            style={{
              left: `${pct(seg.start)}%`,
              width: `${pct(seg.end) - pct(seg.start)}%`,
            }}
            title={`${seg.label}: ${formatDate(seg.start)} → ${formatDate(seg.end)}`}
          >
            <span className="text-white text-xs font-medium truncate px-2">{seg.label}</span>
          </div>
        ))}
        {/* Today marker */}
        {todayPct >= 0 && todayPct <= 100 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-800 z-10"
            style={{ left: `${todayPct}%` }}
          >
            <span className="absolute -top-5 -translate-x-1/2 text-xs text-gray-700 font-medium whitespace-nowrap">
              Today
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{formatDate(segments[0].start)}</span>
        <span>{formatDate(segments[segments.length - 1].end)}</span>
      </div>
    </div>
  );
}

export default function EmployeeEligibilityClient({
  employee,
  measurementPeriods,
  payPeriodHours,
  eligibilityEvents,
  offerLetters,
}: Props) {
  const [activeSection, setActiveSection] = useState<"overview" | "history">("overview");
  const today = new Date();

  const currentPeriod = measurementPeriods[0] ?? null;
  const fullName = `${employee.first_name} ${employee.last_name}`;

  const hoursColorKey = getHoursStatusColor(currentPeriod?.avg_hours_per_week ?? null);
  const HOURS_COLORS = {
    green: "text-green-700 bg-green-50 border-green-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    red: "text-red-700 bg-red-50 border-red-200",
    gray: "text-gray-500",
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/payroll" className="hover:text-navy-600 hover:underline">Pay Period</Link>
        <span>›</span>
        <span className="text-gray-800">{fullName}</span>
      </div>

      {/* Section 1: Employee Summary */}
      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
              <span>Hired: {formatDate(employee.hire_date)}</span>
              <span>Type: <span className="capitalize">{employee.employee_type.replace("_", " ")}</span></span>
              {employee.hourly_rate && <span>Rate: ${employee.hourly_rate.toFixed(2)}/hr</span>}
              <span>Status: <span className="capitalize">{employee.employment_status.replace("_", " ")}</span></span>
            </div>
          </div>
          <div className="text-right">
            {employee.plan_enrolled ? (
              <div>
                <p className="text-xs text-gray-500">Currently Enrolled</p>
                <p className="font-semibold text-navy-700">{PLAN_LABELS[employee.plan_enrolled] ?? employee.plan_enrolled}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No plan enrolled</p>
            )}
          </div>
        </div>

        {/* Current period quick stats */}
        {currentPeriod && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">
                {currentPeriod.total_hours_worked.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">Total Hours</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold inline-block px-2 rounded ${HOURS_COLORS[hoursColorKey]}`}>
                {currentPeriod.avg_hours_per_week?.toFixed(1) ?? "—"}
              </p>
              <p className="text-xs text-gray-500">Avg hrs/wk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">
                {currentPeriod.measurement_end
                  ? Math.max(0, Math.ceil((new Date(currentPeriod.measurement_end).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
                  : "—"}
              </p>
              <p className="text-xs text-gray-500">Days Left in Measurement</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 capitalize">
                {currentPeriod.period_type ?? "—"}
              </p>
              <p className="text-xs text-gray-500">Period Type</p>
            </div>
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6">
          {[
            { id: "overview", label: "Timeline & Hours" },
            { id: "history", label: "Periods, Offers & Events" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === tab.id
                  ? "border-navy-600 text-navy-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* Section 2: Timeline */}
          {currentPeriod ? (
            <div className="card">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Current Period Timeline</h2>
              <PeriodTimeline period={currentPeriod} today={today} />
              <div className="grid grid-cols-3 gap-4 mt-2 text-xs text-gray-600">
                <div>
                  <p className="font-medium text-blue-700">Measurement</p>
                  <p>{formatDate(currentPeriod.measurement_start)} → {formatDate(currentPeriod.measurement_end)}</p>
                </div>
                {currentPeriod.admin_start && (
                  <div>
                    <p className="font-medium text-amber-700">Admin</p>
                    <p>{formatDate(currentPeriod.admin_start)} → {formatDate(currentPeriod.admin_end)}</p>
                  </div>
                )}
                {currentPeriod.stability_start && (
                  <div>
                    <p className="font-medium text-green-700">Stability</p>
                    <p>{formatDate(currentPeriod.stability_start)} → {formatDate(currentPeriod.stability_end)}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center py-8 text-gray-500">
              <p>No measurement period started yet.</p>
              <p className="text-sm mt-1">Use the <Link href="/payroll" className="text-navy-600 hover:underline">Pay Period Dashboard</Link> to start one.</p>
            </div>
          )}

          {/* Section 3: Hours Bar Chart */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Hours per Pay Period (Last 24)</h2>
            <HoursBarChart hours={payPeriodHours} />
          </div>
        </div>
      )}

      {activeSection === "history" && (
        <div className="space-y-6">
          {/* Section 4: Measurement Periods */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Measurement Period History</h2>
            {measurementPeriods.length === 0 ? (
              <p className="text-gray-400 text-sm">No measurement periods on record.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Type</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Measurement Dates</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Total Hours</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Avg hrs/wk</th>
                      <th className="text-center px-3 py-2 font-medium text-gray-600">Result</th>
                      <th className="text-center px-3 py-2 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {measurementPeriods.map((mp) => (
                      <tr key={mp.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-700 capitalize">{mp.period_type}</td>
                        <td className="px-3 py-2 text-gray-600 text-xs">
                          {formatDate(mp.measurement_start)} → {formatDate(mp.measurement_end)}
                        </td>
                        <td className="px-3 py-2 text-right">{mp.total_hours_worked.toFixed(1)}</td>
                        <td className="px-3 py-2 text-right">
                          {mp.avg_hours_per_week?.toFixed(1) ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {mp.is_full_time_result === true ? (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Full-Time</span>
                          ) : mp.is_full_time_result === false ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Not Full-Time</span>
                          ) : (
                            <span className="text-xs text-gray-400">Pending</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-xs text-gray-600 capitalize">
                            {mp.status.replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 5: Offer Letter History */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Offer Letter History</h2>
            {offerLetters.length === 0 ? (
              <p className="text-gray-400 text-sm">No offer letters on record.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Offer Date</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Deadline</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Coverage Start</th>
                      <th className="text-center px-3 py-2 font-medium text-gray-600">Status</th>
                      <th className="text-center px-3 py-2 font-medium text-gray-600">Response</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Plan Selected</th>
                      <th className="text-center px-3 py-2 font-medium text-gray-600">Waiver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {offerLetters.map((ol) => (
                      <tr key={ol.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">{formatDate(ol.offer_date)}</td>
                        <td className="px-3 py-2">{formatDate(ol.offer_deadline)}</td>
                        <td className="px-3 py-2">{formatDate(ol.coverage_start_date)}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            ol.status === "accepted" ? "bg-green-100 text-green-700" :
                            ol.status === "declined" ? "bg-red-100 text-red-700" :
                            ol.status === "expired" ? "bg-gray-200 text-gray-600" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {OFFER_STATUS_LABELS[ol.status] ?? ol.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center capitalize text-gray-600">
                          {ol.response ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          {ol.plan_selected ? PLAN_LABELS[ol.plan_selected] : "—"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {ol.waiver_on_file ? (
                            <span className="text-green-600 text-xs">✓ On file</span>
                          ) : ol.response === "declined" ? (
                            <span className="text-red-600 text-xs">✗ Missing</span>
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 6: Eligibility Event Log */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Eligibility Event Log
              <span className="ml-2 text-xs font-normal text-gray-400">(append-only audit trail)</span>
            </h2>
            {eligibilityEvents.length === 0 ? (
              <p className="text-gray-400 text-sm">No events recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {eligibilityEvents.map((ev) => {
                  const labelColor = EVENT_COLORS[ev.event_type] ?? "bg-gray-100 text-gray-600";
                  return (
                    <div key={ev.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-navy-400 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${labelColor}`}>
                            {EVENT_TYPE_LABELS[ev.event_type] ?? ev.event_type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(ev.created_at).toLocaleString()}
                          </span>
                          {ev.triggered_by && (
                            <span className="text-xs text-gray-400">
                              · {ev.triggered_by}
                            </span>
                          )}
                        </div>
                        {ev.description && (
                          <p className="text-sm text-gray-700 mt-0.5">{ev.description}</p>
                        )}
                        {ev.snapshot && Object.keys(ev.snapshot).length > 0 && (
                          <pre className="text-xs text-gray-400 mt-1 bg-gray-50 rounded px-2 py-1 overflow-x-auto">
                            {JSON.stringify(ev.snapshot, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
