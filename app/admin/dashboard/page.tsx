// Admin dashboard — summary stats and filterable orders table.
// Server Component: fetches data using the service role client.
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import OrdersTable, { OrderRow } from "@/components/admin/OrdersTable";

/** Format paise to rupees */
function formatPrice(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

/** Force dynamic rendering — fetches live data on every request */
export const dynamic = "force-dynamic";

/** Fetch dashboard stats and all orders */
async function getDashboardStats() {
  try {
    const supabase = createAdminClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Orders placed in the last 60 minutes — "needs action" alert
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Today's orders for stats
    const { data: todayOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_cents, status, created_at")
      .gte("created_at", todayStart.toISOString());

    if (ordersError) console.error("[Dashboard] Orders error:", ordersError);

    // All orders for the filterable table
    const { data: allOrders, error: allError } = await supabase
      .from("orders")
      .select("id, customer_name, customer_email, total_cents, status, created_at, completed_at, invoice_url")
      .order("created_at", { ascending: false });

    if (allError) console.error("[Dashboard] All orders error:", allError);

    const orders = todayOrders ?? [];
    const totalRevenue = orders
      .filter((o) => o.status === "paid")
      .reduce((sum: number, o: { total_cents: number }) => sum + o.total_cents, 0);

    // New unactioned orders in last 60 min (paid but not yet completed/cancelled)
    const newOrders = orders.filter(
      (o) => o.status === "paid" && new Date(o.created_at) >= oneHourAgo
    ).length;

    return {
      ordersToday: orders.length,
      revenueToday: totalRevenue,
      newOrders,
      allOrders: (allOrders ?? []) as OrderRow[],
    };
  } catch (err) {
    console.error("[Dashboard] Unexpected error:", err);
    return { ordersToday: 0, revenueToday: 0, newOrders: 0, allOrders: [] };
  }
}

/** Admin dashboard page */
export default async function AdminDashboardPage() {
  const { ordersToday, revenueToday, newOrders, allOrders } = await getDashboardStats();

  return (
    <div>
      {/* Page heading */}
      <h1 className="font-yatra text-3xl text-brand-heading mb-2">Dashboard</h1>
      <hr className="divider-spice mb-8" />

      {/* ── New orders alert banner ── */}
      {newOrders > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-300
                        rounded-2xl px-5 py-4 shadow-sm">
          {/* Pulsing dot */}
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
          </span>
          <p className="font-hind text-amber-800 text-sm font-semibold">
            🔔 &nbsp;{newOrders} new order{newOrders !== 1 ? "s" : ""} in the last hour — needs your attention!
          </p>
          <Link
            href="#orders"
            className="ml-auto font-hind text-xs text-amber-700 hover:text-amber-900
                       underline underline-offset-2 shrink-0"
          >
            View orders ↓
          </Link>
        </div>
      )}

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard emoji="🔔" label="New (Last Hour)" value={String(newOrders)}
          highlight={newOrders > 0} />
        <StatCard emoji="📦" label="Orders Today" value={String(ordersToday)} />
        <StatCard emoji="💰" label="Revenue Today" value={formatPrice(revenueToday)} />
      </div>

      {/* ── Filterable orders table ── */}
      <div id="orders">
        <OrdersTable orders={allOrders} />
      </div>
    </div>
  );
}

/** Small summary stat card */
function StatCard({
  emoji, label, value, href, highlight,
}: {
  emoji: string; label: string; value: string; href?: string; highlight?: boolean;
}) {
  const content = (
    <div className={`border rounded-xl p-5 shadow-sm flex items-center gap-4
                     hover:shadow-md transition-shadow
                     ${highlight
                       ? "bg-amber-50 border-amber-300"
                       : "bg-brand-card border-brand-wood/25"}`}>
      <span className="text-3xl">{emoji}</span>
      <div>
        <p className="font-hind text-brand-muted text-xs uppercase tracking-wide">{label}</p>
        <p className={`font-playfair text-2xl font-semibold
                       ${highlight ? "text-amber-700" : "text-brand-heading"}`}>
          {value}
        </p>
      </div>
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

