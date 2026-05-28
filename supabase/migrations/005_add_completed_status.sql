-- Migration: add "completed" to the orders status check constraint.
-- Run this in Supabase SQL editor → saas-bahu-ki-rasoi project.

-- Drop the old check constraint and replace with one that includes "completed"
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'paid', 'completed', 'refunded'));

