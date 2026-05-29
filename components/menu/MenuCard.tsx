"use client";
// MenuCard — displays a single menu item with photo, name, description,
// dietary badges, regional badge, price, and Add to Cart / quantity stepper.
import Image from "next/image";
import { ShoppingCart, Leaf, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCartToast } from "@/components/CartToast";
import type { MenuItem } from "@/types";

interface MenuCardProps {
  item: MenuItem;
}

/** Infer a regional badge from the item's special_note or name */
function getRegionBadge(item: MenuItem): { flag: string; label: string } | null {
  const text = `${item.name} ${item.description} ${item.special_note ?? ""}`.toLowerCase();
  if (/rajasthan|dal baati|churma|gatte|ker sangri|laal maas|baati/.test(text))
    return { flag: "🏜️", label: "Rajasthan" };
  if (/up |uttar pradesh|awadhi|lucknow|kachori|puri|chaat/.test(text))
    return { flag: "🌿", label: "UP Special" };
  if (/punjab|punjabi|sarson|makki|lassi|butter chicken/.test(text))
    return { flag: "🌾", label: "Punjab" };
  if (/gujarat|gujarati|dhokla|thepla|kadhi/.test(text))
    return { flag: "🎨", label: "Gujarat" };
  if (/south|idli|dosa|sambhar|rasam/.test(text))
    return { flag: "🌴", label: "South India" };
  // Fall back to special_note if it mentions a region
  if (item.special_note && item.special_note.length > 0)
    return { flag: "🍽️", label: "Ghar ka Swad" };
  return null;
}

/**
 * Renders a warm, card-style menu item.
 * When the item is already in the cart, the Add button morphs into a ±stepper.
 * Shows a regional story badge when region can be inferred.
 */
export default function MenuCard({ item }: MenuCardProps) {
  const { addItem, updateQuantity, items } = useCart();
  const { showToast } = useCartToast();

  const formatPrice = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;
  const cartItem = items.find((i) => i.menuItem.id === item.id);
  const quantity = cartItem?.quantity ?? 0;
  const regionBadge = getRegionBadge(item);

  const handleAdd = () => {
    addItem(item);
    showToast(item.name);
  };

  return (
    <div className={`group relative bg-brand-card border border-brand-wood/30 rounded-xl
                    shadow-sm overflow-hidden flex flex-col
                    transition-shadow hover:shadow-md
                    ${!item.is_available ? "opacity-60" : ""}`}>

      {/* Unavailable overlay */}
      {!item.is_available && (
        <div className="absolute inset-0 bg-brand-bg/70 z-10 flex items-center justify-center rounded-xl">
          <span className="font-caveat text-xl text-brand-rust border-2 border-brand-rust
                            px-3 py-1 rounded-full rotate-[-8deg]">
            Unavailable
          </span>
        </div>
      )}

      {/* Photo section — overflow-hidden so zoom stays clipped inside card */}
      <div className="relative w-full h-44 bg-brand-bg overflow-hidden">
        {item.photo_url ? (
          <Image src={item.photo_url} alt={`Photo of ${item.name}`} fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl" role="img" aria-label="Food">🍛</span>
          </div>
        )}
        {/* Today's Special badge */}
        {item.is_special && (
          <span className="absolute top-2 left-2 bg-brand-rust text-white font-caveat
                            text-sm px-2 py-0.5 rounded-full shadow-sm">
            ✨ Aaj ka Special
          </span>
        )}
        {/* In-cart quantity pill */}
        {quantity > 0 && (
          <span className="absolute top-2 right-2 bg-brand-wood text-white font-hind font-bold
                            text-xs px-2 py-0.5 rounded-full shadow-sm">
            {quantity} in cart
          </span>
        )}
        {/* Regional story badge — bottom-left of photo */}
        {regionBadge && !item.is_special && (
          <span className="absolute bottom-2 left-2 bg-brand-dark/75 backdrop-blur-sm
                            text-brand-on-dark font-caveat text-xs px-2 py-0.5
                            rounded-full flex items-center gap-1">
            {regionBadge.flag} {regionBadge.label}
          </span>
        )}
        {/* Regional badge alongside Special badge */}
        {regionBadge && item.is_special && (
          <span className="absolute bottom-2 left-2 bg-brand-dark/75 backdrop-blur-sm
                            text-brand-on-dark font-caveat text-xs px-2 py-0.5
                            rounded-full flex items-center gap-1">
            {regionBadge.flag} {regionBadge.label}
          </span>
        )}
      </div>

      {/* Content section */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-playfair text-lg text-brand-heading leading-tight">{item.name}</h3>
          <span className="font-hind font-semibold text-brand-gold whitespace-nowrap">
            {formatPrice(item.price_cents)}
          </span>
        </div>

        <p className="font-hind text-sm text-brand-muted leading-relaxed flex-1">{item.description}</p>

        {/* Special note — story snippet */}
        {item.special_note && (
          <p className="font-caveat text-brand-wood/70 text-sm italic border-l-2 border-brand-gold/30 pl-2">
            {item.special_note}
          </p>
        )}

        {/* Dietary badges */}
        <div className="flex flex-wrap gap-1 mt-1">
          {item.is_veg   && <Badge color="sage"><Leaf size={11} />Veg</Badge>}
          {item.is_vegan && <Badge color="sage">🌿 Vegan</Badge>}
          {item.is_gf    && <Badge color="gold">GF</Badge>}
        </div>

        {/* CTA: Add to Cart OR quantity stepper */}
        {quantity === 0 ? (
          <button onClick={handleAdd} disabled={!item.is_available}
            aria-label={`Add ${item.name} to cart`}
            className="mt-3 w-full flex items-center justify-center gap-2
                       bg-brand-wood hover:bg-brand-rust text-white
                       font-hind font-medium text-sm py-2 rounded-lg
                       shadow-sm transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed">
            <ShoppingCart size={15} />
            Add to Cart
          </button>
        ) : (
          <div className="mt-3 flex items-center justify-between gap-2">
            <button onClick={() => updateQuantity(item.id, quantity - 1)}
              aria-label={`Decrease ${item.name}`}
              className="w-9 h-9 rounded-full border-2 border-brand-wood text-brand-wood
                         flex items-center justify-center hover:bg-brand-wood hover:text-white
                         transition-colors font-bold">
              <Minus size={14} />
            </button>
            <span className="flex-1 text-center font-playfair font-bold text-brand-heading text-lg">
              {quantity}
            </span>
            <button onClick={handleAdd}
              aria-label={`Increase ${item.name}`}
              className="w-9 h-9 rounded-full bg-brand-wood text-white
                         flex items-center justify-center hover:bg-brand-rust transition-colors">
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps { children: React.ReactNode; color: "sage" | "gold"; }
function Badge({ children, color }: BadgeProps) {
  const cls = color === "sage"
    ? "bg-brand-sage/20 text-brand-sage border-brand-sage/40"
    : "bg-brand-gold/20 text-brand-gold border-brand-gold/40";
  return (
    <span className={`font-caveat text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${cls}`}>
      {children}
    </span>
  );
}
