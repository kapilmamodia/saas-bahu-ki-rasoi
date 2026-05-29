// Tailwind config — extends default theme with brand colors and fonts from spec.md.
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Brand Color Palette ─────────────────────────────────────────────────
      colors: {
        brand: {
          // Backgrounds
          bg:      "#F5EDD6",   // aged parchment / cream
          card:    "#FDF6E3",   // warm off-white for cards
          dark:    "#3B1F0C",   // deep espresso brown (nav, footer)
          // Primary actions
          wood:    "#7B4A1E",   // warm mid-brown — CTA buttons
          rust:    "#C0622A",   // terracotta rust — hover states, badges
          gold:    "#D4A017",   // turmeric gold — highlights, icons, prices
          // Folk art accents
          sage:    "#7A9E7E",   // muted sage green
          terra:   "#E07B39",   // warm terracotta
          // Text
          heading: "#2C1A0E",   // dark brown headings
          body:    "#4A3728",   // medium brown body copy
          muted:   "#8B6F5E",   // muted captions, placeholders
          "on-dark": "#F5EDD6", // parchment on dark backgrounds
        },
      },
      // ── Brand Fonts ─────────────────────────────────────────────────────────
      fontFamily: {
        yatra:    ["var(--font-yatra)", "serif"],
        playfair: ["var(--font-playfair)", "serif"],
        hind:     ["var(--font-hind)", "sans-serif"],
        caveat:   ["var(--font-caveat)", "cursive"],
      },
      // ── Custom animations ────────────────────────────────────────────────────
      keyframes: {
        "slide-up": {
          "0%":   { transform: "translateY(120%)", opacity: "0" },
          "100%": { transform: "translateY(0%)",   opacity: "1" },
        },
        // Blinking cursor for typewriter effect
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0" },
        },
        // Cart shake on item add
        "cart-bounce": {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "20%":       { transform: "scale(1.3) rotate(-8deg)" },
          "40%":       { transform: "scale(1.2) rotate(8deg)" },
          "60%":       { transform: "scale(1.15) rotate(-4deg)" },
          "80%":       { transform: "scale(1.1) rotate(2deg)" },
        },
      },
      animation: {
        "slide-up":    "slide-up 0.5s ease-out forwards",
        "blink":       "blink 1s step-end infinite",
        "cart-bounce": "cart-bounce 0.5s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
