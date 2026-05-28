// Admin layout — shared shell for all /admin/* pages EXCEPT (auth) group.
// The (auth) group (login) has its own layout with no auth check.
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

/**
 * Wraps all authenticated admin pages with sidebar nav.
 * Unauthenticated users are redirected to /admin/login.
 * The login page itself lives in (auth)/login so it bypasses this layout.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify session — redirect to login if not authenticated
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen flex bg-brand-bg">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-56 bg-brand-dark text-brand-on-dark flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-yatra text-brand-gold text-lg leading-tight">Saas Bahu Ki Rasoi</p>
          <p className="font-caveat text-brand-on-dark/60 text-sm">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <NavLink href="/admin/dashboard">📊 Dashboard</NavLink>
          <NavLink href="/admin/menu">🍽️ Menu Items</NavLink>
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <AdminLogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-hind text-sm text-brand-on-dark/80 hover:text-brand-gold hover:bg-white/5 px-3 py-2 rounded-lg transition-colors">
      {children}
    </Link>
  );
}
