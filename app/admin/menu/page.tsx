// Admin menu management page — table of all items with edit, toggle, delete actions.
// Server Component for data fetching; delete confirmation handled in DeleteButton client component.
import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { MenuItem, Category } from "@/types";
import { Plus } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";

interface MenuItemWithCategory extends MenuItem {
  category: Category;
}

/** Fetch all non-deleted menu items with category */
async function getMenuItems(): Promise<MenuItemWithCategory[]> {
  try {
    // Log env var presence to help debug Vercel missing env issues
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[AdminMenu] MISSING env var: SUPABASE_SERVICE_ROLE_KEY — add it in Vercel dashboard");
    }
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*, category:categories(id, name, sort_order)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) { console.error("[AdminMenu] Fetch error:", error); return []; }
    return (data as MenuItemWithCategory[]) ?? [];
  } catch (err) {
    console.error("[AdminMenu] Unexpected error:", err); return [];
  }
}

/** Format paise to rupees */
const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

// ── Server Actions ────────────────────────────────────────────────────────────

/** Toggle is_available for an item */
async function toggleAvailable(id: string, current: boolean) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("menu_items").update({ is_available: !current, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
}

/** Toggle is_special for an item */
async function toggleSpecial(id: string, current: boolean) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("menu_items").update({ is_special: !current, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/menu");
  revalidatePath("/");
}

/** Soft delete an item (set deleted_at = now) */
async function deleteItem(id: string) {
  "use server";
  const supabase = createAdminClient();
  await supabase.from("menu_items").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");
}

/** Admin menu list page */
export default async function AdminMenuPage() {
  const items = await getMenuItems();

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-yatra text-3xl text-brand-heading">Menu Items</h1>
        <Link
          href="/admin/menu/new"
          className="flex items-center gap-2 bg-brand-wood hover:bg-brand-rust text-white
                     font-hind font-medium text-sm px-5 py-2.5 rounded-full shadow-sm transition-colors"
        >
          <Plus size={15} />
          Add New Item
        </Link>
      </div>
      <hr className="divider-spice mb-8" />

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="font-playfair text-xl text-brand-heading mb-2">No items yet</p>
          <p className="font-hind text-brand-muted mb-6">Add your first dish to get started.</p>
          <Link href="/admin/menu/new" className="bg-brand-wood hover:bg-brand-rust text-white font-hind px-6 py-2.5 rounded-full transition-colors">
            Add First Item
          </Link>
        </div>
      ) : (
        /* Horizontally scrollable on mobile */
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
                {items.map((item) => (
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
                      <form action={toggleAvailable.bind(null, item.id, item.is_available)}>
                        <button type="submit"
                          className={`font-caveat text-sm px-3 py-0.5 rounded-full border transition-colors
                            ${item.is_available
                              ? "bg-brand-sage/20 text-brand-sage border-brand-sage/40"
                              : "bg-brand-muted/10 text-brand-muted border-brand-muted/30"}`}>
                          {item.is_available ? "Yes" : "No"}
                        </button>
                      </form>
                    </td>

                    {/* Special toggle */}
                    <td className="px-4 py-3 text-center">
                      <form action={toggleSpecial.bind(null, item.id, item.is_special)}>
                        <button type="submit"
                          className={`font-caveat text-sm px-3 py-0.5 rounded-full border transition-colors
                            ${item.is_special
                              ? "bg-brand-gold/20 text-brand-gold border-brand-gold/40"
                              : "bg-brand-muted/10 text-brand-muted border-brand-muted/30"}`}>
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
                        <DeleteButton id={item.id} name={item.name} deleteAction={deleteItem} />
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

/** Small dietary tag badge */
function Tag({ children, color }: { children: React.ReactNode; color: "sage" | "gold" }) {
  const cls = color === "sage"
    ? "bg-brand-sage/15 text-brand-sage border-brand-sage/30"
    : "bg-brand-gold/15 text-brand-gold border-brand-gold/30";
  return (
    <span className={`font-caveat text-xs px-2 py-0.5 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}

