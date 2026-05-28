/**
 * /orders — Customer order history lookup by email.
 * No login required — customer enters their email to see all past orders.
 */
import OrdersLookup from "@/components/OrdersLookup";

/** Order history page */
export default function OrdersPage() {
  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-10">
      {/* Page heading */}
      <h1 className="font-yatra text-3xl md:text-4xl text-brand-heading mb-2">
        My Orders
      </h1>
      <p className="font-hind text-brand-muted mb-2">
        Enter the email address you used when placing your order.
      </p>
      <hr className="divider-spice mb-8" />

      <OrdersLookup />
    </div>
  );
}

