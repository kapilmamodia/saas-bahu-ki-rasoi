/**
 * app/admin/schedule/page.tsx — Kitchen Schedule management page.
 * Shows default hours, all upcoming overrides (holidays / early close / late open),
 * and lets admins add/edit/delete per-date overrides.
 */
import { getScheduleOverrides } from "@/lib/actions/scheduleActions";
import { OPEN_HOUR, CLOSE_HOUR } from "@/lib/kitchenHours";
import type { KitchenScheduleOverride } from "@/types";
import ScheduleForm from "./ScheduleForm";
import DeleteScheduleButton from "./DeleteScheduleButton";

export const dynamic = "force-dynamic";

/** Format hour number → 12-hr string */
function fmt12(h: number): string {
  if (h === 0)  return "12:00 AM";
  if (h < 12)   return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}

/** Format YYYY-MM-DD → "Wed, 28 May 2026" */
function fmtDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

/** Classify override type for display */
function overrideType(o: KitchenScheduleOverride): { label: string; color: string } {
  if (o.is_closed) return { label: "Holiday / Day Off", color: "text-red-600 bg-red-50 border-red-200" };
  if (o.open_hour  !== null && o.open_hour  > OPEN_HOUR)  return { label: "Late Open",    color: "text-amber-700 bg-amber-50 border-amber-200" };
  if (o.open_hour  !== null && o.open_hour  < OPEN_HOUR)  return { label: "Early Open",   color: "text-green-700 bg-green-50 border-green-200" };
  if (o.close_hour !== null && o.close_hour < CLOSE_HOUR) return { label: "Early Close",  color: "text-orange-700 bg-orange-50 border-orange-200" };
  if (o.close_hour !== null && o.close_hour > CLOSE_HOUR) return { label: "Extended Hours", color: "text-blue-700 bg-blue-50 border-blue-200" };
  return { label: "Custom Hours", color: "text-brand-muted bg-brand-bg border-brand-wood/20" };
}

export default async function AdminSchedulePage() {
  const overrides = await getScheduleOverrides();
  // Split into upcoming and past
  const today = new Date().toISOString().split("T")[0];
  const upcoming = overrides.filter(o => o.date >= today);
  const past     = overrides.filter(o => o.date <  today);

  return (
    <div className="max-w-3xl">
      <h1 className="font-yatra text-3xl text-brand-heading mb-2">Kitchen Schedule</h1>
      <hr className="divider-spice mb-8" />

      {/* ── Default schedule card ── */}
      <div className="bg-brand-card border border-brand-wood/25 rounded-2xl p-5 mb-8 shadow-sm">
        <h2 className="font-playfair text-lg text-brand-heading mb-4">⚙️ Default Schedule</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-brand-bg rounded-xl px-4 py-3">
            <p className="font-hind text-xs text-brand-muted uppercase tracking-wide mb-1">Operating Days</p>
            <p className="font-playfair text-brand-heading font-semibold">Mon – Sun</p>
            <p className="font-caveat text-brand-gold text-sm">All 7 days</p>
          </div>
          <div className="bg-brand-bg rounded-xl px-4 py-3">
            <p className="font-hind text-xs text-brand-muted uppercase tracking-wide mb-1">Opens At</p>
            <p className="font-playfair text-brand-heading font-semibold">{fmt12(OPEN_HOUR)}</p>
          </div>
          <div className="bg-brand-bg rounded-xl px-4 py-3">
            <p className="font-hind text-xs text-brand-muted uppercase tracking-wide mb-1">Closes At</p>
            <p className="font-playfair text-brand-heading font-semibold">{fmt12(CLOSE_HOUR)}</p>
          </div>
        </div>
        <p className="font-hind text-xs text-brand-muted mt-3 text-center">
          To change default hours, edit <code className="bg-brand-bg px-1 rounded text-brand-wood font-mono">lib/kitchenHours.ts</code>
        </p>
      </div>

      {/* ── Add override form ── */}
      <div className="bg-brand-card border border-brand-wood/25 rounded-2xl p-5 mb-8 shadow-sm">
        <h2 className="font-playfair text-lg text-brand-heading mb-1">➕ Add Schedule Override</h2>
        <p className="font-hind text-xs text-brand-muted mb-5">
          Set a holiday, day off, early close, late open, or custom hours for a specific date.
        </p>
        <ScheduleForm />
      </div>

      {/* ── Upcoming overrides ── */}
      <div className="mb-8">
        <h2 className="font-playfair text-lg text-brand-heading mb-4">
          📅 Upcoming Overrides
          {upcoming.length > 0 && (
            <span className="ml-2 font-hind text-sm font-normal text-brand-muted">({upcoming.length})</span>
          )}
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-brand-card border border-brand-wood/15 rounded-2xl px-5 py-8 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="font-hind text-brand-muted">No upcoming overrides — kitchen running on default schedule.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map(o => {
              const { label, color } = overrideType(o);
              return (
                <div key={o.id} className={`border rounded-2xl p-4 flex items-start justify-between gap-4 ${color}`}>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-playfair font-semibold text-base">{fmtDate(o.date)}</p>
                      <span className={`font-caveat text-xs px-2 py-0.5 rounded-full border ${color}`}>{label}</span>
                    </div>
                    {o.is_closed ? (
                      <p className="font-hind text-sm">🔴 Fully Closed</p>
                    ) : (
                      <p className="font-hind text-sm">
                        🕙 {fmt12(o.open_hour ?? OPEN_HOUR)} – {fmt12(o.close_hour ?? CLOSE_HOUR)}
                      </p>
                    )}
                    {o.note && <p className="font-caveat text-sm mt-1">📝 {o.note}</p>}
                  </div>
                  <DeleteScheduleButton id={o.id} date={o.date} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Past overrides (collapsed) ── */}
      {past.length > 0 && (
        <div>
          <h2 className="font-playfair text-base text-brand-muted mb-3">🗂️ Past Overrides ({past.length})</h2>
          <div className="flex flex-col gap-2">
            {past.slice(0, 10).map(o => {
              const { label, color } = overrideType(o);
              return (
                <div key={o.id} className="border border-brand-wood/10 rounded-xl px-4 py-3 flex items-center justify-between gap-3 opacity-60">
                  <div className="flex items-center gap-3">
                    <p className="font-hind text-sm text-brand-muted">{fmtDate(o.date)}</p>
                    <span className={`font-caveat text-xs px-2 py-0.5 rounded-full border ${color}`}>{label}</span>
                    {o.note && <p className="font-caveat text-xs text-brand-muted">· {o.note}</p>}
                  </div>
                  <DeleteScheduleButton id={o.id} date={o.date} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

