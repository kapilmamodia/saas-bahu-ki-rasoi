"use client";
/**
 * OrdersLookup — Gen Z redesign.
 * Dark gradient search card, emoji status badges, glassmorphism order cards,
 * stat pills, animated empty state, collapsible date filter.
 */
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Download, ChevronDown, Tag, Filter,
  Mail, Phone, Zap, ShoppingBag, RotateCcw
} from "lucide-react";
import { getOrdersByEmail, getOrdersByPhone, type OrderWithItems } from "@/lib/actions/customerActions";
import type { OrderItem } from "@/types";
import OrderAgainButton from "@/components/OrderAgainButton";

type SearchMode = "email" | "phone";

/** Format paise → ₹ */
function fmt(p: number): string {
  return `₹${(p / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Status config ─────────────────────────────────────────────────────────────
function statusConfig(status: string) {
  switch (status) {
    case "paid":      return { emoji: "⏳", label: "Preparing",  pill: "bg-amber-100 text-amber-700 border-amber-200",    bar: "bg-amber-400"   };
    case "completed": return { emoji: "✅", label: "Delivered",  pill: "bg-green-100 text-green-700 border-green-200",     bar: "bg-green-500"   };
    case "refunded":  return { emoji: "↩️", label: "Refunded",   pill: "bg-red-100 text-red-600 border-red-200",           bar: "bg-red-400"     };
    default:          return { emoji: "🕐", label: "Pending",    pill: "bg-brand-bg text-brand-muted border-brand-wood/20", bar: "bg-brand-muted" };
  }
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, index }: { order: OrderWithItems; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig(order.status);
  const date = new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const time = new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      style={{ animationDelay: `${index * 60}ms`, background: "linear-gradient(135deg,#FDF6E3 0%,#FAF0D8 100%)", border: "1px solid rgba(123,74,30,0.15)" }}>

      {/* Top colour stripe */}
      <div className={`h-1 w-full ${cfg.bar}`} />

      {/* Header */}
      <button onClick={() => setExpanded(v => !v)} className="w-full text-left p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Order # + status */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand-wood bg-brand-wood/10 px-2.5 py-1 rounded-lg">
                #{order.order_number}
              </span>
              <span className={`inline-flex items-center gap-1 font-hind text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.pill}`}>
                {cfg.emoji} {cfg.label}
              </span>
              {order.coupon_code && (
                <span className="inline-flex items-center gap-1 font-caveat text-xs text-brand-sage bg-brand-sage/10 border border-brand-sage/30 px-2 py-0.5 rounded-full">
                  <Tag size={9} /> {order.coupon_code}
                </span>
              )}
            </div>
            {/* Date */}
            <p className="font-hind text-sm text-brand-muted">{date} · {time}</p>
            {/* Item chips */}
            <div className="flex flex-wrap gap-1">
              {order.items.slice(0, 3).map((item: OrderItem) => (
                <span key={item.id} className="font-hind text-xs text-brand-body bg-white/80 border border-brand-wood/15 px-2.5 py-1 rounded-full">
                  {item.item_name} ×{item.quantity}
                </span>
              ))}
              {order.items.length > 3 && <span className="font-hind text-xs text-brand-muted px-2 py-1">+{order.items.length - 3} more</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="font-playfair font-bold text-brand-gold text-xl leading-none">{fmt(order.total_cents)}</span>
            <div className={`w-8 h-8 rounded-full bg-brand-wood/10 flex items-center justify-center transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
              <ChevronDown size={15} className="text-brand-wood" />
            </div>
          </div>
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-brand-wood/10 bg-white/40 px-5 py-4">
          <p className="font-hind text-xs text-brand-muted uppercase tracking-widest mb-3">📍 Journey</p>
          <OrderTimeline status={order.status} completedAt={order.completed_at} createdAt={order.created_at} />

          <p className="font-hind text-xs text-brand-muted uppercase tracking-widest mb-3 mt-5">🍛 What you ordered</p>
          <div className="flex flex-col gap-2 mb-4">
            {order.items.map((item: OrderItem) => (
              <div key={item.id} className="flex justify-between items-center bg-white/70 border border-brand-wood/10 rounded-xl px-4 py-2.5">
                <div>
                  <p className="font-hind text-sm text-brand-heading font-medium">{item.item_name}</p>
                  <p className="font-hind text-xs text-brand-muted">{fmt(item.item_price_cents)} × {item.quantity}</p>
                </div>
                <span className="font-playfair font-semibold text-brand-gold text-sm">{fmt(item.item_price_cents * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="bg-brand-dark/5 rounded-2xl px-4 py-3 mb-4 border border-brand-wood/10">
            <div className="flex justify-between font-hind text-sm text-brand-muted mb-1"><span>Subtotal</span><span>{fmt(order.subtotal_cents)}</span></div>
            {order.discount_cents > 0 && (
              <div className="flex justify-between font-hind text-sm text-green-600 mb-1">
                <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                <span>− {fmt(order.discount_cents)}</span>
              </div>
            )}
            <div className="flex justify-between font-hind text-sm text-brand-muted mb-2"><span>GST (18%)</span><span>{fmt(order.tax_cents)}</span></div>
            <div className="flex justify-between font-playfair font-bold text-brand-heading text-base border-t border-brand-wood/15 pt-2">
              <span>Total Paid</span><span className="text-brand-gold">{fmt(order.total_cents)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {order.invoice_url ? (
              <a href={order.invoice_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-brand-dark text-white font-hind font-semibold py-2.5 rounded-xl transition-colors text-sm hover:bg-brand-wood">
                <Download size={15} /> Download Invoice
              </a>
            ) : (
              <p className="font-caveat text-brand-muted text-sm text-center py-1">📄 Invoice being prepared — check back soon</p>
            )}
            <OrderAgainButton items={order.items} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat pills ────────────────────────────────────────────────────────────────
function StatPills({ orders }: { orders: OrderWithItems[] }) {
  const totalItems = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);
  const completed  = orders.filter(o => o.status === "completed").length;
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { icon: "📦", label: "Orders",    value: orders.length },
        { icon: "🍛", label: "Dishes",    value: totalItems },
        { icon: "✅", label: "Completed", value: completed },
      ].map(({ icon, label, value }) => (
        <div key={label} className="rounded-2xl p-4 text-center border border-brand-wood/15"
          style={{ background: "linear-gradient(135deg,#FDF6E3,#FAF0D8)" }}>
          <p className="text-2xl mb-1">{icon}</p>
          <p className="font-playfair font-bold text-brand-heading text-xl leading-none">{value}</p>
          <p className="font-hind text-xs text-brand-muted mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OrdersLookup() {
  const [mode, setMode]             = useState<SearchMode>("email");
  const [query, setQuery]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [orders, setOrders]         = useState<OrderWithItems[] | null>(null);
  const [searched, setSearched]     = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [fromDate, setFromDate]     = useState("");
  const [toDate, setToDate]         = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const handleModeSwitch = (m: SearchMode) => {
    setMode(m); setQuery(""); setError(null); setOrders(null); setSearched(false); setFromDate(""); setToDate("");
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => {
      const d = new Date(o.created_at);
      if (fromDate && d < new Date(fromDate)) return false;
      if (toDate) { const end = new Date(toDate); end.setDate(end.getDate() + 1); if (d >= end) return false; }
      return true;
    });
  }, [orders, fromDate, toDate]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    try {
      setLoading(true); setError(null); setOrders(null); setSearched(false);
      const result = mode === "email" ? await getOrdersByEmail(query.trim()) : await getOrdersByPhone(query.trim());
      if (result.error) { setError(result.error); }
      else { setOrders(result.orders ?? []); setSearchedQuery(query.trim()); setSearched(true); }
    } catch (err) {
      console.error("[OrdersLookup]", err);
      setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div>
      {/* ── Search card — dark gradient ── */}
      <div className="rounded-3xl overflow-hidden mb-8 shadow-md"
        style={{ background: "linear-gradient(135deg,#3B1F0C,#7B4A1E)" }}>
        {/* Mode toggle */}
        <div className="flex gap-1 p-3 pb-0">
          {(["email", "phone"] as SearchMode[]).map(m => (
            <button key={m} type="button" onClick={() => handleModeSwitch(m)}
              className={`flex-1 flex items-center justify-center gap-2 font-hind text-sm py-2.5 rounded-2xl transition-all duration-200 font-semibold
                ${mode === m ? "bg-brand-gold text-brand-dark shadow-md" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
              {m === "email" ? <Mail size={14} /> : <Phone size={14} />}
              {m === "email" ? "Email" : "Phone"}
            </button>
          ))}
        </div>
        {/* Input row */}
        <form onSubmit={handleSearch} className="p-3">
          <div className="flex gap-2">
            <input key={mode} type={mode === "email" ? "email" : "tel"} value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={mode === "email" ? "your@email.com" : "98765 43210"}
              required
              className="flex-1 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3
                         font-hind text-white text-sm placeholder:text-white/40 focus:outline-none
                         focus:bg-white/20 focus:border-brand-gold/60 transition-all" />
            <button type="submit" disabled={loading || !query.trim()}
              className="flex items-center gap-2 bg-brand-gold hover:bg-brand-rust text-brand-dark
                         font-hind font-bold px-5 py-3 rounded-2xl transition-colors
                         disabled:opacity-40 shrink-0 shadow-md">
              {loading
                ? <span className="animate-spin h-4 w-4 border-2 border-brand-dark border-t-transparent rounded-full" />
                : <Zap size={16} />}
              {loading ? "…" : "Find"}
            </button>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-6">
          <span className="text-lg">⚠️</span>
          <p className="font-hind text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {searched && orders !== null && (
        orders.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-brand-wood/15"
            style={{ background: "linear-gradient(135deg,#FDF6E3,#FAF0D8)" }}>
            <div className="flex items-end justify-center gap-1 mb-4 h-14">
              <span className="text-2xl animate-flame">🔥</span>
              <span className="text-4xl animate-bounce-gentle">🍲</span>
              <span className="text-2xl animate-spoon-stir origin-bottom">🥄</span>
            </div>
            <p className="font-playfair text-xl text-brand-heading mb-1">No orders yet!</p>
            <p className="font-hind text-brand-muted text-sm mb-1">Nothing found for <strong>{searchedQuery}</strong></p>
            <p className="font-hind text-brand-muted text-xs mb-6">Try the {mode === "email" ? "email" : "phone"} you used at checkout</p>
            <Link href="/menu" className="inline-flex items-center gap-2 bg-brand-wood hover:bg-brand-rust text-white font-hind font-semibold px-6 py-2.5 rounded-full transition-colors shadow-md">
              <ShoppingBag size={16} /> Start Ordering 🍛
            </Link>
          </div>
        ) : (
          <div>
            {/* Welcome banner */}
            <div className="rounded-2xl p-4 mb-5 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg,#3B1F0C,#7B4A1E)" }}>
              <div>
                <p className="font-yatra text-brand-gold text-lg leading-none">Welcome back! 🙏</p>
                <p className="font-hind text-white/50 text-xs mt-0.5">{searchedQuery}</p>
              </div>
              <span className="font-hind text-xs text-brand-gold bg-brand-gold/15 border border-brand-gold/25 px-3 py-1.5 rounded-full font-semibold">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </span>
            </div>

            <StatPills orders={filteredOrders} />

            {/* Filter toggle */}
            <div className="mb-4">
              <button onClick={() => setShowFilter(v => !v)}
                className={`flex items-center gap-2 font-hind text-sm px-4 py-2 rounded-full border transition-colors
                  ${showFilter ? "bg-brand-wood text-white border-brand-wood" : "bg-brand-bg text-brand-muted border-brand-wood/20 hover:text-brand-wood"}`}>
                <Filter size={13} />
                {showFilter ? "Hide Filter" : "Filter by Date"}
                {(fromDate || toDate) && (
                  <span className="bg-brand-rust text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{filteredOrders.length}</span>
                )}
              </button>
              {showFilter && (
                <div className="mt-3 p-4 bg-brand-card border border-brand-wood/15 rounded-2xl flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="font-hind text-xs text-brand-muted">From</label>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                      className="border border-brand-wood/25 rounded-xl px-3 py-1.5 font-hind text-sm bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-wood/30" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="font-hind text-xs text-brand-muted">To</label>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} min={fromDate || undefined}
                      className="border border-brand-wood/25 rounded-xl px-3 py-1.5 font-hind text-sm bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-wood/30" />
                  </div>
                  {(fromDate || toDate) && (
                    <button onClick={() => { setFromDate(""); setToDate(""); }}
                      className="flex items-center gap-1 font-hind text-xs text-brand-rust hover:text-brand-wood transition-colors">
                      <RotateCcw size={11} /> Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Order cards */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-10 bg-brand-card border border-brand-wood/15 rounded-2xl">
                <p className="text-3xl mb-2">📅</p>
                <p className="font-playfair text-brand-heading mb-1">No orders in this range</p>
                <p className="font-hind text-brand-muted text-sm">Try adjusting or clearing the date filter.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredOrders.map((order, i) => <OrderCard key={order.id} order={order} index={i} />)}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

// ── Order Status Timeline ─────────────────────────────────────────────────────
interface OrderTimelineProps { status: string; createdAt: string; completedAt: string | null; }

function OrderTimeline({ status, createdAt, completedAt }: OrderTimelineProps) {
  const steps = [
    { label: "Placed",  emoji: "📝", reached: true, time: new Date(createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) },
    { label: "Paid",    emoji: "💳", reached: ["paid","completed","refunded"].includes(status) },
    { label: "Cooking", emoji: "👩‍🍳", reached: ["paid","completed"].includes(status) },
    { label: "Done!",   emoji: "🎉", reached: status === "completed",
      time: completedAt ? new Date(completedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : undefined },
  ];

  if (status === "refunded") return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      <span className="text-2xl">↩️</span>
      <div>
        <p className="font-hind text-sm font-semibold text-red-700">Order Cancelled / Refunded</p>
        <p className="font-hind text-xs text-red-400">This order has been cancelled.</p>
      </div>
    </div>
  );

  return (
    <div className="flex items-start">
      {steps.map((step, idx) => (
        <div key={step.label} className="flex-1 flex flex-col items-center relative">
          {idx < steps.length - 1 && (
            <div className={`absolute top-4 left-1/2 w-full h-0.5 z-0 ${step.reached && steps[idx+1].reached ? "bg-brand-gold" : "bg-brand-wood/15"}`} />
          )}
          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all
            ${step.reached ? "border-brand-gold bg-brand-gold/15 shadow-sm" : "border-brand-wood/20 bg-brand-bg"}`}>
            <span className={step.reached ? "" : "grayscale opacity-30"}>{step.emoji}</span>
          </div>
          <p className={`font-hind text-center mt-1.5 leading-tight px-0.5 text-[10px] sm:text-xs ${step.reached ? "text-brand-heading font-semibold" : "text-brand-muted"}`}>
            {step.label}
          </p>
          {step.time && step.reached && <p className="font-hind text-[9px] text-brand-muted mt-0.5">{step.time}</p>}
        </div>
      ))}
    </div>
  );
}

