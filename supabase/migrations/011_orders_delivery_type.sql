-- 011_orders_delivery_type.sql
-- Adds delivery_type (pickup | delivery) and delivery_address to orders table.

alter table public.orders
  add column if not exists delivery_type text not null default 'pickup'
    check (delivery_type in ('pickup', 'delivery')),
  add column if not exists delivery_address text null;

