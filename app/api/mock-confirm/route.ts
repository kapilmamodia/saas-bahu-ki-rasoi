/**
 * POST /api/mock-confirm
 *
 * Mock payment confirmation — marks order as "paid", then triggers
 * Phase 4: PDF invoice generation, Supabase Storage upload, and confirmation email.
 *
 * THIS FILE WILL BE DELETED when real Stripe is integrated.
 * Real Stripe uses /api/webhook which handles the same flow after verifying signature.
 */
import { NextRequest, NextResponse } from "next/server";
import { generateAndSendInvoice } from "@/lib/invoice";
import { Order, OrderItem } from "@/types";

/** Shape of the incoming POST body */
interface MockConfirmBody {
  sessionId: string;
}

/**
 * Marks the order as "paid" then fires invoice + email generation asynchronously.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Parse body ───────────────────────────────────────────────────────────
    let body: MockConfirmBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    if (!sessionId.startsWith("mock_")) {
      return NextResponse.json({ error: "Not a mock session" }, { status: 400 });
    }

    // ── Check env vars ───────────────────────────────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("[mock-confirm] Missing Supabase env vars");
      return NextResponse.json(
        { error: "Server configuration error — missing Supabase credentials" },
        { status: 500 }
      );
    }

    // ── Step 1: Mark order as "paid" via direct Supabase REST ───────────────
    const patchUrl = `${supabaseUrl}/rest/v1/orders?stripe_session_id=eq.${encodeURIComponent(sessionId)}&status=eq.pending`;
    const patchRes = await fetch(patchUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ status: "paid" }),
    });

    if (!patchRes.ok) {
      const errText = await patchRes.text();
      console.error("[mock-confirm] Supabase PATCH failed:", patchRes.status, errText);
      return NextResponse.json(
        { error: `Database update failed (${patchRes.status}): ${errText}` },
        { status: 500 }
      );
    }

    // ── Step 2: Fetch the now-paid order + its line items ────────────────────
    // We need the full order object for invoice generation
    const orderRes = await fetch(
      `${supabaseUrl}/rest/v1/orders?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=*`,
      {
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
        },
        cache: "no-store",
      }
    );

    const orders: Order[] = await orderRes.json();
    const order = orders[0];

    if (order) {
      const itemsRes = await fetch(
        `${supabaseUrl}/rest/v1/order_items?order_id=eq.${order.id}&select=*`,
        {
          headers: {
            "apikey": serviceKey,
            "Authorization": `Bearer ${serviceKey}`,
          },
          cache: "no-store",
        }
      );
      const orderItems: OrderItem[] = await itemsRes.json();

      // ── Step 3: Fire invoice + email async (don't block 200 response) ──────
      // This generates the PDF, uploads to Storage, and sends the email.
      // We fire-and-forget but still await it here so the invoice_url is saved
      // before the confirmation page reloads (page will show the download button).
      generateAndSendInvoice(order, orderItems).catch((err) => {
        console.error("[mock-confirm] invoice/email pipeline error:", err);
      });

      // Wait briefly so invoice_url is written to DB before page reloads
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[mock-confirm] Unexpected error:", message);
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}

