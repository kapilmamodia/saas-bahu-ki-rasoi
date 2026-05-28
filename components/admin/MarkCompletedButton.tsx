"use client";
/**
 * MarkCompletedButton — admin order detail page.
 *
 * Calls the markOrderCompleted Server Action, then shows success/error feedback.
 * Only shown for orders with status "paid".
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

  const handleComplete = async () => {
    if (!confirm("Mark this order as completed and notify the customer by email?")) return;
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
      <button
        onClick={handleComplete}
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
    </div>
  );
}

