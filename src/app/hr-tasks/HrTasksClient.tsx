"use client";

import { useState, useTransition } from "react";
import { updateHrTaskProgress } from "@/app/actions/hr-tasks";

const TOTAL_EMPLOYEES = 719;

interface Props {
  initialElectionCount: number;
}

export default function HrTasksClient({ initialElectionCount }: Props) {
  const [electionCount, setElectionCount] = useState(initialElectionCount);
  const [inputValue, setInputValue] = useState(String(initialElectionCount));
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const pct = Math.min(100, Math.round((electionCount / TOTAL_EMPLOYEES) * 100));

  function handleSave() {
    const n = parseInt(inputValue, 10);
    if (isNaN(n) || n < 0) return;
    const clamped = Math.min(n, TOTAL_EMPLOYEES);
    setElectionCount(clamped);
    startTransition(async () => {
      await updateHrTaskProgress("benefit_elections", clamped);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Staff Tasks</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tasks your HR team can complete right now in WinTeam — no administrator access required
        </p>
      </div>

      {/* Amber warning banner */}
      <div
        className="flex items-start gap-3 rounded-lg p-4"
        style={{ background: "#fffbeb", border: "1px solid #f59e0b" }}
      >
        <span className="text-lg flex-shrink-0">⚠️</span>
        <p className="text-sm font-medium" style={{ color: "#92400e" }}>
          <strong>Before starting:</strong> Make sure you are logged into WinTeam and have the{" "}
          <strong>Insurance Benefits</strong> module open
        </p>
      </div>

      {/* SECTION 1 — Enter Benefit Elections */}
      <section>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-bold text-gray-900">Enter Benefit Elections</h2>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#dc2626", color: "white" }}
          >
            URGENT
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #f59e0b" }}
          >
            Due: April 30, 2026
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          For each eligible employee, open their record in WinTeam and enter which plan they enrolled
          in for 2025. This must be completed for all 719 employees before the 1095-C can be
          generated.
        </p>

        {/* WinTeam path badge */}
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md"
            style={{ background: "#1e3a5f", color: "white" }}
          >
            📁 Insurance Benefits &gt; Benefits by Employee
          </span>
        </div>

        {/* GREEN INFO BOX — You can start NOW */}
        <div
          className="rounded-lg p-4 mb-5"
          style={{ background: "#f0fdf4", border: "2px solid #16a34a" }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: "#14532d" }}>
            ✅ You can enter benefit elections NOW without waiting for the package reassignment to be
            completed.
          </p>
          <p className="text-sm mb-2" style={{ color: "#166534" }}>
            Even though employees are currently assigned to the old 2025 Offering, you can still add
            their actual plan enrollment directly in Benefits by Employee. WinTeam will use the
            enrollment data you enter — not just the offering assignment — when generating the 1095-C
            forms.
          </p>
          <p className="text-sm font-bold" style={{ color: "#14532d" }}>
            Start entering elections today. Do not wait.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-2 mb-5">
          {[
            <>Open WinTeam → click <strong>Insurance Benefits</strong> in the left sidebar</>,
            <>Click <strong>Benefits by Employee</strong></>,
            <>Search for the employee by name or number</>,
            <>Click <strong>Add New</strong> to add a benefit record</>,
            <>
              Enter <strong>Effective Date: 01/01/2025</strong>
            </>,
            <>
              Select the plan the employee enrolled in:
              <ul className="mt-2 ml-4 space-y-1 text-sm text-gray-600 list-none">
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
                    <span className="mt-0.5 flex-shrink-0" style={{ color: "#6b7280" }}>
                      ·
                    </span>
                    {plan}
                  </li>
                ))}
              </ul>
            </>,
            <>
              If employee <strong>declined all coverage</strong> — select{" "}
              <strong>Waived/Declined</strong> and enter the date
            </>,
            <>Save the record</>,
            <>
              Proceed to dependent data entry if the employee is on a self-insured plan (see Section
              2)
            </>,
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ width: 24, height: 24, background: "#1a3a5c", marginTop: 1 }}
              >
                {i + 1}
              </span>
              <p className="text-sm text-gray-700">{step}</p>
            </div>
          ))}
        </div>

        {/* Important notes — red border */}
        <div
          className="rounded-lg p-4 mb-5"
          style={{ background: "#fef2f2", border: "1px solid #fca5a5" }}
        >
          <p className="text-sm font-bold mb-2" style={{ color: "#991b1b" }}>
            Important Notes
          </p>
          <ul className="space-y-1.5 text-sm" style={{ color: "#b91c1c" }}>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>
                <strong>H2B Visa workers</strong> do NOT get benefit elections entered
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>
                <strong>Select Health</strong> employees do NOT need dependent data entered — Select
                Health handles their own reporting
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Only self-insured plan enrollees need dependent data</span>
            </li>
          </ul>
        </div>

        {/* Progress tracker */}
        <div
          className="rounded-lg p-4"
          style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
        >
          <p className="text-sm font-semibold text-gray-700 mb-3">Team Progress</p>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="number"
              min={0}
              max={TOTAL_EMPLOYEES}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-24 rounded-md border text-sm px-3 py-1.5 text-center"
              style={{ borderColor: "#d1d5db" }}
            />
            <span className="text-sm text-gray-600">
              employees completed out of {TOTAL_EMPLOYEES}
            </span>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="ml-auto text-sm font-semibold px-4 py-1.5 rounded-md transition-colors"
              style={{ background: "#1a3a5c", color: "white" }}
            >
              {isPending ? "Saving…" : saved ? "Saved ✓" : "Save"}
            </button>
          </div>
          {/* Progress bar */}
          <div className="rounded-full overflow-hidden" style={{ height: 8, background: "#e5e7eb" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: pct === 100 ? "#16a34a" : "#1a3a5c" }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{pct}% complete</p>
        </div>
      </section>

      {/* SECTION 2 — Enter Dependent Data */}
      <section>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-bold text-gray-900">Enter Dependent Data</h2>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd" }}
          >
            REQUIRED FOR PART III
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          For employees enrolled in any self-insured plan (MEC, Bronze IHC, Bronze Non-IHC, Gold
          IHC, or Gold Non-IHC), you must enter all covered dependents in WinTeam. This data appears
          in Part III of the 1095-C form.
        </p>

        {/* Self-insured plans reminder — blue */}
        <div
          className="rounded-lg p-4 mb-5"
          style={{ background: "#eff6ff", border: "1px solid #93c5fd" }}
        >
          <p className="text-sm font-bold mb-2" style={{ color: "#1e40af" }}>
            Part III REQUIRED for these plans:
          </p>
          <ul className="space-y-1 text-sm" style={{ color: "#1d4ed8" }}>
            {[
              "MEC Plan",
              "Bronze IHC Network",
              "Bronze Non IHC Network",
              "Gold IHC Network",
              "Gold Non IHC Network",
            ].map((plan) => (
              <li key={plan} className="flex items-center gap-2">
                <span>✅</span> {plan}
              </li>
            ))}
          </ul>
          <p className="text-xs mt-3 font-semibold" style={{ color: "#1e40af" }}>
            ❌ Select Health plans — NOT required (Select Health reports independently)
          </p>
        </div>

        {/* WinTeam path */}
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md"
            style={{ background: "#1e3a5f", color: "white" }}
          >
            📁 Insurance Benefits &gt; Benefits by Employee &gt; Covered Individuals tab
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-2 mb-5">
          {[
            <>
              Open the employee&apos;s benefit record (same path as Section 1: Insurance Benefits →
              Benefits by Employee)
            </>,
            <>
              Click the <strong>Covered Individuals</strong> tab
            </>,
            <>
              Click <strong>Add New</strong> for each dependent
            </>,
            <>
              Enter the dependent&apos;s <strong>name</strong>, <strong>relationship</strong>, and{" "}
              <strong>date of birth</strong>
            </>,
            <>
              Enter <strong>SSN</strong> if available; if not, enter DOB as the identifier (IRS
              allows DOB as fallback)
            </>,
            <>
              Enter <strong>coverage dates</strong>: start date and end date (or check
              &quot;Full Year&quot; if covered all 12 months)
            </>,
            <>Save each dependent record</>,
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ width: 24, height: 24, background: "#1a3a5c", marginTop: 1 }}
              >
                {i + 1}
              </span>
              <p className="text-sm text-gray-700">{step}</p>
            </div>
          ))}
        </div>

        {/* SSN / DOB rules */}
        <div
          className="rounded-lg p-4"
          style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
        >
          <p className="text-sm font-bold text-gray-700 mb-2">SSN / DOB Rules by Dependent Type</p>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>
                <strong>Spouse:</strong> SSN preferred; DOB acceptable if SSN unavailable
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>
                <strong>Children under 18:</strong> DOB is acceptable (IRS does not require SSN for
                minor dependents)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>
                <strong>Adult dependents (18+):</strong> SSN strongly preferred to avoid IRS
                matching issues
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION 3 — Record Mid-Year Coverage Changes */}
      <section>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-bold text-gray-900">Record Mid-Year Coverage Changes</h2>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" }}
          >
            AS NEEDED
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          If an employee&apos;s coverage changed at any point during 2025 — plan switch, dependent
          added/removed, termination, or new hire — you must record each change separately in
          WinTeam so the correct coverage codes appear on each month of the 1095-C.
        </p>

        <div className="space-y-4">
          {[
            {
              title: "Plan Switch Mid-Year",
              steps: [
                "Open the employee's existing benefit record",
                "Set the End Date on the old plan to the last day of coverage",
                "Click Add New to create a new benefit record",
                "Set the Effective Date to the first day of new coverage",
                "Select the new plan and save",
              ],
            },
            {
              title: "Adding a Dependent Mid-Year",
              steps: [
                "Open the employee's benefit record",
                "Go to the Covered Individuals tab",
                "Add the dependent with their start date (e.g., date of birth for a newborn, marriage date for a new spouse)",
                "Save",
              ],
            },
            {
              title: "Removing a Dependent Mid-Year",
              steps: [
                "Open the employee's benefit record",
                "Go to the Covered Individuals tab",
                "Find the dependent's record and set their End Date",
                "Save",
              ],
            },
            {
              title: "Employee Termination",
              steps: [
                "Open the employee's benefit record",
                "Set the End Date to the last day of coverage (usually the last day of the month they were terminated)",
                "Save",
              ],
            },
            {
              title: "New Hire Mid-Year",
              steps: [
                "Follow Section 1 steps to add a benefit record",
                "Set the Effective Date to the date coverage began (not necessarily January 1)",
                "Enter dependent data if on a self-insured plan (Section 2)",
              ],
            },
          ].map(({ title, steps }) => (
            <div
              key={title}
              className="rounded-lg p-4"
              style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
            >
              <p className="text-sm font-bold text-gray-800 mb-2">{title}</p>
              <ol className="space-y-1">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="flex-shrink-0 font-semibold text-gray-400">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
