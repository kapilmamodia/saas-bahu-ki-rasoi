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

/** Tax rate — 18% GST by default */
const TAX_RATE = parseFloat(process.env.TAX_RATE ?? "0.18");

/** Shape of the incoming POST body from the cart page */
interface CheckoutBody {
  items: CartItem[];
  customerEmail: string;
  customerName: string;
}

/**
 * Creates a pending order in Supabase and returns a mock redirect URL.
 * Real Stripe will replace the mock session logic here.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate incoming request body
    const body: CheckoutBody = await request.json();
    const { items, customerEmail, customerName } = body;

    // Basic validation — must have items and a customer email
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
    }

    // Compute order totals (all in paise / cents)
    const subtotalCents = items.reduce(
      (sum, i) => sum + i.menuItem.price_cents * i.quantity,
      0
    );
    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const totalCents = subtotalCents + taxCents;

    // ── MOCK: Generate a fake session ID ────────────────────────────────────
    // Replace this with: const session = await stripe.checkout.sessions.create(...)
    const mockSessionId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // ── Save pending order to Supabase ───────────────────────────────────────
    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        stripe_session_id: mockSessionId, // will be real Stripe session ID later
        customer_email: customerEmail,
        customer_name: customerName || "Guest",
        status: "pending",
        subtotal_cents: subtotalCents,
        tax_cents: taxCents,
        total_cents: totalCents,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("[checkout] Failed to create order:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // ── Save order line items (price/name snapshotted) ───────────────────────
    const orderItems = items.map((i) => ({
      order_id: order.id,
      menu_item_id: i.menuItem.id,
      item_name: i.menuItem.name,        // snapshot at purchase time
      item_price_cents: i.menuItem.price_cents, // snapshot at purchase time
      quantity: i.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("[checkout] Failed to save order items:", itemsError);
      // Order is saved — don't fail the whole checkout, just log
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

