// Shared TypeScript interfaces for Saas Bahu Ki Rasoi.
// All data model types live here — import from "@/types" throughout the app.
// Prices are ALWAYS stored in cents (integers) — never floats for money.

// ─── Category ────────────────────────────────────────────────────────────────
/** A menu category (e.g. Starters, Mains, Desserts) */
export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

// ─── Menu Item ───────────────────────────────────────────────────────────────
/** A single dish or drink on the menu */
export interface MenuItem {
  id: string;
  category_id: string;
  category?: Category;
  name: string;
  description: string;
  /** Price in paise (Indian cents) — always an integer, never a float */
  price_cents: number;
  photo_url: string | null;
  is_veg: boolean;
  is_vegan: boolean;
  is_gf: boolean;         // gluten-free
  is_available: boolean;
  is_special: boolean;    // "Today's Special"
  special_note: string | null;  // short story / origin of the dish
  created_at: string;
  updated_at: string;
  deleted_at: string | null;    // null = active; non-null = soft deleted
}

// ─── Order ───────────────────────────────────────────────────────────────────
/** A customer order, linked to a Stripe session */
export interface Order {
  id: string;
  stripe_session_id: string;
  customer_email: string;
  customer_name: string;
  status: "pending" | "paid" | "refunded";
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  invoice_url: string | null;   // Supabase Storage signed URL for PDF
  created_at: string;
}

// ─── Order Line Item ─────────────────────────────────────────────────────────
/** A single line in an order — price/name snapshotted at purchase time */
export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;            // snapshot — preserves name even if item changes
  item_price_cents: number;     // snapshot — preserves price at time of purchase
  quantity: number;
}

// ─── Cart ────────────────────────────────────────────────────────────────────
/** A single item in the customer's cart */
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

/** Shape of the cart context value provided by CartProvider */
export interface CartState {
  items: CartItem[];
  /** Add one unit of a menu item to the cart */
  addItem: (item: MenuItem) => void;
  /** Remove a menu item from the cart entirely */
  removeItem: (id: string) => void;
  /** Set the quantity of a cart item (0 removes it) */
  updateQuantity: (id: string, qty: number) => void;
  /** Empty the entire cart */
  clearCart: () => void;
  /** Running total in paise */
  totalCents: number;
  /** Total number of individual items (sum of quantities) */
  itemCount: number;
}

// ─── Admin / Form ─────────────────────────────────────────────────────────────
/** Values used by the admin ItemForm for create/edit */
export interface ItemFormValues {
  name: string;
  description: string;
  category_id: string;
  /** Price entered in rupees by admin — converted to cents on save */
  price_rupees: number;
  photo_url: string | null;
  is_veg: boolean;
  is_vegan: boolean;
  is_gf: boolean;
  is_available: boolean;
  is_special: boolean;
  special_note: string;
}

