"use server";
/**
 * customerActions.ts — Server Actions for customer-facing features.
 *
 * getOrdersByEmail: looks up all orders placed with a given email address.
 * getOrdersByPhone: looks up all orders placed with a given phone number.
 * No authentication required — email or phone acts as the lookup key.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/types";

/** An order with its line items attached */
export type OrderWithItems = Order & { items: OrderItem[] };

/** Shared helper: fetch orders + items for a given supabase query filter */
async function fetchOrdersWithItems(
  filter: { column: string; value: string }
): Promise<{ orders?: OrderWithItems[]; error?: string }> {
  try {
    const supabase = createAdminClient();

    // Fetch orders — only paid/completed/refunded (not pending)
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq(filter.column, filter.value)
      .in("status", ["paid", "completed", "refunded"])
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("[fetchOrdersWithItems] orders error:", ordersError);
      return { error: "Something went wrong. Please try again." };
    }

    if (!orders || orders.length === 0) return { orders: [] };

    // Fetch all line items for these orders in one query
    const orderIds = orders.map((o) => o.id);
    const { data: allItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if (itemsError) {
      console.error("[fetchOrdersWithItems] items error:", itemsError);
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
    console.error("[fetchOrdersWithItems] unexpected:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Fetches all orders for a given customer email, newest first.
 * Returns an empty array if none found or on error.
 */
export async function getOrdersByEmail(
  email: string
): Promise<{ orders?: OrderWithItems[]; error?: string }> {
  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }
  return fetchOrdersWithItems({ column: "customer_email", value: email.trim().toLowerCase() });
}

/**
 * Fetches all orders for a given customer phone number, newest first.
 * Strips spaces/dashes before querying so "98765 43210" matches "9876543210".
 */
export async function getOrdersByPhone(
  phone: string
): Promise<{ orders?: OrderWithItems[]; error?: string }> {
  // Normalise: strip all non-digit characters
  const normalised = phone.replace(/\D/g, "");
  if (!normalised || normalised.length < 7) {
    return { error: "Please enter a valid phone number." };
  }
  return fetchOrdersWithItems({ column: "customer_phone", value: normalised });
}

