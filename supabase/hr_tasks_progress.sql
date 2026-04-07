-- Migration: HR Task Progress (shared counter for all HR staff)
-- Run this in the Supabase SQL editor to enable the progress tracker on the HR Tasks page.

create table if not exists hr_task_progress (
  task_key text primary key,
  value integer not null default 0,
  updated_at timestamptz default now(),
  updated_by uuid references profiles(id)
);

alter table hr_task_progress enable row level security;

create policy "All authenticated users can view hr task progress"
  on hr_task_progress for select using (auth.role() = 'authenticated');

create policy "All authenticated users can upsert hr task progress"
  on hr_task_progress for insert with check (auth.role() = 'authenticated');

create policy "All authenticated users can update hr task progress"
  on hr_task_progress for update using (auth.role() = 'authenticated');

-- Seed initial row for benefit elections progress
insert into hr_task_progress (task_key, value) values ('benefit_elections_completed', 0)
  on conflict (task_key) do nothing;
