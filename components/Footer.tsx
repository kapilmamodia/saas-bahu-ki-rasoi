"use client";
/**
 * Footer — public site footer with brand identity, quick links, contact and copyright.
 * Hidden on /admin routes (ConditionalShell handles that).
 * The Opening Hours box is a live client island fed by useKitchenStatus (DB overrides included).
 */
import Link from "next/link";
import { useState, useEffect } from "react";
import { useKitchenStatus } from "@/hooks/useKitchenStatus";

// ── Live Kitchen Status island ────────────────────────────────────────────────

/**
 * FooterKitchenStatus — live open/closed badge + hours in the footer.
 * Reads from useKitchenStatus so DB overrides (holidays, custom hours) are reflected.
 */
function FooterKitchenStatus() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { isOpen, closingSoon, scheduleText, nextOpenText, overrideNote } = useKitchenStatus();

  if (!mounted) {
    // Server-side / before hydration — show static skeleton
    return (
      <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-xl px-3 py-2.5 animate-pulse">
        <div className="h-3 w-24 bg-brand-gold/20 rounded mb-2" />
        <div className="h-3 w-36 bg-brand-gold/10 rounded" />
      </div>
    );
  }

  return (
    <div className={`rounded-xl px-3 py-2.5 border transition-colors
      ${isOpen
        ? closingSoon
          ? "bg-amber-500/10 border-amber-400/25"
          : "bg-green-500/10 border-green-400/20"
        : "bg-red-500/10 border-red-400/20"
      }`}>

      {/* Status row — dot + label */}
      <div className="flex items-center gap-2 mb-1">
        {/* Animated pulsing status dot */}
        <span className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0
          ${isOpen ? closingSoon ? "bg-amber-400" : "bg-green-400" : "bg-red-400"}`} />
        <p className={`font-caveat text-base font-semibold
          ${isOpen ? closingSoon ? "text-amber-300" : "text-green-300" : "text-red-300"}`}>
          {isOpen
            ? closingSoon ? "⏰ Closing Soon" : "🟢 Open Now"
            : "🔴 Closed"
          }
        </p>
      </div>

      {/* Hours from DB */}
      <p className="font-hind text-brand-on-dark/70 text-xs leading-snug">
        🕙 {scheduleText}
      </p>

      {/* When closed — show override note + next open time */}
      {!isOpen && (
        <p className="font-hind text-brand-on-dark/50 text-xs mt-1 leading-snug">
          {overrideNote && <span className="block">{overrideNote}</span>}
          {nextOpenText}
        </p>
      )}

      {/* When closing soon — show next open */}
      {isOpen && closingSoon && (
        <p className="font-hind text-amber-300/70 text-xs mt-1">
          {nextOpenText}
        </p>
      )}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

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

        {/* Column 3 — Contact + Live Hours */}
        <div>
          <p className="font-playfair text-brand-gold text-base font-semibold mb-4">
            Contact Us
          </p>
          <div className="flex flex-col gap-3">
            {/* Veena */}
            <div>
              <p className="font-caveat text-brand-on-dark/60 text-sm">Veena Khandelwal</p>
              <a href="tel:+919829075457"
                className="font-hind text-sm text-brand-on-dark/80 hover:text-brand-gold transition-colors">
                📞 +91 98290 75457
              </a>
            </div>
            {/* Rajeshwari */}
            <div>
              <p className="font-caveat text-brand-on-dark/60 text-sm">Rajeshwari Khandelwal</p>
              <a href="tel:+919982128866"
                className="font-hind text-sm text-brand-on-dark/80 hover:text-brand-gold transition-colors">
                📞 +91 99821 28866
              </a>
            </div>

            {/* Live kitchen status — DB-driven open/close hours */}
            <FooterKitchenStatus />

            {/* Catering */}
            <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-xl px-3 py-2">
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

