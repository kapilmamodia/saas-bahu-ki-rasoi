"use client";
/**
 * MenuTable — client component for the admin menu list page.
 *
 * Renders a search/filter bar (Item name, Category, Tags, Available, Special)
 * and the filtered table of menu items. All filtering is done client-side so
 * no page reload is required.
 */
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import type { MenuItem, Category } from "@/types";

// ── Types ────────────────────────────────────────────────────────────────────

interface MenuItemWithCategory extends MenuItem {
  category: Category;
}

interface MenuTableProps {
  items: MenuItemWithCategory[];
  /** Server Actions passed down so this client component can call them */
  deleteAction: (id: string) => Promise<void>;
  toggleAvailableAction: (id: string, current: boolean) => Promise<void>;
  toggleSpecialAction: (id: string, current: boolean) => Promise<void>;
}

/** Format paise → ₹ */
const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Renders the filter bar + menu items table.
 * Filtering is entirely client-side — instant, no network request.
 */
export default function MenuTable({
  items,
  deleteAction,
  toggleAvailableAction,
  toggleSpecialAction,
}: MenuTableProps) {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all"); // veg | vegan | gf | all
  const [availableFilter, setAvailableFilter] = useState("all"); // yes | no | all
  const [specialFilter, setSpecialFilter] = useState("all"); // yes | no | all

  /** Unique category list derived from items */
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    items.forEach((i) => {
      if (i.category?.id) seen.set(i.category.id, i.category.name);
    });
    return Array.from(seen.entries()); // [id, name][]
  }, [items]);

  /** Apply all active filters */
  const filtered = useMemo(() => {
    return items.filter((item) => {
      // Item name search — case insensitive
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;

      // Category filter
      if (categoryFilter !== "all" && item.category?.id !== categoryFilter) return false;

      // Tag filter
      if (tagFilter === "veg" && !item.is_veg) return false;
      if (tagFilter === "vegan" && !item.is_vegan) return false;
      if (tagFilter === "gf" && !item.is_gf) return false;

      // Available filter
      if (availableFilter === "yes" && !item.is_available) return false;
      if (availableFilter === "no" && item.is_available) return false;

      // Special filter
      if (specialFilter === "yes" && !item.is_special) return false;
      if (specialFilter === "no" && item.is_special) return false;

      return true;
    });
  }, [items, search, categoryFilter, tagFilter, availableFilter, specialFilter]);

  /** Whether any filter is active */
  const hasFilters =
    search || categoryFilter !== "all" || tagFilter !== "all" ||
    availableFilter !== "all" || specialFilter !== "all";

  /** Reset all filters */
  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setTagFilter("all");
    setAvailableFilter("all");
    setSpecialFilter("all");
  };

  return (
    <div>
      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="bg-brand-card border border-brand-wood/20 rounded-xl p-4 mb-5 flex flex-col gap-3">

        {/* Row 1 — text search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search item name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm font-hind bg-brand-bg border border-brand-wood/25
                       rounded-lg text-brand-body placeholder:text-brand-muted
                       focus:outline-none focus:ring-2 focus:ring-brand-wood/40"
          />
          {/* Clear search */}
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-rust">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Row 2 — dropdown filters */}
        <div className="flex flex-wrap gap-2">
          {/* Category */}
          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: "all", label: "All Categories" },
              ...categories.map(([id, name]) => ({ value: id, label: name })),
            ]}
          />

          {/* Tags */}
          <FilterSelect
            label="Tag"
            value={tagFilter}
            onChange={setTagFilter}
            options={[
              { value: "all", label: "All Tags" },
              { value: "veg", label: "🥦 Veg" },
              { value: "vegan", label: "🌱 Vegan" },
              { value: "gf", label: "🌾 Gluten-Free" },
            ]}
          />

          {/* Available */}
          <FilterSelect
            label="Available"
            value={availableFilter}
            onChange={setAvailableFilter}
            options={[
              { value: "all", label: "Available: All" },
              { value: "yes", label: "✅ Available" },
              { value: "no", label: "❌ Not Available" },
            ]}
          />

          {/* Special */}
          <FilterSelect
            label="Special"
            value={specialFilter}
            onChange={setSpecialFilter}
            options={[
              { value: "all", label: "Special: All" },
              { value: "yes", label: "✨ Special" },
              { value: "no", label: "— Not Special" },
            ]}
          />

          {/* Clear all filters button */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-hind
                         text-brand-rust border border-brand-rust/40 hover:bg-brand-rust/10 transition-colors"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Result count */}
        <p className="font-hind text-xs text-brand-muted">
          Showing <span className="font-semibold text-brand-body">{filtered.length}</span> of {items.length} items
        </p>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-brand-card border border-brand-wood/20 rounded-xl">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-playfair text-lg text-brand-heading mb-1">No items match</p>
          <p className="font-hind text-brand-muted text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="bg-brand-card border border-brand-wood/25 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-hind">
              <thead className="bg-brand-bg text-brand-muted uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Tags</th>
                  <th className="px-4 py-3 text-center">Available</th>
                  <th className="px-4 py-3 text-center">Special</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-brand-wood/10 hover:bg-brand-bg/40">
                    {/* Photo + name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-brand-bg shrink-0">
                          {item.photo_url ? (
                            <Image src={item.photo_url} alt={item.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🍛</div>
                          )}
                        </div>
                        <span className="font-medium text-brand-heading whitespace-nowrap">{item.name}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-brand-muted whitespace-nowrap">
                      {item.category?.name ?? "—"}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-brand-gold font-semibold whitespace-nowrap">
                      {fmt(item.price_cents)}
                    </td>

                    {/* Dietary tags */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {item.is_veg && <Tag color="sage">Veg</Tag>}
                        {item.is_vegan && <Tag color="sage">Vegan</Tag>}
                        {item.is_gf && <Tag color="gold">GF</Tag>}
                      </div>
                    </td>

                    {/* Available toggle */}
                    <td className="px-4 py-3 text-center">
                      <form action={toggleAvailableAction.bind(null, item.id, item.is_available)}>
                        <button
                          type="submit"
                          className={`font-caveat text-sm px-3 py-0.5 rounded-full border transition-colors
                            ${item.is_available
                              ? "bg-brand-sage/20 text-brand-sage border-brand-sage/40"
                              : "bg-brand-muted/10 text-brand-muted border-brand-muted/30"}`}
                        >
                          {item.is_available ? "Yes" : "No"}
                        </button>
                      </form>
                    </td>

                    {/* Special toggle */}
                    <td className="px-4 py-3 text-center">
                      <form action={toggleSpecialAction.bind(null, item.id, item.is_special)}>
                        <button
                          type="submit"
                          className={`font-caveat text-sm px-3 py-0.5 rounded-full border transition-colors
                            ${item.is_special
                              ? "bg-brand-gold/20 text-brand-gold border-brand-gold/40"
                              : "bg-brand-muted/10 text-brand-muted border-brand-muted/30"}`}
                        >
                          {item.is_special ? "✨ Yes" : "No"}
                        </button>
                      </form>
                    </td>

                    {/* Edit / Delete */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/menu/${item.id}/edit`}
                          className="font-hind text-xs text-brand-wood hover:text-brand-rust underline underline-offset-2 transition-colors"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={item.id} name={item.name} deleteAction={deleteAction} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper components ────────────────────────────────────────────────────────

/** Reusable styled select dropdown for filters */
function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm font-hind bg-brand-bg border border-brand-wood/25 rounded-lg
                 px-3 py-1.5 text-brand-body focus:outline-none focus:ring-2
                 focus:ring-brand-wood/40 cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/** Small dietary tag badge */
function Tag({ children, color }: { children: React.ReactNode; color: "sage" | "gold" }) {
  const cls =
    color === "sage"
      ? "bg-brand-sage/15 text-brand-sage border-brand-sage/30"
      : "bg-brand-gold/15 text-brand-gold border-brand-gold/30";
  return (
    <span className={`font-caveat text-xs px-2 py-0.5 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}

