// Admin dashboard — summary stats and recent orders.
// Server Component: fetches data using the service role client.
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

/** Format paise to rupees */
function formatPrice(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

/** Fetch today's order stats */
async function getDashboardStats() {
  try {
    const supabase = createAdminClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Orders created today
    const { data: todayOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_cents, status, customer_name, customer_email, created_at")
      .gte("created_at", todayStart.toISOString())
      .order("created_at", { ascending: false });

    if (ordersError) console.error("[Dashboard] Orders error:", ordersError);

    // Last 20 orders overall
    const { data: recentOrders, error: recentError } = await supabase
      .from("orders")
      .select("id, customer_name, customer_email, total_cents, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (recentError) console.error("[Dashboard] Recent orders error:", recentError);

    const orders = todayOrders ?? [];
    const totalRevenue = orders
      .filter((o) => o.status === "paid")
      .reduce((sum: number, o: { total_cents: number }) => sum + o.total_cents, 0);

    return {
      ordersToday: orders.length,
      revenueToday: totalRevenue,
      recentOrders: recentOrders ?? [],
    };
  } catch (err) {
    console.error("[Dashboard] Unexpected error:", err);
    return { ordersToday: 0, revenueToday: 0, recentOrders: [] };
  }
}

/** Status badge colour */
function statusColor(status: string) {
  if (status === "paid") return "bg-brand-sage/20 text-brand-sage";
  if (status === "refunded") return "bg-brand-rust/20 text-brand-rust";
  return "bg-brand-gold/20 text-brand-gold"; // pending
}

/** Admin dashboard page */
export default async function AdminDashboardPage() {
  const { ordersToday, revenueToday, recentOrders } = await getDashboardStats();

  return (
    <div>
      {/* Page heading */}
      <h1 className="font-yatra text-3xl text-brand-heading mb-2">Dashboard</h1>
      <hr className="divider-spice mb-8" />

      {/* ── Summary cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard
          emoji="📦"
          label="Orders Today"
          value={String(ordersToday)}
        />
        <StatCard
          emoji="💰"
          label="Revenue Today"
          value={formatPrice(revenueToday)}
        />
        <StatCard
          emoji="🍽️"
          label="Menu"
          value="Manage"
          href="/admin/menu"
        />
      </div>

      {/* ── Recent orders table ─────────────────────────────────────────── */}
      <div className="bg-brand-card border border-brand-wood/25 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-wood/15 flex items-center justify-between">
          <h2 className="font-playfair text-xl text-brand-heading">Recent Orders</h2>
          <span className="font-caveat text-brand-muted text-sm">Last 20</span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🛒</p>
            <p className="font-playfair text-brand-heading">No orders yet today — they&apos;re coming!</p>
          </div>
        ) : (
          /* Horizontally scrollable on mobile */
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-hind">
              <thead className="bg-brand-bg text-brand-muted uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: {
                  id: string;
                  customer_name: string;
                  customer_email: string;
                  total_cents: number;
                  status: string;
                  created_at: string;
                }) => (
                  <tr key={order.id} className="border-t border-brand-wood/10 hover:bg-brand-bg/50">
                    <td className="px-4 py-3 text-brand-muted font-mono text-xs">
                      {order.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-brand-heading font-medium">{order.customer_name || "—"}</p>
                      <p className="text-brand-muted text-xs">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-brand-gold font-semibold">
                      {formatPrice(order.total_cents)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-caveat text-sm px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-muted">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/** Small summary stat card */
function StatCard({
  emoji,
  label,
  value,
  href,
}: {
  emoji: string;
  label: string;
  value: string;
  href?: string;
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

