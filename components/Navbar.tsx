"use client";
// Navbar — sticky top nav with animated cart bounce on item add.
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState, useEffect, useRef } from "react";

/**
 * Top navigation bar.
 * Cart icon bounces (animate-cart-bounce) whenever a new item is added.
 */
export default function Navbar() {
  const { itemCount, totalCents } = useCart();
  const prevCountRef = useRef(itemCount);
  const [bouncing, setBouncing] = useState(false);

  const formatTotal = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setBouncing(true);
      const t = setTimeout(() => setBouncing(false), 500);
      return () => clearTimeout(t);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  return (
    <nav className="bg-brand-dark text-brand-on-dark sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand name / home link */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="font-yatra text-xl md:text-2xl text-brand-gold tracking-wide">
            Saas Bahu Ki Rasoi
          </span>
        </Link>

        {/* Navigation links + cart */}
        <div className="flex items-center gap-6">
          <Link href="/menu" className="font-hind text-sm md:text-base hover:text-brand-gold transition-colors">
            Menu
          </Link>
          <Link href="/about" className="font-hind text-sm md:text-base hover:text-brand-gold transition-colors hidden sm:block">
            About Us
          </Link>
          <Link href="/orders" className="font-hind text-sm md:text-base hover:text-brand-gold transition-colors hidden sm:block">
            My Orders
          </Link>


          {/* Cart icon — bounces on item add */}
          <Link href="/cart" className="relative flex items-center gap-2 group" aria-label="View cart">
            <div className={`relative ${bouncing ? "animate-cart-bounce" : ""}`}>
              <ShoppingCart size={22} className="text-brand-gold group-hover:text-brand-rust transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-rust text-white text-xs
                                 font-bold rounded-full w-5 h-5 flex items-center justify-center font-hind"
                  aria-label={`${itemCount} items in cart`}>
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </div>
            {itemCount > 0 && (
              <span className="hidden sm:block font-hind text-sm font-semibold text-brand-gold
                               group-hover:text-brand-rust transition-colors">
                {formatTotal(totalCents)}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
