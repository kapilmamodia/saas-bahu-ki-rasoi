"use client";
/**
 * ScheduleForm — add/update a kitchen schedule override.
 * Supports: single date OR date range, full day off, early close, late open, custom hours.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertScheduleOverride } from "@/lib/actions/scheduleActions";
import { OPEN_HOUR, CLOSE_HOUR } from "@/lib/kitchenHours";

/** Returns today's date as YYYY-MM-DD in IST */
function todayIST(): string {
  const now = new Date();
  const istMs = now.getTime() + now.getTimezoneOffset() * 60000 + 5.5 * 3600000;
  const d = new Date(istMs);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

/** Add N days to a YYYY-MM-DD string */
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

/** All dates between start and end (inclusive) */
function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let cur = start;
  while (cur <= end) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}

type OverrideType = "closed" | "early_close" | "late_open" | "custom";

const HOUR_OPTIONS = Array.from({ length: 19 }, (_, i) => i + 6);

function fmt12(h: number): string {
  if (h === 0)  return "12:00 AM";
  if (h < 12)   return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}

export default function ScheduleForm() {
  const router = useRouter();
  const today = todayIST();

  // Single vs range mode
  const [rangeMode,    setRangeMode]    = useState(false);
  const [startDate,    setStartDate]    = useState(today);
  const [endDate,      setEndDate]      = useState(addDays(today, 1));
  const [type,         setType]         = useState<OverrideType>("closed");
  const [openHour,     setOpenHour]     = useState(OPEN_HOUR);
  const [closeHour,    setCloseHour]    = useState(CLOSE_HOUR);
  const [note,         setNote]         = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!startDate) { setError("Please select a date."); return; }
    if (rangeMode && endDate < startDate) { setError("End date must be on or after start date."); return; }
    if (type !== "closed" && openHour >= closeHour) { setError("Open time must be before close time."); return; }

    const dates = rangeMode ? dateRange(startDate, endDate) : [startDate];
    if (dates.length > 90) { setError("Range too large — maximum 90 days at once."); return; }

    try {
      setLoading(true);
      // Upsert each date in the range
      for (const d of dates) {
        const result = await upsertScheduleOverride({
          date:       d,
          is_closed:  type === "closed",
          open_hour:  type === "closed" ? null : openHour,
          close_hour: type === "closed" ? null : closeHour,
          note:       note.trim() || null,
        });
        if (!result.success) {
          setError(`Failed to save ${d}: ${result.error}`);
          return;
        }
      }
      setSuccess(
        dates.length === 1
          ? `✅ Override saved for ${startDate}.`
          : `✅ ${dates.length} days saved (${startDate} → ${endDate}).`
      );
      setNote("");
      router.refresh();
    } catch (err) {
      console.error("[ScheduleForm]", err);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Single vs Range toggle */}
      <div className="flex items-center gap-3 bg-brand-bg rounded-xl p-3 border border-brand-wood/10">
        <button type="button"
          onClick={() => setRangeMode(false)}
          className={`flex-1 font-hind text-sm py-1.5 rounded-lg transition-colors
            ${!rangeMode ? "bg-brand-wood text-white shadow-sm" : "text-brand-muted hover:text-brand-body"}`}>
          📅 Single Date
        </button>
        <button type="button"
          onClick={() => setRangeMode(true)}
          className={`flex-1 font-hind text-sm py-1.5 rounded-lg transition-colors
            ${rangeMode ? "bg-brand-wood text-white shadow-sm" : "text-brand-muted hover:text-brand-body"}`}>
          📆 Date Range
        </button>
      </div>

      {/* Date input(s) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
            {rangeMode ? "From Date" : "Date"} <span className="text-brand-rust">*</span>
          </label>
          <input type="date" value={startDate} min={today}
            onChange={e => setStartDate(e.target.value)}
            className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                       font-hind text-sm text-brand-body bg-brand-bg
                       focus:outline-none focus:ring-2 focus:ring-brand-wood/30" />
        </div>
        {rangeMode && (
          <div>
            <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
              To Date <span className="text-brand-rust">*</span>
            </label>
            <input type="date" value={endDate} min={startDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                         font-hind text-sm text-brand-body bg-brand-bg
                         focus:outline-none focus:ring-2 focus:ring-brand-wood/30" />
          </div>
        )}
        {!rangeMode && (
          <div>
            <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
              Override Type <span className="text-brand-rust">*</span>
            </label>
            <select value={type} onChange={e => setType(e.target.value as OverrideType)}
              className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                         font-hind text-sm text-brand-body bg-brand-bg
                         focus:outline-none focus:ring-2 focus:ring-brand-wood/30">
              <option value="closed">🔴 Holiday / Full Day Off</option>
              <option value="early_close">🟠 Early Close</option>
              <option value="late_open">🟡 Late Open</option>
              <option value="custom">🔵 Custom Hours</option>
            </select>
          </div>
        )}
      </div>

      {/* Type selector for range mode (shown below dates) */}
      {rangeMode && (
        <div>
          <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
            Override Type <span className="text-brand-rust">*</span>
          </label>
          <select value={type} onChange={e => setType(e.target.value as OverrideType)}
            className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                       font-hind text-sm text-brand-body bg-brand-bg
                       focus:outline-none focus:ring-2 focus:ring-brand-wood/30">
            <option value="closed">🔴 Holiday / Full Day Off (all days in range)</option>
            <option value="early_close">🟠 Early Close (all days in range)</option>
            <option value="late_open">🟡 Late Open (all days in range)</option>
            <option value="custom">🔵 Custom Hours (all days in range)</option>
          </select>
        </div>
      )}

      {/* Range summary pill */}
      {rangeMode && startDate && endDate && endDate >= startDate && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="text-red-500 text-lg">🗓️</span>
          <p className="font-hind text-sm text-red-700 font-medium">
            {dateRange(startDate, endDate).length} day{dateRange(startDate, endDate).length !== 1 ? "s" : ""} will be marked as{" "}
            <strong>{type === "closed" ? "Closed" : "Custom Hours"}</strong>
            {" "}({startDate} → {endDate})
          </p>
        </div>
      )}

      {/* Hours — shown when not full day off */}
      {type !== "closed" && (
        <div className="grid grid-cols-2 gap-4 bg-brand-bg rounded-xl p-4 border border-brand-wood/10">
          <div>
            <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">Opens At</label>
            <select value={openHour} onChange={e => setOpenHour(Number(e.target.value))}
              className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                         font-hind text-sm text-brand-body bg-brand-card
                         focus:outline-none focus:ring-2 focus:ring-brand-wood/30">
              {HOUR_OPTIONS.map(h => (
                <option key={h} value={h}>{fmt12(h)}{h === OPEN_HOUR ? " (default)" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">Closes At</label>
            <select value={closeHour} onChange={e => setCloseHour(Number(e.target.value))}
              className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                         font-hind text-sm text-brand-body bg-brand-card
                         focus:outline-none focus:ring-2 focus:ring-brand-wood/30">
              {HOUR_OPTIONS.map(h => (
                <option key={h} value={h}>{fmt12(h)}{h === CLOSE_HOUR ? " (default)" : ""}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Note */}
      <div>
        <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
          Note (optional)
        </label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)}
          placeholder='e.g. "Diwali Holidays", "Renovation", "Staff training"'
          maxLength={100}
          className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                     font-hind text-sm text-brand-body bg-brand-bg
                     placeholder:text-brand-muted/40 focus:outline-none
                     focus:ring-2 focus:ring-brand-wood/30" />
      </div>

      {/* Feedback */}
      {error && (
        <p className="font-hind text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          ⚠️ {error}
        </p>
      )}
      {success && (
        <p className="font-hind text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {success}
        </p>
      )}

      <button type="submit" disabled={loading}
        className="w-full sm:w-auto bg-brand-wood hover:bg-brand-rust text-white
                   font-hind font-semibold px-8 py-2.5 rounded-xl shadow-sm
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {loading
          ? "Saving..."
          : rangeMode
            ? `Save ${startDate && endDate && endDate >= startDate ? dateRange(startDate, endDate).length : ""} Days`
            : "Save Override"
        }
      </button>
    </form>
  );
}
