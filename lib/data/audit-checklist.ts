export interface AuditChecklistItem {
  id: string;
  category: string;
  label: string;
  description: string;
  sort_order: number;
}

export const auditChecklistItems: AuditChecklistItem[] = [
  // ─── ALE Status ───────────────────────────────────────────────
  {
    id: "ale-1",
    category: "ALE Status",
    label: "Confirm ALE status for the calendar year",
    description:
      "Verify the company had an average of at least 50 full-time equivalent employees (FTEs) during the prior calendar year, making it an Applicable Large Employer (ALE) required to file.",
    sort_order: 1,
  },
  {
    id: "ale-2",
    category: "ALE Status",
    label: "Document ALE calculation worksheet",
    description:
      "Retain the FTE calculation worksheet showing monthly full-time and part-time hour counts used to determine ALE status.",
    sort_order: 2,
  },
  {
    id: "ale-3",
    category: "ALE Status",
    label: "Identify all controlled group members",
    description:
      "If the company is part of a controlled group, confirm that all members are identified and their combined FTE counts are used for ALE determination.",
    sort_order: 3,
  },

  // ─── Employee Eligibility ──────────────────────────────────────
  {
    id: "elig-1",
    category: "Employee Eligibility",
    label: "Identify all full-time employees (30+ hrs/week)",
    description:
      "Pull a list of all employees averaging 30 or more hours per week, or 130+ hours per month, for each month of the tax year.",
    sort_order: 10,
  },
  {
    id: "elig-2",
    category: "Employee Eligibility",
    label: "Identify variable-hour employees and measurement periods",
    description:
      "Document which employees are being tracked under initial or standard measurement periods and confirm the applicable dates.",
    sort_order: 11,
  },
  {
    id: "elig-3",
    category: "Employee Eligibility",
    label: "Verify new hire waiting periods are within 90 days",
    description:
      "Confirm that coverage was offered within 90 days of hire for all applicable new full-time employees.",
    sort_order: 12,
  },
  {
    id: "elig-4",
    category: "Employee Eligibility",
    label: "Confirm terminated employee records are complete",
    description:
      "Ensure termination dates are captured and 1095-C codes are correctly applied for each month including termination month.",
    sort_order: 13,
  },

  // ─── Coverage Offers ────────────────────────────────────────────
  {
    id: "cov-1",
    category: "Coverage Offers",
    label: "Confirm MEC + minimum value plans are documented",
    description:
      "Ensure at least one plan offered meets Minimum Essential Coverage (MEC) and Minimum Value (pays at least 60% of covered costs).",
    sort_order: 20,
  },
  {
    id: "cov-2",
    category: "Coverage Offers",
    label: "Verify dependent coverage was offered where applicable",
    description:
      "Confirm that dependent coverage was made available up to age 26 for all eligible employees.",
    sort_order: 21,
  },
  {
    id: "cov-3",
    category: "Coverage Offers",
    label: "Check affordability threshold compliance",
    description:
      "Verify that the employee share of the lowest-cost self-only MEC plan meets the affordability safe harbor used (W-2, FPL, or Rate of Pay).",
    sort_order: 22,
  },
  {
    id: "cov-4",
    category: "Coverage Offers",
    label: "Document which affordability safe harbor is used",
    description:
      "Confirm whether 2F (W-2), 2G (Federal Poverty Line), or 2H (Rate of Pay) safe harbor applies and that it is applied consistently.",
    sort_order: 23,
  },

  // ─── Line 14 / 15 / 16 Codes ────────────────────────────────────
  {
    id: "codes-1",
    category: "Line 14 / 15 / 16 Codes",
    label: "Review Line 14 Offer of Coverage codes for accuracy",
    description:
      "Validate that the correct 1A–1H code is assigned for each employee for each month based on what coverage was actually offered.",
    sort_order: 30,
  },
  {
    id: "codes-2",
    category: "Line 14 / 15 / 16 Codes",
    label: "Confirm Line 15 amounts match premium records",
    description:
      "Cross-reference the employee required contribution amounts on Line 15 against payroll deduction and benefits enrollment records.",
    sort_order: 31,
  },
  {
    id: "codes-3",
    category: "Line 14 / 15 / 16 Codes",
    label: "Review Line 16 Safe Harbor codes for accuracy",
    description:
      "Ensure the correct 2A–2H safe harbor code is applied for each month, particularly for months where 1H is used on Line 14.",
    sort_order: 32,
  },
  {
    id: "codes-4",
    category: "Line 14 / 15 / 16 Codes",
    label: "Check that 2C is used when employee was enrolled",
    description:
      "Confirm that Line 16 shows 2C for any month where the employee was actually enrolled in employer-sponsored coverage.",
    sort_order: 33,
  },

  // ─── Data Integrity ───────────────────────────────────────────
  {
    id: "data-1",
    category: "Data Integrity",
    label: "Verify employee names match SSA records",
    description:
      "Ensure employee first and last names match their Social Security Administration records to avoid TIN mismatches.",
    sort_order: 40,
  },
  {
    id: "data-2",
    category: "Data Integrity",
    label: "Validate all Social Security Numbers (SSNs / TINs)",
    description:
      "Run TIN matching to confirm all SSNs are valid. Flag and resolve any ITINs or missing TINs before filing.",
    sort_order: 41,
  },
  {
    id: "data-3",
    category: "Data Integrity",
    label: "Confirm employee addresses are current",
    description:
      "Ensure mailing addresses are up to date so 1095-C copies can be delivered to employees by the furnishing deadline.",
    sort_order: 42,
  },
  {
    id: "data-4",
    category: "Data Integrity",
    label: "Reconcile headcount with payroll records",
    description:
      "Cross-check the number of 1095-C forms being generated against payroll headcount for the year to identify missing or extra records.",
    sort_order: 43,
  },

  // ─── Filing & Deadlines ──────────────────────────────────────
  {
    id: "file-1",
    category: "Filing & Deadlines",
    label: "Confirm furnishing deadline (employee copies)",
    description:
      "Employee copies of 1095-C must be furnished by March 3 of the year following the coverage year (or next business day).",
    sort_order: 50,
  },
  {
    id: "file-2",
    category: "Filing & Deadlines",
    label: "Confirm IRS filing deadline (paper or electronic)",
    description:
      "Paper filing deadline is February 28; electronic filing deadline is March 31. ALEs with 10+ returns must e-file.",
    sort_order: 51,
  },
  {
    id: "file-3",
    category: "Filing & Deadlines",
    label: "Verify Employer Identification Number (EIN) is correct",
    description:
      "Confirm the EIN on all 1094-C and 1095-C forms matches the company's official IRS EIN exactly.",
    sort_order: 52,
  },
  {
    id: "file-4",
    category: "Filing & Deadlines",
    label: "Review 1094-C transmittal form completeness",
    description:
      "Ensure the 1094-C Authoritative Transmittal is complete with correct totals, ALE Member information, and certification of eligibility.",
    sort_order: 53,
  },
  {
    id: "file-5",
    category: "Filing & Deadlines",
    label: "Confirm e-filing system or vendor is ready",
    description:
      "Verify access to IRS AIR system or third-party filing vendor credentials, and test file submission before the deadline.",
    sort_order: 54,
  },

  // ─── Self-Insured Plans ──────────────────────────────────────
  {
    id: "self-1",
    category: "Self-Insured Plans",
    label: "Identify self-insured vs. fully-insured plans",
    description:
      "Determine if the employer sponsors any self-insured (self-funded) health plans requiring Part III completion on 1095-C.",
    sort_order: 60,
  },
  {
    id: "self-2",
    category: "Self-Insured Plans",
    label: "Complete Part III for all self-insured enrollees",
    description:
      "For self-insured plans, capture enrollment data for the employee, spouse, and all dependents including dates of coverage.",
    sort_order: 61,
  },
  {
    id: "self-3",
    category: "Self-Insured Plans",
    label: "Verify dependent DOBs and TINs for Part III",
    description:
      "Confirm all dependent dates of birth and TINs/SSNs in the enrollment data are accurate before filing.",
    sort_order: 62,
  },

  // ─── WinTeam / Payroll System ─────────────────────────────────
  {
    id: "wt-1",
    category: "WinTeam / Payroll System",
    label: "Export ACA hours report from WinTeam",
    description:
      "Run the ACA Hours Worked report in WinTeam for all employees and verify that hours are captured for all 12 months.",
    sort_order: 70,
  },
  {
    id: "wt-2",
    category: "WinTeam / Payroll System",
    label: "Confirm WinTeam benefit enrollment data is current",
    description:
      "Verify that all open enrollment changes, new enrollments, and terminations are reflected in WinTeam before generating 1095-C data.",
    sort_order: 71,
  },
  {
    id: "wt-3",
    category: "WinTeam / Payroll System",
    label: "Review WinTeam ACA configuration for correct plan codes",
    description:
      "Ensure Line 14, 15, and 16 code mappings in WinTeam's ACA module match your plan design and affordability safe harbor elections.",
    sort_order: 72,
  },
];
