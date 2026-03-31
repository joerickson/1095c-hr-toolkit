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

// ============================================================
// Eligibility Monitoring Module Types
// ============================================================

export type MeasurementPeriodStatus =
  | "in_progress"
  | "complete"
  | "pending_offer"
  | "offer_sent"
  | "enrolled"
  | "declined"
  | "not_full_time";

export type MeasurementPeriodType = "standard" | "initial";

export interface MeasurementPeriod {
  id: string;
  employee_id: string;
  period_type: MeasurementPeriodType;
  measurement_start: string;
  measurement_end: string;
  admin_start: string | null;
  admin_end: string | null;
  stability_start: string | null;
  stability_end: string | null;
  status: MeasurementPeriodStatus;
  total_hours_worked: number;
  avg_hours_per_week: number | null;
  avg_hours_per_month: number | null;
  is_full_time_result: boolean | null;
  offer_sent_date: string | null;
  offer_response: "accepted" | "declined" | "no_response" | null;
  offer_response_date: string | null;
  plan_selected: "P1" | "P2" | "P3" | null;
  coverage_start_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export type HoursType = "regular" | "overtime" | "pto" | "sick" | "holiday" | "other";
export type DataSource = "manual" | "csv_import" | "api";

export interface PayPeriodHours {
  id: string;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_period_number: number | null;
  tax_year: number;
  hours_worked: number;
  hours_type: HoursType;
  aca_countable_hours: number | null;
  ytd_hours: number | null;
  rolling_12month_hours: number | null;
  rolling_avg_hours_per_week: number | null;
  data_source: DataSource;
  imported_at: string | null;
  created_at: string;
  created_by: string | null;
}

export type EligibilityEventType =
  | "measurement_started"
  | "measurement_completed"
  | "full_time_determination"
  | "part_time_determination"
  | "waiting_period_started"
  | "waiting_period_completed"
  | "offer_generated"
  | "offer_sent"
  | "offer_accepted"
  | "offer_declined"
  | "offer_no_response"
  | "coverage_started"
  | "coverage_ended"
  | "stability_period_started"
  | "stability_period_ended"
  | "hours_threshold_warning"
  | "hours_threshold_crossed"
  | "manual_override"
  | "note_added";

export interface EligibilityEvent {
  id: string;
  employee_id: string;
  measurement_period_id: string | null;
  event_type: EligibilityEventType;
  event_date: string;
  description: string | null;
  triggered_by: "system" | "hr_user" | "import" | null;
  created_by: string | null;
  created_at: string;
  snapshot: Record<string, unknown> | null;
}

export interface PayPeriodChecklistRecord {
  id: string;
  pay_period_start: string;
  tax_year: number;
  checklist_item_key: string;
  is_complete: boolean;
  completed_by: string | null;
  completed_at: string | null;
  notes: string | null;
  auto_context: string | null;
}

export type OfferLetterStatus = "pending" | "sent" | "accepted" | "declined" | "expired";
export type OfferLetterResponse = "accepted" | "declined" | "no_response";

export interface OfferLetter {
  id: string;
  employee_id: string;
  measurement_period_id: string | null;
  offer_date: string;
  offer_deadline: string;
  coverage_start_date: string;
  plans_offered: string[];
  response: OfferLetterResponse | null;
  response_date: string | null;
  plan_selected: "P1" | "P2" | "P3" | null;
  waiver_on_file: boolean;
  waiver_date: string | null;
  status: OfferLetterStatus;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface EligibilityDashboardRow {
  employee_id: string;
  full_name: string;
  employee_type: EmployeeType;
  hire_date: string | null;
  hourly_rate: number | null;
  employment_status: EmploymentStatus;
  plan_enrolled: PlanEnrolled;
  current_measurement_period_id: string | null;
  period_type: MeasurementPeriodType | null;
  measurement_start: string | null;
  measurement_end: string | null;
  admin_start: string | null;
  admin_end: string | null;
  stability_start: string | null;
  stability_end: string | null;
  measurement_status: MeasurementPeriodStatus | null;
  total_hours_worked: number | null;
  avg_hours_per_week: number | null;
  avg_hours_per_month: number | null;
  is_full_time_result: boolean | null;
  days_remaining_in_measurement: number | null;
  in_stability_period: boolean | null;
  offer_letter_id: string | null;
  offer_status: OfferLetterStatus | null;
  offer_date: string | null;
  offer_deadline: string | null;
  offer_coverage_start_date: string | null;
  offer_response: OfferLetterResponse | null;
  warning_approaching_threshold: boolean | null;
  warning_crossed_threshold: boolean | null;
  warning_offer_not_sent: boolean | null;
  warning_offer_expired: boolean | null;
  in_admin_period: boolean | null;
  days_until_coverage_must_start: number | null;
}
