-- Run this in the Supabase SQL editor to enable the shared HR task progress counter.
-- Creates the hr_task_progress table with RLS allowing all authenticated users to read/write.

create table if not exists hr_task_progress (
  task_key text primary key,
  count integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table hr_task_progress enable row level security;

-- Allow all authenticated users to read
create policy "Authenticated users can read hr_task_progress"
  on hr_task_progress for select
  to authenticated
  using (true);

-- Allow all authenticated users to insert/update
create policy "Authenticated users can upsert hr_task_progress"
  on hr_task_progress for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update hr_task_progress"
  on hr_task_progress for update
  to authenticated
  using (true);
