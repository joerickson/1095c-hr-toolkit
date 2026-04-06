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
-- 2. Create is_admin() helper — SECURITY DEFINER bypasses RLS
--    so the admin policies don't cause infinite recursion.
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- 3. Admin RLS policies — drop old (broken) versions first,
--    then re-create using the security definer function.
--
--    The old policies queried profiles from within a profiles
--    policy, causing PostgreSQL to throw "infinite recursion
--    detected in policy for relation profiles". This made every
--    profiles query return null via the anon/user JWT, causing
--    the app to show role = 'hr_user' for everyone.
-- ============================================================
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can update all profiles" on profiles;

create policy "Admins can view all profiles"
  on profiles for select
  using (is_admin());

create policy "Admins can update all profiles"
  on profiles for update
  using (is_admin());
