-- 013_orders_customer_phone.sql
-- Adds an optional customer_phone column to the orders table.

alter table public.orders
  add column if not exists customer_phone text default null;

