/**
 * Order Confirmation Page — /order/confirmation?session_id=...
 *
 * Fetches the order from Supabase using the session_id URL param.
 * Shows order summary and a "Confirm & Pay" button (mock payment).
 * When real Stripe is integrated, this page just shows the completed order
 * (Stripe redirects here after payment, so no confirm button needed).
 *
 * Always fetches fresh — never cache — so the paid status shows immediately after reload.
 */
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Order, OrderItem } from "@/types";
import MockPayButton from "./MockPayButton";
import { CheckCircle, ShoppingBag, Download } from "lucide-react";

/** Force dynamic rendering — no caching so status updates appear immediately */
export const dynamic = "force-dynamic";

/** Format paise to rupees */
function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface PageProps {
  searchParams: { session_id?: string };
}

/**
 * Server Component — fetches order and line items from Supabase.
 */
export default async function ConfirmationPage({ searchParams }: PageProps) {
  const sessionId = searchParams.session_id;

  // No session ID in URL → 404
  if (!sessionId) notFound();

  const supabase = createAdminClient();

  // Fetch the order by stripe_session_id
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .single();

  if (orderError) {
    console.error("[confirmation] Supabase error:", orderError);
    notFound();
  }

  if (!order) notFound();

  const typedOrder = order as Order;

  // Fetch line items for this order
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", typedOrder.id);

  const typedItems = (orderItems ?? []) as OrderItem[];

  const isPaid = typedOrder.status === "paid";

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-10">
      {/* ── Status banner ────────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl p-6 mb-8 flex items-center gap-4 shadow-sm
          ${isPaid
            ? "bg-green-50 border border-green-200"
            : "bg-brand-card border border-brand-wood/25"
          }`}
      >
        {isPaid ? (
          // Paid — show success icon
          <CheckCircle className="text-green-600 flex-shrink-0" size={36} />
        ) : (
          // Pending — show bag icon
          <ShoppingBag className="text-brand-gold flex-shrink-0" size={36} />
        )}
        <div>
          <h1 className="font-yatra text-2xl md:text-3xl text-brand-heading">
            {isPaid ? "Payment Confirmed! 🎉" : "Review Your Order"}
          </h1>
          <p className="font-caveat text-brand-muted text-lg mt-1">
            {isPaid
              ? "Shukriya! Your order is on its way. 🙏"
              : "Please confirm your order below"}
          </p>
        </div>
      </div>

      {/* ── Order meta ───────────────────────────────────────────────────── */}
      <div className="bg-brand-card border border-brand-wood/25 rounded-xl p-5 mb-6 shadow-sm">
        <h2 className="font-playfair text-lg text-brand-heading mb-3">
          Order Details
        </h2>
        {/* Order ID */}
        <div className="flex justify-between font-hind text-sm text-brand-body mb-1">
          <span className="text-brand-muted">Order ID</span>
          <span className="font-mono text-xs">{typedOrder.id.slice(0, 8).toUpperCase()}</span>
        </div>
        {/* Customer */}
        <div className="flex justify-between font-hind text-sm text-brand-body mb-1">
          <span className="text-brand-muted">Name</span>
          <span>{typedOrder.customer_name}</span>
        </div>
        {/* Email */}
        <div className="flex justify-between font-hind text-sm text-brand-body mb-1">
          <span className="text-brand-muted">Email</span>
          <span>{typedOrder.customer_email}</span>
        </div>
        {/* Status badge */}
        <div className="flex justify-between font-hind text-sm text-brand-body">
          <span className="text-brand-muted">Status</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded-full text-xs
              ${isPaid
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
              }`}
          >
            {typedOrder.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── Order items list ─────────────────────────────────────────────── */}
      <div className="bg-brand-card border border-brand-wood/25 rounded-xl p-5 mb-6 shadow-sm">
        <h2 className="font-playfair text-lg text-brand-heading mb-4">
          Items Ordered
        </h2>
        <div className="flex flex-col gap-2">
          {typedItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between font-hind text-brand-body text-sm"
            >
              {/* Item name + quantity */}
              <span>
                {item.item_name}
                <span className="text-brand-muted ml-1">× {item.quantity}</span>
              </span>
              {/* Line total */}
              <span className="font-semibold text-brand-heading">
                {formatPrice(item.item_price_cents * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <hr className="divider-spice my-4" />

        {/* Totals */}
        <div className="flex justify-between font-hind text-sm text-brand-muted mb-1">
          <span>Subtotal</span>
          <span>{formatPrice(typedOrder.subtotal_cents)}</span>
        </div>
        {/* Discount row — only shown when a coupon was applied */}
        {typedOrder.discount_cents > 0 && (
          <div className="flex justify-between font-hind text-sm text-brand-sage mb-1">
            <span>
              Discount
              {typedOrder.coupon_code && (
                <span className="ml-1 font-caveat text-xs bg-brand-sage/15 border border-brand-sage/30
                                 text-brand-sage px-2 py-0.5 rounded-full">
                  {typedOrder.coupon_code}
                </span>
              )}
            </span>
            <span>− {formatPrice(typedOrder.discount_cents)}</span>
          </div>
        )}
        <div className="flex justify-between font-hind text-sm text-brand-muted mb-3">
          <span>GST (18%)</span>
          <span>{formatPrice(typedOrder.tax_cents)}</span>
        </div>
        <div className="flex justify-between font-playfair text-xl text-brand-heading font-semibold">
          <span>Total Paid</span>
          <span className="text-brand-gold">{formatPrice(typedOrder.total_cents)}</span>
        </div>
      </div>

      {/* ── Action area ──────────────────────────────────────────────────── */}
      {isPaid ? (
        // Paid — show success card with Download Invoice button
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
          <p className="font-playfair text-green-800 text-lg font-semibold mb-1 text-center">
            ✅ Your order is confirmed!
          </p>
          <p className="font-caveat text-green-700 text-base mb-4 text-center">
            Shukriya! We are cooking your ghar ka khana with love 🙏
          </p>

          {/* Download Invoice button — shown when invoice_url is ready */}
          {typedOrder.invoice_url ? (
            <a
              href={typedOrder.invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download your invoice PDF"
              className="w-full flex items-center justify-center gap-2 bg-brand-wood
                         hover:bg-brand-rust text-white font-hind font-semibold py-3
                         rounded-full shadow-md transition-colors mb-4"
            >
              <Download size={18} />
              Download Invoice
            </a>
          ) : (
            // Invoice still being generated — show a subtle note
            <p className="font-caveat text-brand-muted text-base text-center mb-4">
              📄 Invoice is being generated — check back in a moment
            </p>
          )}

          <p className="font-hind text-sm text-brand-muted text-center">
            Questions? Call us — Rajeshwari{" "}
            <a href="tel:+91XXXXXXXXXX" className="text-brand-wood hover:text-brand-rust underline">
              +91 XXX-XX-XXXX
            </a>{" "}
            · Veena{" "}
            <a href="tel:+91XXXXXXXXXX" className="text-brand-wood hover:text-brand-rust underline">
              +91 XXX-XX-XXXX
            </a>
          </p>
        </div>
      ) : (
        // Pending — show the mock "Confirm & Pay" button (client component)
        <MockPayButton sessionId={sessionId} />
      )}
    </div>
  );
}
