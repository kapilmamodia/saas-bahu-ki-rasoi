// Root layout — applies brand fonts, CSS custom properties, and CartProvider.
// Admin routes render their own layout shell — public Navbar/Footer are hidden for them.
import type { Metadata } from "next";
import { Yatra_One, Playfair_Display, Hind, Caveat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/hooks/useCart";
import ConditionalShell from "@/components/ConditionalShell";

// ── Google Fonts ─────────────────────────────────────────────────────────────
/** Hero / display headings — hand-lettered warmth */
const yatraOne = Yatra_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-yatra",
  display: "swap",
});

/** Section headings — editorial serif personality */
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

/** Body and UI text — clean and highly legible */
const hind = Hind({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-hind",
  display: "swap",
});

/** Badges and accents — casual handwritten feel */
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Saas Bahu Ki Rasoi — Order Food For Any Mood",
  description:
    "Home-cooked Indian food by Rajeshwari & Veena Khandelwal. Individual orders, Kitty Party and Get Together catering.",
};

/** Root layout — wraps every page with fonts, brand CSS vars, and CartProvider */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`
          ${yatraOne.variable} ${playfair.variable}
          ${hind.variable} ${caveat.variable}
          font-hind antialiased bg-brand-bg text-brand-body
        `}
      >
        {/* Cart context wraps entire app so any component can access cart state */}
        <CartProvider>
          {/* ConditionalShell hides public Navbar/Footer on /admin routes */}
          <ConditionalShell>{children}</ConditionalShell>
        </CartProvider>
      </body>
    </html>
  );
}
