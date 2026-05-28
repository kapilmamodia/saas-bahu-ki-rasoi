"use client";
/**
 * MarkCompletedButton — admin order detail page.
 *
 * Calls the markOrderCompleted Server Action, then shows success/error feedback.
 * Uses a custom in-page confirm modal instead of window.confirm() so it works
 * reliably on all mobile browsers and PWA/standalone mode.
 */
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { markOrderCompleted } from "@/lib/actions/orderActions";

interface MarkCompletedButtonProps {
  orderId: string;
}

/** Button that marks a paid order as completed and sends the customer a notification email. */
export default function MarkCompletedButton({ orderId }: MarkCompletedButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  // Controls visibility of the custom confirm modal
  const [showConfirm, setShowConfirm] = useState(false);

  /** Called when user taps "Confirm" inside the modal */
  const handleConfirmed = async () => {
    setShowConfirm(false);
    try {
      setLoading(true);
      setError(null);

      const result = await markOrderCompleted(orderId);
      console.log("[MarkCompletedButton] result:", result);

      if (result.error) {
        setError(result.error);
        return;
      }

      setDone(true);
      // Hard reload — bypasses Next.js cache so updated status shows immediately
      window.location.reload();
    } catch (err) {
      console.error("[MarkCompletedButton] error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200
                      rounded-xl px-5 py-3 text-green-700 font-hind text-sm">
        <CheckCircle size={16} />
        Order marked as completed — customer notified by email ✅
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="font-hind text-sm text-red-600 mb-2">{error}</p>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-green-700
                   hover:bg-green-800 text-white font-hind font-semibold py-3
                   rounded-full shadow-md transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : (
          <CheckCircle size={18} />
        )}
        {loading ? "Processing..." : "Mark as Completed & Notify Customer"}
      </button>
      <p className="font-caveat text-brand-muted text-sm text-center mt-2">
        This will send a completion email to the customer
      </p>

      {/* ── Custom confirm modal ──────────────────────────────────────── */}
      {showConfirm && (
        /* Full-screen backdrop */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          {/* Modal card */}
          <div className="bg-brand-card border border-brand-wood/30 rounded-2xl shadow-xl
                          w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-green-600 shrink-0" />
              <h2 className="font-playfair text-lg text-brand-heading">Mark as Completed?</h2>
            </div>
            <p className="font-hind text-sm text-brand-body">
              This will mark the order as <strong>completed</strong> and send a
              notification email to the customer.
            </p>
            {/* Action buttons */}
            <div className="flex gap-3 mt-1">
              {/* Cancel — dismiss modal */}
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-brand-wood/40
                           font-hind text-sm text-brand-body hover:bg-brand-bg transition-colors"
              >
                Go Back
              </button>
              {/* Confirm — proceed */}
              <button
                onClick={handleConfirmed}
                className="flex-1 py-2.5 rounded-full bg-green-700 hover:bg-green-800
                           text-white font-hind font-semibold text-sm transition-colors"
              >
                Yes, Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
