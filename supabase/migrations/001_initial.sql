-- 1095-C HR Toolkit: Initial Schema
-- Run this in your Supabase SQL editor or via supabase db push

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Checklist Items ────────────────────────────────────────────────────────
-- Stores per-user checkbox state for the audit checklist.
create table if not exists checklist_items (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  item_key    text not null,
  checked     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, item_key)
);

-- ─── Employees ──────────────────────────────────────────────────────────────
-- Stores employee ACA data for 1095-C reporting.
create table if not exists employees (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,

  -- Basic info
  employee_id     text,
  first_name      text not null,
  last_name       text not null,
  ssn_last4       text check (ssn_last4 ~ '^[0-9]{4}$' or ssn_last4 is null),

  -- Form 1095-C Lines (annual / all-12-months code)
  line14_annual   text,     -- Offer of coverage code (1A–1K)
  line15_annual   numeric(8,2), -- Employee share of lowest-cost monthly premium
  line16_annual   text,     -- Section 4980H safe harbor code (2A–2I)

  notes           text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table checklist_items enable row level security;
alter table employees enable row level security;

-- Users can only access their own checklist items
create policy "Users manage their own checklist items"
  on checklist_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can only access their own employee records
create policy "Users manage their own employees"
  on employees
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Updated_at Trigger ──────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_checklist
  before update on checklist_items
  for each row execute function update_updated_at();

create trigger set_updated_at_employees
  before update on employees
  for each row execute function update_updated_at();
