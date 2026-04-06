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
  tax_year integer not null default extract(year from current_date)::integer,
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

-- Seed initial phases for the current year (upsert so safe to run multiple times).
-- The app auto-seeds phases for any selected year via FilingClient.seedPhases(),
-- so this SQL seed is only needed for the very first run.
insert into filing_phases (tax_year, phase_number, phase_name, status)
select
  extract(year from current_date)::integer,
  phase_number,
  case phase_number
    when 1 then 'Audit ' || (extract(year from current_date)::integer - 1)::text || ' WinTeam Setup'
    when 2 then 'Fix Issues and Roll Forward to ' || extract(year from current_date)::text
    when 3 then extract(year from current_date)::text || ' Data Catch-Up'
    when 4 then 'Generate, Verify, and File'
  end,
  case phase_number when 1 then 'in_progress' else 'locked' end
from (values (1), (2), (3), (4)) as t(phase_number)
on conflict (tax_year, phase_number) do nothing;

-- ============================================================
-- Table: filing_checklist_progress
-- ============================================================
create table if not exists filing_checklist_progress (
  id uuid default uuid_generate_v4() primary key,
  tax_year integer not null default extract(year from current_date)::integer,
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
  tax_year integer not null default extract(year from current_date)::integer,
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
  tax_year integer not null default extract(year from current_date)::integer,
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

-- ============================================================
-- Storage: walkthrough-screenshots bucket
-- ============================================================

-- Create storage bucket for walkthrough screenshots
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'walkthrough-screenshots',
  'walkthrough-screenshots',
  false,
  5242880,  -- 5MB limit per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- RLS policies for the bucket
do $$ begin
  create policy "Authenticated users can upload screenshots"
    on storage.objects for insert
    with check (
      bucket_id = 'walkthrough-screenshots' and
      auth.role() = 'authenticated'
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Authenticated users can view screenshots"
    on storage.objects for select
    using (
      bucket_id = 'walkthrough-screenshots' and
      auth.role() = 'authenticated'
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can delete screenshots"
    on storage.objects for delete
    using (
      bucket_id = 'walkthrough-screenshots' and
      exists (
        select 1 from profiles
        where id = auth.uid() and role = 'admin'
      )
    );
exception when duplicate_object then null;
end $$;

-- ============================================================
-- Table: checklist_screenshots
-- ============================================================

create table if not exists checklist_screenshots (
  id uuid default uuid_generate_v4() primary key,
  tax_year integer not null,
  item_key text not null,
  storage_path text not null,
  -- path in the walkthrough-screenshots bucket
  -- format: {tax_year}/{item_key}/{uuid}.{ext}
  file_name text not null,
  file_size integer,
  mime_type text,
  caption text,
  -- optional caption the uploader adds e.g. "This is what it
  -- looks like when correctly configured"
  uploaded_by uuid references profiles(id),
  uploaded_at timestamptz default now(),
  display_order integer default 0
  -- allows multiple screenshots per item, ordered
);

alter table checklist_screenshots enable row level security;

do $$ begin
  create policy "Authenticated users can view screenshots metadata"
    on checklist_screenshots for select
    using (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Authenticated users can insert screenshot metadata"
    on checklist_screenshots for insert
    with check (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can delete screenshot metadata"
    on checklist_screenshots for delete
    using (
      exists (
        select 1 from profiles
        where id = auth.uid() and role = 'admin'
      )
    );
exception when duplicate_object then null;
end $$;
