"use client";
/**
 * OrderAgainButton — adds all items from a past order back into the cart.
 * Shown in the expanded section of each order card on /orders.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import type { OrderItem, MenuItem } from "@/types";

interface OrderAgainButtonProps {
  /** Line items from the past order */
  items: OrderItem[];
}

/**
 * On click: adds each past order item to the cart (by reconstructing a
 * minimal MenuItem shape from the snapshot stored on the order).
 * Then redirects to /cart so the customer can review and checkout.
 */
export default function OrderAgainButton({ items }: OrderAgainButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [done, setDone] = useState(false);

  const handleOrderAgain = () => {
    // Add each item the correct number of times using the snapshotted data
    items.forEach((item) => {
      const menuItem: MenuItem = {
        id: item.menu_item_id,
        name: item.item_name,
        price_cents: item.item_price_cents,
        description: "",
        category_id: "",
        is_available: true,
        is_special: false,
        is_veg: true,
        is_vegan: false,
        is_gf: false,
        special_note: null,
        photo_url: null,
        deleted_at: null,
        created_at: "",
        updated_at: "",
      };
      for (let i = 0; i < item.quantity; i++) {
        addItem(menuItem);
      }
    });
    setDone(true);
    // Navigate to cart after a short moment
    setTimeout(() => router.push("/cart"), 600);
  };

  return (
    <button
      onClick={handleOrderAgain}
      disabled={done}
      className="flex items-center justify-center gap-2 w-full mt-2
                 bg-brand-gold hover:bg-brand-rust text-brand-dark font-hind
                 font-semibold py-2.5 rounded-full transition-colors text-sm shadow-sm
                 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {done ? <Check size={15} /> : <ShoppingBag size={15} />}
      {done ? "Added to cart! Taking you there…" : "🔁 Order Again"}
    </button>
  );
}

