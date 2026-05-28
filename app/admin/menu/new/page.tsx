// Admin — Add new menu item page.
// Server Component: fetches categories, renders the shared ItemForm.
import { createAdminClient } from "@/lib/supabase/admin";
import ItemForm from "@/components/admin/ItemForm";
import type { Category } from "@/types";

/** Fetch all categories for the form dropdown */
async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    if (error) { console.error("[AdminMenuNew] Categories error:", error); return []; }
    return (data as Category[]) ?? [];
  } catch (err) {
    console.error("[AdminMenuNew] Unexpected error:", err); return [];
  }
}

export const dynamic = "force-dynamic";
export const metadata = { title: "Add Menu Item — Admin" };

/** Add new item page */
export default async function AdminMenuNewPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-yatra text-3xl text-brand-heading mb-2">Add New Item</h1>
      <hr className="divider-spice mb-8" />
      <ItemForm categories={categories} />
    </div>
  );
}

