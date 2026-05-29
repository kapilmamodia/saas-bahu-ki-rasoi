"use client";
/**
 * HomeKitchenStatus — fetches live status including DB overrides via useKitchenStatus hook.
 */
import { useState, useEffect } from "react";
import { useKitchenStatus } from "@/hooks/useKitchenStatus";

export default function HomeKitchenStatus() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { isOpen, closingSoon, nextOpenText, scheduleText, overrideNote } = useKitchenStatus();

  if (!mounted) return null;

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-hind text-xs mb-4
      ${isOpen
        ? closingSoon
          ? "bg-amber-500/15 border-amber-400/30 text-amber-300"
          : "bg-green-500/15 border-green-400/30 text-green-300"
        : "bg-red-500/15 border-red-400/30 text-red-300"
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0
        ${isOpen ? closingSoon ? "bg-amber-400" : "bg-green-400" : "bg-red-400"}`} />
      {isOpen
        ? closingSoon
          ? `Closing soon · ${scheduleText}`
          : `Open Now · ${scheduleText}`
        : overrideNote
          ? `Closed · ${overrideNote} · ${nextOpenText}`
          : `Closed · ${nextOpenText}`
      }
    </div>
  );
}
