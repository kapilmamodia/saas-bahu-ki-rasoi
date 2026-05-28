/**
 * POST /api/checkout
 *
 * Mock checkout endpoint — simulates what Stripe Checkout would do.
 * Saves a "pending" order to Supabase and redirects to the confirmation page.
 *
 * TO UPGRADE TO REAL STRIPE LATER:
 *   1. npm install stripe @stripe/stripe-js
 *   2. Replace the mock session block with:
 *      const session = await stripe.checkout.sessions.create({ ... })
 *      return NextResponse.json({ url: session.url })
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CartItem } from "@/types";
import { validateCoupon, incrementCouponUsage } from "@/lib/actions/couponActions";

/** Tax rate — 18% GST by default */
const TAX_RATE = parseFloat(process.env.TAX_RATE ?? "0.18");

/** Shape of the incoming POST body from the cart page */
interface CheckoutBody {
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  couponCode?: string;
  deliveryType?: "pickup" | "delivery";
  deliveryAddress?: string | null;
}

/**
 * Creates a pending order in Supabase and returns a mock redirect URL.
 * Real Stripe will replace the mock session logic here.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate incoming request body
    const body: CheckoutBody = await request.json();
    const { items, customerEmail, customerName, couponCode, deliveryType, deliveryAddress } = body;

    // Basic validation — must have items and a customer email
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
    }

    // Compute subtotal (all in paise / cents)
    const subtotalCents = items.reduce(
      (sum, i) => sum + i.menuItem.price_cents * i.quantity,
      0
    );

    // Validate coupon if provided and calculate discount
    let discountCents = 0;
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, subtotalCents);
      if (couponResult.valid) {
        discountCents = couponResult.discountCents ?? 0;
      }
      // If invalid on server re-check, proceed without discount (don't block checkout)
    }

    const discountedSubtotal = subtotalCents - discountCents;
    const taxCents = Math.round(discountedSubtotal * TAX_RATE);
    const totalCents = discountedSubtotal + taxCents;

    // ── MOCK: Generate a fake session ID ────────────────────────────────────
    // Replace this with: const session = await stripe.checkout.sessions.create(...)
    const mockSessionId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // ── Save pending order to Supabase ───────────────────────────────────────
    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        stripe_session_id: mockSessionId,
        customer_email: customerEmail,
        customer_name: customerName || "Guest",
        status: "pending",
        subtotal_cents: subtotalCents,
        discount_cents: discountCents,
        coupon_code: couponCode ?? null,
        tax_cents: taxCents,
        total_cents: totalCents,
        delivery_type: deliveryType ?? "pickup",
        delivery_address: deliveryAddress ?? null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("[checkout] Failed to create order:", JSON.stringify(orderError));
      return NextResponse.json({ error: `Failed to create order: ${orderError?.message ?? "unknown"}` }, { status: 500 });
    }

    // ── Save order line items (price/name snapshotted) ───────────────────────
    const orderItems = items.map((i) => ({
      order_id: order.id,
      menu_item_id: i.menuItem.id,
      item_name: i.menuItem.name,
      item_price_cents: i.menuItem.price_cents,
      quantity: i.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("[checkout] Failed to save order items:", itemsError);
    }

    // ── Increment coupon usage now that order is saved ───────────────────────
    if (couponCode && discountCents > 0) {
      await incrementCouponUsage(couponCode);
    }

    // ── Return the redirect URL ──────────────────────────────────────────────
    // We return BOTH a relative path (used by router.push on the client — works on
    // all environments including Vercel) AND a full URL for future Stripe compatibility.
    //
    // Real Stripe: return { url: session.url, path: "/order/confirmation?..." }
    // router.push() in Next.js App Router requires a relative path for same-origin
    // navigation — passing an absolute URL can silently fail on Vercel edge.
    const confirmPath = `/order/confirmation?session_id=${mockSessionId}`;
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const confirmUrl = `${baseUrl}${confirmPath}`;

    return NextResponse.json({ url: confirmUrl, path: confirmPath });
  } catch (error) {
    console.error("[checkout] Unexpected error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

