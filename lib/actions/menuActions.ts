// Server Actions for menu item mutations — used by ItemForm.
// All DB writes go through the service role client (bypasses RLS).
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

interface ItemPayload {
  name: string;
  description: string;
  category_id: string;
  price_cents: number;
  photo_url: string | null;
  is_veg: boolean;
  is_vegan: boolean;
  is_gf: boolean;
  is_available: boolean;
  is_special: boolean;
  special_note: string | null;
}

/**
 * Insert a new menu item using the service role client.
 * Returns an error string on failure, null on success.
 */
export async function createMenuItem(payload: ItemPayload): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("menu_items").insert({
      ...payload,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("[createMenuItem] DB error:", error);
      return "Failed to create item. Please try again.";
    }
    // Revalidate customer-facing pages so changes appear immediately
    revalidatePath("/menu");
    revalidatePath("/");
    revalidatePath("/admin/menu");
    return null;
  } catch (err) {
    console.error("[createMenuItem] Unexpected error:", err);
    return "Something went wrong. Please try again.";
  }
}

/**
 * Update an existing menu item using the service role client.
 * Returns an error string on failure, null on success.
 */
export async function updateMenuItem(id: string, payload: ItemPayload): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("menu_items")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      console.error("[updateMenuItem] DB error:", error);
      return "Failed to update item. Please try again.";
    }
    revalidatePath("/menu");
    revalidatePath("/");
    revalidatePath("/admin/menu");
    return null;
  } catch (err) {
    console.error("[updateMenuItem] Unexpected error:", err);
    return "Something went wrong. Please try again.";
  }
}

