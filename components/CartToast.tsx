"use client";
/**
 * CartToast — floating "Added to cart" toast notification.
 * Rendered once in layout; triggered via the CartToastContext.
 * Auto-dismisses after 2.5 seconds.
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { ShoppingCart, X } from "lucide-react";

// ── Context ───────────────────────────────────────────────────────────────────
interface CartToastContextValue {
  /** Show the toast with a given item name */
  showToast: (itemName: string) => void;
}

const CartToastContext = createContext<CartToastContextValue | null>(null);

/** Hook to trigger the cart toast from any component */
export function useCartToast(): CartToastContextValue {
  const ctx = useContext(CartToastContext);
  if (!ctx) throw new Error("useCartToast must be used inside <CartToastProvider>");
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────
interface CartToastProviderProps {
  children: ReactNode;
}

/** Wraps the app and renders the floating toast overlay */
export function CartToastProvider({ children }: CartToastProviderProps) {
  const [visible, setVisible] = useState(false);
  const [itemName, setItemName] = useState("");
  const [timerId, setTimerId] = useState<ReturnType<typeof setTimeout> | null>(null);

  /** Show toast — resets timer if already showing */
  const showToast = useCallback((name: string) => {
    // Clear any existing auto-dismiss timer
    if (timerId) clearTimeout(timerId);
    setItemName(name);
    setVisible(true);
    // Auto-dismiss after 2.5 s
    const id = setTimeout(() => setVisible(false), 2500);
    setTimerId(id);
  }, [timerId]);

  return (
    <CartToastContext.Provider value={{ showToast }}>
      {children}

      {/* ── Floating toast ── */}
      <div
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]
                    transition-all duration-300
                    ${visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <div className="flex items-center gap-3 bg-brand-dark text-brand-on-dark
                        px-5 py-3 rounded-2xl shadow-xl border border-brand-gold/20
                        min-w-[220px] max-w-xs">
          {/* Green check circle */}
          <span className="w-8 h-8 rounded-full bg-green-500/20 border border-green-400/40
                           flex items-center justify-center flex-shrink-0">
            <ShoppingCart size={15} className="text-green-400" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-hind text-xs text-brand-on-dark/60 leading-none mb-0.5">Added to cart!</p>
            {/* Item name — truncated if too long */}
            <p className="font-playfair text-sm text-brand-gold truncate">{itemName}</p>
          </div>
          {/* Manual dismiss */}
          <button onClick={() => setVisible(false)} aria-label="Dismiss"
            className="text-brand-on-dark/40 hover:text-brand-on-dark transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      </div>
    </CartToastContext.Provider>
  );
}

