"use client";
/**
 * OrdersLookup — interactive order history for /orders page.
 * Features: animated search, timeline-style cards, status glow, item chips,
 * smooth expand/collapse, summary stats bar.
 */
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Download, ChevronDown, Tag, Package, CheckCircle2, XCircle, Clock, Filter } from "lucide-react";
import { getOrdersByEmail, type OrderWithItems } from "@/lib/actions/customerActions";
import type { OrderItem } from "@/types";
import OrderAgainButton from "@/components/OrderAgainButton";

/** Format paise → ₹ */
function fmt(p: number): string {
  return `₹${(p / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Status config — icon, colour, label */
function statusConfig(status: string) {
  switch (status) {
    case "paid":      return { icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-200", dot: "bg-amber-400",  label: "Paid"      };
    case "completed": return { icon: CheckCircle2,  color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200", dot: "bg-green-500",  label: "Completed" };
    case "refunded":  return { icon: XCircle,       color: "text-red-500",    bg: "bg-red-50",     border: "border-red-200",   dot: "bg-red-400",    label: "Refunded"  };
    default:          return { icon: Package,       color: "text-brand-muted",bg: "bg-brand-bg",   border: "border-brand-wood/20", dot: "bg-brand-muted", label: status };
  }
}

/** Single order card — timeline style with smooth expand */
function OrderCard({ order, index }: { order: OrderWithItems; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig(order.status);
  const StatusIcon = cfg.icon;

  const date = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const time = new Date(order.created_at).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      className="relative pl-8"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* ── Timeline line ── */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-brand-wood/15" />

      {/* ── Timeline dot with status glow ── */}
      <div className={`absolute left-0 top-5 w-6 h-6 rounded-full ${cfg.dot}
                       flex items-center justify-center shadow-md z-10
                       ring-2 ring-white ring-offset-1`}>
        <StatusIcon size={12} className="text-white" />
      </div>

      {/* ── Card ── */}
      <div className={`bg-brand-card border rounded-2xl shadow-sm overflow-hidden
                       transition-all duration-200 hover:shadow-md ${cfg.border}`}>

        {/* Coloured top accent stripe */}
        <div className={`h-1 w-full ${cfg.dot}`} />

        {/* ── Header — always visible ── */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full px-5 py-4 text-left"
        >
          <div className="flex items-start justify-between gap-3">

            {/* Left — meta */}
            <div className="flex flex-col gap-1.5">
              {/* Date + time */}
              <div className="flex items-center gap-2">
                <span className="font-playfair text-brand-heading text-base font-semibold">{date}</span>
                <span className="font-hind text-xs text-brand-muted">{time}</span>
              </div>

              {/* Order ID + status */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-brand-muted bg-brand-bg px-2 py-0.5 rounded-md border border-brand-wood/15">
                  #{order.order_number}
                </span>
                <span className={`flex items-center gap-1 font-hind text-xs font-semibold
                                  px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                  <StatusIcon size={11} />
                  {cfg.label}
                </span>
                {/* Coupon chip */}
                {order.coupon_code && (
                  <span className="flex items-center gap-1 font-caveat text-sm text-brand-sage
                                   bg-brand-sage/10 border border-brand-sage/30 px-2 py-0.5 rounded-full">
                    <Tag size={10} /> {order.coupon_code}
                  </span>
                )}
              </div>

              {/* Item name chips — preview */}
              <div className="flex flex-wrap gap-1 mt-0.5">
                {order.items.slice(0, 3).map((item: OrderItem) => (
                  <span key={item.id}
                    className="font-hind text-xs text-brand-body bg-brand-bg border border-brand-wood/15
                               px-2 py-0.5 rounded-full">
                    {item.item_name} ×{item.quantity}
                  </span>
                ))}
                {order.items.length > 3 && (
                  <span className="font-hind text-xs text-brand-muted px-2 py-0.5">
                    +{order.items.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Right — total + chevron */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="font-playfair font-bold text-brand-gold text-lg leading-none">
                {fmt(order.total_cents)}
              </span>
              <div className={`w-7 h-7 rounded-full bg-brand-bg border border-brand-wood/20
                               flex items-center justify-center transition-transform duration-300
                               ${expanded ? "rotate-180" : ""}`}>
                <ChevronDown size={14} className="text-brand-muted" />
              </div>
            </div>
          </div>
        </button>

        {/* ── Expanded panel ── */}
        {expanded && (
          <div className="border-t border-brand-wood/10 bg-brand-bg/40 px-5 py-4">

            {/* Items list */}
            <p className="font-hind text-xs text-brand-muted uppercase tracking-wider mb-3">
              🍛 Items Ordered
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {order.items.map((item: OrderItem) => (
                <div key={item.id}
                  className="flex justify-between items-center bg-brand-card
                             border border-brand-wood/15 rounded-xl px-4 py-2.5">
                  <div>
                    <p className="font-hind text-sm text-brand-heading font-medium">{item.item_name}</p>
                    <p className="font-hind text-xs text-brand-muted">
                      {fmt(item.item_price_cents)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-playfair font-semibold text-brand-gold text-sm">
                    {fmt(item.item_price_cents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-brand-card border border-brand-wood/15 rounded-xl px-4 py-3 mb-4">
              <div className="flex justify-between font-hind text-sm text-brand-muted mb-1">
                <span>Subtotal</span><span>{fmt(order.subtotal_cents)}</span>
              </div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between font-hind text-sm text-brand-sage mb-1">
                  <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                  <span>− {fmt(order.discount_cents)}</span>
                </div>
              )}
              <div className="flex justify-between font-hind text-sm text-brand-muted mb-2">
                <span>GST (18%)</span><span>{fmt(order.tax_cents)}</span>
              </div>
              <div className="flex justify-between font-playfair font-bold text-brand-heading text-base
                              border-t border-brand-wood/15 pt-2">
                <span>Total Paid</span>
                <span className="text-brand-gold">{fmt(order.total_cents)}</span>
              </div>
            </div>

            {/* Invoice button */}
            {order.invoice_url ? (
              <a href={order.invoice_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-brand-wood
                           hover:bg-brand-rust text-white font-hind font-semibold py-2.5
                           rounded-full transition-colors text-sm shadow-sm">
                <Download size={15} /> Download Invoice
              </a>
            ) : (
              <p className="font-caveat text-brand-muted text-sm text-center py-1">
                📄 Invoice being generated — check back soon
              </p>
            )}

            {/* Order Again button */}
            <OrderAgainButton items={order.items} />
          </div>
        )}
      </div>
    </div>
  );
}

/** Summary stats bar shown above the order list */
function StatBar({ orders }: { orders: OrderWithItems[] }) {
  const items = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {[
        { label: "Orders",        value: orders.length, icon: "📦" },
        { label: "Items Ordered", value: items,         icon: "🍛" },
      ].map(({ label, value, icon }) => (
        <div key={label} className="bg-brand-card border border-brand-wood/20 rounded-xl p-3 text-center">
          <p className="text-xl mb-1">{icon}</p>
          <p className="font-playfair font-bold text-brand-heading text-lg leading-none">{value}</p>
          <p className="font-hind text-xs text-brand-muted mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}

/** Main component */
export default function OrdersLookup() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [orders, setOrders]     = useState<OrderWithItems[] | null>(null);
  const [searched, setSearched] = useState(false);

  // ── Date filter state ──
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]     = useState("");

  /** Orders filtered by the date range (client-side, instant) */
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      const d = new Date(o.created_at);
      if (fromDate && d < new Date(fromDate)) return false;
      // Add 1 day to toDate so "to" is inclusive of the full day
      if (toDate) {
        const end = new Date(toDate);
        end.setDate(end.getDate() + 1);
        if (d >= end) return false;
      }
      return true;
    });
  }, [orders, fromDate, toDate]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setOrders(null);
      setSearched(false);
      const result = await getOrdersByEmail(email.trim());
      if (result.error) { setError(result.error); }
      else { setOrders(result.orders ?? []); setSearched(true); }
    } catch (err) {
      console.error("[OrdersLookup]", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ── Search form ── */}
      <form onSubmit={handleSearch}
        className="bg-brand-card border border-brand-wood/25 rounded-2xl p-5 shadow-sm mb-8">
        <p className="font-caveat text-brand-muted text-base mb-3">
          🔍 Enter your email to find all your past orders
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="e.g. priya@example.com"
            required
            className="flex-1 border border-brand-wood/30 rounded-xl px-4 py-3
                       font-hind text-brand-body bg-brand-bg placeholder:text-brand-muted/60
                       focus:outline-none focus:ring-2 focus:ring-brand-wood/40"
          />
          <button type="submit" disabled={loading || !email.trim()}
            className="flex items-center gap-2 bg-brand-wood hover:bg-brand-rust text-white
                       font-hind font-semibold px-6 py-3 rounded-xl transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
            {loading
              ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              : <Search size={16} />}
            {loading ? "Searching..." : "Find Orders"}
          </button>
        </div>
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
          <div className="text-center py-16 bg-brand-card border border-brand-wood/20 rounded-2xl">
            <p className="text-5xl mb-4">🍲</p>
            <p className="font-playfair text-xl text-brand-heading mb-2">No orders found</p>
            <p className="font-hind text-brand-muted text-sm mb-6">
              No orders found for <strong>{email}</strong>.<br />
              Try the email you used at checkout.
            </p>
            <Link href="/menu"
              className="bg-brand-wood hover:bg-brand-rust text-white font-hind px-6 py-2.5 rounded-full transition-colors">
              Browse Menu 🍛
            </Link>
          </div>
        ) : (
          <div>
            {/* Greeting + count */}
            <div className="flex items-center justify-between mb-4">
              <p className="font-playfair text-brand-heading text-lg">
                Welcome back! 🙏
              </p>
              <span className="font-hind text-xs text-brand-muted bg-brand-bg border border-brand-wood/20 px-3 py-1 rounded-full">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Stats bar */}
            <StatBar orders={filteredOrders} />

            {/* ── Date filter ── */}
            <div className="bg-brand-card border border-brand-wood/20 rounded-2xl px-4 py-3 mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-brand-muted shrink-0">
                <Filter size={14} />
                <span className="font-hind text-sm">Filter by date</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* From */}
                <div className="flex items-center gap-1.5">
                  <label className="font-hind text-xs text-brand-muted whitespace-nowrap">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="border border-brand-wood/30 rounded-lg px-2 py-1.5 font-hind text-sm
                               text-brand-body bg-brand-bg focus:outline-none focus:ring-2
                               focus:ring-brand-wood/40"
                  />
                </div>
                {/* To */}
                <div className="flex items-center gap-1.5">
                  <label className="font-hind text-xs text-brand-muted whitespace-nowrap">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    min={fromDate || undefined}
                    className="border border-brand-wood/30 rounded-lg px-2 py-1.5 font-hind text-sm
                               text-brand-body bg-brand-bg focus:outline-none focus:ring-2
                               focus:ring-brand-wood/40"
                  />
                </div>
                {/* Clear button — only shown when filter is active */}
                {(fromDate || toDate) && (
                  <button
                    onClick={() => { setFromDate(""); setToDate(""); }}
                    className="font-hind text-xs text-brand-rust hover:text-brand-wood
                               underline underline-offset-2 transition-colors"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              {/* Filtered count badge */}
              {(fromDate || toDate) && (
                <span className="font-hind text-xs text-brand-wood bg-brand-wood/10 border border-brand-wood/20 px-2.5 py-1 rounded-full shrink-0">
                  {filteredOrders.length} of {orders.length}
                </span>
              )}
            </div>

            {/* Timeline order list */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-10 bg-brand-card border border-brand-wood/20 rounded-2xl">
                <p className="text-4xl mb-3">📅</p>
                <p className="font-playfair text-brand-heading mb-1">No orders in this range</p>
                <p className="font-hind text-brand-muted text-sm">Try adjusting or clearing the date filter.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {filteredOrders.map((order, i) => (
                  <OrderCard key={order.id} order={order} index={i} />
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
