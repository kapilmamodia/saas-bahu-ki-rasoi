/**
 * GET /api/kitchen-status
 * Returns today's kitchen status including any DB override.
 * Also reads default open/close hours from kitchen_settings.
 * When kitchen is closed today, finds the next open date by scanning forward.
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getKitchenStatus, todayIST } from "@/lib/kitchenHours";
import type { KitchenScheduleOverride, KitchenSettings } from "@/types";

export const dynamic = "force-dynamic";

/** Format YYYY-MM-DD → "31 May" */
function fmtDate(d: string): string {
  const dt = new Date(d + "T00:00:00");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${String(dt.getDate()).padStart(2,"0")} ${months[dt.getMonth()]}`;
}

/** Add n days to YYYY-MM-DD */
function addDays(date: string, n: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

/** Format hour to 12hr string */
function fmt12(h: number): string {
  if (h === 0) return "12:00 AM";
  if (h < 12)  return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}

export async function GET() {
  try {
    const today    = todayIST();
    const supabase = createAdminClient();

    // Fetch default schedule from kitchen_settings (singleton)
    const { data: settingsRow } = await supabase
      .from("kitchen_settings")
      .select("open_hour, close_hour")
      .eq("id", 1)
      .maybeSingle();
    const defaults = (settingsRow as Pick<KitchenSettings, "open_hour" | "close_hour">) ?? null;
    const defaultOpen  = defaults?.open_hour  ?? 10;

    // Fetch today's override
    const { data: todayRow } = await supabase
      .from("kitchen_schedule")
      .select("*")
      .eq("date", today)
      .maybeSingle();

    const override = (todayRow as KitchenScheduleOverride) ?? null;
    // Pass both override and DB defaults so status uses live hours
    const status   = getKitchenStatus(override, defaults);

    // If kitchen is closed today, find the next open date (scan up to 90 days forward)
    let nextOpenText = status.nextOpenText;
    if (!status.isOpen && override?.is_closed) {
      // Fetch all future closed overrides starting from tomorrow
      const tomorrow = addDays(today, 1);
      const { data: futureOverrides } = await supabase
        .from("kitchen_schedule")
        .select("date, is_closed, open_hour")
        .gte("date", tomorrow)
        .order("date", { ascending: true });

      const closedDates = new Set(
        ((futureOverrides ?? []) as { date: string; is_closed: boolean }[])
          .filter(r => r.is_closed)
          .map(r => r.date)
      );

      // Walk forward day by day until we find a day that isn't closed
      let candidate = tomorrow;
      for (let i = 0; i < 90; i++) {
        if (!closedDates.has(candidate)) {
          // Found the next open day — get its open_hour if overridden, else use DB default
          const overrideRow = ((futureOverrides ?? []) as KitchenScheduleOverride[])
            .find(r => r.date === candidate);
          const openHour = overrideRow?.open_hour ?? defaultOpen;
          nextOpenText = `Opens on ${fmtDate(candidate)} at ${fmt12(openHour)}`;
          break;
        }
        candidate = addDays(candidate, 1);
      }
    }

    return NextResponse.json({ ...status, nextOpenText, override });
  } catch (err) {
    console.error("[api/kitchen-status]", err);
    return NextResponse.json(getKitchenStatus());
  }
}




