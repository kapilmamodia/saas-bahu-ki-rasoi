// Tailwind config — extends default theme with brand colors and fonts from spec.md.
import type { Config } from "tailwindcss";

const config: Config = {
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
    },
  },
  plugins: [],
};

export default config;
