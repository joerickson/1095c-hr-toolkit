-- Admin feature migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Safe to run multiple times — all statements are idempotent.

-- ============================================================
-- 1. Add preferred_language column to profiles
-- ============================================================
alter table profiles
  add column if not exists preferred_language text
  default 'en'
  check (preferred_language in ('en', 'es'));

-- ============================================================
-- 2. Admin RLS policies — allow admins to see/update all rows
-- ============================================================
do $$ begin
  create policy "Admins can view all profiles"
    on profiles for select
    using (
      exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can update all profiles"
    on profiles for update
    using (
      exists (
        select 1 from profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    );
exception when duplicate_object then null;
end $$;
