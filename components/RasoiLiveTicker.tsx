"use client";
/**
 * RasoiLiveTicker — scrolling marquee banner just below the navbar.
 * Shows live kitchen status + rotating specials/promo messages.
 * Pauses on hover. Hidden on /admin routes.
 */
import { usePathname } from "next/navigation";
import { useKitchenStatus } from "@/hooks/useKitchenStatus";
import { useState, useEffect } from "react";

/** Static ticker items — mix of promos, warmth, and today's vibe */
const TICKER_ITEMS = [
  "🍛 Dal Makhani — slow-cooked overnight, just like nani banati thi",
  "🌶️ Fresh masalas ground every morning — no shortcuts, no packets",
  "✨ Aaj ka Special — check Today's Specials section below!",
  "🎉 Kitty Party & Get Together catering available — call Veena ji",
  "🫙 Ancestral Rajasthani recipes passed down through generations",
  "🏠 Ghar ka khana, dil se banaya — Order Food For Any Mood",
  "🪔 Made with love by Rajeshwari & Veena Khandelwal",
  "🌿 100% fresh — no frozen ingredients, ever",
  "📞 Call to order: +91 98290 75457 · +91 99821 28866",
];

/**
 * Horizontal scrolling ticker with live kitchen open/closed status dot.
 */
export default function RasoiLiveTicker() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { isOpen, closingSoon, scheduleText } = useKitchenStatus();

  // Hide on admin routes or before hydration
  if (!mounted || pathname?.startsWith("/admin")) return null;

  // Duplicate items so the scroll loops seamlessly
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="w-full bg-brand-dark border-b border-brand-gold/15 overflow-hidden"
      style={{ height: "32px" }}>
      <div className="flex items-center h-full">

        {/* Left badge — live status pill, always visible */}
        <div className={`flex items-center gap-1.5 px-3 h-full shrink-0 border-r z-10
                         ${isOpen
                           ? closingSoon
                             ? "bg-amber-500/20 border-amber-400/20"
                             : "bg-green-500/15 border-green-400/15"
                           : "bg-red-500/15 border-red-400/15"
                         }`}
          style={{ minWidth: "fit-content" }}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0
            ${isOpen ? closingSoon ? "bg-amber-400" : "bg-green-400" : "bg-red-400"}`} />
          <span className={`font-hind text-xs font-semibold whitespace-nowrap
            ${isOpen ? closingSoon ? "text-amber-300" : "text-green-300" : "text-red-300"}`}>
            {isOpen ? closingSoon ? "Closing Soon" : "Open Now" : "Closed"}
          </span>
          <span className="font-hind text-xs text-brand-on-dark/40 whitespace-nowrap hidden sm:inline">
            · {scheduleText}
          </span>
        </div>

        {/* Scrolling ticker track */}
        <div className="overflow-hidden flex-1 relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, #3B1F0C, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, #3B1F0C, transparent)" }} />

          <div className="ticker-track flex items-center gap-0 whitespace-nowrap h-8">
            {items.map((item, i) => (
              <span key={i} className="font-hind text-xs text-brand-on-dark/70 px-6 flex items-center gap-1.5 shrink-0">
                {item}
                {/* Separator dot */}
                <span className="text-brand-gold/40 ml-6">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

