"use server";
/**
 * lib/actions/scheduleActions.ts
 * Server actions for kitchen schedule override CRUD + default schedule settings.
 * Uses admin client (service role) — never exposed to browser.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type { KitchenScheduleOverride, KitchenSettings } from "@/types";
import { OPEN_HOUR, CLOSE_HOUR } from "@/lib/kitchenHours";

// ── Default schedule ──────────────────────────────────────────────────────────

/** Fetch the default open/close hours from kitchen_settings (singleton row) */
export async function getDefaultSchedule(): Promise<KitchenSettings> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kitchen_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) {
      console.error("[schedule] getDefaultSchedule error:", error);
      // Fallback to hardcoded constants if DB row missing
      return { id: 1, open_hour: OPEN_HOUR, close_hour: CLOSE_HOUR, updated_at: new Date().toISOString() };
    }
    return data as KitchenSettings;
  } catch (err) {
    console.error("[schedule] getDefaultSchedule unexpected:", err);
    return { id: 1, open_hour: OPEN_HOUR, close_hour: CLOSE_HOUR, updated_at: new Date().toISOString() };
  }
}

/** Update the default open/close hours in kitchen_settings */
export async function updateDefaultSchedule(
  openHour: number,
  closeHour: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (openHour < 0 || openHour > 23 || closeHour < 0 || closeHour > 23) {
      return { success: false, error: "Hours must be between 0 and 23." };
    }
    if (openHour >= closeHour) {
      return { success: false, error: "Open time must be before close time." };
    }
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("kitchen_settings")
      .upsert({ id: 1, open_hour: openHour, close_hour: closeHour, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (error) { console.error("[schedule] updateDefaultSchedule error:", error); return { success: false, error: error.message }; }
    return { success: true };
  } catch (err) {
    console.error("[schedule] updateDefaultSchedule unexpected:", err);
    return { success: false, error: "Unexpected error" };
  }
}

// ── Schedule overrides ────────────────────────────────────────────────────────

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

