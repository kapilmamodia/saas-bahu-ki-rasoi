-- 016_reviews.sql
-- Customer reviews table — star rating (1-5), name, optional dish, message.
-- Requires admin approval before showing publicly (is_approved flag).

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating        integer not null check (rating between 1 and 5),
  message       text not null,
  dish_name     text default null,      -- optional: which dish they're reviewing
  is_approved   boolean not null default false,  -- admin must approve before public display
  created_at    timestamptz not null default now()
);

-- Public can insert (submit review) but only read approved ones
alter table public.reviews enable row level security;

create policy "Anyone can submit a review"
  on public.reviews for insert
  with check (true);

create policy "Public can read approved reviews"
  on public.reviews for select
  using (is_approved = true);

create policy "Service role full access on reviews"
  on public.reviews for all
  using (true)
  with check (true);

