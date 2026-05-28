"use client";
/**
 * CancelOrderButton — admin order detail page.
 *
 * Calls the cancelOrder Server Action, then shows success/error feedback.
 * Uses a custom in-page confirm modal instead of window.confirm() so it works
 * reliably on all mobile browsers and PWA/standalone mode.
 */
import { useState } from "react";
import { XCircle } from "lucide-react";
import { cancelOrder } from "@/lib/actions/orderActions";

interface CancelOrderButtonProps {
  orderId: string;
}

/** Button that cancels a paid/completed order and marks it as refunded. */
export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
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

      const result = await cancelOrder(orderId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setDone(true);
      // Hard reload so the updated status badge shows immediately
      window.location.reload();
    } catch (err) {
      console.error("[CancelOrderButton] error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Show success state briefly before reload
  if (done) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200
                      rounded-xl px-5 py-3 text-red-700 font-hind text-sm">
        <XCircle size={16} />
        Order cancelled — please process refund in Stripe if needed.
      </div>
    );
  }

  return (
    <div>
      {/* Inline error message */}
      {error && <p className="font-hind text-sm text-red-600 mb-2">{error}</p>}

      {/* Trigger button — destructive style */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-red-600
                   hover:bg-red-700 text-white font-hind font-semibold py-3
                   rounded-full shadow-md transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : (
          <XCircle size={18} />
        )}
        {loading ? "Cancelling..." : "Cancel Order"}
      </button>

      {/* Reminder note for admin */}
      <p className="font-caveat text-brand-muted text-sm text-center mt-2">
        ⚠️ Remember to issue a refund in Stripe manually
      </p>

      {/* ── Custom confirm modal ──────────────────────────────────────── */}
      {showConfirm && (
        /* Full-screen backdrop */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          {/* Modal card */}
          <div className="bg-brand-card border border-brand-wood/30 rounded-2xl shadow-xl
                          w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <XCircle size={24} className="text-red-600 shrink-0" />
              <h2 className="font-playfair text-lg text-brand-heading">Cancel this Order?</h2>
            </div>
            <p className="font-hind text-sm text-brand-body">
              This will mark the order as <strong>cancelled / refunded</strong>.
              Remember to process the refund manually in Stripe if payment was collected.
            </p>
            {/* Action buttons */}
            <div className="flex gap-3 mt-1">
              {/* Dismiss modal */}
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-brand-wood/40
                           font-hind text-sm text-brand-body hover:bg-brand-bg transition-colors"
              >
                Go Back
              </button>
              {/* Confirm cancellation */}
              <button
                onClick={handleConfirmed}
                className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-700
                           text-white font-hind font-semibold text-sm transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
