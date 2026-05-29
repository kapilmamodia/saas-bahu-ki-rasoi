"use client";
/**
 * Footer — public site footer with brand identity, quick links, contact and copyright.
 * Hidden on /admin routes (ConditionalShell handles that).
 */
import Link from "next/link";

/** Public site footer */
export default function Footer() {
  return (
    <footer className="bg-brand-dark text-brand-on-dark">

      {/* ── Top dot-dash divider ── */}
      <div className="h-1 bg-gradient-to-r from-brand-gold via-brand-rust to-brand-gold opacity-60" />

      {/* ── Main footer content ── */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">

        {/* Column 1 — Brand */}
        <div className="flex flex-col gap-3">
          <p className="font-yatra text-2xl text-brand-gold leading-tight">
            Saas Bahu Ki Rasoi
          </p>
          <p className="font-caveat text-brand-on-dark/70 text-base leading-snug">
            Order Food For Any Mood
          </p>
          <p className="font-hind text-brand-on-dark/50 text-sm leading-relaxed">
            Authentic home-cooked Rajasthani &amp; UP food, made with love by Veena &amp; Rajeshwari Khandelwal.
          </p>
          {/* Decorative motif */}
          <div className="flex items-center gap-2 mt-1 opacity-40">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-brand-gold text-sm">🪔</span>
            <div className="h-px w-8 bg-brand-gold" />
          </div>
        </div>

        {/* Column 2 — Quick Links */}
        <div>
          <p className="font-playfair text-brand-gold text-base font-semibold mb-4">
            Quick Links
          </p>
          <ul className="flex flex-col gap-2">
            {[
              { label: "Home",      href: "/"       },
              { label: "Menu",      href: "/menu"   },
              { label: "About Us",  href: "/about"  },
              { label: "My Orders", href: "/orders" },
              { label: "Cart",      href: "/cart"   },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="font-hind text-sm text-brand-on-dark/70 hover:text-brand-gold transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 — Contact */}
        <div>
          <p className="font-playfair text-brand-gold text-base font-semibold mb-4">
            Contact Us
          </p>
          <div className="flex flex-col gap-3">
            {/* Veena */}
            <div>
              <p className="font-caveat text-brand-on-dark/60 text-sm">Veena Khandelwal</p>
              <a
                href="tel:+91XXXXXXXXXX"
                className="font-hind text-sm text-brand-on-dark/80 hover:text-brand-gold transition-colors"
              >
                📞 +91 XXX-XX-XXXX
              </a>
            </div>
            {/* Rajeshwari */}
            <div>
              <p className="font-caveat text-brand-on-dark/60 text-sm">Rajeshwari Khandelwal</p>
              <a
                href="tel:+91XXXXXXXXXX"
                className="font-hind text-sm text-brand-on-dark/80 hover:text-brand-gold transition-colors"
              >
                📞 +91 XXX-XX-XXXX
              </a>
            </div>
            {/* Catering */}
            <div className="mt-1 bg-brand-gold/10 border border-brand-gold/20 rounded-xl px-3 py-2">
              <p className="font-caveat text-brand-gold text-sm">
                🎉 Kitty Party &amp; Get Together catering available!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-caveat text-brand-on-dark/50 text-sm">
            Made with ❤️ in our rasoi — Rajeshwari &amp; Veena Khandelwal
          </p>
          <p className="font-hind text-brand-on-dark/40 text-xs">
            © {new Date().getFullYear()} Saas Bahu Ki Rasoi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

