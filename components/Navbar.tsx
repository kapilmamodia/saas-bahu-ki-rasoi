"use client";
// Navbar — appears on all pages. Shows the restaurant logo/name, navigation
// links, and a cart icon with item count badge.
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

/**
 * Top navigation bar with brand colours (espresso brown).
 * Cart badge shows total item count from CartContext.
 */
export default function Navbar() {
  const { itemCount } = useCart();

  return (
    <nav
      // Espresso brown background, parchment text
      className="bg-brand-dark text-brand-on-dark sticky top-0 z-50 shadow-md"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand name / home link */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="font-yatra text-xl md:text-2xl text-brand-gold tracking-wide">
            Saas Bahu Ki Rasoi
          </span>
        </Link>

        {/* Navigation links + cart */}
        <div className="flex items-center gap-6">
          {/* Menu link */}
          <Link
            href="/menu"
            className="font-hind text-sm md:text-base hover:text-brand-gold transition-colors"
          >
            Menu
          </Link>

          {/* My Orders — between Menu and Cart */}
          <Link
            href="/orders"
            className="font-hind text-sm md:text-base hover:text-brand-gold transition-colors hidden sm:block"
          >
            My Orders
          </Link>

          {/* Cart icon with item count badge */}
          <Link href="/cart" className="relative" aria-label="View cart">
            {/* Gold-tinted cart icon */}
            <ShoppingCart
              size={22}
              className="text-brand-gold hover:text-brand-rust transition-colors"
            />
            {/* Badge — only shown when cart has items */}
            {itemCount > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-brand-rust text-white text-xs
                           font-bold rounded-full w-5 h-5 flex items-center justify-center
                           font-hind"
                aria-label={`${itemCount} items in cart`}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

