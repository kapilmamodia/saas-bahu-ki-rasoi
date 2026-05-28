-- 008_coupon_increment_fn.sql
-- Postgres function to atomically increment used_count on a coupon.
-- Called via supabase.rpc("increment_coupon_usage", { coupon_code: "..." })
-- Using a function avoids race conditions when two orders pay simultaneously.

create or replace function public.increment_coupon_usage(coupon_code text)
returns void
language plpgsql
security definer
as $$
begin
  update public.coupons
  set used_count = used_count + 1
  where code = upper(coupon_code);
end;
$$;

