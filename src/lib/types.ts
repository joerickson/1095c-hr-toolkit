export type UserRole = "admin" | "hr_user";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
}

export interface AppSettings {
  id: string;
  tax_year: number;
  company_name: string;
  company_ein: string;
  contact_phone: string;
  plan_start_month: string;
  mec_monthly_premium: number;
  safe_harbor_method: "rate_of_pay" | "w2" | "fpl";
  affordability_threshold: number;
  fpl_monthly_threshold: number;
  updated_at: string;
  updated_by: string | null;
}

export type EmploymentStatus = "active" | "terminated" | "leave_of_absence";
export type EmployeeType = "full_time" | "part_time" | "variable" | "seasonal";
export type PlanEnrolled = "P1" | "P2" | "P3" | "declined" | null;

export interface Employee {
  id: string;
  last_name: string;
  first_name: string;
  middle_initial: string | null;
  ssn_last_four: string | null;
  ssn_on_file: boolean;
  dob: string | null;
  dob_on_file: boolean;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  employment_status: EmploymentStatus;
  employee_type: EmployeeType;
  hourly_rate: number | null;
  hire_date: string | null;
  termination_date: string | null;
  plan_enrolled: PlanEnrolled;
  stability_start_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeStatus extends Employee {
  full_name: string;
  line14_code: string;
  line16_code: string;
  part3_required: boolean;
  dependent_count: number;
  issue_missing_ssn: boolean;
  issue_missing_dob: boolean;
  issue_missing_stability_date: boolean;
  issue_no_dependents_entered: boolean;
  is_ready: boolean;
}

export type DependentRelationship =
  | "spouse"
  | "dependent_minor"
  | "dependent_adult";

export interface EmployeeDependent {
  id: string;
  employee_id: string;
  full_name: string;
  relationship: DependentRelationship;
  ssn_on_file: boolean;
  dob: string | null;
  covered_all_12_months: boolean;
  months_covered: number[];
  created_at: string;
}

export interface ChecklistProgress {
  id: string;
  user_id: string;
  tax_year: number;
  checklist_item_key: string;
  is_complete: boolean;
  completed_at: string | null;
  notes: string | null;
}

export type ChecklistSeverity = "critical" | "required" | "deadline";

export interface ChecklistItem {
  key: string;
  label: string;
  severity: ChecklistSeverity;
  section: string;
}

export type WizardOffered = "yes" | "waiting_period" | "no";
export type WizardWho =
  | "employee_only"
  | "employee_dependents"
  | "employee_spouse"
  | "all";

export interface WizardAnswers {
  fullTime: boolean;
  offered: WizardOffered;
  who: WizardWho;
  enrolled: "yes" | "no";
}

export interface WizardResult {
  line14: string;
  line14Description: string;
  line15: number;
  line16: string;
  line16Description: string;
  part3Required: boolean;
  warnings: string[];
}

export interface WizardSession {
  id: string;
  user_id: string;
  tax_year: number;
  employee_id: string | null;
  answers: WizardAnswers;
  result_line14: string | null;
  result_line15: number | null;
  result_line16: string | null;
  part3_required: boolean | null;
  created_at: string;
}
