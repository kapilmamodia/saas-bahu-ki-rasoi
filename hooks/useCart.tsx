"use client";
// Global cart state using React Context + localStorage persistence.
// Wrap the app in <CartProvider> (done in app/layout.tsx).
// Consumer components call useCart() to read and mutate cart state.
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { CartItem, CartState, MenuItem } from "@/types";

/** The key used to persist cart data in localStorage */
const CART_STORAGE_KEY = "sbkr_cart";

const CartContext = createContext<CartState | null>(null);

/**
 * Wraps the application and provides cart state to all descendants.
 * Cart is persisted to localStorage so it survives page refreshes.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Rehydrate cart from localStorage on initial mount (client-side only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // Ignore parse errors — start with an empty cart
    }
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /** Add one unit of a menu item; increments quantity if already in cart */
  const addItem = (menuItem: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === menuItem.id);
      if (existing) {
        // Increment existing item's quantity
        return prev.map((i) =>
          i.menuItem.id === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      // Add as a new cart line
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  /** Remove a menu item from the cart entirely */
  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.menuItem.id !== id));

  /** Set exact quantity; passing 0 or less removes the item */
  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setItems((prev) =>
      prev.map((i) => (i.menuItem.id === id ? { ...i, quantity: qty } : i))
    );
  };

  /** Empty the entire cart */
  const clearCart = () => setItems([]);

  // Running total in paise (sum of price × qty for each line)
  const totalCents = items.reduce(
    (sum, i) => sum + i.menuItem.price_cents * i.quantity,
    0
  );

  // Total number of individual items (sum of quantities, not unique items)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCents,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook to access cart state.
 * Must be called inside a component wrapped by CartProvider.
 */
export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

