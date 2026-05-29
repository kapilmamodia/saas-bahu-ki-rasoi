-- 014_kitchen_schedule.sql
-- Kitchen schedule overrides table.
-- Allows admins to define holidays, early closes, late opens, and full day offs
-- on a per-date basis. The app checks this table before showing open/closed status.

create table if not exists public.kitchen_schedule (
  id           uuid primary key default gen_random_uuid(),
  date         date not null unique,               -- the specific date (YYYY-MM-DD)
  is_closed    boolean not null default false,      -- full day closed (holiday / day off)
  open_hour    integer default null,                -- override open hour (0-23), null = default
  close_hour   integer default null,                -- override close hour (0-23), null = default
  note         text default null,                   -- admin note e.g. "Diwali Holiday"
  created_at   timestamptz not null default now()
);

-- Only admins (service role) can manage this table
alter table public.kitchen_schedule enable row level security;

create policy "Service role full access on kitchen_schedule"
  on public.kitchen_schedule
  for all
  using (true)
  with check (true);

