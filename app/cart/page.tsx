"use client";
// Cart page — redesigned with two-column layout: items list (left) + sticky summary panel (right).
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X, MapPin, PackageCheck, ChevronRight, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { validateCoupon } from "@/lib/actions/couponActions";
import type { CouponValidationResult } from "@/types";

const TAX_RATE = 0.18;

/** Format paise to rupees string */
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

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponResult, setCouponResult] = useState<CouponValidationResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  /** Apply coupon — calls validateCoupon server action */
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      setCouponLoading(true);
      setCouponResult(null);
      const result = await validateCoupon(couponInput.trim(), totalCents);
      setCouponResult(result);
    } catch (err) {
      console.error("[CartPage] coupon error:", err);
      setCouponResult({ valid: false, error: "Could not validate coupon." });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInput("");
    setCouponResult(null);
  };

  /** POST to /api/checkout and redirect */
  const handleCheckout = async () => {
    if (!customerEmail.trim()) {
      setCheckoutError("Please enter your email address.");
      return;
    }
    if (deliveryType === "delivery" && !deliveryAddress.trim()) {
      setCheckoutError("Please enter your delivery address.");
      return;
    }
    try {
      setCheckoutLoading(true);
      setCheckoutError(null);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerEmail,
          customerName,
          customerPhone: customerPhone.trim() || null,
          couponCode: couponResult?.valid ? couponResult.coupon?.code : undefined,
          deliveryType,
          deliveryAddress: deliveryType === "delivery" ? deliveryAddress.trim() : null,
        }),
      });
      const data: { url?: string; path?: string; error?: string } = await res.json();
      if (!res.ok || !data.path) throw new Error(data.error ?? "Checkout failed");
      clearCart();
      router.push(data.path);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setCheckoutError(msg);
      console.error("[CartPage] checkout error:", err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const discountCents = couponResult?.valid ? (couponResult.discountCents ?? 0) : 0;
  const discountedSubtotal = totalCents - discountCents;
  const taxCents = Math.round(discountedSubtotal * TAX_RATE);
  const grandTotalCents = discountedSubtotal + taxCents;

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center"
        style={{ background: "linear-gradient(160deg,#FDF6E3 0%,#F5EDD6 100%)" }}>
        {/* Decorative ring */}
        <div className="w-32 h-32 rounded-full flex items-center justify-center mb-6 border-4 border-dashed border-brand-wood/20"
          style={{ background: "radial-gradient(circle,#FDF6E3,#F5EDD6)" }}>
          <UtensilsCrossed size={48} className="text-brand-wood/30" />
        </div>
        <p className="font-caveat text-brand-rust text-xl mb-1">Arey, khaali hai! 🙈</p>
        <h1 className="font-yatra text-3xl text-brand-heading mb-3">Your cart is empty</h1>
        <p className="font-hind text-brand-muted mb-8 max-w-xs">
          Explore the menu and add something delicious — ghar ka khana awaits!
        </p>
        <Link href="/menu"
          className="inline-flex items-center gap-2 bg-brand-wood hover:bg-brand-rust
                     text-white font-hind font-semibold px-8 py-3 rounded-full shadow-md transition-colors">
          Browse Menu <ChevronRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#FDF6E3 0%,#F5EDD6 100%)" }}>

      {/* ── Decorative header banner ───────────────────────────────────────── */}
      <div className="relative overflow-hidden py-8 px-4 text-center"
        style={{ background: "linear-gradient(135deg,#3B1F0C 0%,#7B4A1E 100%)" }}>
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(#D4A017 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative">
          <p className="font-caveat text-brand-gold text-lg mb-1">🛒 Review your order</p>
          <h1 className="font-yatra text-3xl md:text-4xl text-white">Your Cart</h1>
          <p className="font-hind text-white/50 text-sm mt-1">{items.length} item{items.length !== 1 ? "s" : ""} · {formatPrice(totalCents)}</p>
        </div>
      </div>

      {/* ── Main layout: items left, summary right ──────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* ── LEFT: Cart items ──────────────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Item count badge — shown when list is long enough to scroll */}
          {items.length > 3 && (
            <p className="font-caveat text-brand-muted text-sm text-right">
              {items.length} items in your cart 🛒
            </p>
          )}
          {/* Scrollable item list — capped at ~4 visible items on desktop, full height on mobile */}
          <div className="relative">
            <div className="flex flex-col gap-3 lg:max-h-[30rem] lg:overflow-y-auto cart-scroll lg:pr-0.5">
            {items.map(({ menuItem, quantity }, index) => (
            <div key={menuItem.id}
              className="group bg-white border border-brand-wood/15 rounded-2xl p-4
                         flex items-center gap-4 shadow-sm hover:shadow-md hover:border-brand-wood/30
                         transition-all duration-200">
              {/* Index badge */}
              <span className="hidden sm:flex w-6 h-6 rounded-full bg-brand-bg border border-brand-wood/20
                               items-center justify-center font-caveat text-xs text-brand-muted flex-shrink-0">
                {index + 1}
              </span>

              {/* Thumbnail */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-brand-bg">
                {menuItem.photo_url ? (
                  <Image src={menuItem.photo_url} alt={menuItem.name} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🍛</div>
                )}
              </div>

              {/* Name + price */}
              <div className="flex-1 min-w-0">
                <p className="font-playfair text-base text-brand-heading font-semibold truncate">{menuItem.name}</p>
                <p className="font-hind text-xs text-brand-muted mt-0.5">{formatPrice(menuItem.price_cents)} each</p>
                {/* Line total on mobile */}
                <p className="font-hind text-sm font-semibold text-brand-gold mt-1 sm:hidden">
                  {formatPrice(menuItem.price_cents * quantity)}
                </p>
              </div>

              {/* Qty controls */}
              <div className="flex items-center gap-1 flex-shrink-0 bg-brand-bg rounded-full px-2 py-1 border border-brand-wood/15">
                <button onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                  aria-label={`Decrease ${menuItem.name}`}
                  className="w-7 h-7 rounded-full flex items-center justify-center
                             hover:bg-brand-wood/15 transition-colors text-brand-wood">
                  <Minus size={12} />
                </button>
                <span className="font-hind font-bold w-6 text-center text-brand-heading text-sm">{quantity}</span>
                <button onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                  aria-label={`Increase ${menuItem.name}`}
                  className="w-7 h-7 rounded-full flex items-center justify-center
                             hover:bg-brand-wood/15 transition-colors text-brand-wood">
                  <Plus size={12} />
                </button>
              </div>

              {/* Line total desktop */}
              <span className="hidden sm:block font-hind font-bold text-brand-gold w-24 text-right flex-shrink-0">
                {formatPrice(menuItem.price_cents * quantity)}
              </span>

              {/* Remove */}
              <button onClick={() => removeItem(menuItem.id)} aria-label={`Remove ${menuItem.name}`}
                className="text-brand-muted/40 hover:text-brand-rust transition-colors flex-shrink-0
                           opacity-0 group-hover:opacity-100">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
            </div>
            {/* Fade hint at bottom — only visible on desktop when items overflow */}
            {items.length > 3 && (
              <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-10 pointer-events-none rounded-b-2xl"
                style={{ background: "linear-gradient(to bottom, transparent, #F5EDD6)" }} />
            )}
          </div>

          {/* Continue shopping */}
          <Link href="/menu"
            className="inline-flex items-center gap-1.5 font-hind text-sm text-brand-wood
                       hover:text-brand-rust underline underline-offset-4 transition-colors mt-2">
            ← Continue Shopping
          </Link>

          {/* ── Delivery / Pickup selector ──────────────────────────────── */}
          <div className="bg-white border border-brand-wood/15 rounded-2xl shadow-sm overflow-hidden mt-2">
            <div className="px-5 py-3 border-b border-brand-wood/10"
              style={{ background: "linear-gradient(135deg,rgba(123,74,30,0.06),rgba(212,160,23,0.04))" }}>
              <h3 className="font-playfair text-base text-brand-heading font-semibold">How would you like your order?</h3>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button type="button" onClick={() => setDeliveryType("pickup")}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 transition-all
                              font-hind font-semibold text-sm
                              ${deliveryType === "pickup"
                                ? "bg-brand-wood border-brand-wood text-white shadow-md"
                                : "bg-brand-bg border-brand-wood/20 text-brand-body hover:border-brand-wood/50"}`}>
                  <PackageCheck size={18} />
                  Self Pickup
                </button>
                <button type="button" onClick={() => setDeliveryType("delivery")}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 transition-all
                              font-hind font-semibold text-sm
                              ${deliveryType === "delivery"
                                ? "bg-brand-wood border-brand-wood text-white shadow-md"
                                : "bg-brand-bg border-brand-wood/20 text-brand-body hover:border-brand-wood/50"}`}>
                  <MapPin size={18} />
                  Home Delivery
                </button>
              </div>

              {deliveryType === "pickup" && (
                <p className="font-caveat text-brand-muted text-sm text-center">
                  📍 Collect from our kitchen — we&apos;ll ping you when ready!
                </p>
              )}

              {deliveryType === "delivery" && (
                <div>
                  <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1.5">
                    Delivery Address <span className="text-brand-rust normal-case">*</span>
                  </label>
                  <textarea rows={2} value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House no., Street, Area, City — Pincode"
                    className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                               font-hind text-sm text-brand-body bg-brand-bg resize-none
                               placeholder:text-brand-muted/50 focus:outline-none
                               focus:ring-2 focus:ring-brand-wood/30" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Order summary panel ─────────────────────────────────── */}
        <div className="lg:col-span-2 lg:sticky lg:top-6">
          <div className="bg-white border border-brand-wood/15 rounded-2xl shadow-md overflow-hidden">

            {/* Panel header */}
            <div className="px-6 py-4 border-b border-brand-wood/10"
              style={{ background: "linear-gradient(135deg,rgba(123,74,30,0.06),rgba(212,160,23,0.04))" }}>
              <h2 className="font-playfair text-lg text-brand-heading font-semibold">Order Summary</h2>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">

              {/* Price breakdown */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-hind text-sm text-brand-body">
                  <span>Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                  <span>{formatPrice(totalCents)}</span>
                </div>

                {discountCents > 0 && (
                  <div className="flex justify-between font-hind text-sm text-brand-sage font-medium">
                    <span>Discount</span>
                    <span>− {formatPrice(discountCents)}</span>
                  </div>
                )}

                <div className="flex justify-between font-hind text-xs text-brand-muted">
                  <span>GST ({(TAX_RATE * 100).toFixed(0)}%)</span>
                  <span>{formatPrice(taxCents)}</span>
                </div>

                <hr className="border-dashed border-brand-wood/15 my-1" />

                <div className="flex justify-between font-playfair text-xl font-bold text-brand-heading">
                  <span>Total</span>
                  <span className="text-brand-gold">{formatPrice(grandTotalCents)}</span>
                </div>
              </div>

              {/* ── Coupon ──────────────────────────────────────────────── */}
              {!couponResult?.valid ? (
                <div className="flex gap-2">
                  <input type="text" value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Coupon code"
                    className="flex-1 border border-brand-wood/25 rounded-xl px-3 py-2
                               font-hind text-sm text-brand-body bg-brand-bg
                               placeholder:text-brand-muted/50 focus:outline-none
                               focus:ring-2 focus:ring-brand-wood/30" />
                  <button onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="flex items-center gap-1 bg-brand-wood hover:bg-brand-rust
                               text-white font-hind text-sm px-4 py-2 rounded-xl
                               transition-colors disabled:opacity-50">
                    {couponLoading
                      ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      : <Tag size={13} />}
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-brand-sage/10
                                border border-brand-sage/30 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag size={13} className="text-brand-sage" />
                    <span className="font-caveat text-base text-brand-sage font-semibold">
                      {couponResult.coupon?.code}
                    </span>
                    <span className="font-hind text-xs text-brand-sage">
                      ({couponResult.coupon?.type === "percent"
                        ? `${couponResult.coupon.value}% off`
                        : `₹${(couponResult.coupon!.value / 100).toLocaleString("en-IN")} off`})
                    </span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-brand-muted hover:text-brand-rust transition-colors">
                    <X size={13} />
                  </button>
                </div>
              )}

              {couponResult && !couponResult.valid && (
                <p className="font-hind text-xs text-red-500 -mt-2">{couponResult.error}</p>
              )}


              {/* ── Customer info ───────────────────────────────────────── */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
                    Your Name
                  </label>
                  <input type="text" value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                               font-hind text-sm text-brand-body bg-brand-bg
                               placeholder:text-brand-muted/50 focus:outline-none
                               focus:ring-2 focus:ring-brand-wood/30" />
                </div>
                <div>
                  <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
                    Email Address <span className="text-brand-rust normal-case">*</span>
                  </label>
                  <input type="email" value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. priya@example.com"
                    className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                               font-hind text-sm text-brand-body bg-brand-bg
                               placeholder:text-brand-muted/50 focus:outline-none
                               focus:ring-2 focus:ring-brand-wood/30" />
                </div>
                <div>
                  <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
                    Phone Number
                  </label>
                  <input type="tel" value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 98765 43210"
                    className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                               font-hind text-sm text-brand-body bg-brand-bg
                               placeholder:text-brand-muted/50 focus:outline-none
                               focus:ring-2 focus:ring-brand-wood/30" />
                </div>
              </div>

              {/* Error */}
              {checkoutError && (
                <p className="font-hind text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {checkoutError}
                </p>
              )}

              {/* CTA button */}
              <button onClick={handleCheckout} disabled={checkoutLoading}
                className="w-full flex items-center justify-center gap-2
                           bg-brand-wood hover:bg-brand-rust text-white
                           font-hind font-semibold py-3.5 rounded-xl shadow-md
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base">
                {checkoutLoading
                  ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  : <ShoppingBag size={18} />}
                {checkoutLoading ? "Processing..." : "Place Order"}
              </button>

              <p className="text-center font-caveat text-brand-muted text-sm">
                🧪 Mock payment mode — no real charges
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
