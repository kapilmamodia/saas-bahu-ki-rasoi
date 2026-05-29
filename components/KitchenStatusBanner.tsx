"use client";
/**
 * KitchenStatusBanner — uses useKitchenStatus hook so DB overrides are respected.
 */
import { useState, useEffect } from "react";
import { useKitchenStatus } from "@/hooks/useKitchenStatus";

export default function KitchenStatusBanner() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { isOpen, closingSoon, nextOpenText, scheduleText, overrideNote } = useKitchenStatus();

  if (!mounted) return null;

  return (
    <div className="w-full py-1.5 px-4 text-center bg-brand-wood border-b border-brand-dark/20">
      <p className={`font-hind text-xs flex items-center justify-center gap-2
        ${isOpen ? closingSoon ? "text-amber-200" : "text-green-300" : "text-red-300"}`}>
        <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse flex-shrink-0
          ${isOpen ? closingSoon ? "bg-amber-400" : "bg-green-400" : "bg-red-400"}`} />
        {isOpen
          ? closingSoon
            ? `Kitchen closing soon · ${scheduleText}`
            : `Kitchen is Open · ${scheduleText}`
          : overrideNote
            ? `Kitchen is Closed · ${overrideNote} · ${nextOpenText}`
            : `Kitchen is Closed · ${nextOpenText}`
        }
      </p>
    </div>
  );
}
