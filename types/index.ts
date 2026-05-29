// Shared TypeScript interfaces for Saas Bahu Ki Rasoi.
// All data model types live here — import from "@/types" throughout the app.
// Prices are ALWAYS stored in cents (integers) — never floats for money.

// ─── Review ───────────────────────────────────────────────────────────────────
/** A customer review — must be approved by admin before showing publicly */
export interface Review {
  id: string;
  customer_name: string;
  rating: number;        // 1-5
  message: string;
  dish_name: string | null;   // optional dish being reviewed
  is_approved: boolean;
  created_at: string;
}

// ─── Kitchen Settings (default schedule) ─────────────────────────────────────
/** Singleton row in kitchen_settings — stores the default open/close hours */
export interface KitchenSettings {
  id: 1;
  open_hour: number;   // 0-23 (IST)
  close_hour: number;  // 0-23 (IST)
  updated_at: string;
}

// ─── Kitchen Schedule Override ───────────────────────────────────────────────
/** A per-date kitchen schedule override (holiday, early close, late open, day off) */
export interface KitchenScheduleOverride {
  id: string;
  date: string;           // YYYY-MM-DD
  is_closed: boolean;     // true = full day closed
  open_hour: number | null;   // null = use default
  close_hour: number | null;  // null = use default
  note: string | null;        // admin note e.g. "Diwali Holiday"
  created_at: string;
}

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
  order_number: number;          // human-friendly sequential number: 1, 2, 3…
  stripe_session_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;  // optional phone number
  status: "pending" | "paid" | "completed" | "refunded";
  subtotal_cents: number;
  discount_cents: number;      // 0 if no coupon applied
  coupon_code: string | null;  // coupon code used, if any
  tax_cents: number;
  total_cents: number;
  invoice_url: string | null;   // Supabase Storage signed URL for PDF
  /** pickup = customer collects; delivery = we deliver to address */
  delivery_type: "pickup" | "delivery";
  delivery_address: string | null;  // required only when delivery_type = "delivery"
  created_at: string;
  completed_at: string | null;  // set when admin marks order as completed
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

// ─── Coupon ───────────────────────────────────────────────────────────────────
/** A discount coupon code */
export interface Coupon {
  id: string;
  code: string;
  description: string;
  /** "percent" = value is 1-100; "flat" = value is paise amount */
  type: "percent" | "flat";
  value: number;
  /** Minimum subtotal (paise) required to apply this coupon */
  min_order_cents: number;
  /** null = unlimited uses */
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  /** When true, a promo banner for this coupon is shown on the public home page */
  show_on_home: boolean;
  created_at: string;
}

/** Result returned by validateCoupon server action */
export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountCents?: number;
  error?: string;
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

