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

    // Today's orders for stats
    const { data: todayOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_cents, status")
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

    return {
      ordersToday: orders.length,
      revenueToday: totalRevenue,
      allOrders: (allOrders ?? []) as OrderRow[],
    };
  } catch (err) {
    console.error("[Dashboard] Unexpected error:", err);
    return { ordersToday: 0, revenueToday: 0, allOrders: [] };
  }
}

/** Admin dashboard page */
export default async function AdminDashboardPage() {
  const { ordersToday, revenueToday, allOrders } = await getDashboardStats();

  return (
    <div>
      {/* Page heading */}
      <h1 className="font-yatra text-3xl text-brand-heading mb-2">Dashboard</h1>
      <hr className="divider-spice mb-8" />

      {/* ── Summary cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard emoji="📦" label="Orders Today" value={String(ordersToday)} />
        <StatCard emoji="💰" label="Revenue Today" value={formatPrice(revenueToday)} />
        <StatCard emoji="🍽️" label="Menu" value="Manage" href="/admin/menu" />
      </div>

      {/* ── Filterable orders table (Client Component) ──────────────────── */}
      <OrdersTable orders={allOrders} />
    </div>
  );
}

/** Small summary stat card */
function StatCard({
  emoji, label, value, href,
}: {
  emoji: string; label: string; value: string; href?: string;
}) {
  const content = (
    <div className="bg-brand-card border border-brand-wood/25 rounded-xl p-5 shadow-sm
                    flex items-center gap-4 hover:shadow-md transition-shadow">
      <span className="text-3xl">{emoji}</span>
      <div>
        <p className="font-hind text-brand-muted text-xs uppercase tracking-wide">{label}</p>
        <p className="font-playfair text-2xl text-brand-heading font-semibold">{value}</p>
      </div>
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

