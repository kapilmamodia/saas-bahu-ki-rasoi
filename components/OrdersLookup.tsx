"use client";
/**
 * OrdersLookup — client component for /orders page.
 *
 * Renders an email input form. On submit calls getOrdersByEmail server action
 * and displays a list of past orders with status, items, totals, and invoice link.
 */
import { useState } from "react";
import Link from "next/link";
import { Search, Download, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { getOrdersByEmail, type OrderWithItems } from "@/lib/actions/customerActions";
import type { OrderItem } from "@/types";

/** Format paise → ₹ */
function fmt(p: number): string {
  return `₹${(p / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Status badge colours */
function statusStyle(status: string) {
  switch (status) {
    case "paid":      return "bg-amber-100 text-amber-700 border-amber-200";
    case "completed": return "bg-green-100 text-green-700 border-green-200";
    case "refunded":  return "bg-red-100 text-red-600 border-red-200";
    default:          return "bg-brand-muted/10 text-brand-muted border-brand-muted/20";
  }
}

/** Single expandable order card */
function OrderCard({ order }: { order: OrderWithItems }) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div className="bg-brand-card border border-brand-wood/25 rounded-xl shadow-sm overflow-hidden">

      {/* ── Header row — always visible ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-brand-bg/40 transition-colors text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          {/* Order ID */}
          <span className="font-mono text-xs text-brand-muted">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          {/* Date */}
          <span className="font-hind text-sm text-brand-body">{date}</span>
          {/* Status badge */}
          <span className={`font-hind text-xs font-semibold px-2.5 py-0.5 rounded-full border w-fit ${statusStyle(order.status)}`}>
            {order.status.toUpperCase()}
          </span>
          {/* Coupon badge if used */}
          {order.coupon_code && (
            <span className="flex items-center gap-1 font-caveat text-sm text-brand-sage bg-brand-sage/10 border border-brand-sage/30 px-2 py-0.5 rounded-full w-fit">
              <Tag size={11} /> {order.coupon_code}
            </span>
          )}
        </div>

        {/* Total + expand icon */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-playfair font-semibold text-brand-gold text-base">
            {fmt(order.total_cents)}
          </span>
          {expanded
            ? <ChevronUp size={16} className="text-brand-muted" />
            : <ChevronDown size={16} className="text-brand-muted" />}
        </div>
      </button>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="border-t border-brand-wood/10 px-5 pb-5 pt-4">

          {/* Line items */}
          <div className="flex flex-col gap-2 mb-4">
            {order.items.map((item: OrderItem) => (
              <div key={item.id} className="flex justify-between font-hind text-sm text-brand-body">
                <span>
                  {item.item_name}
                  <span className="text-brand-muted ml-1">× {item.quantity}</span>
                </span>
                <span className="font-semibold text-brand-heading">
                  {fmt(item.item_price_cents * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <hr className="divider-spice mb-3" />

          {/* Totals */}
          <div className="flex flex-col gap-1 text-sm font-hind mb-4">
            <div className="flex justify-between text-brand-muted">
              <span>Subtotal</span>
              <span>{fmt(order.subtotal_cents)}</span>
            </div>
            {/* Discount row — only if coupon was applied */}
            {order.discount_cents > 0 && (
              <div className="flex justify-between text-brand-sage">
                <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                <span>− {fmt(order.discount_cents)}</span>
              </div>
            )}
            <div className="flex justify-between text-brand-muted">
              <span>GST (18%)</span>
              <span>{fmt(order.tax_cents)}</span>
            </div>
            <div className="flex justify-between font-playfair font-semibold text-brand-heading text-base mt-1">
              <span>Total</span>
              <span className="text-brand-gold">{fmt(order.total_cents)}</span>
            </div>
          </div>

          {/* Invoice download */}
          {order.invoice_url ? (
            <a
              href={order.invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-brand-wood hover:bg-brand-rust
                         text-white font-hind font-semibold py-2.5 rounded-full transition-colors text-sm"
            >
              <Download size={15} />
              Download Invoice
            </a>
          ) : (
            <p className="font-caveat text-brand-muted text-sm text-center">
              📄 Invoice being generated — check back soon
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Main lookup component — email form + results */
export default function OrdersLookup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[] | null>(null);
  const [searched, setSearched] = useState(false); // whether a search has been done

  /** Submit handler */
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setOrders(null);
      setSearched(false);

      const result = await getOrdersByEmail(email.trim());

      if (result.error) {
        setError(result.error);
      } else {
        setOrders(result.orders ?? []);
        setSearched(true);
      }
    } catch (err) {
      console.error("[OrdersLookup]", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Email search form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. priya@example.com"
          required
          className="flex-1 border border-brand-wood/30 rounded-xl px-4 py-3
                     font-hind text-brand-body bg-brand-card placeholder:text-brand-muted/60
                     focus:outline-none focus:ring-2 focus:ring-brand-wood/40"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="flex items-center gap-2 bg-brand-wood hover:bg-brand-rust text-white
                     font-hind font-semibold px-6 py-3 rounded-xl transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {loading
            ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            : <Search size={16} />}
          {loading ? "Searching..." : "Find Orders"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <p className="font-hind text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {searched && orders !== null && (
        orders.length === 0 ? (
          /* No orders found */
          <div className="text-center py-16 bg-brand-card border border-brand-wood/20 rounded-xl">
            <p className="text-5xl mb-4">🍲</p>
            <p className="font-playfair text-xl text-brand-heading mb-2">No orders found</p>
            <p className="font-hind text-brand-muted text-sm mb-6">
              We couldn&apos;t find any orders for <strong>{email}</strong>.
              <br />Make sure you&apos;re using the same email you entered at checkout.
            </p>
            <Link
              href="/menu"
              className="bg-brand-wood hover:bg-brand-rust text-white font-hind px-6 py-2.5 rounded-full transition-colors"
            >
              Browse Menu 🍛
            </Link>
          </div>
        ) : (
          /* Order list */
          <div className="flex flex-col gap-4">
            {/* Result count */}
            <p className="font-hind text-sm text-brand-muted">
              Found <strong className="text-brand-body">{orders.length}</strong> order{orders.length !== 1 ? "s" : ""} for <strong className="text-brand-body">{email}</strong>
            </p>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

