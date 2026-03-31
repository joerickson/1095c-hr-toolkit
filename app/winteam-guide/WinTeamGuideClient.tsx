"use client";

import { useState } from "react";

interface Section {
  id: string;
  title: string;
  icon: string;
  steps: Step[];
}

interface Step {
  title: string;
  detail: string;
  path?: string;
  tip?: string;
  warning?: string;
}

const sections: Section[] = [
  {
    id: "initial-setup",
    title: "Initial ACA Module Setup",
    icon: "⚙️",
    steps: [
      {
        title: "Enable ACA Reporting in Company Setup",
        detail:
          "Navigate to System Administration → Company Setup → Benefits tab. Check the box for 'Enable ACA Reporting.' This activates the ACA module and makes 1094-C/1095-C menus visible.",
        path: "System Administration → Company Setup → Benefits",
        tip: "This setting must be enabled before any ACA configuration can take effect. If you don't see ACA menus, confirm this is checked.",
      },
      {
        title: "Set the ALE (Applicable Large Employer) Flag",
        detail:
          "In Company Setup → ACA tab, confirm the 'Applicable Large Employer' checkbox is marked. Enter the company's EIN exactly as it appears on IRS filings.",
        path: "System Administration → Company Setup → ACA",
        tip: "The EIN here must match Form 1094-C exactly. A mismatch will cause IRS reject codes.",
        warning: "ABC Janitorial Services must verify its ALE status each year based on prior-year FTE counts before this box is checked.",
      },
      {
        title: "Configure the Measurement Method",
        detail:
          "Choose between the Monthly Measurement Method (determines full-time status month-by-month) or the Look-Back Measurement Method (uses a standard measurement period). For variable-hour janitorial staff, the Look-Back method is recommended.",
        path: "System Administration → ACA Setup → Measurement Method",
        tip: "Most janitorial service companies use Look-Back with a 12-month Standard Measurement Period to handle variable-hour and seasonal employees.",
      },
      {
        title: "Define Measurement and Stability Periods",
        detail:
          "For Look-Back method, configure: Standard Measurement Period (e.g., Nov 1 – Oct 31), Administrative Period (up to 90 days), and Stability Period (must equal or exceed measurement period).",
        path: "System Administration → ACA Setup → Measurement Periods",
        tip: "Example for ABC Janitorial: Measurement 11/1–10/31, Admin Period Nov–Jan, Stability Period 1/1–12/31 (calendar year).",
      },
    ],
  },
  {
    id: "benefit-plans",
    title: "Benefit Plan Configuration",
    icon: "🏥",
    steps: [
      {
        title: "Flag Plans as MEC (Minimum Essential Coverage)",
        detail:
          "In Benefits → Plan Setup, open each health plan and check the 'Minimum Essential Coverage' checkbox. This flags the plan for ACA reporting purposes.",
        path: "Benefits → Plan Setup → [Plan Name] → ACA tab",
        tip: "All major medical plans, employer-sponsored HMOs and PPOs typically qualify as MEC. Limited benefit or dental/vision-only plans do NOT.",
      },
      {
        title: "Flag Plans as Meeting Minimum Value",
        detail:
          "On the same ACA tab, check 'Minimum Value' if the plan pays at least 60% of the total allowed costs of benefits. Use the IRS Minimum Value Calculator or your carrier's actuarial certification.",
        path: "Benefits → Plan Setup → [Plan Name] → ACA tab",
        warning: "Do not check Minimum Value without actuarial confirmation. Incorrectly coding this as MV-qualified can expose the company to §4980H(b) penalties.",
      },
      {
        title: "Set the Employee Premium Contribution Amount",
        detail:
          "Enter the employee's required monthly contribution for the lowest-cost self-only plan that provides MEC + MV. This populates Line 15 of Form 1095-C automatically.",
        path: "Benefits → Plan Setup → [Plan Name] → Rates",
        tip: "If rates changed mid-year, update the contribution amount with effective dates so WinTeam generates the correct Line 15 for each month.",
      },
      {
        title: "Configure the Self-Insured Plan Flag (if applicable)",
        detail:
          "If ABC Janitorial Services sponsors a self-funded health plan, check 'Self-Insured' on the plan. This triggers Part III completion on 1095-C and requires dependent enrollment data.",
        path: "Benefits → Plan Setup → [Plan Name] → ACA tab",
      },
    ],
  },
  {
    id: "employee-setup",
    title: "Employee ACA Configuration",
    icon: "👤",
    steps: [
      {
        title: "Verify Employee Type and Hours in WinTeam",
        detail:
          "Ensure each employee's record has the correct employment classification (Full-Time, Part-Time, Variable). WinTeam uses scheduled and actual hours to determine ACA full-time status.",
        path: "Employee Master → [Employee] → Employment tab",
        tip: "For janitorial field staff paid by the shift, ensure shift hours are correctly mapped to the employee's ACA hours calculation.",
      },
      {
        title: "Enter or Import Employee SSNs",
        detail:
          "Verify all employees have a valid Social Security Number in the system. WinTeam will flag employees with missing or malformed SSNs during 1095-C generation.",
        path: "Employee Master → [Employee] → Personal tab",
        warning: "Run the SSN Verification report before generating 1095-C forms. Missing or mismatched SSNs result in IRS B-Notices and penalties.",
      },
      {
        title: "Confirm Benefit Enrollment Records",
        detail:
          "Check that all benefit enrollment and disenrollment events are recorded with accurate effective dates. WinTeam uses these dates to determine which months to use code 2C (enrolled) on Line 16.",
        path: "Benefits → Employee Enrollments → [Employee]",
        tip: "Run an Open Enrollment audit after each OE period to confirm all elections are entered before year-end processing.",
      },
      {
        title: "Review New Hire Initial Measurement Periods",
        detail:
          "For variable-hour new hires, confirm WinTeam has set the initial measurement period start date on the employee record. This affects which months receive code 2D on Line 16.",
        path: "Employee Master → [Employee] → ACA tab → Initial Measurement Start",
      },
    ],
  },
  {
    id: "line-codes",
    title: "Line 14 / 15 / 16 Code Mapping",
    icon: "📝",
    steps: [
      {
        title: "Review Default ACA Code Assignments",
        detail:
          "Go to ACA Setup → Code Defaults to review how WinTeam auto-assigns Line 14 and Line 16 codes based on offer status and enrollment. Verify these defaults match your plan design.",
        path: "System Administration → ACA Setup → Code Defaults",
        tip: "WinTeam uses the offer of coverage and enrollment flags to determine Line 14. If an employee was offered coverage (plan is active for their position) but not enrolled, it should generate 1E/1B and 2F/2G/2H.",
      },
      {
        title: "Select the Affordability Safe Harbor",
        detail:
          "In ACA Setup → Safe Harbor, choose the affordability safe harbor: W-2 (2F), Federal Poverty Line (2G), or Rate of Pay (2H). For hourly janitorial workers with varying hours, W-2 or Rate of Pay is most common.",
        path: "System Administration → ACA Setup → Affordability Safe Harbor",
        tip: "ABC Janitorial Services should confirm this election with HR/legal. The Rate of Pay safe harbor (2H) works well for hourly employees with consistent base rates.",
      },
      {
        title: "Override Individual Employee Codes (if needed)",
        detail:
          "For exceptions (e.g., employees on COBRA, rehires, short-term employees), use the Manual Override screen to adjust Line 14/16 codes for specific months.",
        path: "ACA Management → Manual Overrides → [Employee]",
        warning: "Document all manual overrides with a reason. Overrides are not automatically updated if employee data changes.",
      },
    ],
  },
  {
    id: "hours-tracking",
    title: "Hours Tracking for Janitorial Staff",
    icon: "⏱️",
    steps: [
      {
        title: "Confirm WinTeam Job Costing Links to ACA Hours",
        detail:
          "Verify that hours entered via WinTeam's job costing or time & attendance module are flowing into the ACA hours calculation. Go to ACA Reports → Hours Worked by Employee to spot-check.",
        path: "ACA Management → Reports → Hours Worked by Employee",
        tip: "Common issue: if supervisors are entering hours in a separate payroll system, those hours may not feed into WinTeam's ACA module. Confirm the integration.",
      },
      {
        title: "Run the ACA Hours Verification Report",
        detail:
          "Monthly, run the ACA Hours Verification Report for all employees. Flag any employee averaging 130+ hours/month in a prior month who is coded as part-time.",
        path: "ACA Management → Reports → ACA Hours Verification",
        tip: "Schedule this report to run automatically at month-end. Address any discrepancies before the next payroll cycle.",
      },
      {
        title: "Handle Mid-Year Status Changes",
        detail:
          "When an employee transitions from part-time to full-time (or vice versa) based on measurement period results, update their employment type and stability period in WinTeam before the new stability period begins.",
        path: "Employee Master → [Employee] → ACA tab → Stability Period",
        warning: "Status changes must be made before the stability period start date. Retroactive changes may require manual 1095-C code corrections.",
      },
    ],
  },
  {
    id: "year-end",
    title: "Year-End 1095-C Generation",
    icon: "📋",
    steps: [
      {
        title: "Run the ACA Pre-Check Report",
        detail:
          "Before generating 1095-C forms, run the ACA Pre-Check Report. This report flags missing SSNs, invalid dates, employees without offer codes, and other data quality issues.",
        path: "ACA Management → Pre-Check Report",
        tip: "Resolve ALL pre-check errors before generating forms. Forms with errors will be rejected by the IRS.",
      },
      {
        title: "Generate Draft 1095-C Forms",
        detail:
          "In ACA Management → Generate 1095-C, select the tax year and run in Draft mode first. Review a sample of forms for employees with known situations to verify codes are correct.",
        path: "ACA Management → Generate 1095-C → Draft",
      },
      {
        title: "Review and Correct Codes",
        detail:
          "Use the 1095-C Review screen to filter by Line 14 code and verify distributions make sense. For example: verify 1H/2A appears only for months with no offer or no employment.",
        path: "ACA Management → 1095-C Review",
        tip: "Use the Code Lookup Wizard in this toolkit to verify specific employee situations against expected codes.",
      },
      {
        title: "Print / Deliver Employee Copies",
        detail:
          "Once forms are final, generate employee copies (PDF or paper) and distribute by the IRS furnishing deadline (March 3 of the following year, or the next business day).",
        path: "ACA Management → Print 1095-C → Employee Copies",
        warning: "Employees may request electronic delivery consent. Confirm consent tracking is enabled in WinTeam if distributing electronically.",
      },
      {
        title: "Generate 1094-C Transmittal and IRS File",
        detail:
          "Generate the 1094-C authoritative transmittal and the IRS electronic submission file (XML). Validate the file using IRS AIR System schema validation before submitting.",
        path: "ACA Management → Generate 1094-C → IRS Submission File",
        tip: "ACA filers with 10+ returns MUST e-file. Submit through the IRS ACA Information Returns (AIR) system.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Common Issues & Troubleshooting",
    icon: "🔧",
    steps: [
      {
        title: "Issue: Employee Missing from 1095-C Run",
        detail:
          "Check that the employee was active in WinTeam during the tax year, has a valid SSN, and is linked to the company's ALE entity. Also verify the employee's ACA eligibility flag is not suppressed.",
        tip: "Run Payroll → Employee List filtered to the tax year to see all employees who should be included.",
      },
      {
        title: "Issue: Wrong Line 14 Code Generated",
        detail:
          "Verify the benefit plan is correctly flagged as MEC/MV in Plan Setup. Check the employee's enrollment record for gaps. If the offer was made but employee declined, confirm the offer date falls within the month.",
        tip: "Cross-reference with the Code Lookup Wizard to confirm what code should apply based on the employee's situation.",
      },
      {
        title: "Issue: Line 15 Amount is $0 or Blank",
        detail:
          "Line 15 is only populated when Line 14 = 1B, 1C, 1D, or 1E. If the plan rate is missing or zero, check Benefits → Plan Setup → Rates for the correct effective date and employee contribution amount.",
        warning: "A blank or $0 Line 15 when Line 14 = 1E may indicate an affordability issue that triggers §4980H(b) liability. Verify with HR.",
      },
      {
        title: "Issue: IRS Rejects — TIN Mismatch",
        detail:
          "IRS AIR system rejects occur when the employee name/SSN doesn't match SSA records. Obtain a W-9 from the affected employees, update records in WinTeam, and file a corrected 1095-C.",
        warning: "After the third consecutive TIN mismatch B-Notice, the IRS requires backup withholding. Address TIN mismatches immediately.",
      },
    ],
  },
];

export default function WinTeamGuideClient() {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set([sections[0].id])
  );
  const [openSteps, setOpenSteps] = useState<Set<string>>(new Set());

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleStep(key: string) {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">WinTeam Setup Guide</h1>
        <p className="text-gray-500 mt-1">
          Step-by-step reference for configuring WinTeam for ACA 1095-C reporting at ABC Janitorial
          Services.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-800">
        <strong>Note:</strong> This guide is based on WinTeam's standard ACA module. Menu paths may
        vary slightly by WinTeam version. If a path doesn&apos;t match your version, search the
        WinTeam help system for the section title.
      </div>

      {/* Table of Contents */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <h2 className="font-semibold text-gray-700 text-sm mb-3">Contents</h2>
        <ol className="space-y-1">
          {sections.map((section, i) => (
            <li key={section.id}>
              <button
                onClick={() => {
                  toggleSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm text-blue-600 hover:text-blue-800 text-left"
              >
                {i + 1}. {section.icon} {section.title}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, sIdx) => {
          const isOpen = openSections.has(section.id);
          return (
            <div
              key={section.id}
              id={section.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{section.icon}</span>
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Section {sIdx + 1}
                    </span>
                    <h2 className="font-semibold text-gray-800">{section.title}</h2>
                  </div>
                </div>
                <span
                  className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100">
                  {section.steps.map((step, stepIdx) => {
                    const key = `${section.id}-${stepIdx}`;
                    const isStepOpen = openSteps.has(key);
                    return (
                      <div key={key} className="border-b border-gray-100 last:border-0">
                        <button
                          onClick={() => toggleStep(key)}
                          className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                            {stepIdx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm text-gray-800">
                              {step.title}
                            </span>
                            {step.path && (
                              <div className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                                {step.path}
                              </div>
                            )}
                          </div>
                          <span
                            className={`text-gray-400 text-sm transition-transform flex-shrink-0 ${
                              isStepOpen ? "rotate-180" : ""
                            }`}
                          >
                            ▼
                          </span>
                        </button>

                        {isStepOpen && (
                          <div className="px-6 pb-5 space-y-3">
                            <p className="text-sm text-gray-700 leading-relaxed">{step.detail}</p>

                            {step.path && (
                              <div className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                <span className="text-gray-400 text-xs mt-0.5">📍</span>
                                <span className="text-xs text-gray-600 font-mono">{step.path}</span>
                              </div>
                            )}

                            {step.tip && (
                              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                <span className="text-blue-500 text-xs mt-0.5">💡</span>
                                <p className="text-xs text-blue-800">
                                  <strong>Tip:</strong> {step.tip}
                                </p>
                              </div>
                            )}

                            {step.warning && (
                              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                <span className="text-amber-500 text-xs mt-0.5">⚠️</span>
                                <p className="text-xs text-amber-800">
                                  <strong>Warning:</strong> {step.warning}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
        <strong>Need more help?</strong> Contact WinTeam Support at{" "}
        <span className="font-mono">support@winteam.com</span> or reference the WinTeam ACA
        Knowledge Base within your WinTeam portal under Help → ACA Reporting.
      </div>
    </main>
  );
}
