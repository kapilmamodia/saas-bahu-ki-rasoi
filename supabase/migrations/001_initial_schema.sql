-- Saas Bahu Ki Rasoi — Initial Database Schema
-- Run via: npx supabase db push (or paste directly in Supabase SQL editor)
-- All prices stored in paise (integer cents) — never floats for money.

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Categories ──────────────────────────────────────────────────────────────
create table if not exists categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  sort_order integer not null default 0
);

-- ─── Menu Items ──────────────────────────────────────────────────────────────
create table if not exists menu_items (
  id           uuid primary key default uuid_generate_v4(),
  category_id  uuid references categories(id) on delete set null,
  name         text not null,
  description  text not null default '',
  price_cents  integer not null check (price_cents >= 0),  -- stored in paise
  photo_url    text,
  is_veg       boolean not null default false,
  is_vegan     boolean not null default false,
  is_gf        boolean not null default false,             -- gluten-free
  is_available boolean not null default true,
  is_special   boolean not null default false,             -- today's special flag
  special_note text,                                       -- short story / origin
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz                                 -- null = active (soft delete)
);

-- ─── Orders ──────────────────────────────────────────────────────────────────
create table if not exists orders (
  id                uuid primary key default uuid_generate_v4(),
  stripe_session_id text unique not null,
  customer_email    text not null,
  customer_name     text not null default '',
  status            text not null default 'pending'
                      check (status in ('pending', 'paid', 'refunded')),
  subtotal_cents    integer not null,
  tax_cents         integer not null,
  total_cents       integer not null,
  invoice_url       text,                                  -- Supabase Storage signed URL
  created_at        timestamptz not null default now()
);

-- ─── Order Items ─────────────────────────────────────────────────────────────
create table if not exists order_items (
  id               uuid primary key default uuid_generate_v4(),
  order_id         uuid references orders(id) on delete cascade,
  menu_item_id     uuid references menu_items(id) on delete set null,
  item_name        text not null,       -- price/name snapshot at purchase time
  item_price_cents integer not null,    -- price snapshot — never changes after order
  quantity         integer not null check (quantity > 0)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Allow public read on categories and available menu items
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public can read categories
create policy "Public read categories"
  on categories for select
  using (true);

-- Public can read active, available menu items
create policy "Public read available menu items"
  on menu_items for select
  using (deleted_at is null);

-- Service role has full access (used by admin panel server-side)
-- No policy needed — service role bypasses RLS

-- ─── Seed: default categories ────────────────────────────────────────────────
insert into categories (name, sort_order) values
  ('Starters',  1),
  ('Mains',     2),
  ('Breads',    3),
  ('Rice',      4),
  ('Desserts',  5),
  ('Drinks',    6)
on conflict do nothing;

-- ─── Seed: sample menu items ─────────────────────────────────────────────────
insert into menu_items (category_id, name, description, price_cents, is_veg, is_special, special_note)
select id, 'Dal Makhani',
  'Slow-cooked black lentils in a rich tomato-butter gravy. Nani ki recipe.',
  32000, true, true, 'Simmered overnight — just like home'
from categories where name = 'Mains'
on conflict do nothing;

insert into menu_items (category_id, name, description, price_cents, is_veg)
select id, 'Aloo Tikki', 'Crispy spiced potato patties with mint chutney.', 15000, true
from categories where name = 'Starters'
on conflict do nothing;

insert into menu_items (category_id, name, description, price_cents, is_veg)
select id, 'Paneer Butter Masala',
  'Tender cottage cheese cubes in a velvety tomato-cream gravy.',
  28000, true
from categories where name = 'Mains'
on conflict do nothing;

insert into menu_items (category_id, name, description, price_cents, is_veg)
select id, 'Gulab Jamun', 'Soft milk-solid dumplings in rose-scented sugar syrup.', 12000, true
from categories where name = 'Desserts'
on conflict do nothing;

insert into menu_items (category_id, name, description, price_cents, is_veg)
select id, 'Butter Naan', 'Soft leavened flatbread baked in a tandoor, brushed with butter.', 5000, true
from categories where name = 'Breads'
on conflict do nothing;

insert into menu_items (category_id, name, description, price_cents, is_veg)
select id, 'Masala Chai', 'Spiced Indian tea with ginger, cardamom and whole spices.', 4000, true
from categories where name = 'Drinks'
on conflict do nothing;

