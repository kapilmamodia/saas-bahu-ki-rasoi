"use client";
/**
 * CancelOrderButton — admin order detail page.
 *
 * Calls the cancelOrder Server Action, then shows success/error feedback.
 * Shown for orders with status "paid" or "completed".
 * Cancellation sets status to "refunded" — manual Stripe refund may still be needed.
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

  /** Handle the cancel button click — confirm first, then call server action. */
  const handleCancel = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this order?\n\nThis will mark it as refunded. Remember to process the refund manually in Stripe if payment was collected."
      )
    )
      return;

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
      <div
        className="flex items-center gap-2 bg-red-50 border border-red-200
                    rounded-xl px-5 py-3 text-red-700 font-hind text-sm"
      >
        <XCircle size={16} />
        Order cancelled — please process refund in Stripe if needed.
      </div>
    );
  }

  return (
    <div>
      {/* Inline error message */}
      {error && <p className="font-hind text-sm text-red-600 mb-2">{error}</p>}

      {/* Cancel button — destructive style */}
      <button
        onClick={handleCancel}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-red-600
                   hover:bg-red-700 text-white font-hind font-semibold py-3
                   rounded-full shadow-md transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          /* Loading spinner */
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
    </div>
  );
}

