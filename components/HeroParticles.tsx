"use client";
/**
 * HeroParticles — floating spice/food emoji particles that drift across the hero.
 * Pure CSS animations — no canvas, no heavy libs. Respects prefers-reduced-motion.
 */
import { useEffect, useState } from "react";

interface Particle {
  emoji: string;
  top: string;
  left: string;
  size: string;
  animClass: string;
  delay: string;
  blur: string;
}

/** Fixed particle definitions — deterministic so no hydration mismatch */
const PARTICLES: Particle[] = [
  { emoji: "🌶️", top: "12%",  left: "8%",   size: "1.6rem", animClass: "particle-float-slow",  delay: "0s",    blur: "0px"   },
  { emoji: "🫙",  top: "22%",  left: "88%",  size: "1.4rem", animClass: "particle-float-med",   delay: "0.8s",  blur: "1px"   },
  { emoji: "🌿",  top: "55%",  left: "5%",   size: "1.2rem", animClass: "particle-drift-right", delay: "1.2s",  blur: "0.5px" },
  { emoji: "✨",  top: "70%",  left: "92%",  size: "1rem",   animClass: "particle-float-fast",  delay: "0.4s",  blur: "0px"   },
  { emoji: "🧅",  top: "35%",  left: "78%",  size: "1.5rem", animClass: "particle-float-slow",  delay: "2s",    blur: "1px"   },
  { emoji: "🫚",  top: "80%",  left: "18%",  size: "1.3rem", animClass: "particle-drift-left",  delay: "1.6s",  blur: "0.5px" },
  { emoji: "🍃",  top: "18%",  left: "55%",  size: "1.1rem", animClass: "particle-float-med",   delay: "0.2s",  blur: "0px"   },
  { emoji: "🌰",  top: "62%",  left: "70%",  size: "1.2rem", animClass: "particle-float-fast",  delay: "2.5s",  blur: "1px"   },
  { emoji: "🪔",  top: "45%",  left: "95%",  size: "1.4rem", animClass: "particle-drift-left",  delay: "0.9s",  blur: "0.5px" },
  { emoji: "🌸",  top: "88%",  left: "45%",  size: "1rem",   animClass: "particle-float-slow",  delay: "1.8s",  blur: "0px"   },
  { emoji: "🫙",  top: "8%",   left: "35%",  size: "1.3rem", animClass: "particle-drift-right", delay: "3s",    blur: "1px"   },
  { emoji: "🌶️", top: "75%",  left: "60%",  size: "1.1rem", animClass: "particle-float-med",   delay: "0.6s",  blur: "0.5px" },
];

/**
 * Renders fixed-position spice particle emojis that float with CSS keyframe animations.
 * Mounted client-side only to avoid SSR mismatch.
 */
export default function HeroParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={p.animClass}
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            fontSize: p.size,
            animationDelay: p.delay,
            filter: p.blur !== "0px" ? `blur(${p.blur})` : undefined,
            opacity: 0.55,
            userSelect: "none",
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

