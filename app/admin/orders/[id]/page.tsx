/**
 * Admin Order Detail Page — /admin/orders/[id]
 *
 * Shows full order details including all line items, customer info,
 * totals, and invoice download link.
 * Server Component — fetches data using the admin Supabase client.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Order, OrderItem } from "@/types";
import { ArrowLeft, Download } from "lucide-react";
import MarkCompletedButton from "@/components/admin/MarkCompletedButton";
import CancelOrderButton from "@/components/admin/CancelOrderButton";

export const dynamic = "force-dynamic";

/** Format paise → ₹ */
function fmt(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })}`;
}

/** Status badge colour */
function statusColor(status: string) {
  if (status === "paid")      return "bg-green-100 text-green-700";
  if (status === "completed") return "bg-blue-100 text-blue-700";
  if (status === "refunded")  return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700"; // pending
}

interface PageProps {
  params: { id: string };
}

/** Admin order detail page — full order breakdown */
export default async function AdminOrderDetailPage({ params }: PageProps) {
  const supabase = createAdminClient();

  // Fetch the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();

  if (orderError || !order) notFound();

  const typedOrder = order as Order;

  // Fetch line items
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", typedOrder.id);

  const typedItems = (items ?? []) as OrderItem[];

  const orderDate = new Date(typedOrder.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="max-w-2xl">
      {/* Back link */}
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-1 font-hind text-sm text-brand-muted
                   hover:text-brand-wood transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Page heading */}
      <div className="flex items-start justify-between mb-2">
        <h1 className="font-yatra text-3xl text-brand-heading">
          Order #{typedOrder.order_number}
        </h1>
        <span className={`font-caveat text-base px-3 py-1 rounded-full ${statusColor(typedOrder.status)}`}>
          {typedOrder.status.toUpperCase()}
        </span>
      </div>
      <hr className="divider-spice mb-8" />

      {/* ── Customer info ───────────────────────────────────────────────── */}
      <div className="bg-brand-card border border-brand-wood/25 rounded-xl p-5 mb-5 shadow-sm">
        <h2 className="font-playfair text-lg text-brand-heading mb-3">Customer</h2>
        <div className="grid grid-cols-2 gap-2 font-hind text-sm">
          <span className="text-brand-muted">Name</span>
          <span className="text-brand-body font-medium">{typedOrder.customer_name || "—"}</span>
          <span className="text-brand-muted">Email</span>
          <span className="text-brand-body">{typedOrder.customer_email}</span>
          {/* Phone — shown only when provided */}
          {typedOrder.customer_phone && (
            <>
              <span className="text-brand-muted">Phone</span>
              <a href={`tel:${typedOrder.customer_phone}`}
                className="text-brand-wood hover:text-brand-rust transition-colors font-medium">
                📞 {typedOrder.customer_phone}
              </a>
            </>
          )}
          {/* Delivery type */}
          <span className="text-brand-muted">Order Type</span>
          <span className="text-brand-body font-semibold">
            {typedOrder.delivery_type === "delivery" ? "🛵 Home Delivery" : "📍 Self Pickup"}
          </span>
          {/* Delivery address */}
          {typedOrder.delivery_type === "delivery" && typedOrder.delivery_address && (
            <>
              <span className="text-brand-muted">Address</span>
              <span className="text-brand-body">{typedOrder.delivery_address}</span>
            </>
          )}
          <span className="text-brand-muted">Ordered at</span>
          <span className="text-brand-body">{orderDate}</span>
          {/* Show completed timestamp if available */}
          {typedOrder.completed_at && (
            <>
              <span className="text-brand-muted">Completed at</span>
              <span className="text-blue-700 font-medium">
                {new Date(typedOrder.completed_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Items ordered ───────────────────────────────────────────────── */}
      <div className="bg-brand-card border border-brand-wood/25 rounded-xl p-5 mb-5 shadow-sm">
        <h2 className="font-playfair text-lg text-brand-heading mb-4">Items Ordered</h2>

        {/* Table header */}
        <div className="grid grid-cols-12 font-hind text-xs text-brand-muted uppercase mb-2 px-1">
          <span className="col-span-6">Item</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Unit</span>
          <span className="col-span-2 text-right">Total</span>
        </div>

        {/* Item rows */}
        <div className="flex flex-col gap-1">
          {typedItems.map((item, idx) => (
            <div
              key={item.id}
              className={`grid grid-cols-12 font-hind text-sm py-2 px-1 rounded-lg
                ${idx % 2 === 0 ? "bg-brand-bg/50" : ""}`}
            >
              <span className="col-span-6 text-brand-body font-medium">{item.item_name}</span>
              <span className="col-span-2 text-center text-brand-muted">{item.quantity}</span>
              <span className="col-span-2 text-right text-brand-muted">{fmt(item.item_price_cents)}</span>
              <span className="col-span-2 text-right text-brand-heading font-semibold">
                {fmt(item.item_price_cents * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <hr className="divider-spice my-4" />

        {/* Totals */}
        <div className="flex flex-col gap-1 font-hind text-sm">
          <div className="flex justify-between text-brand-muted">
            <span>Subtotal</span>
            <span>{fmt(typedOrder.subtotal_cents)}</span>
          </div>
          <div className="flex justify-between text-brand-muted">
            <span>GST (18%)</span>
            <span>{fmt(typedOrder.tax_cents)}</span>
          </div>
          <div className="flex justify-between font-playfair text-xl text-brand-heading font-semibold mt-2">
            <span>Total</span>
            <span className="text-brand-gold">{fmt(typedOrder.total_cents)}</span>
          </div>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mt-2">
        {/* Mark as Completed — only shown for paid orders */}
        {typedOrder.status === "paid" && (
          <MarkCompletedButton orderId={typedOrder.id} />
        )}

        {/* Completed banner */}
        {typedOrder.status === "completed" && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200
                          rounded-xl px-5 py-3 text-blue-700 font-hind text-sm">
            ✅ Order completed — customer has been notified
          </div>
        )}

        {/* Cancel Order — shown for paid and completed orders */}
        {(typedOrder.status === "paid" || typedOrder.status === "completed") && (
          <CancelOrderButton orderId={typedOrder.id} />
        )}

        {/* Refunded / Cancelled banner */}
        {typedOrder.status === "refunded" && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200
                          rounded-xl px-5 py-3 text-red-700 font-hind text-sm">
            ❌ Order cancelled / refunded
          </div>
        )}

        {/* Download Invoice */}
        {typedOrder.invoice_url ? (
          <a
            href={typedOrder.invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-brand-wood
                       hover:bg-brand-rust text-white font-hind font-semibold py-3
                       rounded-full shadow-md transition-colors"
          >
            <Download size={16} />
            Download Invoice PDF
          </a>
        ) : (
          <p className="text-center font-caveat text-brand-muted text-base">
            📄 Invoice not yet generated for this order
          </p>
        )}
      </div>
    </div>
  );
}

