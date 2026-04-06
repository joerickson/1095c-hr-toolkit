-- ============================================================
-- Filing Assistant Module
-- Run this file in the Supabase SQL editor AFTER schema.sql
-- ============================================================

-- Add extension_filed field to app_settings if not already present
alter table app_settings
  add column if not exists extension_filed boolean default false;

-- ============================================================
-- Table: filing_phases
-- ============================================================
create table if not exists filing_phases (
  id uuid default uuid_generate_v4() primary key,
  tax_year integer not null default 2025,
  phase_number integer not null check (phase_number in (1, 2, 3, 4)),
  phase_name text not null,
  status text default 'locked'
    check (status in ('locked', 'in_progress', 'complete', 'blocked')),
  started_at timestamptz,
  completed_at timestamptz,
  started_by uuid references profiles(id),
  completed_by uuid references profiles(id),
  notes text,
  unique(tax_year, phase_number)
);

alter table filing_phases enable row level security;

create policy "Authenticated users can manage filing phases"
  on filing_phases for all using (auth.role() = 'authenticated');

-- Seed phases for 2025 (upsert so safe to run multiple times)
insert into filing_phases (tax_year, phase_number, phase_name, status) values
  (2025, 1, 'Audit 2024 WinTeam Setup', 'in_progress'),
  (2025, 2, 'Fix Issues and Roll Forward to 2025', 'locked'),
  (2025, 3, '2025 Data Catch-Up', 'locked'),
  (2025, 4, 'Generate, Verify, and File', 'locked')
on conflict (tax_year, phase_number) do nothing;

-- ============================================================
-- Table: filing_checklist_progress
-- ============================================================
create table if not exists filing_checklist_progress (
  id uuid default uuid_generate_v4() primary key,
  tax_year integer not null default 2025,
  item_key text not null,
  is_complete boolean default false,
  completed_by uuid references profiles(id),
  completed_at timestamptz,
  finding text,
  action_taken text,
  unique(tax_year, item_key)
);

alter table filing_checklist_progress enable row level security;

create policy "Authenticated users can manage filing progress"
  on filing_checklist_progress for all using (auth.role() = 'authenticated');

-- ============================================================
-- Table: filing_issues
-- ============================================================
create table if not exists filing_issues (
  id uuid default uuid_generate_v4() primary key,
  tax_year integer not null default 2025,
  phase_found integer not null,
  category text not null check (category in (
    'benefit_setup','eligibility_setup','company_setup',
    'employee_data','dependent_data','benefit_assignment',
    'hours_data','measurement_period','other'
  )),
  severity text not null check (severity in ('blocking','warning','informational')),
  title text not null,
  description text,
  winteam_fix_path text,
  fix_instructions text,
  affected_count integer default 0,
  status text default 'open'
    check (status in ('open','in_progress','resolved','wont_fix')),
  resolved_at timestamptz,
  resolved_by uuid references profiles(id),
  resolution_notes text,
  created_at timestamptz default now(),
  created_by uuid references profiles(id)
);

alter table filing_issues enable row level security;

create policy "Authenticated users can manage filing issues"
  on filing_issues for all using (auth.role() = 'authenticated');

-- ============================================================
-- Table: employee_filing_status
-- (year-agnostic version; replaces employee_2025_status)
-- ============================================================
create table if not exists employee_filing_status (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references employees(id) on delete cascade,
  tax_year integer not null default 2025,
  benefit_package_assigned boolean default false,
  stability_start_date_set boolean default false,
  plan_enrolled text check (plan_enrolled in ('P1','P2','P3','declined',null)),
  election_entered_winteam boolean default false,
  dependents_reviewed boolean default false,
  spouse_ssn_on_file boolean,
  all_dependent_info_complete boolean default false,
  was_full_time_all_year boolean,
  had_status_change boolean default false,
  status_change_description text,
  months_offered integer[] default array[1,2,3,4,5,6,7,8,9,10,11,12],
  months_enrolled integer[],
  expected_line14 text,
  expected_line15 numeric(8,2),
  expected_line16 text,
  part3_required boolean default false,
  is_ready boolean default false,
  blocking_issues text[],
  last_reviewed_at timestamptz,
  last_reviewed_by uuid references profiles(id),
  unique(employee_id, tax_year)
);

alter table employee_filing_status enable row level security;

create policy "Authenticated users can manage employee filing status"
  on employee_filing_status for all using (auth.role() = 'authenticated');
