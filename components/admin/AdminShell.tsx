"use client";
/**
 * AdminShell — responsive admin layout shell.
 *
 * Desktop (md+): permanent sidebar fixed on the left.
 * Mobile       : sidebar hidden; a hamburger button opens a slide-in drawer
 *                overlay with a backdrop that closes it on tap.
 */
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

interface AdminShellProps {
  children: React.ReactNode;
}

/**
 * Renders the full admin chrome — top bar (mobile only), sidebar/drawer,
 * and the main content area. Sidebar state is local to this component.
 */
export default function AdminShell({ children }: AdminShellProps) {
  // Controls whether the mobile drawer is open
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-brand-bg">

      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      {/* Shown only on small screens; hidden on md+ where sidebar is always visible */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30
                         bg-brand-dark flex items-center justify-between px-4 py-3 shadow-md">
        {/* App name */}
        <p className="font-yatra text-brand-gold text-base leading-tight">
          Saas Bahu Ki Rasoi
        </p>
        {/* Hamburger / close toggle */}
        <button
          onClick={() => setDrawerOpen((prev) => !prev)}
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          className="text-brand-on-dark hover:text-brand-gold transition-colors p-1"
        >
          {drawerOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── Backdrop (mobile only) — tap to close drawer ────────────────── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      {/*
        Mobile : absolute drawer that slides in from the left when drawerOpen=true.
        Desktop: always-visible fixed-width sidebar (translate-x-0 locked).
      */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-56 bg-brand-dark text-brand-on-dark flex flex-col shrink-0
          transition-transform duration-300 ease-in-out
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Sidebar header */}
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-yatra text-brand-gold text-lg leading-tight">
            Saas Bahu Ki Rasoi
          </p>
          <p className="font-caveat text-brand-on-dark/60 text-sm">Admin Panel</p>
        </div>

        {/* Nav links — close drawer on navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <NavLink href="/admin/dashboard" onClick={() => setDrawerOpen(false)}>
            📊 Dashboard
          </NavLink>
          <NavLink href="/admin/menu" onClick={() => setDrawerOpen(false)}>
            🍽️ Menu Items
          </NavLink>
          <NavLink href="/admin/coupons" onClick={() => setDrawerOpen(false)}>
            🎟️ Coupons
          </NavLink>
          <NavLink href="/admin/schedule" onClick={() => setDrawerOpen(false)}>
            🗓️ Kitchen Schedule
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <AdminLogoutButton />
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      {/* pt-14 on mobile offsets the fixed top bar; no offset needed on md+ */}
      <main className="flex-1 overflow-auto p-4 pt-16 md:pt-0 md:p-8">
        {children}
      </main>
    </div>
  );
}

/** Single nav link — forwards onClick so the drawer closes on mobile navigation */
function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="font-hind text-sm text-brand-on-dark/80 hover:text-brand-gold
                 hover:bg-white/5 px-3 py-2 rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}

