/**
 * POST /api/webhook
 *
 * Stripe webhook endpoint — receives events from Stripe and updates the DB.
 * Currently a stub — will be implemented when real Stripe is integrated.
 *
 * TO IMPLEMENT WITH REAL STRIPE:
 *   1. npm install stripe
 *   2. Replace the stub with:
 *      const sig = request.headers.get("stripe-signature")!
 *      const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
 *      if (event.type === "checkout.session.completed") { ... mark order paid ... }
 */
import { NextResponse } from "next/server";

/**
 * Stub webhook handler — returns 200 so Stripe doesn't retry.
 * Will be replaced with real signature verification when Stripe is integrated.
 */
export async function POST() {
  // TODO: implement real Stripe webhook verification here
  // For now, orders are confirmed via /api/mock-confirm
  return NextResponse.json({ received: true });
}

