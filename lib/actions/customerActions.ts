"use server";
/**
 * customerActions.ts — Server Actions for customer-facing features.
 *
 * getOrdersByEmail: looks up all orders placed with a given email address.
 * No authentication required — email acts as the lookup key.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/types";

/** An order with its line items attached */
export type OrderWithItems = Order & { items: OrderItem[] };

/**
 * Fetches all orders for a given customer email, newest first.
 * Returns an empty array if none found or on error.
 */
export async function getOrdersByEmail(
  email: string
): Promise<{ orders?: OrderWithItems[]; error?: string }> {
  try {
    if (!email || !email.includes("@")) {
      return { error: "Please enter a valid email address." };
    }

    const supabase = createAdminClient();

    // Fetch orders for this email — only paid/completed/refunded (not pending)
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_email", email.trim().toLowerCase())
      .in("status", ["paid", "completed", "refunded"])
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("[getOrdersByEmail] orders error:", ordersError);
      return { error: "Something went wrong. Please try again." };
    }

    if (!orders || orders.length === 0) {
      return { orders: [] };
    }

    // Fetch all line items for these orders in one query
    const orderIds = orders.map((o) => o.id);
    const { data: allItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if (itemsError) {
      console.error("[getOrdersByEmail] items error:", itemsError);
    }

    // Attach items to each order
    const ordersWithItems: OrderWithItems[] = orders.map((order) => ({
      ...(order as Order),
      items: ((allItems ?? []) as OrderItem[]).filter(
        (item) => item.order_id === order.id
      ),
    }));

    return { orders: ordersWithItems };
  } catch (err) {
    console.error("[getOrdersByEmail] unexpected:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

