"use server";
/**
 * lib/actions/reviewActions.ts
 * Server actions for customer reviews — submit and fetch.
 * Uses public client for fetching (RLS: only approved) and
 * admin client for admin operations (approve/delete).
 */
import { createPublicClient } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Review } from "@/types";

// ── Public ────────────────────────────────────────────────────────────────────

/**
 * Fetch all approved reviews, newest first.
 * Uses public client — RLS ensures only is_approved = true rows are returned.
 */
export async function getApprovedReviews(): Promise<Review[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    if (error) { console.error("[reviews] fetch error:", error); return []; }
    return (data ?? []) as Review[];
  } catch (err) {
    console.error("[reviews] unexpected fetch error:", err);
    return [];
  }
}

/**
 * Submit a new review — always starts as unapproved (pending admin sign-off).
 * Basic server-side validation before insert.
 */
export async function submitReview(payload: {
  customer_name: string;
  rating: number;
  message: string;
  dish_name: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { customer_name, rating, message, dish_name } = payload;

    // Validate
    if (!customer_name.trim() || customer_name.trim().length < 2) {
      return { success: false, error: "Please enter your name (at least 2 characters)." };
    }
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5." };
    }
    if (!message.trim() || message.trim().length < 10) {
      return { success: false, error: "Please write at least 10 characters in your review." };
    }
    if (message.trim().length > 500) {
      return { success: false, error: "Review must be 500 characters or less." };
    }

    const supabase = createPublicClient();
    const { error } = await supabase.from("reviews").insert({
      customer_name: customer_name.trim(),
      rating,
      message: message.trim(),
      dish_name: dish_name?.trim() || null,
      is_approved: false,   // always pending until admin approves
    });

    if (error) {
      console.error("[reviews] insert error:", error);
      return { success: false, error: "Could not submit review. Please try again." };
    }

    return { success: true };
  } catch (err) {
    console.error("[reviews] unexpected submit error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ── Admin ─────────────────────────────────────────────────────────────────────

/** Fetch all reviews (approved + pending) — admin only */
export async function getAllReviews(): Promise<Review[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("[reviews] admin fetch error:", error); return []; }
    return (data ?? []) as Review[];
  } catch (err) {
    console.error("[reviews] admin unexpected error:", err);
    return [];
  }
}

/** Approve a review — makes it publicly visible */
export async function approveReview(id: string): Promise<{ success: boolean }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("reviews").update({ is_approved: true }).eq("id", id);
    if (error) { console.error("[reviews] approve error:", error); return { success: false }; }
    return { success: true };
  } catch { return { success: false }; }
}

/** Delete a review permanently */
export async function deleteReview(id: string): Promise<{ success: boolean }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { console.error("[reviews] delete error:", error); return { success: false }; }
    return { success: true };
  } catch { return { success: false }; }
}

