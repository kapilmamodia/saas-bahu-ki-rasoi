"use client";
/**
 * DefaultScheduleForm — lets admins update the default kitchen open/close hours.
 * Renders inside the Default Schedule card on the admin schedule page.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDefaultSchedule } from "@/lib/actions/scheduleActions";

interface DefaultScheduleFormProps {
  /** Current default open hour (0-23) from DB */
  currentOpenHour: number;
  /** Current default close hour (0-23) from DB */
  currentCloseHour: number;
}

/** Hours available in the selector: 5 AM to midnight */
const HOUR_OPTIONS = Array.from({ length: 19 }, (_, i) => i + 5);

/** Format integer hour to human-readable 12-hr string */
function fmt12(h: number): string {
  if (h === 0)  return "12:00 AM";
  if (h < 12)   return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}

/**
 * Inline edit form for the default kitchen open and close hours.
 * Calls updateDefaultSchedule server action on save.
 */
export default function DefaultScheduleForm({ currentOpenHour, currentCloseHour }: DefaultScheduleFormProps) {
  const router = useRouter();
  const [editing,    setEditing]    = useState(false);
  const [openHour,   setOpenHour]   = useState(currentOpenHour);
  const [closeHour,  setCloseHour]  = useState(currentCloseHour);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState<string | null>(null);

  /** Submit updated default hours */
  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    if (openHour >= closeHour) {
      setError("Open time must be before close time.");
      return;
    }
    try {
      setLoading(true);
      const result = await updateDefaultSchedule(openHour, closeHour);
      if (!result.success) {
        setError(result.error ?? "Failed to save.");
        return;
      }
      setSuccess("✅ Default schedule updated!");
      setEditing(false);
      router.refresh(); // re-fetch page so schedule page reflects new values
    } catch (err) {
      console.error("[DefaultScheduleForm]", err);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to current saved values
    setOpenHour(currentOpenHour);
    setCloseHour(currentCloseHour);
    setError(null);
    setSuccess(null);
    setEditing(false);
  };

  if (!editing) {
    // Read-only view with Edit button
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {/* Operating days — always Mon-Sun */}
          <div className="bg-brand-bg rounded-xl px-4 py-3">
            <p className="font-hind text-xs text-brand-muted uppercase tracking-wide mb-1">Operating Days</p>
            <p className="font-playfair text-brand-heading font-semibold">Mon – Sun</p>
            <p className="font-caveat text-brand-gold text-sm">All 7 days</p>
          </div>
          {/* Opens At */}
          <div className="bg-brand-bg rounded-xl px-4 py-3">
            <p className="font-hind text-xs text-brand-muted uppercase tracking-wide mb-1">Opens At</p>
            <p className="font-playfair text-brand-heading font-semibold">{fmt12(currentOpenHour)}</p>
          </div>
          {/* Closes At */}
          <div className="bg-brand-bg rounded-xl px-4 py-3">
            <p className="font-hind text-xs text-brand-muted uppercase tracking-wide mb-1">Closes At</p>
            <p className="font-playfair text-brand-heading font-semibold">{fmt12(currentCloseHour)}</p>
          </div>
        </div>

        {/* Success message after save */}
        {success && (
          <p className="font-hind text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-3">
            {success}
          </p>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setEditing(true)}
            className="font-hind text-sm bg-brand-wood hover:bg-brand-rust text-white
                       px-5 py-2 rounded-xl shadow-sm transition-colors">
            ✏️ Edit Default Hours
          </button>
        </div>
      </div>
    );
  }

  // Edit mode — show selects for open and close hour
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 bg-brand-bg rounded-xl p-4 border border-brand-wood/10">
        {/* Open hour selector */}
        <div>
          <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
            Default Opens At
          </label>
          <select
            value={openHour}
            onChange={e => setOpenHour(Number(e.target.value))}
            className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                       font-hind text-sm text-brand-body bg-brand-card
                       focus:outline-none focus:ring-2 focus:ring-brand-wood/30">
            {HOUR_OPTIONS.map(h => (
              <option key={h} value={h}>{fmt12(h)}</option>
            ))}
          </select>
        </div>
        {/* Close hour selector */}
        <div>
          <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
            Default Closes At
          </label>
          <select
            value={closeHour}
            onChange={e => setCloseHour(Number(e.target.value))}
            className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                       font-hind text-sm text-brand-body bg-brand-card
                       focus:outline-none focus:ring-2 focus:ring-brand-wood/30">
            {HOUR_OPTIONS.map(h => (
              <option key={h} value={h}>{fmt12(h)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Validation error */}
      {error && (
        <p className="font-hind text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          ⚠️ {error}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="font-hind text-sm bg-brand-wood hover:bg-brand-rust text-white
                     px-6 py-2 rounded-xl shadow-sm transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="font-hind text-sm text-brand-muted hover:text-brand-rust transition-colors px-3 py-2">
          Cancel
        </button>
      </div>
    </div>
  );
}

