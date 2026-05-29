"use client";
// Navbar — sticky top nav with cart bounce, floating cart preview, kitchen status pill,
// and a mobile hamburger drawer showing all nav links.
import Link from "next/link";
import { ShoppingCart, X, Home, Menu, UtensilsCrossed, Info, ClipboardList } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useKitchenStatus } from "@/hooks/useKitchenStatus";
import { usePathname } from "next/navigation";

/**
 * Top navigation bar.
 * Desktop: inline links. Mobile: hamburger → full-screen slide-in drawer.
 */
export default function Navbar() {
  const { itemCount, totalCents, items, removeItem } = useCart();
  const kitchenStatus = useKitchenStatus();
  const pathname = usePathname();
  const prevCountRef  = useRef(itemCount);
  const [bouncing, setBouncing]       = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [mounted, setMounted]         = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  // Bounce on item add
  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setBouncing(true);
      const t = setTimeout(() => setBouncing(false), 500);
      return () => clearTimeout(t);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  // Close cart preview when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(e.target as Node)) {
        setPreviewOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /** Mobile nav links config */
  const mobileLinks = [
    { href: "/",       label: "Home",      icon: Home           },
    { href: "/menu",   label: "Menu",      icon: UtensilsCrossed },
    { href: "/about",  label: "About Us",  icon: Info           },
    { href: "/orders", label: "My Orders", icon: ClipboardList  },
    { href: "/cart",   label: "Cart",      icon: ShoppingCart   },
  ];

  return (
    <nav className="bg-brand-dark text-brand-on-dark sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* ── Left: Home link ── */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="Go to home">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-brand-gold/30 flex-shrink-0 bg-brand-wood/20 flex items-center justify-center">
            <Image
              src="/logo-saas-bahu-ki-rasoi.png"
              alt="Saas Bahu Ki Rasoi logo"
              fill
              className="object-cover"
              sizes="32px"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <Home size={16} className="text-brand-gold absolute" />
          </div>
          <span className="font-hind text-sm md:text-base text-brand-gold group-hover:text-brand-rust transition-colors font-semibold">
            Home
          </span>
        </Link>

        {/* ── Centre: Kitchen status pill (desktop only) ── */}
        {mounted && (
          <span className={`hidden sm:flex items-center gap-1.5 font-hind text-xs px-2.5 py-1
                            rounded-full border font-medium
                            ${kitchenStatus.isOpen
                              ? kitchenStatus.closingSoon
                                ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                                : "bg-green-500/15 border-green-400/30 text-green-300"
                              : "bg-red-500/15 border-red-400/30 text-red-300"
                            }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse
              ${kitchenStatus.isOpen ? kitchenStatus.closingSoon ? "bg-amber-400" : "bg-green-400" : "bg-red-400"}`} />
            {kitchenStatus.isOpen
              ? kitchenStatus.closingSoon ? "Closing Soon" : "Open Now"
              : `Closed · ${kitchenStatus.nextOpenText}`
            }
          </span>
        )}

        {/* ── Right: desktop links + cart + mobile hamburger ── */}
        <div className="flex items-center gap-5">

          {/* Desktop-only links */}
          <Link href="/menu"   className="font-hind text-sm md:text-base hover:text-brand-gold transition-colors hidden sm:block">Menu</Link>
          <Link href="/about"  className="font-hind text-sm md:text-base hover:text-brand-gold transition-colors hidden sm:block">About Us</Link>
          <Link href="/orders" className="font-hind text-sm md:text-base hover:text-brand-gold transition-colors hidden sm:block">My Orders</Link>

          {/* ── Cart icon + floating preview ── */}
          <div ref={previewRef} className="relative"
            onMouseEnter={() => itemCount > 0 && setPreviewOpen(true)}
            onMouseLeave={() => setPreviewOpen(false)}>

            <Link href="/cart" className="relative flex items-center gap-2 group" aria-label="View cart">
              <div className={`relative ${bouncing ? "animate-cart-bounce" : ""}`}>
                <ShoppingCart size={22} className="text-brand-gold group-hover:text-brand-rust transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-rust text-white text-xs
                                   font-bold rounded-full w-5 h-5 flex items-center justify-center font-hind">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              {itemCount > 0 && (
                <span className="hidden sm:block font-hind text-sm font-semibold text-brand-gold
                                 group-hover:text-brand-rust transition-colors">
                  {fmt(totalCents)}
                </span>
              )}
            </Link>

            {/* Floating cart preview dropdown — desktop only */}
            {previewOpen && itemCount > 0 && (
              <div className="absolute right-0 top-full mt-3 w-80 z-50
                              bg-brand-card border border-brand-wood/20 rounded-2xl
                              shadow-2xl overflow-hidden hidden md:block"
                style={{ animation: "fadeSlideDown 0.18s ease-out" }}>

                {/* Header */}
                <div className="px-4 py-3 border-b border-brand-wood/10 flex items-center justify-between"
                  style={{ background: "linear-gradient(135deg,rgba(123,74,30,0.07),rgba(212,160,23,0.04))" }}>
                  <p className="font-playfair text-brand-heading text-sm font-semibold">
                    🛒 Your Cart ({itemCount} item{itemCount !== 1 ? "s" : ""})
                  </p>
                  <button onClick={() => setPreviewOpen(false)} className="text-brand-muted hover:text-brand-rust transition-colors">
                    <X size={14} />
                  </button>
                </div>

                {/* Items list — max 4 visible, scrollable */}
                <div className="max-h-56 overflow-y-auto cart-scroll px-3 py-2 flex flex-col gap-2">
                  {items.map(({ menuItem, quantity }) => (
                    <div key={menuItem.id} className="flex items-center gap-3 py-1.5 border-b border-brand-wood/8 last:border-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-brand-bg flex-shrink-0">
                        {menuItem.photo_url
                          ? <Image src={menuItem.photo_url} alt={menuItem.name} fill className="object-cover" sizes="40px" />
                          : <span className="w-full h-full flex items-center justify-center text-lg">🍛</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-hind text-xs text-brand-heading font-medium truncate">{menuItem.name}</p>
                        <p className="font-hind text-xs text-brand-muted">{fmt(menuItem.price_cents)} × {quantity}</p>
                      </div>
                      <span className="font-hind text-xs font-semibold text-brand-gold flex-shrink-0">
                        {fmt(menuItem.price_cents * quantity)}
                      </span>
                      <button onClick={() => removeItem(menuItem.id)}
                        className="text-brand-muted/50 hover:text-brand-rust transition-colors flex-shrink-0"
                        aria-label={`Remove ${menuItem.name}`}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer — total + go to cart */}
                <div className="px-4 py-3 border-t border-brand-wood/10" style={{ background: "rgba(123,74,30,0.04)" }}>
                  <div className="flex justify-between font-playfair text-sm font-bold text-brand-heading mb-2">
                    <span>Total</span>
                    <span className="text-brand-gold">{fmt(totalCents)}</span>
                  </div>
                  <Link href="/cart" onClick={() => setPreviewOpen(false)}
                    className="block w-full text-center bg-brand-wood hover:bg-brand-rust
                               text-white font-hind font-semibold text-sm py-2 rounded-xl
                               transition-colors shadow-sm">
                    Go to Cart →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Hamburger button — mobile only ── */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg
                       hover:bg-white/10 transition-colors text-brand-gold">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer backdrop ── */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 top-[56px] z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile slide-in drawer ── */}
      <div className={`sm:hidden fixed top-[56px] left-0 right-0 z-50
                       bg-brand-dark border-t border-white/10
                       transition-all duration-300 ease-in-out overflow-hidden
                       ${mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>

        {/* Kitchen status — shown in drawer on mobile */}
        {mounted && (
          <div className={`mx-4 mt-4 flex items-center gap-2 px-3 py-2 rounded-xl border
                           ${kitchenStatus.isOpen
                             ? kitchenStatus.closingSoon
                               ? "bg-amber-500/15 border-amber-400/25 text-amber-300"
                               : "bg-green-500/10 border-green-400/20 text-green-300"
                             : "bg-red-500/10 border-red-400/20 text-red-300"
                           }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0
              ${kitchenStatus.isOpen ? kitchenStatus.closingSoon ? "bg-amber-400" : "bg-green-400" : "bg-red-400"}`} />
            <span className="font-hind text-sm">
              {kitchenStatus.isOpen
                ? kitchenStatus.closingSoon ? "Closing Soon" : "Kitchen is Open Now 🟢"
                : `Kitchen Closed · ${kitchenStatus.nextOpenText}`}
            </span>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex flex-col px-4 py-4 gap-1">
          {mobileLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-hind text-base
                          transition-colors
                          ${pathname === href
                            ? "bg-brand-wood text-white font-semibold"
                            : "text-brand-on-dark/80 hover:bg-white/8 hover:text-brand-gold"
                          }`}>
              <Icon size={18} className={pathname === href ? "text-brand-gold" : "text-brand-gold/60"} />
              {label}
              {/* Cart badge in drawer */}
              {href === "/cart" && itemCount > 0 && (
                <span className="ml-auto bg-brand-rust text-white text-xs font-bold
                                 rounded-full px-2 py-0.5 font-hind">
                  {itemCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom divider + tagline */}
        <div className="px-4 pb-5 pt-1 border-t border-white/8">
          <p className="font-caveat text-brand-gold/50 text-sm text-center">
            Order Food For Any Mood 🍛
          </p>
        </div>
      </div>
    </nav>
  );
}
