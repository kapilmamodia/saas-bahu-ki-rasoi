-- 012_orders_order_number.sql
-- Adds a human-friendly auto-incrementing order number (1, 2, 3...) to orders.
-- Uses a Postgres sequence so it's guaranteed unique and never resets.

create sequence if not exists public.order_number_seq start 1;

alter table public.orders
  add column if not exists order_number integer
    default nextval('public.order_number_seq');

-- Back-fill existing orders in created_at order
do $$
declare
  r record;
  n integer := 1;
begin
  for r in select id from public.orders order by created_at asc loop
    update public.orders set order_number = n where id = r.id;
    n := n + 1;
  end loop;
  -- Advance the sequence past the back-filled values
  perform setval('public.order_number_seq', n);
end$$;

-- Make it not null and unique now that all rows are filled
alter table public.orders
  alter column order_number set not null,
  add constraint orders_order_number_unique unique (order_number);

