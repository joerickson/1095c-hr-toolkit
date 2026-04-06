import { WALKTHROUGHS } from './walkthroughs-data'

export type WalkthroughStep = {
  step: number
  instruction: string
  detail?: string
  warning?: string
  screenshot_hint?: string
}

export type Walkthrough = {
  overview: string
  why_it_matters: string
  steps: WalkthroughStep[]
  if_something_looks_wrong: string[]
  estimated_minutes: number
}

export type WinTeamAccess = {
  module: string
  permission_level: 'read' | 'read_write' | 'admin'
  specific_permission?: string
  notes?: string
}

export type WinTeamRole = 'standard_hr' | 'hr_manager' | 'winteam_admin' | 'team_software_support'

export type AccessRequired = {
  winteam_role: WinTeamRole
  modules: WinTeamAccess[]
  can_delegate: boolean
  delegation_notes?: string
}

export const ROLE_METADATA: Record<WinTeamRole, { label: string; description: string; color: string; badgeClass: string; textClass: string; borderClass: string }> = {
  standard_hr: {
    label: 'Standard HR User',
    description: 'Basic HR staff with access to view and edit employee records, enter hours, and manage benefit enrollments in INS: Benefits by Employee. Cannot access SYS: Company Setup or INS: Benefit Setup.',
    color: 'blue',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
  },
  hr_manager: {
    label: 'HR Manager / Power User',
    description: 'HR staff with elevated access to run 1095-C reports, execute the Eligibility Testing Wizard, view and edit benefit packages, and access most INS screens. Cannot access SYS.',
    color: 'purple',
    badgeClass: 'bg-purple-100 text-purple-800 border border-purple-200',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
  },
  winteam_admin: {
    label: 'WinTeam Administrator',
    description: 'Full system access including SYS: Company Setup, INS: Benefit Setup, and all configuration screens. Typically the person who manages your WinTeam system. There may only be one or two people with this role.',
    color: 'red',
    badgeClass: 'bg-red-100 text-red-800 border border-red-200',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
  },
  team_software_support: {
    label: 'TEAM Software Support',
    description: 'Tasks that require involvement from TEAM Software directly — either because they require backend access or because the risk of error is high enough that professional support is recommended.',
    color: 'gray',
    badgeClass: 'bg-gray-200 text-gray-800 border border-gray-300',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-300',
  },
}

export type FilingChecklistItem = {
  key: string
  phase: 1 | 2 | 3 | 4
  section: string
  label: string
  detail: string
  winteamPath: string | null
  severity: 'critical' | 'required' | 'recommended'
  isGate: boolean
  order: number
  walkthrough?: Walkthrough
  access_required: AccessRequired
}

