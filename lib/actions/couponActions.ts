"use server";
/**
 * couponActions.ts — Server Actions for coupon management and validation.
 *
 * Admin actions : createCoupon, updateCoupon, deleteCoupon, toggleCouponActive
 * Public action : validateCoupon — called from the cart page to check a code
 * Internal      : incrementCouponUsage — called from checkout after payment
 */
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Coupon, CouponValidationResult } from "@/types";

// ── Admin: list all coupons ───────────────────────────────────────────────────

/** Fetch all coupons ordered by creation date (newest first) */
export async function getCoupons(): Promise<Coupon[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("[getCoupons]", error); return []; }
    return (data as Coupon[]) ?? [];
  } catch (err) {
    console.error("[getCoupons] unexpected:", err);
    return [];
  }
}

// ── Admin: create coupon ──────────────────────────────────────────────────────

/** Form values for creating/editing a coupon */
export interface CouponFormValues {
  code: string;
  description: string;
  type: "percent" | "flat";
  value: number;
  min_order_rupees: number;
  max_uses: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  /** Show a promo banner for this coupon on the public home page */
  show_on_home: boolean;
}

/** Create a new coupon. Returns error string on failure. */
export async function createCoupon(values: CouponFormValues): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("coupons").insert({
      code: values.code.trim().toUpperCase(),
      description: values.description.trim(),
      type: values.type,
      // For flat type, convert rupees → paise; for percent just use the number
      value: values.type === "flat"
        ? Math.round(values.value * 100)
        : values.value,
      min_order_cents: Math.round((values.min_order_rupees ?? 0) * 100),
      max_uses: values.max_uses ?? null,
      valid_from: new Date(values.valid_from).toISOString(),
      valid_until: new Date(values.valid_until).toISOString(),
      is_active: values.is_active,
      show_on_home: values.show_on_home,
    });
    if (error) {
      console.error("[createCoupon]", error);
      // Unique constraint violation = duplicate code
      if (error.code === "23505") return { error: "A coupon with this code already exists." };
      return { error: "Failed to create coupon." };
    }
    revalidatePath("/admin/coupons");
    return {};
  } catch (err) {
    console.error("[createCoupon] unexpected:", err);
    return { error: "Something went wrong." };
  }
}

/** Update an existing coupon. Returns error string on failure. */
export async function updateCoupon(id: string, values: CouponFormValues): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("coupons").update({
      code: values.code.trim().toUpperCase(),
      description: values.description.trim(),
      type: values.type,
      value: values.type === "flat"
        ? Math.round(values.value * 100)
        : values.value,
      min_order_cents: Math.round((values.min_order_rupees ?? 0) * 100),
      max_uses: values.max_uses ?? null,
      valid_from: new Date(values.valid_from).toISOString(),
      valid_until: new Date(values.valid_until).toISOString(),
      is_active: values.is_active,
      show_on_home: values.show_on_home,
    }).eq("id", id);
    if (error) { console.error("[updateCoupon]", error); return { error: "Failed to update coupon." }; }
    revalidatePath("/admin/coupons");
    return {};
  } catch (err) {
    console.error("[updateCoupon] unexpected:", err);
    return { error: "Something went wrong." };
  }
}

/** Toggle is_active for a coupon */
export async function toggleCouponActive(id: string, current: boolean): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("coupons").update({ is_active: !current }).eq("id", id);
    revalidatePath("/admin/coupons");
  } catch (err) {
    console.error("[toggleCouponActive]", err);
  }
}

/** Delete a coupon permanently */
export async function deleteCoupon(id: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("coupons").delete().eq("id", id);
    revalidatePath("/admin/coupons");
  } catch (err) {
    console.error("[deleteCoupon]", err);
  }
}

// ── Public: coupons for home page banner ─────────────────────────────────────

/**
 * Fetches coupons that should be displayed on the public home page.
 * Only returns active coupons within their validity window with show_on_home=true.
 */
export async function getHomePageCoupons(): Promise<Coupon[]> {
  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("is_active", true)
      .eq("show_on_home", true)
      .lte("valid_from", now)   // already started
      .gte("valid_until", now)  // not yet expired
      .order("created_at", { ascending: false });
    if (error) { console.error("[getHomePageCoupons]", error); return []; }
    return (data as Coupon[]) ?? [];
  } catch (err) {
    console.error("[getHomePageCoupons] unexpected:", err);
    return [];
  }
}

// ── Public: validate coupon ───────────────────────────────────────────────────

/**
 * Validates a coupon code for a given cart subtotal.
 * Does NOT increment used_count — that happens only on successful payment.
 *
 * @param code          - The coupon code entered by the user
 * @param subtotalCents - Cart subtotal in paise (before tax)
 */
export async function validateCoupon(
  code: string,
  subtotalCents: number
): Promise<CouponValidationResult> {
  try {
    const supabase = createAdminClient();

    // Look up coupon by code (case-insensitive via stored uppercase)
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (error || !data) return { valid: false, error: "Invalid coupon code." };

    const coupon = data as Coupon;
    const now = new Date();

    // Check active flag
    if (!coupon.is_active) return { valid: false, error: "This coupon is no longer active." };

    // Check date range
    if (now < new Date(coupon.valid_from))
      return { valid: false, error: "This coupon is not valid yet." };
    if (now > new Date(coupon.valid_until))
      return { valid: false, error: "This coupon has expired." };

    // Check usage limit
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses)
      return { valid: false, error: "This coupon has reached its usage limit." };

    // Check minimum order value
    if (subtotalCents < coupon.min_order_cents)
      return {
        valid: false,
        error: `Minimum order of ₹${(coupon.min_order_cents / 100).toLocaleString("en-IN")} required.`,
      };

    // Calculate discount amount in paise
    let discountCents: number;
    if (coupon.type === "percent") {
      // value is the percentage (e.g. 20 = 20%)
      discountCents = Math.round(subtotalCents * (coupon.value / 100));
    } else {
      // value is already in paise for flat discount
      discountCents = Math.min(coupon.value, subtotalCents); // never discount more than subtotal
    }

    return { valid: true, coupon, discountCents };
  } catch (err) {
    console.error("[validateCoupon]", err);
    return { valid: false, error: "Could not validate coupon. Please try again." };
  }
}

// ── Internal: increment usage ─────────────────────────────────────────────────

/**
 * Increments used_count for a coupon after a successful payment.
 * Called internally from /api/checkout after order is saved.
 */
export async function incrementCouponUsage(code: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    // Use rpc to atomically increment — avoids race conditions
    await supabase.rpc("increment_coupon_usage", { coupon_code: code });
  } catch (err) {
    console.error("[incrementCouponUsage]", err);
  }
}

