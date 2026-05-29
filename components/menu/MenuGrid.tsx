"use client";
// MenuGrid — renders sticky category tabs, search bar, item grid, and back-to-top button.
import { useState, useEffect } from "react";
import MenuCard from "./MenuCard";
import type { Category, MenuItem } from "@/types";
import { Search, X, ArrowUp } from "lucide-react";

interface MenuItemWithCategory extends MenuItem {
  category: Category;
}

interface MenuGridProps {
  items: MenuItemWithCategory[];
}

/**
 * Groups items by category, renders tab navigation, search, card grid, and back-to-top.
 */
export default function MenuGrid({ items }: MenuGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery]       = useState("");
  const [showBackToTop, setShowBackToTop]   = useState(false);

  // Show back-to-top button after scrolling 400px
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Derive unique categories preserving sort order
  const categories: Category[] = [];
  const seen = new Set<string>();
  items.forEach((item) => {
    if (item.category && !seen.has(item.category.id)) {
      seen.add(item.category.id);
      categories.push(item.category);
    }
  });

  // Apply category filter first, then search query
  const categoryFiltered = activeCategory === "all"
    ? items
    : items.filter((item) => item.category?.id === activeCategory);

  const visibleItems = searchQuery.trim()
    ? categoryFiltered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categoryFiltered;

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

      {/* ── Sticky category tabs + search bar ──────────────────────────── */}
      <div className="sticky top-16 z-40 bg-brand-bg/95 backdrop-blur py-3 mb-8 -mx-4 px-4 flex flex-col gap-2">
        {/* Category tab row */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <TabButton label="All" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
          {categories.map((cat) => (
            <TabButton key={cat.id} label={cat.name}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)} />
          ))}
        </div>

        {/* Search bar */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes…"
            className="w-full pl-9 pr-8 py-2 rounded-full border border-brand-wood/25
                       bg-brand-card font-hind text-sm text-brand-body
                       placeholder:text-brand-muted/60
                       focus:outline-none focus:ring-2 focus:ring-brand-wood/30"
          />
          {/* Clear button */}
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-rust transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Search results message ── */}
      {searchQuery.trim() && (
        <p className="font-hind text-sm text-brand-muted mb-4">
          {visibleItems.length === 0
            ? `No dishes found for "${searchQuery}"`
            : `${visibleItems.length} dish${visibleItems.length !== 1 ? "es" : ""} found for "${searchQuery}"`}
        </p>
      )}

      {/* ── Items grid ─────────────────────────────────────────────────── */}
      {/* When searching, show flat grid; otherwise group by category */}
      {searchQuery.trim() || activeCategory !== "all" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((item) => <MenuCard key={item.id} item={item} />)}
          {visibleItems.length === 0 && (
            <p className="col-span-full text-center font-hind text-brand-muted py-12">
              No items match. Try a different search or category.
            </p>
          )}
        </div>
      ) : (
        categories.map((cat) => {
          const catItems = items.filter((i) => i.category?.id === cat.id);
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id} className="mb-10" id={`cat-${cat.id}`}>
              <h2 className="font-playfair text-2xl text-brand-heading mb-4">{cat.name}</h2>
              <hr className="divider-spice mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catItems.map((item) => <MenuCard key={item.id} item={item} />)}
              </div>
            </div>
          );
        })
      )}

      {/* ── Back to top button ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full
                    bg-brand-wood hover:bg-brand-rust text-white shadow-lg
                    flex items-center justify-center transition-all duration-300
                    ${showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <ArrowUp size={18} />
      </button>
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
interface TabButtonProps { label: string; active: boolean; onClick: () => void; }

/** Individual category tab */
function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`font-hind text-sm whitespace-nowrap px-4 py-1.5 rounded-full
                  border transition-colors flex-shrink-0
                  ${active
                    ? "bg-brand-wood text-white border-brand-wood shadow-sm"
                    : "bg-brand-card text-brand-body border-brand-wood/30 hover:border-brand-wood"}`}>
      {label}
    </button>
  );
}
