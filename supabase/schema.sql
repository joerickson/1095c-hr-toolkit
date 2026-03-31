-- 1095-C HR Toolkit — Supabase Schema
-- Run this entire file in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- Table: profiles
-- Linked to Supabase auth.users. One row per HR user.
-- ============================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  role text default 'hr_user' check (role in ('admin', 'hr_user')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- ============================================================
-- Table: app_settings
-- Company-wide ACA settings. Only admins can update.
-- ============================================================
create table app_settings (
  id uuid default uuid_generate_v4() primary key,
  tax_year integer default 2025,
  company_name text default 'ABC Janitorial Services LLC',
  company_ein text default '87-1234567',
  contact_phone text default '(801) 555-0100',
  plan_start_month text default '01',
  mec_monthly_premium numeric(8,2) default 145.00,
  safe_harbor_method text default 'rate_of_pay'
    check (safe_harbor_method in ('rate_of_pay', 'w2', 'fpl')),
  affordability_threshold numeric(5,4) default 0.0902,
  fpl_monthly_threshold numeric(8,2) default 105.29,
  updated_at timestamptz default now(),
  updated_by uuid references profiles(id)
);

alter table app_settings enable row level security;

create policy "All authenticated users can view settings"
  on app_settings for select using (auth.role() = 'authenticated');

create policy "Only admins can update settings"
  on app_settings for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Insert default settings row
insert into app_settings default values;

-- ============================================================
-- Table: employees
-- One row per employee being tracked for 1095-C purposes.
-- ============================================================
create table employees (
  id uuid default uuid_generate_v4() primary key,
  last_name text not null,
  first_name text not null,
  middle_initial text,
  ssn_last_four text,
  ssn_on_file boolean default false,
  dob date,
  dob_on_file boolean default false,
  address_line1 text,
  city text,
  state text,
  zip text,
  employment_status text default 'active'
    check (employment_status in ('active', 'terminated', 'leave_of_absence')),
  employee_type text default 'full_time'
    check (employee_type in ('full_time', 'part_time', 'variable', 'seasonal')),
  hourly_rate numeric(8,2),
  hire_date date,
  termination_date date,
  plan_enrolled text
    check (plan_enrolled in ('P1', 'P2', 'P3', 'declined', null)),
  stability_start_date date,
  notes text,
  created_at timestamptz default now(),
  created_by uuid references profiles(id),
  updated_at timestamptz default now(),
  updated_by uuid references profiles(id)
);

alter table employees enable row level security;

create policy "Authenticated users can view all employees"
  on employees for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert employees"
  on employees for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update employees"
  on employees for update using (auth.role() = 'authenticated');

create policy "Only admins can delete employees"
  on employees for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- Table: employee_dependents
-- Covered individuals for Part III (Plan 1 and Plan 2 only).
-- ============================================================
create table employee_dependents (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references employees(id) on delete cascade,
  full_name text not null,
  relationship text not null
    check (relationship in ('spouse', 'dependent_minor', 'dependent_adult')),
  ssn_on_file boolean default false,
  dob date,
  covered_all_12_months boolean default true,
  months_covered integer[] default array[1,2,3,4,5,6,7,8,9,10,11,12],
  created_at timestamptz default now()
);

alter table employee_dependents enable row level security;

create policy "Authenticated users can manage dependents"
  on employee_dependents for all using (auth.role() = 'authenticated');

-- ============================================================
-- Table: audit_checklist_progress
-- Persists checklist checkbox state per user.
-- ============================================================
create table audit_checklist_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  tax_year integer default 2025,
  checklist_item_key text not null,
  is_complete boolean default false,
  completed_at timestamptz,
  notes text,
  unique(user_id, tax_year, checklist_item_key)
);

alter table audit_checklist_progress enable row level security;

create policy "Users can manage their own checklist progress"
  on audit_checklist_progress for all using (auth.uid() = user_id);

-- ============================================================
-- Table: wizard_sessions
-- Stores wizard lookup history.
-- ============================================================
create table wizard_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  tax_year integer default 2025,
  employee_id uuid references employees(id) on delete set null,
  answers jsonb not null,
  result_line14 text,
  result_line15 numeric(8,2),
  result_line16 text,
  part3_required boolean,
  created_at timestamptz default now()
);

alter table wizard_sessions enable row level security;

create policy "Users can view their own wizard sessions"
  on wizard_sessions for all using (auth.uid() = user_id);

-- ============================================================
-- Helper view: employee_1095c_status
-- Used by Employee Tracker to surface compliance issues.
-- ============================================================
create or replace view employee_1095c_status as
select
  e.id,
  e.last_name || ', ' || e.first_name as full_name,
  e.first_name,
  e.last_name,
  e.plan_enrolled,
  e.employment_status,
  e.employee_type,
  e.hourly_rate,
  e.ssn_on_file,
  e.dob_on_file,
  e.stability_start_date,
  e.hire_date,
  e.termination_date,
  e.notes,
  e.created_at,
  e.updated_at,
  -- Derive Line 14 code
  case
    when e.employment_status = 'active' and e.stability_start_date is not null
      then '1E'
    else '1H'
  end as line14_code,
  -- Derive Line 16 code
  case
    when e.plan_enrolled in ('P1', 'P2', 'P3') then '2C'
    when e.plan_enrolled = 'declined' then '2H'
    else '2A'
  end as line16_code,
  -- Part III required flag
  case
    when e.plan_enrolled in ('P1', 'P2') then true
    else false
  end as part3_required,
  -- Count of dependents on file
  (
    select count(*) from employee_dependents d where d.employee_id = e.id
  ) as dependent_count,
  -- Issue flags
  not e.ssn_on_file as issue_missing_ssn,
  not e.dob_on_file as issue_missing_dob,
  e.stability_start_date is null as issue_missing_stability_date,
  (
    e.plan_enrolled in ('P1', 'P2') and
    not exists (select 1 from employee_dependents d where d.employee_id = e.id)
    and e.plan_enrolled != 'declined'
  ) as issue_no_dependents_entered,
  -- Overall readiness
  (
    e.ssn_on_file and
    e.dob_on_file and
    e.stability_start_date is not null and
    not (
      e.plan_enrolled in ('P1', 'P2') and
      not exists (select 1 from employee_dependents d where d.employee_id = e.id)
    )
  ) as is_ready
from employees e;

-- ============================================================
-- Trigger: auto-update updated_at timestamps
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger employees_updated_at
  before update on employees
  for each row execute function update_updated_at();

create trigger app_settings_updated_at
  before update on app_settings
  for each row execute function update_updated_at();

-- ============================================================
-- Auth trigger: create profile on user signup
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
