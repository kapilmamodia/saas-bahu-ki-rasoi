"use client";
/**
 * CouponPopup — Style B
 * A slide-in popup from bottom-right that appears after 2 seconds.
 * Shows the first available coupon with a "Copy Code" button.
 * Dismissable with ×.
 */
import { useState, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";
import type { Coupon } from "@/types";

interface CouponPopupProps {
  coupons: Coupon[];
}

/** Format discount label */
function discountLabel(c: Coupon): string {
  return c.type === "percent"
    ? `${c.value}% off`
    : `₹${(c.value / 100).toLocaleString("en-IN")} off`;
}

/**
 * Slides in after 2s delay, shows first coupon, lets user copy the code.
 * Dismissed state is stored in sessionStorage so it doesn't re-appear on same visit.
 */
export default function CouponPopup({ coupons }: CouponPopupProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const coupon = coupons[0]; // Show the first active coupon

  useEffect(() => {
    if (!coupon) return;
    // Don't show again if dismissed this session
    if (sessionStorage.getItem("coupon-popup-dismissed")) return;
    // Slide in after 2 seconds
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, [coupon]);

  if (!coupon || !visible) return null;

  /** Copy code to clipboard */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /** Dismiss and remember */
  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("coupon-popup-dismissed", "1");
  };

  return (
    /* Fixed bottom-right, above everything */
    <div className="fixed bottom-6 right-4 z-50 w-72 animate-slide-up">
      {/* Card */}
      <div className="bg-brand-card border-2 border-brand-gold/50 rounded-2xl shadow-2xl overflow-hidden">

        {/* Top accent strip */}
        <div className="bg-gradient-to-r from-brand-wood to-brand-rust px-4 py-2
                        flex items-center justify-between">
          <span className="font-caveat text-white text-lg">🎟️ Special Offer!</span>
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss offer"
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          {/* Offer headline */}
          <p className="font-playfair text-brand-heading text-lg font-semibold leading-tight mb-1">
            {coupon.description ||
              `Get ${discountLabel(coupon)} on your order!`}
          </p>
          {/* Min order */}
          {coupon.min_order_cents > 0 && (
            <p className="font-hind text-xs text-brand-muted mb-3">
              Min. order ₹{(coupon.min_order_cents / 100).toLocaleString("en-IN")}
            </p>
          )}

          {/* Code + copy */}
          <div className="flex items-center gap-2 mt-2">
            {/* Code display */}
            <div className="flex-1 bg-brand-bg border-2 border-dashed border-brand-gold
                            rounded-xl px-3 py-2 text-center">
              <span className="font-caveat text-2xl text-brand-wood tracking-widest select-all">
                {coupon.code}
              </span>
            </div>
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-brand-wood hover:bg-brand-rust
                         text-white font-hind text-xs font-semibold px-3 py-2 rounded-xl
                         transition-colors shrink-0"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Validity note */}
          <p className="font-hind text-xs text-brand-muted text-center mt-2">
            Valid till {new Date(coupon.valid_until).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

