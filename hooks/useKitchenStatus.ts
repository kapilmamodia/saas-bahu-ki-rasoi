"use client";
/**
 * hooks/useKitchenStatus.ts
 * Fetches live kitchen status from /api/kitchen-status (includes DB overrides).
 * Falls back to clock-only status until the fetch resolves.
 * Re-fetches every 60 seconds so status stays current.
 */
import { useState, useEffect } from "react";
import { getKitchenStatus, type KitchenStatus } from "@/lib/kitchenHours";

export function useKitchenStatus(): KitchenStatus {
  // Initial state: clock-only (instant, no flicker)
  const [status, setStatus] = useState<KitchenStatus>(getKitchenStatus());

  const fetchStatus = async () => {
    try {
      const res  = await fetch("/api/kitchen-status", { cache: "no-store" });
      const data = await res.json() as KitchenStatus;
      setStatus(data);
    } catch {
      // Network error — fall back to clock-only
      setStatus(getKitchenStatus());
    }
  };

  useEffect(() => {
    fetchStatus(); // fetch immediately on mount
    const t = setInterval(fetchStatus, 60000); // refresh every minute
    return () => clearInterval(t);
  }, []);

  return status;
}

