-- ============================================================
-- 1095-C HR Toolkit — Supabase Schema
-- ABC Janitorial Services
-- ============================================================
-- Run this in the Supabase SQL Editor for your project.
-- ============================================================

-- ── user_checklist_states ──────────────────────────────────
-- Stores per-user checkbox state for the ACA audit checklist.
-- item_id corresponds to the IDs in lib/data/audit-checklist.ts

create table if not exists public.user_checklist_states (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     text not null,
  is_checked  boolean not null default false,
  updated_at  timestamptz not null default now(),

  unique (user_id, item_id)
);

-- RLS: users can only read/write their own checklist state
alter table public.user_checklist_states enable row level security;

create policy "Users can manage their own checklist state"
  on public.user_checklist_states
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── employees ─────────────────────────────────────────────
-- Employee ACA tracking records. Each user owns their records.

create table if not exists public.employees (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  employee_id        text not null default '',
  first_name         text not null,
  last_name          text not null,
  ssn_last4          text not null default '',
  department         text not null default '',
  hire_date          date,
  termination_date   date,
  is_full_time       boolean not null default true,
  line14_code        text not null default '1E',
  line15_amount      numeric(10, 2),
  line16_code        text not null default '2C',
  notes              text not null default '',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Index for fast user-scoped lookups
create index if not exists employees_user_id_idx on public.employees(user_id);

-- RLS: users can only manage their own employee records
alter table public.employees enable row level security;

create policy "Users can manage their own employee records"
  on public.employees
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── updated_at trigger ───────────────────────────────────
-- Automatically keeps updated_at current for employees table.

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger employees_set_updated_at
  before update on public.employees
  for each row execute function public.set_updated_at();
