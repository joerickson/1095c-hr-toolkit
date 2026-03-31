export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  description: string;
  sort_order: number;
}

export interface UserChecklistState {
  id: string;
  user_id: string;
  item_id: string;
  is_checked: boolean;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  ssn_last4: string;
  department: string;
  hire_date: string;
  termination_date: string | null;
  is_full_time: boolean;
  line14_code: string;
  line15_amount: number | null;
  line16_code: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Line14Code {
  code: string;
  name: string;
  description: string;
  tip: string;
  retired?: boolean;
}

export interface Line16Code {
  code: string;
  name: string;
  description: string;
  tip: string;
}
