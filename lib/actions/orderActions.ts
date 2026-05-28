/**
 * orderActions.ts — Server Actions for order management.
 *
 * Used by admin pages to update order status and trigger emails.
 * All actions require the user to be authenticated (admin only).
 */
"use server";

import { createElement } from "react";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient, EMAIL_FROM } from "@/lib/resend";
import { Order, OrderItem } from "@/types";
import OrderCompleted from "@/components/email/OrderCompleted";
import OrderCancelled from "@/components/email/OrderCancelled";
import { render as renderEmail } from "@react-email/components";

/**
 * Marks an order as "completed" and sends a completion email to the customer.
 * Called from the admin order detail page.
 */
export async function markOrderCompleted(orderId: string): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    // ── Update status to "completed" and stamp completed_at ────────────────
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(), // stamp the completion time
      })
      .eq("id", orderId)
      .eq("status", "paid"); // only allow paid → completed transition

    if (updateError) {
      console.error("[orderActions] Failed to update order status:", updateError);
      return { error: "Failed to update order status. Please try again." };
    }

    // ── Fetch updated order + line items for the email ───────────────────────
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    // ── Send completion email ────────────────────────────────────────────────
    if (order) {
      await sendCompletionEmail(order as Order, (items ?? []) as OrderItem[]);
    }

    // Revalidate dashboard and order detail so status updates immediately
    revalidatePath("/admin/dashboard");
    revalidatePath(`/admin/orders/${orderId}`);

    return {};
  } catch (err) {
    console.error("[orderActions] Unexpected error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Cancels an order by setting its status to "refunded".
 * Can be applied to orders with status "paid" or "completed".
 * Admin-only action — called from the order detail page.
 */
export async function cancelOrder(orderId: string): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    // ── Update status to "refunded" (cancelled) ────────────────────────────
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "refunded" })
      .eq("id", orderId)
      .in("status", ["paid", "completed"]); // only paid/completed → refunded

    if (updateError) {
      console.error("[orderActions] Failed to cancel order:", updateError);
      return { error: "Failed to cancel order. Please try again." };
    }

    // ── Fetch order + line items so we can send the cancellation email ────────
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    // Send cancellation email to the customer
    if (order) {
      await sendCancellationEmail(order as Order, (items ?? []) as OrderItem[]);
    }

    // Revalidate so admin pages reflect the new status immediately
    revalidatePath("/admin/dashboard");
    revalidatePath(`/admin/orders/${orderId}`);

    return {};
  } catch (err) {
    console.error("[orderActions] Unexpected cancel error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

/** Sends the order completion email via Resend. Skips if key not configured. */
async function sendCompletionEmail(order: Order, orderItems: OrderItem[]): Promise<void> {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.log("[orderActions] Email skipped — RESEND_API_KEY not configured");
      return;
    }

    const emailHtml = await renderEmail(
      createElement(OrderCompleted, { order, orderItems })
    );

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: order.customer_email,
      subject: `Your order is ready! — Saas Bahu Ki Rasoi (#${order.id.slice(0, 8).toUpperCase()})`,
      html: emailHtml,
    });

    if (error) {
      console.error("[orderActions] Resend email failed:", error);
    } else {
      console.log("[orderActions] Completion email sent to:", order.customer_email);
    }
  } catch (err) {
    console.error("[orderActions] Unexpected email error:", err);
  }
}

/** Sends the order cancellation email via Resend. Skips if key not configured. */
async function sendCancellationEmail(order: Order, orderItems: OrderItem[]): Promise<void> {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.log("[orderActions] Cancellation email skipped — RESEND_API_KEY not configured");
      return;
    }

    const emailHtml = await renderEmail(
      createElement(OrderCancelled, { order, orderItems })
    );

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: order.customer_email,
      subject: `Order Cancelled — Saas Bahu Ki Rasoi (#${order.id.slice(0, 8).toUpperCase()})`,
      html: emailHtml,
    });

    if (error) {
      console.error("[orderActions] Resend cancellation email failed:", error);
    } else {
      console.log("[orderActions] Cancellation email sent to:", order.customer_email);
    }
  } catch (err) {
    console.error("[orderActions] Unexpected cancellation email error:", err);
  }
}

