"use client";
/**
 * KitchenStatusCardClient — uses useKitchenStatus so DB overrides are respected.
 */
import { useKitchenStatus } from "@/hooks/useKitchenStatus";

export default function KitchenStatusCardClient() {
  const { isOpen, closingSoon, nextOpenText, scheduleText, overrideNote } = useKitchenStatus();

  return (
    <div className={`rounded-xl px-4 py-3 border
      ${isOpen
        ? closingSoon ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"
        : "bg-red-50 border-red-200"}`}>
      <p className="font-hind text-xs text-brand-muted uppercase tracking-wide mb-1">Current Status</p>
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full animate-pulse
          ${isOpen ? closingSoon ? "bg-amber-500" : "bg-green-500" : "bg-red-500"}`} />
        <p className={`font-playfair font-semibold
          ${isOpen ? closingSoon ? "text-amber-700" : "text-green-700" : "text-red-700"}`}>
          {isOpen ? closingSoon ? "Closing Soon" : "Open Now" : "Closed"}
        </p>
      </div>
      {isOpen
        ? <p className="font-caveat text-green-600 text-sm mt-1">{scheduleText}</p>
        : <p className="font-caveat text-red-500 text-sm mt-1">
            {overrideNote ? overrideNote : nextOpenText}
          </p>
      }
    </div>
  );
}
