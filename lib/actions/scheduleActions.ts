"use server";
/**
 * lib/actions/scheduleActions.ts
 * Server actions for kitchen schedule override CRUD.
 * Uses admin client (service role) — never exposed to browser.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type { KitchenScheduleOverride } from "@/types";

/** Fetch all schedule overrides, ordered by date */
export async function getScheduleOverrides(): Promise<KitchenScheduleOverride[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kitchen_schedule")
      .select("*")
      .order("date", { ascending: true });
    if (error) { console.error("[schedule] fetch error:", error); return []; }
    return (data ?? []) as KitchenScheduleOverride[];
  } catch (err) {
    console.error("[schedule] unexpected error:", err);
    return [];
  }
}

/** Fetch a single override by date string (YYYY-MM-DD) */
export async function getOverrideForDate(date: string): Promise<KitchenScheduleOverride | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("kitchen_schedule")
      .select("*")
      .eq("date", date)
      .maybeSingle();
    return (data as KitchenScheduleOverride) ?? null;
  } catch { return null; }
}

/** Upsert a schedule override (insert or update by date) */
export async function upsertScheduleOverride(
  payload: Omit<KitchenScheduleOverride, "id" | "created_at">
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("kitchen_schedule")
      .upsert({ ...payload }, { onConflict: "date" });
    if (error) { console.error("[schedule] upsert error:", error); return { success: false, error: error.message }; }
    return { success: true };
  } catch (err) {
    console.error("[schedule] upsert unexpected:", err);
    return { success: false, error: "Unexpected error" };
  }
}

/** Delete a schedule override by id */
export async function deleteScheduleOverride(id: string): Promise<{ success: boolean }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("kitchen_schedule")
      .delete()
      .eq("id", id);
    if (error) { console.error("[schedule] delete error:", error); return { success: false }; }
    return { success: true };
  } catch { return { success: false }; }
}

