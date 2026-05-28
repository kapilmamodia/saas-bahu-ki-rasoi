-- Migration: add completed_at timestamp column to orders table.
-- Run in Supabase SQL Editor.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

