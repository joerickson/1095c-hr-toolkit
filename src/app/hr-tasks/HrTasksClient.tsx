"use client";

import { useState, useCallback, useRef } from "react";
import { updateHrTaskProgress } from "@/app/actions/hr-tasks";

const TOTAL_EMPLOYEES = 719;
const SELF_INSURED_PLANS = [
  "MEC Plan",
  "Bronze IHC Network",
  "Bronze Non IHC Network",
  "Gold IHC Network",
  "Gold Non IHC Network",
];

interface HrTasksClientProps {
  initialElectionsCompleted: number;
}

export default function HrTasksClient({ initialElectionsCompleted }: HrTasksClientProps) {
  const [electionsCompleted, setElectionsCompleted] = useState(initialElectionsCompleted);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCountChange = useCallback((raw: string) => {
    const parsed = parseInt(raw, 10);
    const clamped = isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, TOTAL_EMPLOYEES));
    setElectionsCompleted(clamped);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      await updateHrTaskProgress("benefit_elections_completed", clamped);
      setSaving(false);
    }, 800);
  }, []);

  const pct = Math.round((electionsCompleted / TOTAL_EMPLOYEES) * 100);

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">HR Staff Tasks</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tasks your HR team can complete right now in WinTeam — no administrator access required
        </p>
      </div>

      {/* Pre-start banner */}
      <div
        className="flex items-start gap-3 p-4 rounded-lg mb-8"
        style={{ background: "#fffbeb", border: "1px solid #f59e0b" }}
      >
        <span className="text-xl flex-shrink-0" aria-hidden="true">⚠️</span>
        <p className="text-sm font-medium" style={{ color: "#92400e" }}>
          Before starting: Make sure you are logged into WinTeam and have the Insurance Benefits module open
        </p>
      </div>

      {/* ─── SECTION 1: Enter Benefit Elections ─── */}
      <Section
        number={1}
        title="Enter Benefit Elections"
        badges={[
          { label: "URGENT", color: "#dc2626", bg: "#fee2e2" },
          { label: "Due: April 30, 2026", color: "#92400e", bg: "#fffbeb" },
        ]}
        priority="highest"
      >
        <p className="text-sm text-gray-700 mb-4">
          For each eligible employee, open their record in WinTeam and enter which plan they enrolled
          in for 2025. This must be completed for all {TOTAL_EMPLOYEES} employees before the 1095-C
          can be generated.
        </p>

        {/* WinTeam path badge */}
        <WinTeamPath path="Insurance Benefits > Benefits by Employee" />

        {/* Step-by-step instructions */}
        <StepList
          steps={[
            "Open WinTeam → click Insurance Benefits in the left sidebar",
            "Click Benefits by Employee",
            "Search for the employee by name or number",
            "Click Add New to add a benefit record",
            <>
              Enter <strong>Effective Date: 01/01/2025</strong>
            </>,
            <>
              Select the plan the employee enrolled in:
              <ul className="mt-2 ml-4 space-y-1.5">
                {[
                  "MEC Plan ($30/month employee only)",
                  "Bronze IHC Network ($142/month employee only)",
                  "Bronze Non IHC Network ($142/month employee only)",
                  "Gold IHC Network ($327.96/month employee only)",
                  "Gold Non IHC Network ($300.32/month employee only)",
                  "Bronze Select Health ($142/month employee only)",
                  "Gold Select Health ($327.96/month employee only)",
                ].map((plan) => (
                  <li key={plan} className="flex items-start gap-2">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{plan}</span>
                  </li>
                ))}
              </ul>
            </>,
            <>
              If employee declined all coverage — select <strong>Waived/Declined</strong> and enter the date
            </>,
            "Save the record",
            "Proceed to dependent data entry if the employee is on a self-insured plan (see Section 2)",
          ]}
        />

        {/* Important notes */}
        <div
          className="mt-5 p-4 rounded-lg"
          style={{ border: "1px solid #fca5a5", background: "#fff5f5" }}
        >
          <p className="text-sm font-semibold text-red-800 mb-2">Important Notes</p>
          <ul className="space-y-1.5">
            {[
              "H2B Visa workers do NOT get benefit elections entered",
              "Select Health employees do NOT need dependent data entered — Select Health handles their own reporting",
              "Only self-insured plan enrollees need dependent data",
            ].map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span className="text-red-500 font-bold flex-shrink-0 mt-0.5">!</span>
                <span className="text-sm text-red-700">{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Progress tracker */}
        <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-sm font-semibold text-gray-800 mb-3">Team Progress Tracker</p>
          <p className="text-xs text-gray-500 mb-3">
            Update the count as your team completes entries. All HR staff see the same number.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={TOTAL_EMPLOYEES}
              value={electionsCompleted}
              onChange={(e) => handleCountChange(e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Employees completed"
            />
            <span className="text-sm text-gray-600">
              employees completed out of <strong>{TOTAL_EMPLOYEES}</strong>
            </span>
            {saving && (
              <span className="text-xs text-gray-400">saving…</span>
            )}
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{pct}% complete</span>
              <span>{TOTAL_EMPLOYEES - electionsCompleted} remaining</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: pct === 100 ? "#16a34a" : "#2563eb",
                }}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ─── SECTION 2: Enter Dependent Data ─── */}
      <Section
        number={2}
        title="Enter Dependent Data"
        subtitle="Self-insured plans only"
        badges={[{ label: "REQUIRED FOR PART III", color: "#1e40af", bg: "#eff6ff" }]}
        priority="high"
      >
        <p className="text-sm text-gray-700 mb-4">
          For employees enrolled in any self-insured plan (MEC, Bronze IHC, Bronze Non-IHC, Gold IHC,
          or Gold Non-IHC), you must enter all covered dependents in WinTeam. This data appears in
          Part III of the 1095-C form.
        </p>

        {/* Self-insured plans reminder */}
        <div
          className="mb-5 p-4 rounded-lg"
          style={{ border: "1px solid #93c5fd", background: "#eff6ff" }}
        >
          <p className="text-sm font-semibold text-blue-800 mb-2">
            Part III REQUIRED for these plans:
          </p>
          <ul className="space-y-1">
            {SELF_INSURED_PLANS.map((plan) => (
              <li key={plan} className="flex items-center gap-2 text-sm text-blue-700">
                <span>✅</span>
                <span>{plan}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-sm text-blue-600">
              <strong>NOT required:</strong> Bronze Select Health, Gold Select Health — Select Health
              issues their own 1095-B forms.
            </p>
          </div>
        </div>

        {/* WinTeam path badge */}
        <WinTeamPath path="Insurance Benefits > Benefits by Employee > Covered Individuals Tab" />

        {/* Steps */}
        <StepList
          steps={[
            "Open WinTeam → Insurance Benefits → Benefits by Employee",
            "Search for and open the employee's record",
            "Confirm the employee is on a self-insured plan (see list above)",
            <>
              Click the <strong>Covered Individuals</strong> tab
            </>,
            "Click Add New to add each covered person",
            <>
              For each dependent, enter:
              <ul className="mt-2 ml-4 space-y-1.5">
                {[
                  "Full legal name",
                  "Relationship (Spouse / Minor Dependent under 18 / Adult Dependent 18+)",
                  "SSN — required for spouse and adult dependents (18+)",
                  "Date of Birth — acceptable in place of SSN for minor dependents only",
                  "Coverage months (which months of 2025 they were covered)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </>,
            "Save each dependent record",
            "Repeat for all covered dependents for this employee",
          ]}
        />

        {/* Important notes */}
        <div
          className="mt-5 p-4 rounded-lg"
          style={{ border: "1px solid #fca5a5", background: "#fff5f5" }}
        >
          <p className="text-sm font-semibold text-red-800 mb-2">Important Notes</p>
          <ul className="space-y-1.5">
            {[
              "Spouse SSN is always required — DOB is not acceptable for a spouse",
              "Minor dependent (under 18) DOB is acceptable in place of SSN",
              "Adult dependent (18+) SSN is required — DOB alone is not sufficient",
              "Do NOT enter dependents for Select Health employees",
              "If the employee has no dependents covered, no Part III entry is needed",
            ].map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span className="text-red-500 font-bold flex-shrink-0 mt-0.5">!</span>
                <span className="text-sm text-red-700">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ─── SECTION 3: Mid-Year Changes ─── */}
      <Section
        number={3}
        title="Record Mid-Year Coverage Changes"
        badges={[{ label: "AS NEEDED", color: "#6b7280", bg: "#f9fafb" }]}
        priority="normal"
      >
        <p className="text-sm text-gray-700 mb-4">
          If any employee had a change in coverage during 2025 — switched plans, added or removed
          dependents, or terminated coverage — you must record that change as a separate benefit
          record in WinTeam. Each period of coverage needs its own start and end date.
        </p>

        {/* WinTeam path badge */}
        <WinTeamPath path="Insurance Benefits > Benefits by Employee" />

        {/* Common mid-year changes */}
        <div className="mb-5 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">Common mid-year scenarios:</p>
          <ul className="space-y-2">
            {[
              {
                scenario: "Employee switched plans",
                action:
                  "End-date the old benefit record on the last day of the month they left the plan. Add a new record for the new plan starting the 1st of the following month.",
              },
              {
                scenario: "Employee added a dependent",
                action:
                  "Update the Covered Individuals tab — add the dependent with the correct coverage start date.",
              },
              {
                scenario: "Employee removed a dependent (e.g., divorce, aging out)",
                action:
                  "Update the Covered Individuals tab — add an end date for that dependent's coverage.",
              },
              {
                scenario: "Employee terminated coverage",
                action:
                  "Add an end date to their benefit record. If they declined all plans, add a Waived/Declined record with the effective date.",
              },
              {
                scenario: "New hire enrolled mid-year",
                action:
                  "Add a benefit record with the effective date equal to their coverage start date (not necessarily their hire date).",
              },
            ].map(({ scenario, action }) => (
              <li key={scenario} className="text-sm">
                <span className="font-medium text-gray-800">{scenario}:</span>{" "}
                <span className="text-gray-600">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <StepList
          steps={[
            "Open the employee's record in Insurance Benefits > Benefits by Employee",
            "Review their existing benefit records and coverage dates",
            "If a change occurred, end-date the current record on the correct date",
            "Click Add New to create a new record for the new coverage period",
            "Enter the correct plan, effective date, and end date (if applicable)",
            "If the plan is self-insured, update the Covered Individuals tab to reflect the change",
            "Save all records",
          ]}
        />

        <div
          className="mt-5 p-4 rounded-lg"
          style={{ border: "1px solid #d1d5db", background: "#f9fafb" }}
        >
          <p className="text-sm font-medium text-gray-700">
            <strong>Tip:</strong> When in doubt about the correct effective dates, use the first day
            of the month the change took effect. WinTeam generates monthly codes based on coverage
            as of the first of each month.
          </p>
        </div>
      </Section>
    </div>
  );
}

// ─── Shared sub-components ─────────────────────────────────────────────────

function Section({
  number,
  title,
  subtitle,
  badges,
  priority,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  badges: { label: string; color: string; bg: string }[];
  priority: "highest" | "high" | "normal";
  children: React.ReactNode;
}) {
  const borderColor =
    priority === "highest"
      ? "#dc2626"
      : priority === "high"
      ? "#2563eb"
      : "#d1d5db";

  const headerBg =
    priority === "highest"
      ? "#1a3a5c"
      : priority === "high"
      ? "#1e40af"
      : "#374151";

  return (
    <div
      className="rounded-lg mb-6 overflow-hidden"
      style={{ border: `1px solid ${borderColor}` }}
    >
      {/* Section header */}
      <div className="px-5 py-4" style={{ background: headerBg }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white text-xs font-bold opacity-70">SECTION {number}</span>
          <span className="text-white font-semibold">{title}</span>
          {subtitle && (
            <span className="text-white text-sm opacity-70">— {subtitle}</span>
          )}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {badges.map((b) => (
              <span
                key={b.label}
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ color: b.color, background: b.bg }}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Section body */}
      <div className="p-5 bg-white">{children}</div>
    </div>
  );
}

function WinTeamPath({ path }: { path: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md mb-4 text-sm font-medium"
      style={{ background: "#1a3a5c", color: "white" }}
    >
      <span className="opacity-70 text-xs">WinTeam Path</span>
      <span>→</span>
      <span>{path}</span>
    </div>
  );
}

function StepList({ steps }: { steps: (string | React.ReactNode)[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "#1a3a5c", marginTop: 1 }}
          >
            {i + 1}
          </span>
          <div className="text-sm text-gray-700 flex-1">{step}</div>
        </li>
      ))}
    </ol>
  );
}
