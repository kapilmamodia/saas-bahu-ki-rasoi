"use client";
/**
 * OrdersTable — filterable orders table for the admin dashboard.
 *
 * Client Component — handles filter state (name, email, status, date) locally.
 * Receives all orders from the Server Component parent (no extra fetches needed).
 */
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, CalendarDays } from "lucide-react";

/** Shape of a single order row passed from the server */
export interface OrderRow {
  id: string;
  customer_name: string;
  customer_email: string;
  total_cents: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  invoice_url: string | null;
}

interface OrdersTableProps {
  orders: OrderRow[];
}

/** Format paise → ₹ */
function fmt(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

/** Status badge colour */
function statusColor(status: string) {
  if (status === "paid")      return "bg-green-100 text-green-700";
  if (status === "completed") return "bg-blue-100 text-blue-700";
  if (status === "refunded")  return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700"; // pending
}

/**
 * Renders a filterable, scrollable orders table.
 * Filters are applied client-side — no extra API calls.
 */
export default function OrdersTable({ orders }: OrdersTableProps) {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "completed" | "refunded">("all");
  /** Date filter — ISO date string "YYYY-MM-DD" or empty string for no filter */
  const [dateFilter, setDateFilter] = useState("");

  /** Apply filters — case-insensitive search across name, email, and date */
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      // Date filter — compare only the date portion (YYYY-MM-DD) of created_at
      if (dateFilter) {
        const orderDate = new Date(o.created_at).toLocaleDateString("en-CA"); // en-CA gives YYYY-MM-DD
        if (orderDate !== dateFilter) return false;
      }
      // Text search across name and email
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = o.customer_name?.toLowerCase().includes(q);
        const matchEmail = o.customer_email?.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter, dateFilter]);

  return (
    <div className="bg-brand-card border border-brand-wood/25 rounded-xl shadow-sm overflow-hidden">

      {/* ── Header + filters ───────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-brand-wood/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-playfair text-xl text-brand-heading">All Orders</h2>
            <p className="font-hind text-xs text-brand-muted mt-0.5">
              {filtered.length} of {orders.length} orders
            </p>
          </div>

          {/* Filter controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email…"
                className="pl-8 pr-8 py-1.5 text-sm font-hind border border-brand-wood/30
                           rounded-lg bg-brand-bg text-brand-body placeholder:text-brand-muted/60
                           focus:outline-none focus:ring-2 focus:ring-brand-wood/40 w-full sm:w-56"
              />
              {/* Clear search button */}
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-rust"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Date filter — pick a single day to see all orders placed on it */}
            <div className="relative">
              <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-8 pr-8 py-1.5 text-sm font-hind border border-brand-wood/30
                           rounded-lg bg-brand-bg text-brand-body
                           focus:outline-none focus:ring-2 focus:ring-brand-wood/40 w-full sm:w-44"
              />
              {/* Clear date button */}
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-rust"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status filter dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="py-1.5 px-3 text-sm font-hind border border-brand-wood/30
                         rounded-lg bg-brand-bg text-brand-body
                         focus:outline-none focus:ring-2 focus:ring-brand-wood/40"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-playfair text-brand-heading">No orders match your filters</p>
          <button
            onClick={() => { setSearch(""); setStatusFilter("all"); setDateFilter(""); }}
            className="mt-3 font-hind text-sm text-brand-wood hover:text-brand-rust underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-hind">
            <thead className="bg-brand-bg text-brand-muted uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-brand-wood/10 hover:bg-brand-bg/50">
                  {/* Order ID */}
                  <td className="px-4 py-3 text-brand-muted font-mono text-xs">
                    {order.id.slice(0, 8).toUpperCase()}
                  </td>

                  {/* Customer name + email */}
                  <td className="px-4 py-3">
                    <p className="text-brand-heading font-medium">{order.customer_name || "—"}</p>
                    <p className="text-brand-muted text-xs">{order.customer_email}</p>
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3 text-brand-gold font-semibold">
                    {fmt(order.total_cents)}
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-3">
                    <span className={`font-caveat text-sm px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>

                  {/* Date — shows ordered date + completed date if applicable */}
                  <td className="px-4 py-3 text-brand-muted whitespace-nowrap">
                    <p>{new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}</p>
                    {order.completed_at && (
                      <p className="text-blue-600 text-xs mt-0.5">
                        ✅ {new Date(order.completed_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* View items link */}
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-hind text-xs text-brand-wood hover:text-brand-rust
                                   underline underline-offset-2 transition-colors whitespace-nowrap"
                      >
                        View Items →
                      </Link>
                      {/* Download invoice if available */}
                      {order.invoice_url && (
                        <a
                          href={order.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-hind text-xs text-brand-muted hover:text-brand-wood
                                     underline underline-offset-2 transition-colors whitespace-nowrap"
                        >
                          Invoice ↗
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

