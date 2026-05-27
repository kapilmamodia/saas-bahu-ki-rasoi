"use client";
// MenuGrid — renders sticky category tabs and the grid of MenuCards.
// Needs "use client" because tab selection is interactive state.
import { useState } from "react";
import MenuCard from "./MenuCard";
import type { Category, MenuItem } from "@/types";

interface MenuItemWithCategory extends MenuItem {
  category: Category;
}

interface MenuGridProps {
  items: MenuItemWithCategory[];
}

/**
 * Groups items by category, renders tab navigation and a card grid.
 * The "All" tab shows every item; category tabs filter to that category.
 */
export default function MenuGrid({ items }: MenuGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Derive unique categories from items, preserving sort order
  const categories: Category[] = [];
  const seen = new Set<string>();
  items.forEach((item) => {
    if (item.category && !seen.has(item.category.id)) {
      seen.add(item.category.id);
      categories.push(item.category);
    }
  });

  // Filter items based on selected tab
  const visibleItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category?.id === activeCategory);

  if (items.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-5xl mb-4">🍲</p>
        <p className="font-playfair text-xl text-brand-heading">Menu coming soon!</p>
        <p className="font-hind text-brand-muted mt-2">Our kitchen is getting ready.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ── Sticky category tabs ───────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-brand-bg/95 backdrop-blur py-3 mb-8 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* "All" tab */}
          <TabButton
            label="All"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {/* Category tabs */}
          {categories.map((cat) => (
            <TabButton
              key={cat.id}
              label={cat.name}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Items grid: 1 col → 2 col → 3 col ────────────────────────── */}
      {activeCategory === "all" ? (
        // When showing all, group by category with headings
        categories.map((cat) => {
          const catItems = items.filter((i) => i.category?.id === cat.id);
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id} className="mb-10" id={`cat-${cat.id}`}>
              <h2 className="font-playfair text-2xl text-brand-heading mb-4">
                {cat.name}
              </h2>
              <hr className="divider-spice mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
          {visibleItems.length === 0 && (
            <p className="col-span-full text-center font-hind text-brand-muted py-12">
              No items in this category yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

/** Individual category tab — wood-brown when active, muted when inactive */
function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`font-hind text-sm whitespace-nowrap px-4 py-1.5 rounded-full
                  border transition-colors flex-shrink-0
                  ${
                    active
                      ? "bg-brand-wood text-white border-brand-wood shadow-sm"
                      : "bg-brand-card text-brand-body border-brand-wood/30 hover:border-brand-wood"
                  }`}
    >
      {label}
    </button>
  );
}

