/**
 * lib/kitchenHours.ts — single source of truth for kitchen open/close schedule.
 * Default hours: Mon–Sun, 10:00 AM – 9:00 PM IST.
 * Per-date overrides (holidays, early close, late open) come from kitchen_schedule table.
 * To change default hours, edit OPEN_HOUR / CLOSE_HOUR only here.
 */

export const OPEN_HOUR  = 10; // 10:00 AM IST (default)
export const CLOSE_HOUR = 21; // 9:00 PM  IST (default)

/** Returns current IST Date object */
export function nowIST(): Date {
  const utcMs = Date.now() + new Date().getTimezoneOffset() * 60000;
  return new Date(utcMs + 5.5 * 3600000);
}

/** Returns today's date string in YYYY-MM-DD (IST) */
export function todayIST(): string {
  const d = nowIST();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface KitchenStatus {
  isOpen:        boolean;
  closingSoon:   boolean;     // within 30 min of closing
  nextOpenText:  string;      // human-readable next open time
  scheduleText:  string;      // "Mon – Sun, 10:00 AM – 9:00 PM"
  isOverridden:  boolean;     // true if a DB override applies today
  overrideNote:  string|null; // e.g. "Diwali Holiday"
}

interface Override {
  is_closed:   boolean;
  open_hour:   number | null;
  close_hour:  number | null;
  note:        string | null;
}

/**
 * Returns the current kitchen status.
 * Pass an optional override fetched server-side for SSR accuracy.
 * On client, call without argument — reads clock only (no DB access).
 */
export function getKitchenStatus(override?: Override | null): KitchenStatus {
  const ist   = nowIST();
  const hour  = ist.getHours();
  const min   = ist.getMinutes();

  // Apply override if present
  const isClosed   = override?.is_closed ?? false;
  const openHour   = override?.open_hour  ?? OPEN_HOUR;
  const closeHour  = override?.close_hour ?? CLOSE_HOUR;
  const isOverridden = !!override;
  const overrideNote = override?.note ?? null;

  const isOpen      = !isClosed && hour >= openHour && hour < closeHour;
  const minsLeft    = isOpen ? (closeHour - hour - 1) * 60 + (60 - min) : 0;
  const closingSoon = isOpen && minsLeft <= 30;

  const fmt12 = (h: number) => h === 0 ? "12:00 AM" : h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`;

  let nextOpenText = "";
  if (!isOpen) {
    if (isClosed) {
      nextOpenText = overrideNote ? `Closed: ${overrideNote}` : "Closed today";
    } else {
      nextOpenText = hour < openHour
        ? `Opens today at ${fmt12(openHour)}`
        : `Opens tomorrow at ${fmt12(OPEN_HOUR)}`;
    }
  }

  return {
    isOpen,
    closingSoon,
    nextOpenText,
    scheduleText: `Mon – Sun · ${fmt12(OPEN_HOUR)} – ${fmt12(CLOSE_HOUR)}`,
    isOverridden,
    overrideNote,
  };
}
