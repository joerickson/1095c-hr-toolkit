import { ChecklistItem } from "./types";

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // SYS: Company Setup
  {
    key: "sys_aca_enabled",
    label: "ACA Configuration is enabled in SYS: Company Setup",
    severity: "critical",
    section: "SYS: Company Setup",
  },
  {
    key: "sys_contact_phone",
    label: "1095-C Contact Phone Number routes to Benefits Administrator",
    severity: "required",
    section: "SYS: Company Setup",
  },
  {
    key: "sys_ein_correct",
    label: "Employer EIN is correct in Company Setup",
    severity: "critical",
    section: "SYS: Company Setup",
  },

  // INS: Eligibility Setup
  {
    key: "elig_aca_compliant",
    label:
      "ACA Compliant Eligibility checkbox is checked on all ACA eligibility rules",
    severity: "critical",
    section: "INS: Eligibility Setup",
  },
  {
    key: "elig_plan_start_month",
    label:
      'Plan Start Month is set to "01" (January) for all ACA eligibility rules',
    severity: "required",
    section: "INS: Eligibility Setup",
  },

  // Plan 1 — MEC (self-insured)
  {
    key: "p1_aca_checked",
    label: "Plan 1: ACA checkbox is checked on the Pricing tab",
    severity: "critical",
    section: "Plan 1 — MEC (self-insured)",
  },
  {
    key: "p1_self_insured_checked",
    label: "Plan 1: Self Insured checkbox IS checked — Part III will be generated",
    severity: "critical",
    section: "Plan 1 — MEC (self-insured)",
  },
  {
    key: "p1_min_value_unchecked",
    label:
      "Plan 1: Minimum Value is NOT checked — MEC-only does not meet minimum value",
    severity: "critical",
    section: "Plan 1 — MEC (self-insured)",
  },
  {
    key: "p1_premium_entered",
    label:
      "Plan 1: Employee-only monthly premium is entered correctly on Pricing tab (Line 15 source)",
    severity: "required",
    section: "Plan 1 — MEC (self-insured)",
  },
  {
    key: "p1_plan_options",
    label: "Plan 1: Plan Options tab includes Employee, Spouse, and Dependents",
    severity: "required",
    section: "Plan 1 — MEC (self-insured)",
  },

  // Plan 2 — Self-Insured Full Coverage
  {
    key: "p2_aca_checked",
    label: "Plan 2: ACA checkbox is checked on the Pricing tab",
    severity: "critical",
    section: "Plan 2 — Self-Insured Full Coverage",
  },
  {
    key: "p2_self_insured_checked",
    label: "Plan 2: Self Insured checkbox IS checked — Part III will be generated",
    severity: "critical",
    section: "Plan 2 — Self-Insured Full Coverage",
  },
  {
    key: "p2_min_value_checked",
    label: "Plan 2: Minimum Value IS checked — full coverage meets minimum value",
    severity: "critical",
    section: "Plan 2 — Self-Insured Full Coverage",
  },
  {
    key: "p2_plan_options",
    label: "Plan 2: Plan Options tab includes Employee, Spouse, and Dependents",
    severity: "required",
    section: "Plan 2 — Self-Insured Full Coverage",
  },

  // Plan 3 — Select Health Small Group
  {
    key: "p3_aca_checked",
    label: "Plan 3: ACA checkbox is checked on the Pricing tab",
    severity: "critical",
    section: "Plan 3 — Select Health Small Group",
  },
  {
    key: "p3_self_insured_unchecked",
    label:
      "Plan 3: Self Insured checkbox is NOT checked — Select Health issues the 1095-B",
    severity: "critical",
    section: "Plan 3 — Select Health Small Group",
  },
  {
    key: "p3_min_value_checked",
    label: "Plan 3: Minimum Value IS checked — Select Health is full coverage",
    severity: "critical",
    section: "Plan 3 — Select Health Small Group",
  },
  {
    key: "p3_plan_options",
    label: "Plan 3: Plan Options tab includes Employee, Spouse, and Dependents",
    severity: "required",
    section: "Plan 3 — Select Health Small Group",
  },
  {
    key: "p3_package_includes_all",
    label:
      "All employee benefit packages include all three plans so WinTeam generates 1E for everyone",
    severity: "critical",
    section: "Plan 3 — Select Health Small Group",
  },

  // Employee Master File
  {
    key: "emp_ssn_all",
    label: "All full-time employees have a valid SSN on file",
    severity: "critical",
    section: "Employee Master File",
  },
  {
    key: "emp_dob_all",
    label: "All employees have a date of birth entered",
    severity: "required",
    section: "Employee Master File",
  },
  {
    key: "emp_state_all",
    label: "All employees have a current US state on their address",
    severity: "required",
    section: "Employee Master File",
  },
  {
    key: "emp_terminated_review",
    label:
      "Terminated employees reviewed — still receive 1095-C if full-time any month in tax year",
    severity: "required",
    section: "Employee Master File",
  },

  // INS: Benefits by Employee — Self-Insured Plans
  {
    key: "dep_spouse_ssn",
    label:
      "All enrolled spouses have an SSN in the covered individuals sub-record",
    severity: "critical",
    section: "INS: Benefits by Employee — Self-Insured Plans",
  },
  {
    key: "dep_minor_dob",
    label: "All enrolled minor dependents have a date of birth entered",
    severity: "required",
    section: "INS: Benefits by Employee — Self-Insured Plans",
  },
  {
    key: "dep_adult_ssn",
    label: "Adult dependents (18+) have an SSN — DOB alone is not sufficient",
    severity: "required",
    section: "INS: Benefits by Employee — Self-Insured Plans",
  },
  {
    key: "dep_coverage_dates",
    label: "Coverage start and end dates are correct for all dependents",
    severity: "required",
    section: "INS: Benefits by Employee — Self-Insured Plans",
  },
  {
    key: "dep_stability_date",
    label: "Stability Start Date (Availability Date) is correct for each employee",
    severity: "critical",
    section: "INS: Benefits by Employee — Self-Insured Plans",
  },

  // Pre-Filing Final Checks
  {
    key: "pre_test_report",
    label:
      "Run a test 1095-C report in WinTeam and spot-check 5–10 employees across all three plans",
    severity: "critical",
    section: "Pre-Filing Final Checks",
  },
  {
    key: "pre_verify_1e",
    label:
      "Verify ALL eligible employees show Line 14 code 1E (not 1F — all three plans are offered to everyone)",
    severity: "critical",
    section: "Pre-Filing Final Checks",
  },
  {
    key: "pre_verify_part3",
    label:
      "Verify Part III is populated for Plan 1 and Plan 2 employees and blank for Plan 3",
    severity: "critical",
    section: "Pre-Filing Final Checks",
  },
  {
    key: "pre_verify_line15",
    label:
      "Line 15 amount matches the Plan 1 MEC employee-only monthly premium on every form",
    severity: "required",
    section: "Pre-Filing Final Checks",
  },
  {
    key: "pre_1094c_review",
    label:
      "1094-C transmittal data reviewed — full-time employee count and ALE info are correct",
    severity: "required",
    section: "Pre-Filing Final Checks",
  },
  {
    key: "pre_efile_submitted",
    label:
      "E-file submitted through WinTeam or TEAM Software e-file service before deadline",
    severity: "deadline",
    section: "Pre-Filing Final Checks",
  },
];

export const CHECKLIST_SECTIONS = Array.from(
  new Set(CHECKLIST_ITEMS.map((item) => item.section))
);
