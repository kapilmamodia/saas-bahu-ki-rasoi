-- 009_orders_coupon_fields.sql
-- Adds discount_cents and coupon_code columns to the orders table
-- to record which coupon was applied and how much was discounted.

alter table public.orders
  add column if not exists discount_cents integer not null default 0,
  add column if not exists coupon_code text;

