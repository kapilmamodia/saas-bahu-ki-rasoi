"use client";
/**
 * MockPayButton — /order/confirmation
 *
 * Client Component — handles the mock "Confirm & Pay" button click.
 * Calls /api/mock-confirm to mark the order as "paid", then navigates
 * to the same page with a cache-busting param so the Server Component
 * re-fetches fresh data and shows "paid" status.
 *
 * REMOVE THIS FILE when real Stripe is integrated.
 */
import { useState } from "react";
import { ShoppingBag } from "lucide-react";

interface MockPayButtonProps {
  sessionId: string;
}

/** Simulates payment confirmation by calling the mock-confirm API route. */
export default function MockPayButton({ sessionId }: MockPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${window.location.origin}/api/mock-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const text = await res.text();
      let data: { success?: boolean; error?: string } = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Unexpected server response (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? `Server returned ${res.status}`);
      }

      // Navigate with cache-busting param — forces Server Component to re-fetch
      // fresh order status from Supabase instead of serving a cached response
      window.location.href = `${window.location.pathname}?session_id=${sessionId}&t=${Date.now()}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-card border border-brand-wood/25 rounded-xl p-5 shadow-sm">
      {/* Mock payment notice badge */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 text-center">
        <p className="font-caveat text-amber-700 text-lg">
          🧪 Mock Payment Mode — no real money charged
        </p>
        <p className="font-hind text-xs text-amber-600 mt-0.5">
          Click the button below to simulate a successful payment
        </p>
      </div>

      {/* Error message */}
      {error && (
        <p className="font-hind text-sm text-red-600 mb-3 text-center">{error}</p>
      )}

      {/* Confirm & Pay button */}
      <button
        onClick={handleConfirm}
        disabled={loading}
        aria-label="Confirm mock payment"
        className="w-full flex items-center justify-center gap-2 bg-brand-wood
                   hover:bg-brand-rust text-white font-hind font-semibold py-3
                   rounded-full shadow-md transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : (
          <ShoppingBag size={18} />
        )}
        {loading ? "Processing..." : "Confirm & Pay (Mock)"}
      </button>

      {/* Contact fallback */}
      <p className="font-hind text-xs text-brand-muted text-center mt-3">
        Questions? Call Rajeshwari{" "}
        <a href="tel:+91XXXXXXXXXX" className="text-brand-wood hover:text-brand-rust underline">
          +91 XXX-XXX-XXXX
        </a>
      </p>
    </div>
  );
}
