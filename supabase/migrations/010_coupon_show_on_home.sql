-- 010_coupon_show_on_home.sql
-- Adds show_on_home flag to coupons table.
-- When true, the coupon is displayed as a banner on the public home page
-- so customers know there is a discount available.

alter table public.coupons
  add column if not exists show_on_home boolean not null default false;

