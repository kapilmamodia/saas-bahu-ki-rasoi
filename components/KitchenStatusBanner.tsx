"use client";
/**
 * KitchenStatusBanner — shows Open/Closed status based on current time (IST).
 * Hours: 10:00 AM – 9:00 PM, every day.
 * Renders a green "Open" or red "Closed" banner with next open/close time.
 */
import { useState, useEffect } from "react";

const OPEN_HOUR  = 10; // 10:00 AM
const CLOSE_HOUR = 21; // 9:00 PM

/** Returns current IST hour (0–23) */
function getISTHour(): number {
  const now = new Date();
  // IST = UTC + 5:30
  const utcMs  = now.getTime() + now.getTimezoneOffset() * 60000;
  const istMs  = utcMs + 5.5 * 3600000;
  return new Date(istMs).getHours();
}

/** Returns current IST minutes */
function getISTMinutes(): number {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istMs = utcMs + 5.5 * 3600000;
  return new Date(istMs).getMinutes();
}

/** Kitchen status banner — mounted client-side to avoid SSR time mismatch */
export default function KitchenStatusBanner() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const hour    = getISTHour();
  const minutes = getISTMinutes();
  const isOpen  = hour >= OPEN_HOUR && hour < CLOSE_HOUR;

  // Minutes until close / open
  const minutesUntilClose = isOpen
    ? (CLOSE_HOUR - hour - 1) * 60 + (60 - minutes)
    : 0;
  const closingSoon = isOpen && minutesUntilClose <= 30;

  return (
    <div className="w-full py-1.5 px-4 text-center bg-brand-wood border-b border-brand-dark/20">
      <p className={`font-hind text-xs flex items-center justify-center gap-2
        ${isOpen ? closingSoon ? "text-amber-200" : "text-green-300" : "text-red-300"}`}>
        <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse flex-shrink-0
          ${isOpen ? closingSoon ? "bg-amber-400" : "bg-green-400" : "bg-red-400"}`} />
        {isOpen
          ? closingSoon
            ? `Kitchen closing soon — closes at 9:00 PM`
            : `Kitchen is Open  ·  10:00 AM – 9:00 PM`
          : hour < OPEN_HOUR
            ? `Kitchen is Closed  ·  Opens today at 10:00 AM`
            : `Kitchen is Closed  ·  Opens tomorrow at 10:00 AM`
        }
      </p>
    </div>
  );
}

