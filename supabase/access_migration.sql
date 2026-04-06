-- ============================================================
-- Access Plan Migration
-- Run this in the Supabase SQL editor AFTER filing_assistant.sql
-- Adds task assignment fields to filing_checklist_progress
-- ============================================================

alter table filing_checklist_progress
  add column if not exists assigned_to text,
  add column if not exists assigned_at timestamptz;
