-- 1095-C HR Toolkit — Eligibility Monitoring Module
-- Run this file in the Supabase SQL Editor AFTER running schema.sql

-- ============================================================
-- Table: measurement_periods
-- Tracks each employee's measurement, admin, and stability period dates.
-- ============================================================
create table if not exists measurement_periods (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references employees(id) on delete cascade,
  period_type text not null
    check (period_type in ('standard', 'initial')),
  -- Measurement window
  measurement_start date not null,
  measurement_end date not null,
  -- Admin window
  admin_start date,
  admin_end date,
  -- Stability window
  stability_start date,
  stability_end date,
  -- Results
  status text default 'in_progress'
    check (status in ('in_progress', 'complete', 'pending_offer', 'offer_sent', 'enrolled', 'declined', 'not_full_time')),
  total_hours_worked numeric(8,2) default 0,
  avg_hours_per_week numeric(6,2),
  avg_hours_per_month numeric(8,2),
  is_full_time_result boolean,
  -- Offer tracking
  offer_sent_date date,
  offer_response text check (offer_response in ('accepted', 'declined', 'no_response', null)),
  offer_response_date date,
  plan_selected text check (plan_selected in ('P1', 'P2', 'P3', null)),
  coverage_start_date date,
  -- Meta
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by uuid references profiles(id)
);

alter table measurement_periods enable row level security;

create policy "Authenticated users can manage measurement periods"
  on measurement_periods for all using (auth.role() = 'authenticated');

create trigger measurement_periods_updated_at
  before update on measurement_periods
  for each row execute function update_updated_at();

-- ============================================================
-- Table: pay_period_hours
-- Stores actual hours worked per employee per pay period.
-- ============================================================
create table if not exists pay_period_hours (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references employees(id) on delete cascade,
  pay_period_start date not null,  -- always the 1st or 15th of the month
  pay_period_end date not null,    -- always the 14th or last day of month
  pay_period_number integer,       -- 1-24 for the tax year
  tax_year integer not null,
  hours_worked numeric(6,2) not null default 0,
  hours_type text default 'regular'
    check (hours_type in ('regular', 'overtime', 'pto', 'sick', 'holiday', 'other')),
  -- For ACA: ALL hours count — regular, overtime, PTO, sick, holiday, FMLA
  aca_countable_hours numeric(6,2),
  -- Running totals (updated by trigger or app logic)
  ytd_hours numeric(8,2),
  rolling_12month_hours numeric(8,2),
  rolling_avg_hours_per_week numeric(6,2),
  data_source text default 'manual'
    check (data_source in ('manual', 'csv_import', 'api')),
  imported_at timestamptz,
  created_at timestamptz default now(),
  created_by uuid references profiles(id),
  unique(employee_id, pay_period_start, hours_type)
);

alter table pay_period_hours enable row level security;

create policy "Authenticated users can manage pay period hours"
  on pay_period_hours for all using (auth.role() = 'authenticated');

-- ============================================================
-- Table: eligibility_events
-- Immutable audit log of every eligibility-related action.
-- ============================================================
create table if not exists eligibility_events (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references employees(id) on delete cascade,
  measurement_period_id uuid references measurement_periods(id) on delete set null,
  event_type text not null check (event_type in (
    'measurement_started',
    'measurement_completed',
    'full_time_determination',
    'part_time_determination',
    'waiting_period_started',
    'waiting_period_completed',
    'offer_generated',
    'offer_sent',
    'offer_accepted',
    'offer_declined',
    'offer_no_response',
    'coverage_started',
    'coverage_ended',
    'stability_period_started',
    'stability_period_ended',
    'hours_threshold_warning',
    'hours_threshold_crossed',
    'manual_override',
    'note_added'
  )),
  event_date date not null default current_date,
  description text,
  triggered_by text check (triggered_by in ('system', 'hr_user', 'import')),
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  -- Snapshot of key values at time of event for audit trail
  snapshot jsonb
);

alter table eligibility_events enable row level security;

-- Eligibility events are append-only — no updates or deletes allowed
create policy "Authenticated users can insert eligibility events"
  on eligibility_events for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can view eligibility events"
  on eligibility_events for select using (auth.role() = 'authenticated');

