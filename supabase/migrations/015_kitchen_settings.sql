-- 015_kitchen_settings.sql
-- Singleton settings table for default kitchen open/close hours.
-- Admins can update these from the schedule page without touching code.

create table if not exists public.kitchen_settings (
  id           int primary key default 1 check (id = 1), -- singleton enforced
  open_hour    integer not null default 10,               -- 10:00 AM IST default
  close_hour   integer not null default 21,               -- 9:00 PM  IST default
  updated_at   timestamptz not null default now()
);

-- Seed the single default row
insert into public.kitchen_settings (id, open_hour, close_hour)
values (1, 10, 21)
on conflict (id) do nothing;

-- Only service role can manage this table
alter table public.kitchen_settings enable row level security;

create policy "Service role full access on kitchen_settings"
  on public.kitchen_settings
  for all
  using (true)
  with check (true);