// Access requirements for each checklist item
const ACCESS_REQUIREMENTS: Record<string, AccessRequired> = {
  // ── Phase 1: SYS Company Setup ─────────────────────────────────────────────
  audit_sys_aca_enabled: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'SYS: Company Setup', permission_level: 'admin', notes: 'SYS access required. Standard HR and HR Manager roles cannot access Company Setup.' }],
    can_delegate: false,
    delegation_notes: 'Must be performed by your WinTeam Administrator. If you are not sure who that is, contact TEAM Software support.',
  },
  audit_sys_ein: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'SYS: Company Setup', permission_level: 'admin' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only. Have your accountant or payroll provider confirm the correct EIN before making any changes.',
  },
  audit_sys_phone: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'SYS: Company Setup', permission_level: 'admin' }],
    can_delegate: false,
  },
  // ── Phase 1: INS Eligibility Setup ─────────────────────────────────────────
  audit_ins_aca_compliant: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Eligibility Setup', permission_level: 'admin', notes: 'Eligibility Setup is typically restricted to WinTeam Administrators. Some organizations grant HR Managers read access but not write access.' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator must make any changes. An HR Manager with read access can verify the setting but cannot fix it if it is wrong.',
  },
  audit_ins_plan_start_month: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Eligibility Setup', permission_level: 'admin' }],
    can_delegate: false,
  },
  // ── Phase 1: INS Benefit Setup (all plan config items) ─────────────────────
  audit_plan1_aca: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit', notes: 'Benefit Setup is a configuration screen restricted to WinTeam Administrators. Changes here affect all employees assigned to these plans.' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only. These are system configuration changes — not employee data entry. One wrong checkbox here affects every 1095-C you generate.',
  },
  audit_plan1_self_insured: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only. These are system configuration changes.',
  },
  audit_plan1_min_value: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only.',
  },
  audit_plan1_premium: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only.',
  },
  audit_plan1_options: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only.',
  },
  audit_plan2_aca: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit', notes: 'Benefit Setup is a configuration screen restricted to WinTeam Administrators.' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only. These are system configuration changes.',
  },
  audit_plan2_self_insured: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only.',
  },
  audit_plan2_min_value: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only.',
  },
  audit_plan2_options: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only.',
  },
  audit_plan3_aca: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit', notes: 'Benefit Setup is a configuration screen restricted to WinTeam Administrators.' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only.',
  },
  audit_plan3_self_insured: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only.',
  },
  audit_plan3_min_value: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only.',
  },
  audit_plan3_options: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', specific_permission: 'INS: Benefit Setup - Edit' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only.',
  },
  // ── Phase 1: Benefit Package Verification ──────────────────────────────────
  audit_packages_all_three: {
    winteam_role: 'hr_manager',
    modules: [
      { module: 'INS: Benefits by Employee', permission_level: 'read_write', notes: 'Read access needed to verify packages. Write access needed if packages must be corrected.' },
      { module: 'INS: Benefit Setup', permission_level: 'admin', notes: 'If packages need to be updated to include all three plans, the package template itself must be edited by a WinTeam Administrator.' },
    ],
    can_delegate: true,
    delegation_notes: 'An HR Manager can verify whether packages are correct. If corrections are needed, a WinTeam Administrator must make them. Plan to have both people available for this step.',
  },
  // ── Phase 1: Preview Report ─────────────────────────────────────────────────
  audit_preview_line14: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'read_write', specific_permission: 'INS: 1095-C Report - Run', notes: 'Running the 1095-C report typically requires HR Manager level access or a specific report permission granted by the WinTeam Administrator.' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff member with 1095-C Report access can run this. If no one has this access, contact your WinTeam Administrator to grant it before starting Phase 1.',
  },
  audit_part3_populated: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'read_write', specific_permission: 'INS: 1095-C Report - Run' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff member with 1095-C Report access can run this.',
  },
  audit_line15_consistent: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'read_write', specific_permission: 'INS: 1095-C Report - Run' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff member with 1095-C Report access can run this.',
  },
  // ── Phase 2 ─────────────────────────────────────────────────────────────────
  rollforward_blocking_resolved: {
    winteam_role: 'winteam_admin',
    modules: [],
    can_delegate: false,
    delegation_notes: 'Resolution of blocking issues requires whoever has the WinTeam access level that corresponds to the issue category. Most blocking issues from Phase 1 will require WinTeam Administrator access.',
  },
  rollforward_tax_year: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'read_write', notes: 'The tax year is set at report run time, not in a settings screen. HR Manager access to the report is sufficient.' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff with 1095-C Report access can do this.',
  },
  rollforward_affordability: {
    winteam_role: 'standard_hr',
    modules: [],
    can_delegate: true,
    delegation_notes: 'This setting is updated in this app on the Settings page. Any admin user of this app can make this change. No WinTeam access required for this specific step.',
  },
  rollforward_fpl: {
    winteam_role: 'standard_hr',
    modules: [],
    can_delegate: true,
    delegation_notes: 'This setting is updated in this app on the Settings page. Any admin user of this app can make this change. No WinTeam access required for this specific step.',
  },
  rollforward_plan1_premium: {
    winteam_role: 'standard_hr',
    modules: [{ module: 'INS: Benefit Setup', permission_level: 'admin', notes: 'If the MEC premium changed for this year, it must also be updated in WinTeam INS: Benefit Setup Pricing tab — not just in this app. That part requires a WinTeam Administrator.' }],
    can_delegate: true,
    delegation_notes: 'App settings changes can be done by any admin user of this app. The WinTeam Benefit Setup update requires a WinTeam Administrator.',
  },
  rollforward_eligibility_wizard: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Eligibility Testing Wizard', permission_level: 'admin', specific_permission: 'INS: Eligibility Testing Wizard - Execute', notes: 'The Eligibility Testing Wizard re-evaluates and reassigns benefit eligibility for your entire workforce. It requires Administrator access and should be run with care.' }],
    can_delegate: false,
    delegation_notes: 'This must be run by your WinTeam Administrator. Consider having TEAM Software support on standby the first time you run this for a new year. Recommended to run during off-hours.',
  },
  rollforward_benefit_packages: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Benefits by Employee', permission_level: 'read_write', notes: 'Assigning packages to employees requires write access to Benefits by Employee.' }],
    can_delegate: true,
    delegation_notes: 'HR Manager or Standard HR with write access to INS: Benefits by Employee can do this. This is the most time-intensive step in Phase 2 — consider assigning it to multiple HR staff members splitting the employee list.',
  },
  rollforward_stability_dates: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Benefits by Employee', permission_level: 'read_write' }],
    can_delegate: true,
    delegation_notes: 'HR Manager or Standard HR with Benefits by Employee write access. Can be split across multiple staff members.',
  },
  // ── Phase 3 ─────────────────────────────────────────────────────────────────
  data_all_ft_employees: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'Employee Master File', permission_level: 'read_write', notes: 'Write access is needed to add any missing employee records.' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff with Employee Master File write access can do this.',
  },
  data_valid_ssn: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'Employee Master File', permission_level: 'read_write' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff with Employee Master File write access can do this. Consider assigning one person to pull a list of all employees missing SSN and contact them directly.',
  },
  data_dob: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'Employee Master File', permission_level: 'read_write' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff with Employee Master File write access can do this.',
  },
  data_plan1_enrollments: {
    winteam_role: 'standard_hr',
    modules: [{ module: 'INS: Benefits by Employee', permission_level: 'read_write', notes: 'Entering benefit elections is standard HR data entry. Standard HR users with write access to Benefits by Employee can complete this.' }],
    can_delegate: true,
    delegation_notes: 'This is the most delegatable task in the entire process. Any HR staff member with INS: Benefits by Employee write access can enter elections. Consider splitting the employee list across your whole HR team.',
  },
  data_plan2_enrollments: {
    winteam_role: 'standard_hr',
    modules: [{ module: 'INS: Benefits by Employee', permission_level: 'read_write', notes: 'Entering benefit elections is standard HR data entry.' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff member with INS: Benefits by Employee write access can enter elections.',
  },
  data_plan3_enrollments: {
    winteam_role: 'standard_hr',
    modules: [{ module: 'INS: Benefits by Employee', permission_level: 'read_write' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff member with INS: Benefits by Employee write access can enter elections.',
  },
  data_declined_packages: {
    winteam_role: 'standard_hr',
    modules: [{ module: 'INS: Benefits by Employee', permission_level: 'read_write' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff member with INS: Benefits by Employee write access can complete this.',
  },
  data_spouse_ssn: {
    winteam_role: 'standard_hr',
    modules: [{ module: 'INS: Benefits by Employee', permission_level: 'read_write', notes: 'Dependent data is entered on the Covered Individuals tab within Benefits by Employee.' }],
    can_delegate: true,
    delegation_notes: 'Standard HR with Benefits by Employee write access. Collecting missing SSNs from employees may require reaching out directly by phone or email — build time for that into your schedule.',
  },
  data_dependent_dob: {
    winteam_role: 'standard_hr',
    modules: [{ module: 'INS: Benefits by Employee', permission_level: 'read_write', notes: 'Dependent data is entered on the Covered Individuals tab within Benefits by Employee.' }],
    can_delegate: true,
    delegation_notes: 'Standard HR with Benefits by Employee write access.',
  },
  data_adult_ssn: {
    winteam_role: 'standard_hr',
    modules: [{ module: 'INS: Benefits by Employee', permission_level: 'read_write' }],
    can_delegate: true,
    delegation_notes: 'Standard HR with Benefits by Employee write access.',
  },
  data_coverage_months: {
    winteam_role: 'standard_hr',
    modules: [{ module: 'INS: Benefits by Employee', permission_level: 'read_write' }],
    can_delegate: true,
    delegation_notes: 'Standard HR with Benefits by Employee write access.',
  },
  data_variable_hour: {
    winteam_role: 'hr_manager',
    modules: [
      { module: 'INS: Benefits by Employee', permission_level: 'read_write' },
      { module: 'Eligibility Board (this app)', permission_level: 'read_write', notes: 'Check the Eligibility Board in this app first to see which employees need attention, then make changes in WinTeam.' },
    ],
    can_delegate: true,
  },
  data_terminations: {
    winteam_role: 'standard_hr',
    modules: [
      { module: 'Employee Master File', permission_level: 'read_write' },
      { module: 'INS: Benefits by Employee', permission_level: 'read_write' },
    ],
    can_delegate: true,
  },
  data_new_hires: {
    winteam_role: 'standard_hr',
    modules: [
      { module: 'Employee Master File', permission_level: 'read_write' },
      { module: 'INS: Benefits by Employee', permission_level: 'read_write' },
    ],
    can_delegate: true,
  },
  data_tracker_ready: {
    winteam_role: 'standard_hr',
    modules: [{ module: 'Employee Tracker (this app)', permission_level: 'read', notes: 'This step is completed entirely in this app — no WinTeam access required. Review the tracker and fix any flagged issues in WinTeam before marking this complete.' }],
    can_delegate: true,
  },
  // ── Phase 4 ─────────────────────────────────────────────────────────────────
  file_preview_all: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'read_write', specific_permission: 'INS: 1095-C Report - Run' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff with 1095-C Report access can run the test report. Spot-checking the output can be done by anyone who understands what the codes should look like — use the Code Wizard in this app to verify codes if unsure.',
  },
  file_spot_plan1: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'read_write', specific_permission: 'INS: 1095-C Report - Run' }],
    can_delegate: true,
    delegation_notes: 'Spot-checking can be done by anyone who understands what the codes should look like — use the Code Wizard in this app to verify codes if unsure.',
  },
  file_spot_plan2: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'read_write', specific_permission: 'INS: 1095-C Report - Run' }],
    can_delegate: true,
    delegation_notes: 'Spot-checking can be done by anyone who understands what the codes should look like.',
  },
  file_spot_plan3: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'read_write', specific_permission: 'INS: 1095-C Report - Run' }],
    can_delegate: true,
    delegation_notes: 'Spot-checking can be done by anyone who understands what the codes should look like.',
  },
  file_spot_declined: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'read_write', specific_permission: 'INS: 1095-C Report - Run' }],
    can_delegate: true,
    delegation_notes: 'Spot-checking can be done by anyone who understands what the codes should look like.',
  },
  file_line15_consistent: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'read_write', specific_permission: 'INS: 1095-C Report - Run' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff with 1095-C Report access can run the report.',
  },
  file_count_matches: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'read_write', specific_permission: 'INS: 1095-C Report - Run' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff with 1095-C Report access can run the report.',
  },
  file_fix_rerun: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'read_write', specific_permission: 'INS: 1095-C Report - Run' }],
    can_delegate: true,
    delegation_notes: 'Any HR staff with 1095-C Report access can run the report. Spot-checking can be done by anyone who understands what the codes should look like.',
  },
  file_generate_1095c: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'admin', specific_permission: 'INS: 1095-C Electronic File - Generate', notes: 'Generating the electronic file and transmitter information requires Administrator access. This is the step that creates the actual file submitted to the IRS.' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only. Do not rush this step. Verify the transmitter information window carefully — your TCC and EIN must be exact.',
  },
  file_generate_1094c: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'INS: Employee 1095-C Report', permission_level: 'admin', specific_permission: 'INS: 1095-C Electronic File - Generate', notes: 'Generating the transmitter file requires Administrator access.' }],
    can_delegate: false,
    delegation_notes: 'WinTeam Administrator only.',
  },
  file_submit: {
    winteam_role: 'winteam_admin',
    modules: [{ module: 'IRS FIRE System or TEAM Software e-file portal', permission_level: 'admin', notes: 'Submitting through FIRE requires your TCC. Submitting through TEAM Software requires your TEAM Software portal credentials.' }],
    can_delegate: false,
    delegation_notes: 'Must be performed by whoever holds your TCC credentials. If you do not know who that is or where the TCC is stored, find out immediately — you cannot file without it.',
  },
  file_acknowledgement: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'IRS FIRE System', permission_level: 'read', notes: 'Checking acknowledgement status requires logging into FIRE with your TCC credentials.' }],
    can_delegate: true,
  },
  file_save_copies: {
    winteam_role: 'hr_manager',
    modules: [{ module: 'IRS FIRE System', permission_level: 'read', notes: 'Download and save the acknowledgement file from FIRE.' }],
    can_delegate: true,
  },
}

