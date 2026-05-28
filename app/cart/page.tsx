"use client";
// Cart page — shows items in the cart with quantity controls and order totals.
// Posts to /api/checkout which creates a pending order and redirects to confirmation.
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

/**
 * Tax rate — read from env; defaults to 18% (GST) if not set.
 * Note: process.env.TAX_RATE is server-side only, so we use a constant here.
 * When Phase 3 (checkout) is wired, the server will compute the final tax.
 */
const TAX_RATE = 0.18;

/** Format paise to rupees string — e.g. 32000 → "₹320.00" */
function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Cart page component */
export default function CartPage() {
  const { items, updateQuantity, removeItem, totalCents, clearCart } = useCart();
  const router = useRouter();

  // Customer info for the order
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  /** POST to /api/checkout and redirect to the confirmation page */
  const handleCheckout = async () => {
    if (!customerEmail.trim()) {
      setCheckoutError("Please enter your email address.");
      return;
    }
    try {
      setCheckoutLoading(true);
      setCheckoutError(null);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customerEmail, customerName }),
      });

      const data: { url?: string; path?: string; error?: string } = await res.json();

      if (!res.ok || !data.path) {
        throw new Error(data.error ?? "Checkout failed");
      }

      // Clear the cart then navigate using the RELATIVE path.
      // router.push() in Next.js App Router must receive a relative path for
      // same-origin navigation — passing an absolute URL can silently fail on Vercel.
      clearCart();
      router.push(data.path);
    } catch (err) {
      setCheckoutError("Something went wrong. Please try again.");
      console.error("[CartPage] checkout error:", err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Compute tax and grand total from cart subtotal
  const taxCents = Math.round(totalCents * TAX_RATE);
  const grandTotalCents = totalCents + taxCents;

  // ── Empty cart state ─────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h1 className="font-playfair text-2xl md:text-3xl text-brand-heading mb-3">
          Your cart is empty
        </h1>
        <p className="font-hind text-brand-muted mb-8">
          Explore the menu and add something delicious — ghar ka khana awaits!
        </p>
        <Link
          href="/menu"
          className="bg-brand-wood hover:bg-brand-rust text-white font-hind
                     font-semibold px-8 py-3 rounded-full shadow-md transition-colors"
        >
          Browse Menu 🍛
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-10">
      {/* Page heading */}
      <h1 className="font-yatra text-3xl md:text-4xl text-brand-heading mb-2">
        Your Cart
      </h1>
      <hr className="divider-spice mb-8" />

      {/* ── Cart item list ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mb-8">
        {items.map(({ menuItem, quantity }) => (
          <div
            key={menuItem.id}
            // Cream card with warm brown border
            className="bg-brand-card border border-brand-wood/25 rounded-xl p-4
                       flex items-center gap-4 shadow-sm"
          >
            {/* Thumbnail photo */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-brand-bg">
              {menuItem.photo_url ? (
                <Image
                  src={menuItem.photo_url}
                  alt={menuItem.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🍛
                </div>
              )}
            </div>

            {/* Name and unit price */}
            <div className="flex-1 min-w-0">
              <p className="font-playfair text-base text-brand-heading truncate">
                {menuItem.name}
              </p>
              <p className="font-hind text-sm text-brand-muted">
                {formatPrice(menuItem.price_cents)} each
              </p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                aria-label={`Decrease quantity of ${menuItem.name}`}
                className="w-7 h-7 rounded-full border border-brand-wood/40
                           flex items-center justify-center hover:bg-brand-wood/10
                           transition-colors text-brand-wood"
              >
                <Minus size={13} />
              </button>
              <span className="font-hind font-semibold w-6 text-center text-brand-heading">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                aria-label={`Increase quantity of ${menuItem.name}`}
                className="w-7 h-7 rounded-full border border-brand-wood/40
                           flex items-center justify-center hover:bg-brand-wood/10
                           transition-colors text-brand-wood"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Line total */}
            <span className="font-hind font-semibold text-brand-gold w-20 text-right flex-shrink-0">
              {formatPrice(menuItem.price_cents * quantity)}
            </span>

            {/* Remove button */}
            <button
              onClick={() => removeItem(menuItem.id)}
              aria-label={`Remove ${menuItem.name} from cart`}
              className="text-brand-muted hover:text-brand-rust transition-colors flex-shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Order summary ──────────────────────────────────────────────── */}
      <div className="bg-brand-card border border-brand-wood/25 rounded-xl p-6 shadow-sm">
        {/* Subtotal row */}
        <div className="flex justify-between font-hind text-brand-body mb-2">
          <span>Subtotal</span>
          <span>{formatPrice(totalCents)}</span>
        </div>
        {/* Tax row */}
        <div className="flex justify-between font-hind text-brand-muted text-sm mb-4">
          <span>GST ({(TAX_RATE * 100).toFixed(0)}%)</span>
          <span>{formatPrice(taxCents)}</span>
        </div>

        <hr className="divider-spice mb-4" />

        {/* Grand total row */}
        <div className="flex justify-between font-playfair text-xl text-brand-heading font-semibold mb-6">
          <span>Total</span>
          <span className="text-brand-gold">{formatPrice(grandTotalCents)}</span>
        </div>

        {/* ── Customer info fields ──────────────────────────────────── */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Name field */}
          <div>
            <label htmlFor="customer-name" className="font-hind text-sm text-brand-muted block mb-1">
              Your Name
            </label>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full border border-brand-wood/30 rounded-lg px-3 py-2
                         font-hind text-brand-body bg-brand-bg placeholder:text-brand-muted/60
                         focus:outline-none focus:ring-2 focus:ring-brand-wood/40"
            />
          </div>
          {/* Email field */}
          <div>
            <label htmlFor="customer-email" className="font-hind text-sm text-brand-muted block mb-1">
              Email Address <span className="text-brand-rust">*</span>
            </label>
            <input
              id="customer-email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="e.g. priya@example.com"
              className="w-full border border-brand-wood/30 rounded-lg px-3 py-2
                         font-hind text-brand-body bg-brand-bg placeholder:text-brand-muted/60
                         focus:outline-none focus:ring-2 focus:ring-brand-wood/40"
            />
          </div>
        </div>

        {/* Error message */}
        {checkoutError && (
          <p className="font-hind text-sm text-red-600 mb-3">{checkoutError}</p>
        )}

        {/* Proceed to Payment button */}
        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          aria-label="Proceed to payment"
          className="w-full flex items-center justify-center gap-2 bg-brand-wood
                     hover:bg-brand-rust text-white font-hind font-semibold py-3
                     rounded-full shadow-md transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checkoutLoading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <ShoppingBag size={18} />
          )}
          {checkoutLoading ? "Processing..." : "Proceed to Payment"}
        </button>

        <p className="text-center font-caveat text-brand-muted text-sm mt-3">
          🧪 Mock payment mode — no real charges
        </p>
      </div>

      {/* Continue shopping link */}
      <div className="text-center mt-6">
        <Link
          href="/menu"
          className="font-hind text-brand-wood hover:text-brand-rust underline
                     underline-offset-4 transition-colors text-sm"
        >
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}

