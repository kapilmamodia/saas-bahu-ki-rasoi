// Menu page — full menu grouped by category with sticky nav tabs.
// Server Component: fetches data server-side, renders MenuCard (client).
import { createPublicClient } from "@/lib/supabase/public";
import MenuGrid from "@/components/menu/MenuGrid";
import type { Category, MenuItem } from "@/types";

/** Force dynamic rendering — never pre-render at build time with empty data */
export const dynamic = "force-dynamic";

/** ISR: revalidate every 60 seconds */
export const revalidate = 0;

export const metadata = {
  title: "Menu — Saas Bahu Ki Rasoi",
  description: "Browse our full menu of home-cooked Indian dishes.",
};

interface MenuItemWithCategory extends MenuItem {
  category: Category;
}

/**
 * Fetches all available, non-deleted menu items with their category data.
 * Returns items sorted by category sort_order then item name.
 */
async function getMenuItems(): Promise<MenuItemWithCategory[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*, category:categories(id, name, sort_order)")
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) {
      console.error("[Menu] Error fetching items:", error);
      return [];
    }

    // Sort by category sort_order first, then by name
    return ((data as MenuItemWithCategory[]) ?? []).sort((a, b) => {
      const catDiff = (a.category?.sort_order ?? 99) - (b.category?.sort_order ?? 99);
      if (catDiff !== 0) return catDiff;
      return a.name.localeCompare(b.name);
    });
  } catch (err) {
    console.error("[Menu] Unexpected error:", err);
    return [];
  }
}

/** Menu page — category nav tabs + item grid */
export default async function MenuPage() {
  const items = await getMenuItems();

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="bg-brand-dark text-brand-on-dark py-10 px-4 text-center">
        <p className="font-caveat text-brand-gold text-lg mb-1">🍽️ Hamare pakwan</p>
        <h1 className="font-yatra text-4xl md:text-5xl text-white">Our Menu</h1>
        <p className="font-hind text-brand-on-dark/70 mt-2 text-sm md:text-base">
          Everything made fresh, from our rasoi to your table
        </p>
      </div>

      <hr className="divider-spice max-w-2xl mx-auto" />

      {/* Menu grid — client component for sticky tabs and cart interaction */}
      <MenuGrid items={items} />
    </div>
  );
}

