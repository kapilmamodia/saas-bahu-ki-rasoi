"use client";
/**
 * ConfettiBurst — fires a celebratory confetti animation on mount.
 * Used on the order confirmation page when isPaid = true.
 * Uses canvas-confetti for the burst effect with brand colors.
 */
import { useEffect } from "react";
import confetti from "canvas-confetti";

/** Brand colors used for confetti particles */
const BRAND_COLORS = ["#D4A017", "#C0622A", "#7B4A1E", "#7A9E7E", "#F5EDD6"];

/**
 * Fires two overlapping confetti cannons from left and right on mount.
 * No visible DOM element — purely a side-effect component.
 */
export default function ConfettiBurst() {
  useEffect(() => {
    // Small delay so the page has painted before firing
    const timer = setTimeout(() => {
      // Left cannon
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.6 },
        colors: BRAND_COLORS,
        gravity: 0.9,
        scalar: 1.1,
      });
      // Right cannon (slight delay for stagger)
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.6 },
          colors: BRAND_COLORS,
          gravity: 0.9,
          scalar: 1.1,
        });
      }, 150);
      // Center burst for extra drama
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { x: 0.5, y: 0.4 },
          colors: BRAND_COLORS,
          gravity: 0.7,
          scalar: 0.9,
        });
      }, 300);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // No visible output — just the side effect
  return null;
}

