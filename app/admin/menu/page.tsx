// Admin menu management page — table of all items with edit, toggle, delete actions.
// Server Component for data fetching; delete confirmation handled in DeleteButton client component.
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { MenuItem, Category } from "@/types";
import { Plus } from "lucide-react";
import MenuTable from "@/components/admin/MenuTable";

/** Force dynamic rendering — always fetch live menu data */export const dynamic = "force-dynamic";

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

/** Soft delete an item (set deleted_at = now) */
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
        <MenuTable
          items={items}
          deleteAction={deleteItem}
          toggleAvailableAction={toggleAvailable}
          toggleSpecialAction={toggleSpecial}
        />
      )}
    </div>
  );
}

