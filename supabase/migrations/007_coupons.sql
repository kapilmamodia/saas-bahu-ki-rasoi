-- 007_coupons.sql
-- Creates the coupons table for discount codes redeemable at checkout.
-- type: "percent" = percentage off subtotal, "flat" = fixed rupee amount off (stored in paise).
-- valid_from / valid_until: date-range validity window.
-- max_uses: null means unlimited uses.
-- used_count: incremented on every successful paid order that used this coupon.

create table if not exists public.coupons (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,               -- e.g. "WELCOME20" (stored uppercase)
  description   text not null default '',           -- admin-facing note
  type          text not null check (type in ('percent', 'flat')),
  value         integer not null check (value > 0), -- percent: 1-100; flat: paise amount
  min_order_cents integer not null default 0,       -- minimum subtotal required
  max_uses      integer,                            -- null = unlimited
  used_count    integer not null default 0,
  valid_from    timestamptz not null,
  valid_until   timestamptz not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Index for fast lookup by code during checkout
create index if not exists coupons_code_idx on public.coupons (code);

-- RLS: only admins (service role) can manage coupons
alter table public.coupons enable row level security;

-- Public read is blocked by default (no policy = deny)
-- Service role bypasses RLS so admin server actions work fine