-- ============================================================
-- Table: pay_period_checklist
-- HR checklist items per pay period (1st and 15th).
-- ============================================================
create table if not exists pay_period_checklist (
  id uuid default uuid_generate_v4() primary key,
  pay_period_start date not null,
  tax_year integer not null,
  checklist_item_key text not null,
  is_complete boolean default false,
  completed_by uuid references profiles(id),
  completed_at timestamptz,
  notes text,
  auto_context text,
  unique(pay_period_start, checklist_item_key)
);

alter table pay_period_checklist enable row level security;

create policy "Authenticated users can manage pay period checklist"
  on pay_period_checklist for all using (auth.role() = 'authenticated');

-- ============================================================
-- Table: offer_letters
-- Tracks the formal benefit offer for each newly eligible employee.
-- ============================================================
create table if not exists offer_letters (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references employees(id) on delete cascade,
  measurement_period_id uuid references measurement_periods(id),
  -- Offer details
  offer_date date not null,
  offer_deadline date not null,
  coverage_start_date date not null,
  -- Plans offered (always all three for this employer)
  plans_offered text[] default array['P1', 'P2', 'P3'],
  -- Response
  response text check (response in ('accepted', 'declined', 'no_response')),
  response_date date,
  plan_selected text check (plan_selected in ('P1', 'P2', 'P3', null)),
  -- Waiver on file (required if declined)
  waiver_on_file boolean default false,
  waiver_date date,
  -- Status
  status text default 'pending'
    check (status in ('pending', 'sent', 'accepted', 'declined', 'expired')),
  notes text,
  created_at timestamptz default now(),
  created_by uuid references profiles(id)
);

alter table offer_letters enable row level security;

create policy "Authenticated users can manage offer letters"
  on offer_letters for all using (auth.role() = 'authenticated');

-- ============================================================
-- Helper view: eligibility_dashboard
-- Real-time view of every employee's current eligibility status.
-- ============================================================
create or replace view eligibility_dashboard as
select
  e.id as employee_id,
  e.last_name || ', ' || e.first_name as full_name,
  e.employee_type,
  e.hire_date,
  e.hourly_rate,
  e.employment_status,
  e.plan_enrolled,
  -- Current measurement period (most recent by measurement_end)
  mp.id as current_measurement_period_id,
  mp.period_type,
  mp.measurement_start,
  mp.measurement_end,
  mp.admin_start,
  mp.admin_end,
  mp.stability_start,
  mp.stability_end,
  mp.status as measurement_status,
  mp.total_hours_worked,
  mp.avg_hours_per_week,
  mp.avg_hours_per_month,
  mp.is_full_time_result,
  -- Days remaining in current measurement period
  case
    when mp.measurement_end >= current_date
    then (mp.measurement_end - current_date)
    else 0
  end as days_remaining_in_measurement,
  -- Is currently in stability period
  (
    mp.stability_start <= current_date and
    mp.stability_end >= current_date
  ) as in_stability_period,
  -- Offer status
  ol.id as offer_letter_id,
  ol.status as offer_status,
  ol.offer_date,
  ol.offer_deadline,
  ol.coverage_start_date as offer_coverage_start_date,
  ol.response as offer_response,
  -- Warning flags
  (
    mp.avg_hours_per_week >= 25 and
    mp.avg_hours_per_week < 30 and
    mp.status = 'in_progress'
  ) as warning_approaching_threshold,
  (
    mp.avg_hours_per_week >= 30 and
    mp.status = 'in_progress'
  ) as warning_crossed_threshold,
  (
    mp.status = 'pending_offer' and
    ol.id is null
  ) as warning_offer_not_sent,
  (
    ol.status = 'pending' and
    ol.offer_deadline < current_date
  ) as warning_offer_expired,
  -- Admin period active
  (
    mp.admin_start is not null and
    mp.admin_start <= current_date and
    mp.admin_end >= current_date
  ) as in_admin_period,
  -- Days until coverage must start (if in admin period)
  case
    when mp.admin_start is not null and
         mp.admin_start <= current_date and
         mp.admin_end >= current_date and
         mp.stability_start is not null
    then (mp.stability_start - current_date)
    else null
  end as days_until_coverage_must_start
from employees e
left join measurement_periods mp on (
  mp.employee_id = e.id and
  mp.measurement_end = (
    select max(mp2.measurement_end)
    from measurement_periods mp2
    where mp2.employee_id = e.id
  )
)
left join offer_letters ol on (
  ol.employee_id = e.id and
  ol.measurement_period_id = mp.id
)
where e.employment_status != 'terminated';