export function getFilingChecklist(taxYear: number): FilingChecklistItem[] {
  const priorYear = taxYear - 1

  // Intermediate type without fields populated at map time
  type ItemDef = Omit<FilingChecklistItem, 'access_required' | 'walkthrough'>

  const items: ItemDef[] = [
    // ============================================================
    // PHASE 1 — Audit [priorYear] WinTeam Setup (22 items, all gated)
    // ============================================================

    // SYS: Company Setup
    {
      key: 'audit_sys_aca_enabled',
      phase: 1,
      section: `Audit ${priorYear} — SYS: Company Setup`,
      label: `Confirm ACA Configuration was enabled in ${priorYear}`,
      detail: `Navigate to SYS > Company Setup > ACA Configuration. Verify the ACA module was active and configured for tax year ${priorYear}. This is required before any 1095-C forms can be generated.`,
      winteamPath: 'SYS > Company Setup > ACA Configuration',
      severity: 'critical',
      isGate: true,
      order: 1,
    },
    {
      key: 'audit_sys_ein',
      phase: 1,
      section: `Audit ${priorYear} — SYS: Company Setup`,
      label: `Verify EIN matches IRS records`,
      detail: `Confirm the Employer Identification Number in WinTeam exactly matches your IRS records. An incorrect EIN will cause the IRS to reject the entire 1094-C/1095-C filing.`,
      winteamPath: 'SYS > Company Setup > ACA Configuration',
      severity: 'critical',
      isGate: true,
      order: 2,
    },
    {
      key: 'audit_sys_phone',
      phase: 1,
      section: `Audit ${priorYear} — SYS: Company Setup`,
      label: `Confirm contact phone is current`,
      detail: `Verify the contact phone number in ACA Configuration is a current, working number for your HR department. The IRS may use this number to contact you about your filing.`,
      winteamPath: 'SYS > Company Setup > ACA Configuration',
      severity: 'required',
      isGate: true,
      order: 3,
    },

    // INS: Eligibility Setup
    {
      key: 'audit_ins_aca_compliant',
      phase: 1,
      section: `Audit ${priorYear} — INS: Eligibility Setup`,
      label: `ACA Compliant Eligibility checked on all eligibility rules`,
      detail: `In INS > Eligibility Setup, open each eligibility rule used for ${priorYear} and confirm the "ACA Compliant Eligibility" checkbox is checked. Without this, WinTeam will not correctly calculate offer-of-coverage status.`,
      winteamPath: 'INS > Eligibility Setup > ACA Compliant Eligibility checkbox',
      severity: 'critical',
      isGate: true,
      order: 4,
    },
    {
      key: 'audit_ins_plan_start_month',
      phase: 1,
      section: `Audit ${priorYear} — INS: Eligibility Setup`,
      label: `Plan Start Month = 01 (January)`,
      detail: `Verify Plan Start Month is set to 01 in INS > Eligibility Setup. This tells WinTeam your plan year runs January–December, which is required for accurate ACA Line 14/15/16 calculations.`,
      winteamPath: 'INS > Eligibility Setup > ACA Compliant Eligibility checkbox',
      severity: 'critical',
      isGate: true,
      order: 5,
    },

    // Plan 1 — MEC
    {
      key: 'audit_plan1_aca',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 1 (MEC) Setup`,
      label: `Plan 1: ACA checkbox is checked`,
      detail: `In INS > Benefit Setup, open Plan 1. On the Pricing Tab, confirm the "ACA" checkbox is checked. This designates Plan 1 as an ACA-reportable plan.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Pricing Tab > ACA checkbox',
      severity: 'critical',
      isGate: true,
      order: 6,
    },
    {
      key: 'audit_plan1_self_insured',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 1 (MEC) Setup`,
      label: `Plan 1: Self Insured checkbox is checked`,
      detail: `On Plan 1's Pricing Tab, confirm the "Self Insured" checkbox is checked. Plan 1 is a self-insured MEC plan — this triggers Part III (covered individuals) on the 1095-C.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Pricing Tab > Self Insured checkbox',
      severity: 'critical',
      isGate: true,
      order: 7,
    },
    {
      key: 'audit_plan1_min_value',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 1 (MEC) Setup`,
      label: `Plan 1: Minimum Value is NOT checked`,
      detail: `On Plan 1's Pricing Tab, confirm the "Minimum Value" checkbox is NOT checked. Plan 1 is a MEC plan that does not meet minimum value — checking this box would generate incorrect Line 14 codes.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Pricing Tab > Minimum Value checkbox',
      severity: 'critical',
      isGate: true,
      order: 8,
    },
    {
      key: 'audit_plan1_premium',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 1 (MEC) Setup`,
      label: `Plan 1: Employee-only premium amount is recorded`,
      detail: `Verify the employee-only premium dollar amount for Plan 1 is entered on the Pricing Tab. This amount populates Line 15 on the 1095-C. All enrolled employees should show the same Line 15 amount.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Pricing Tab > Employee premium field',
      severity: 'critical',
      isGate: true,
      order: 9,
    },
    {
      key: 'audit_plan1_options',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 1 (MEC) Setup`,
      label: `Plan 1: Plan Options includes Employee, Spouse, and Dependents tiers`,
      detail: `On Plan 1's Plan Options Tab, confirm coverage tiers for Employee-only, Employee + Spouse, and Employee + Dependents exist. All three tiers must be available in the benefit package for WinTeam to generate code 1E (not 1F).`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Plan Options Tab',
      severity: 'critical',
      isGate: true,
      order: 10,
    },

    // Plan 2 — Self-Insured
    {
      key: 'audit_plan2_aca',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 2 (Self-Insured) Setup`,
      label: `Plan 2: ACA checkbox is checked`,
      detail: `In INS > Benefit Setup, open Plan 2. On the Pricing Tab, confirm "ACA" is checked.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Pricing Tab > ACA checkbox',
      severity: 'critical',
      isGate: true,
      order: 11,
    },
    {
      key: 'audit_plan2_self_insured',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 2 (Self-Insured) Setup`,
      label: `Plan 2: Self Insured checkbox is checked`,
      detail: `On Plan 2's Pricing Tab, confirm "Self Insured" is checked. Plan 2 is a self-insured major medical plan — this triggers Part III on the 1095-C.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Pricing Tab > Self Insured checkbox',
      severity: 'critical',
      isGate: true,
      order: 12,
    },
    {
      key: 'audit_plan2_min_value',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 2 (Self-Insured) Setup`,
      label: `Plan 2: Minimum Value is checked`,
      detail: `On Plan 2's Pricing Tab, confirm "Minimum Value" IS checked. Plan 2 meets minimum value, which affects Line 14 coding.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Pricing Tab > Minimum Value checkbox',
      severity: 'critical',
      isGate: true,
      order: 13,
    },
    {
      key: 'audit_plan2_options',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 2 (Self-Insured) Setup`,
      label: `Plan 2: Plan Options includes Employee, Spouse, and Dependents tiers`,
      detail: `On Plan 2's Plan Options Tab, confirm all three coverage tiers exist. This is required for code 1E generation.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Plan Options Tab',
      severity: 'critical',
      isGate: true,
      order: 14,
    },

    // Plan 3 — Select Health
    {
      key: 'audit_plan3_aca',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 3 (Select Health) Setup`,
      label: `Plan 3: ACA checkbox is checked`,
      detail: `In INS > Benefit Setup, open Plan 3. On the Pricing Tab, confirm "ACA" is checked.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Pricing Tab > ACA checkbox',
      severity: 'critical',
      isGate: true,
      order: 15,
    },
    {
      key: 'audit_plan3_self_insured',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 3 (Select Health) Setup`,
      label: `Plan 3: Self Insured is NOT checked`,
      detail: `On Plan 3's Pricing Tab, confirm "Self Insured" is NOT checked. Plan 3 is a fully-insured plan through Select Health — Part III should be blank on 1095-C forms for Plan 3 enrollees.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Pricing Tab > Self Insured checkbox',
      severity: 'critical',
      isGate: true,
      order: 16,
    },
    {
      key: 'audit_plan3_min_value',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 3 (Select Health) Setup`,
      label: `Plan 3: Minimum Value is checked`,
      detail: `On Plan 3's Pricing Tab, confirm "Minimum Value" IS checked. Plan 3 meets minimum value.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Pricing Tab > Minimum Value checkbox',
      severity: 'critical',
      isGate: true,
      order: 17,
    },
    {
      key: 'audit_plan3_options',
      phase: 1,
      section: `Audit ${priorYear} — INS: Plan 3 (Select Health) Setup`,
      label: `Plan 3: Plan Options includes Employee, Spouse, and Dependents tiers`,
      detail: `On Plan 3's Plan Options Tab, confirm all three coverage tiers exist.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Plan Options Tab',
      severity: 'critical',
      isGate: true,
      order: 18,
    },

    // Benefit Packages
    {
      key: 'audit_packages_all_three',
      phase: 1,
      section: `Audit ${priorYear} — Benefit Package Verification`,
      label: `All employee benefit packages include all THREE plans (Plan 1, Plan 2, and Plan 3)`,
      detail: `This is the most common error causing incorrect 1095-C output. In INS > Benefits by Employee, open the Package Tab for a sample of employees. Each package must include Plan 1 AND Plan 2 AND Plan 3 — not just the plan the employee enrolled in. If only Plan 1 is in the package, WinTeam generates Line 14 code 1F (minimum essential coverage, not minimum value) instead of 1E (minimum value coverage). This affects every form in your filing.`,
      winteamPath: 'INS > Benefits by Employee > Package Tab > review package contents',
      severity: 'critical',
      isGate: true,
      order: 19,
    },

    // Preview Report Validation
    {
      key: 'audit_preview_line14',
      phase: 1,
      section: `Audit ${priorYear} — Preview Report Validation`,
      label: `Run ${priorYear} preview report; verify Line 14 = 1E (not 1F) on enrolled employees`,
      detail: `Run the ${priorYear} 1095-C preview report in WinTeam (Output Type: Preview). Spot-check 5–10 employees who were enrolled in Plan 1, Plan 2, or Plan 3. Line 14 should read 1E (Minimum Value coverage offered to employee and at least MV coverage to dependents/spouse). If you see 1F, the benefit package is missing Plan 2 or Plan 3 — correct the packages and re-run.`,
      winteamPath: `INS > Employee 1095-C Report > Tax Year ${priorYear} > Output Type: Preview`,
      severity: 'critical',
      isGate: true,
      order: 20,
    },
    {
      key: 'audit_part3_populated',
      phase: 1,
      section: `Audit ${priorYear} — Preview Report Validation`,
      label: `Verify Part III: populated for Plan 1 and Plan 2, blank for Plan 3 enrollees`,
      detail: `In the preview report, spot-check Part III (Covered Individuals). Plan 1 and Plan 2 enrollees are on self-insured plans — Part III must list the employee and all covered dependents with SSN/DOB and months covered. Plan 3 enrollees are on a fully-insured plan — Part III should be completely blank for them.`,
      winteamPath: `INS > Employee 1095-C Report > Tax Year ${priorYear} > Output Type: Preview`,
      severity: 'critical',
      isGate: true,
      order: 21,
    },
    {
      key: 'audit_line15_consistent',
      phase: 1,
      section: `Audit ${priorYear} — Preview Report Validation`,
      label: `Verify Line 15 = same dollar amount on every enrolled employee's form`,
      detail: `Line 15 must show the employee-only premium for the lowest-cost minimum value plan (Plan 1 MEC). Every enrolled employee should have the exact same dollar amount on Line 15 — this is the affordability safe harbor figure. Flag any forms showing a different amount or a blank Line 15.`,
      winteamPath: `INS > Employee 1095-C Report > Tax Year ${priorYear} > Output Type: Preview`,
      severity: 'critical',
      isGate: true,
      order: 22,
    },

    // ============================================================
    // PHASE 2 — Fix Issues and Roll Forward (8 items)
    // ============================================================

    {
      key: 'rollforward_blocking_resolved',
      phase: 2,
      section: 'Fix Issues — Resolve Phase 1 Findings',
      label: 'All blocking issues logged in Phase 1 are resolved',
      detail: `Review all issues logged in the Filing Issues log with severity "Blocking." Each blocking issue must be resolved before the ${taxYear} filing can proceed. Verify resolution notes are complete.`,
      winteamPath: null,
      severity: 'critical',
      isGate: true,
      order: 1,
    },
    {
      key: 'rollforward_tax_year',
      phase: 2,
      section: `Roll Forward — Update WinTeam for ${taxYear}`,
      label: `Tax year updated to ${taxYear} in WinTeam`,
      detail: `In WinTeam SYS > Company Setup > ACA Configuration, update the tax year to ${taxYear}. This is required before running the ${taxYear} Eligibility Testing Wizard or generating ${taxYear} 1095-C forms.`,
      winteamPath: 'SYS > Company Setup > ACA Configuration',
      severity: 'critical',
      isGate: true,
      order: 2,
    },
    {
      key: 'rollforward_affordability',
      phase: 2,
      section: `Roll Forward — Update WinTeam for ${taxYear}`,
      label: `Affordability threshold updated to 9.02% in App Settings`,
      detail: `The IRS affordability threshold for ${taxYear} is 9.02% of W-2 Box 1 wages (or applicable safe harbor). Update this percentage in the app's Settings page so affordability calculations are correct for ${taxYear}.`,
      winteamPath: null,
      severity: 'critical',
      isGate: true,
      order: 3,
    },
    {
      key: 'rollforward_fpl',
      phase: 2,
      section: `Roll Forward — Update WinTeam for ${taxYear}`,
      label: `FPL monthly threshold updated to $105.29 in App Settings`,
      detail: `The federal poverty line (FPL) monthly threshold for ${taxYear} affordability is $105.29. Update this in the app's Settings page. This figure is used for the FPL safe harbor method calculation.`,
      winteamPath: null,
      severity: 'required',
      isGate: true,
      order: 4,
    },
    {
      key: 'rollforward_plan1_premium',
      phase: 2,
      section: `Roll Forward — Update WinTeam for ${taxYear}`,
      label: `Plan 1 MEC employee-only premium confirmed/updated for ${taxYear} in both WinTeam and App Settings`,
      detail: `Verify the Plan 1 employee-only monthly premium is correct for ${taxYear}. Update it in two places: (1) INS > Benefit Setup > Plan 1 > Pricing Tab, and (2) the App Settings page in this application. Both must match for Line 15 to be accurate.`,
      winteamPath: 'INS > Benefit Setup > [Plan 1] > Pricing Tab > Employee premium field',
      severity: 'critical',
      isGate: true,
      order: 5,
    },
    {
      key: 'rollforward_eligibility_wizard',
      phase: 2,
      section: `Roll Forward — Run ${taxYear} Eligibility Wizard`,
      label: `Run WinTeam Eligibility Testing Wizard for ${taxYear}`,
      detail: `In INS > Eligibility Testing Wizard, run the wizard for tax year ${taxYear}. This processes all employees through your eligibility rules and determines who must be offered coverage for ${taxYear}. Review the output for any unexpected results.`,
      winteamPath: `INS > Eligibility Testing Wizard > run for ${taxYear}`,
      severity: 'critical',
      isGate: true,
      order: 6,
    },
    {
      key: 'rollforward_benefit_packages',
      phase: 2,
      section: `Roll Forward — Run ${taxYear} Eligibility Wizard`,
      label: `Assign ${taxYear} benefit packages to all eligible employees`,
      detail: `After running the Eligibility Wizard, assign the ${taxYear} benefit package to all employees identified as eligible. Each package must include all three plans. Check INS > Benefits by Employee for each eligible employee.`,
      winteamPath: 'INS > Benefits by Employee > Package Tab > review package contents',
      severity: 'critical',
      isGate: true,
      order: 7,
    },
    {
      key: 'rollforward_stability_dates',
      phase: 2,
      section: `Roll Forward — Run ${taxYear} Eligibility Wizard`,
      label: `Verify Stability Start Dates reflect January 1, ${taxYear} for all year-round full-time employees`,
      detail: `For employees who were full-time all of ${taxYear - 1} and continue into ${taxYear}, their Stability Start Date should be January 1, ${taxYear}. Review INS > Benefits by Employee for year-round employees and confirm stability dates are correct.`,
      winteamPath: 'INS > Benefits by Employee > Package Tab > review package contents',
      severity: 'required',
      isGate: true,
      order: 8,
    },

    // ============================================================
    // PHASE 3 — Data Catch-Up (15 items)
    // ============================================================

    {
      key: 'data_all_ft_employees',
      phase: 3,
      section: `${taxYear} Data — Employee Records`,
      label: `All full-time ${taxYear} employees are in WinTeam (including terminations)`,
      detail: `Every employee who was full-time at any point during ${taxYear} must have a record in WinTeam — even if they have been terminated. Run a headcount reconciliation against payroll records to confirm no one is missing.`,
      winteamPath: null,
      severity: 'critical',
      isGate: false,
      order: 1,
    },
    {
      key: 'data_valid_ssn',
      phase: 3,
      section: `${taxYear} Data — Employee Records`,
      label: `All employees have a valid SSN on file`,
      detail: `Every employee who will receive a 1095-C must have a valid 9-digit SSN on file. Use the Employee Tracker in this app to identify employees with missing SSNs and collect them before filing.`,
      winteamPath: null,
      severity: 'critical',
      isGate: false,
      order: 2,
    },
    {
      key: 'data_dob',
      phase: 3,
      section: `${taxYear} Data — Employee Records`,
      label: `All employees have a date of birth on file`,
      detail: `Date of birth is required for all employees on self-insured plans (Plan 1 and Plan 2) for Part III. Review the Employee Tracker and collect any missing DOBs.`,
      winteamPath: null,
      severity: 'required',
      isGate: false,
      order: 3,
    },
    {
      key: 'data_plan1_enrollments',
      phase: 3,
      section: `${taxYear} Data — Enrollment Entry`,
      label: `All Plan 1 enrollments entered in INS: Benefits by Employee`,
      detail: `For every employee enrolled in Plan 1 (MEC) during ${taxYear}, verify their enrollment is entered in INS > Benefits by Employee with the correct coverage start and end dates.`,
      winteamPath: null,
      severity: 'critical',
      isGate: false,
      order: 4,
    },
    {
      key: 'data_plan2_enrollments',
      phase: 3,
      section: `${taxYear} Data — Enrollment Entry`,
      label: `All Plan 2 enrollments entered + Covered Individuals tab completed`,
      detail: `For every Plan 2 (Self-Insured) enrollee, verify enrollment dates AND that the Covered Individuals tab lists all covered dependents with names, SSNs/DOBs, and coverage months. The Covered Individuals tab is required for Part III of the 1095-C.`,
      winteamPath: null,
      severity: 'critical',
      isGate: false,
      order: 5,
    },
    {
      key: 'data_plan3_enrollments',
      phase: 3,
      section: `${taxYear} Data — Enrollment Entry`,
      label: `All Plan 3 enrollments entered in INS: Benefits by Employee`,
      detail: `For every employee enrolled in Plan 3 (Select Health) during ${taxYear}, verify their enrollment is entered with correct coverage dates.`,
      winteamPath: null,
      severity: 'required',
      isGate: false,
      order: 6,
    },
    {
      key: 'data_declined_packages',
      phase: 3,
      section: `${taxYear} Data — Enrollment Entry`,
      label: `All employees who declined coverage have a benefit package showing the offer was made`,
      detail: `Employees who were offered but declined coverage still need a benefit package assigned in WinTeam so the offer is documented. Without a package showing the offer, WinTeam cannot generate the correct Line 14 code showing the offer was made.`,
      winteamPath: 'INS > Benefits by Employee > Package Tab > review package contents',
      severity: 'critical',
      isGate: false,
      order: 7,
    },
    {
      key: 'data_spouse_ssn',
      phase: 3,
      section: `${taxYear} Data — Dependent Data`,
      label: `All spouse SSNs collected and entered for Plan 1 and Plan 2 enrollees`,
      detail: `For employees enrolled in Plan 1 or Plan 2 whose spouse was covered, the spouse's SSN must be in WinTeam. Collect W-9s from spouses if necessary. Missing spouse SSNs will trigger an IRS error on Part III.`,
      winteamPath: null,
      severity: 'critical',
      isGate: false,
      order: 8,
    },
    {
      key: 'data_dependent_dob',
      phase: 3,
      section: `${taxYear} Data — Dependent Data`,
      label: `All minor dependent dates of birth entered`,
      detail: `For dependent children covered under Plan 1 or Plan 2, verify dates of birth are entered in the Covered Individuals tab. DOB is used in lieu of SSN for dependents under age 19, but both must be on file.`,
      winteamPath: null,
      severity: 'required',
      isGate: false,
      order: 9,
    },
    {
      key: 'data_adult_ssn',
      phase: 3,
      section: `${taxYear} Data — Dependent Data`,
      label: `All adult dependent SSNs entered`,
      detail: `Adult dependents (age 19+) covered under Plan 1 or Plan 2 must have their SSN entered in the Covered Individuals tab. Collect any missing SSNs before the filing deadline.`,
      winteamPath: null,
      severity: 'required',
      isGate: false,
      order: 10,
    },
    {
      key: 'data_coverage_months',
      phase: 3,
      section: `${taxYear} Data — Coverage Accuracy`,
      label: `Coverage months are correct for mid-year additions and removals`,
      detail: `For employees or dependents who were added or removed mid-year, verify the covered months in the Covered Individuals tab match actual coverage. Check new hires, terminations, and life event changes.`,
      winteamPath: null,
      severity: 'critical',
      isGate: false,
      order: 11,
    },
    {
      key: 'data_variable_hour',
      phase: 3,
      section: `${taxYear} Data — Coverage Accuracy`,
      label: `Variable-hour employees who became full-time in ${taxYear} have been verified and offered coverage`,
      detail: `Review variable-hour employees who crossed the full-time threshold during ${taxYear} measurement periods. Confirm they were offered coverage during their stability period and that the offer/enrollment is recorded correctly.`,
      winteamPath: null,
      severity: 'required',
      isGate: false,
      order: 12,
    },
    {
      key: 'data_terminations',
      phase: 3,
      section: `${taxYear} Data — Coverage Accuracy`,
      label: `All ${taxYear} terminations have correct termination dates`,
      detail: `Review all employees terminated during ${taxYear}. Confirm termination dates in WinTeam match HR records. Coverage end dates must align with termination dates for accurate monthly coverage reporting on the 1095-C.`,
      winteamPath: null,
      severity: 'required',
      isGate: false,
      order: 13,
    },
    {
      key: 'data_new_hires',
      phase: 3,
      section: `${taxYear} Data — Coverage Accuracy`,
      label: `New hires who completed the 90-day waiting period have coverage entered`,
      detail: `Review all ${taxYear} new hires. For those who completed the 90-day waiting period and became eligible, verify their coverage enrollment is entered in WinTeam starting from the correct date after the waiting period ended.`,
      winteamPath: null,
      severity: 'required',
      isGate: false,
      order: 14,
    },
    {
      key: 'data_tracker_ready',
      phase: 3,
      section: `${taxYear} Data — Final Review`,
      label: `Employee Tracker in this app shows all employees as Ready`,
      detail: `Open the Employee Tracker and verify every employee who will receive a 1095-C shows "Ready" status with no open issues. Use the Filing Employees page to review each employee's ${taxYear} readiness flags. Address all issues before advancing.`,
      winteamPath: null,
      severity: 'critical',
      isGate: true,
      order: 15,
    },

    // ============================================================
    // PHASE 4 — Generate, Verify, and File (13 items)
    // ============================================================

    {
      key: 'file_preview_all',
      phase: 4,
      section: 'Generate — Run Preview Report',
      label: `Run ${taxYear} preview report in WinTeam for ALL employees`,
      detail: `In INS > Employee 1095-C Report, set Tax Year to ${taxYear} and Output Type to "1095-C Forms (preview)". Run for all employees. This generates the full set of draft forms for review before electronic filing.`,
      winteamPath: `INS > Employee 1095-C Report > Tax Year ${taxYear} > Output Type: 1095-C Forms (preview)`,
      severity: 'critical',
      isGate: true,
      order: 1,
    },
    {
      key: 'file_spot_plan1',
      phase: 4,
      section: 'Verify — Spot-Check Forms',
      label: `Spot-check 3 Plan 1 employees: Line 14=1E, Part III populated, Line 16=2C`,
      detail: `Select 3 employees enrolled in Plan 1 (MEC) and verify: Line 14 = 1E (MV coverage offered), Part III is populated with employee and dependents, Line 16 = 2C (enrolled in coverage). Flag any discrepancies.`,
      winteamPath: `INS > Employee 1095-C Report > Tax Year ${taxYear} > Output Type: 1095-C Forms (preview)`,
      severity: 'critical',
      isGate: true,
      order: 2,
    },
    {
      key: 'file_spot_plan2',
      phase: 4,
      section: 'Verify — Spot-Check Forms',
      label: `Spot-check 3 Plan 2 employees: Line 14=1E, Part III with dependents listed`,
      detail: `Select 3 employees enrolled in Plan 2 (Self-Insured) and verify: Line 14 = 1E, Part III lists the employee and all covered dependents with SSNs and coverage months.`,
      winteamPath: `INS > Employee 1095-C Report > Tax Year ${taxYear} > Output Type: 1095-C Forms (preview)`,
      severity: 'critical',
      isGate: true,
      order: 3,
    },
    {
      key: 'file_spot_plan3',
      phase: 4,
      section: 'Verify — Spot-Check Forms',
      label: `Spot-check 3 Plan 3 employees: Line 14=1E, Part III is blank`,
      detail: `Select 3 employees enrolled in Plan 3 (Select Health) and verify: Line 14 = 1E, Part III is completely blank (Plan 3 is fully-insured, no Part III required).`,
      winteamPath: `INS > Employee 1095-C Report > Tax Year ${taxYear} > Output Type: 1095-C Forms (preview)`,
      severity: 'critical',
      isGate: true,
      order: 4,
    },
    {
      key: 'file_spot_declined',
      phase: 4,
      section: 'Verify — Spot-Check Forms',
      label: `Spot-check 3 employees who declined coverage: Line 14=1E, Line 16 has safe harbor code`,
      detail: `Select 3 employees who were offered but declined coverage. Verify: Line 14 = 1E (offer was made), Line 16 shows the applicable safe harbor code (2F, 2G, or 2H depending on the safe harbor method used).`,
      winteamPath: `INS > Employee 1095-C Report > Tax Year ${taxYear} > Output Type: 1095-C Forms (preview)`,
      severity: 'critical',
      isGate: true,
      order: 5,
    },
    {
      key: 'file_line15_consistent',
      phase: 4,
      section: 'Verify — Spot-Check Forms',
      label: `Line 15 shows the same dollar amount on every enrolled employee's form`,
      detail: `Scan the preview report and confirm Line 15 is identical on every form for enrolled employees. Any variation indicates an employee has a different Plan 1 premium entered — investigate and correct before generating the electronic file.`,
      winteamPath: `INS > Employee 1095-C Report > Tax Year ${taxYear} > Output Type: 1095-C Forms (preview)`,
      severity: 'critical',
      isGate: true,
      order: 6,
    },
    {
      key: 'file_count_matches',
      phase: 4,
      section: 'Verify — Spot-Check Forms',
      label: `Total form count matches expected full-time headcount`,
      detail: `Count the total number of 1095-C forms generated and compare to your expected full-time headcount for ${taxYear}. A mismatch means an employee is missing or an ineligible part-time employee was included.`,
      winteamPath: `INS > Employee 1095-C Report > Tax Year ${taxYear} > Output Type: 1095-C Forms (preview)`,
      severity: 'critical',
      isGate: true,
      order: 7,
    },
    {
      key: 'file_fix_rerun',
      phase: 4,
      section: 'Verify — Spot-Check Forms',
      label: `All discrepancies fixed and preview report rerun until clean`,
      detail: `Fix any issues found in spot-checks (wrong Line 14 codes, missing Part III data, incorrect Line 15 amounts, wrong form count) in WinTeam, then rerun the preview report. Repeat until the preview report is completely clean.`,
      winteamPath: `INS > Employee 1095-C Report > Tax Year ${taxYear} > Output Type: 1095-C Forms (preview)`,
      severity: 'critical',
      isGate: true,
      order: 8,
    },
    {
      key: 'file_generate_1095c',
      phase: 4,
      section: 'File — Generate and Submit',
      label: `Generate ${taxYear} 1095-C electronic file in WinTeam`,
      detail: `In INS > Employee 1095-C Report, change Output Type to "1095-C Electronic File" and generate the file. Save the output file securely — this is the file you will submit to the IRS.`,
      winteamPath: 'INS > Employee 1095-C Report > Output Type: 1095-C Electronic File',
      severity: 'critical',
      isGate: true,
      order: 9,
    },
    {
      key: 'file_generate_1094c',
      phase: 4,
      section: 'File — Generate and Submit',
      label: `Generate ${taxYear} 1094-C transmittal file`,
      detail: `Generate the 1094-C transmittal in WinTeam. The 1094-C is the cover sheet for your 1095-C submission — it summarizes the total number of forms and your ALE status. File this together with the 1095-C electronic file.`,
      winteamPath: 'INS > Employee 1095-C Report > Output Type: 1095-C Electronic File',
      severity: 'critical',
      isGate: true,
      order: 10,
    },
    {
      key: 'file_submit',
      phase: 4,
      section: 'File — Generate and Submit',
      label: `Submit 1094-C and 1095-C through WinTeam FIRE integration or TEAM Software e-file service`,
      detail: `Submit the electronic files to the IRS before the filing deadline. You can use WinTeam's built-in FIRE integration or TEAM Software's e-file service. Keep a record of your submission confirmation number.`,
      winteamPath: null,
      severity: 'critical',
      isGate: true,
      order: 11,
    },
    {
      key: 'file_acknowledgement',
      phase: 4,
      section: 'File — Post-Filing',
      label: `Retrieve and save IRS acknowledgement from FIRE system`,
      detail: `After submission, log back into the IRS FIRE system and download your acknowledgement file. The acknowledgement will show whether your submission was "Accepted," "Accepted with Errors," or "Rejected." Address any errors immediately.`,
      winteamPath: null,
      severity: 'critical',
      isGate: true,
      order: 12,
    },
    {
      key: 'file_save_copies',
      phase: 4,
      section: 'File — Post-Filing',
      label: `Save copies of all 1095-C forms, 1094-C, electronic file, and IRS acknowledgement`,
      detail: `Archive the following in your secure HR records: (1) PDF copies of all employee 1095-C forms, (2) the 1094-C transmittal, (3) the electronic submission file, and (4) the IRS acknowledgement. The IRS recommends retaining ACA records for at least 3 years.`,
      winteamPath: null,
      severity: 'required',
      isGate: true,
      order: 13,
    },
  ]

  return items.map((item) => ({
    ...item,
    walkthrough: WALKTHROUGHS[item.key],
    access_required: ACCESS_REQUIREMENTS[item.key] ?? {
      winteam_role: 'hr_manager' as WinTeamRole,
      modules: [],
      can_delegate: true,
    },
  }))
}

// Helper to get all items for a specific phase
export function getPhaseChecklist(taxYear: number, phase: 1 | 2 | 3 | 4): FilingChecklistItem[] {
  return getFilingChecklist(taxYear).filter((item) => item.phase === phase)
}

// Helper to get all gate items for a phase
export function getGateItems(taxYear: number, phase: 1 | 2 | 3 | 4): FilingChecklistItem[] {
  return getPhaseChecklist(taxYear, phase).filter((item) => item.isGate)
}

// Phase metadata
export const PHASE_METADATA = {
  1: { estimatedTime: '2–4 hours', description: 'Verify WinTeam is correctly configured for the prior year before rolling forward.' },
  2: { estimatedTime: '2–6 hours', description: 'Fix issues found in Phase 1 and update WinTeam for the current tax year.' },
  3: { estimatedTime: '1–3 days', description: 'Enter all employee enrollment data, dependents, and coverage months for the current year.' },
  4: { estimatedTime: '3–5 hours', description: 'Generate, verify, and electronically file 1094-C and 1095-C forms with the IRS.' },
} as const
