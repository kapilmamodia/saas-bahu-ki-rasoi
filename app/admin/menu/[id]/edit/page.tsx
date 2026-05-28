// Admin — Edit existing menu item page.
// Server Component: fetches the item and categories, renders ItemForm with defaults.
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import ItemForm from "@/components/admin/ItemForm";
import type { Category, MenuItem } from "@/types";

interface EditPageProps {
  params: { id: string };
}

/** Fetch item and categories in parallel */
async function getItemAndCategories(id: string): Promise<{ item: MenuItem; categories: Category[] } | null> {
  try {
    const supabase = createAdminClient();
    const [itemResult, catResult] = await Promise.all([
      supabase.from("menu_items").select("*").eq("id", id).is("deleted_at", null).single(),
      supabase.from("categories").select("*").order("sort_order"),
    ]);

    if (itemResult.error || !itemResult.data) return null;

    return {
      item: itemResult.data as MenuItem,
      categories: (catResult.data as Category[]) ?? [],
    };
  } catch (err) {
    console.error("[AdminMenuEdit] Error:", err); return null;
  }
}

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Menu Item — Admin" };

/** Edit item page */
export default async function AdminMenuEditPage({ params }: EditPageProps) {
  const result = await getItemAndCategories(params.id);
  if (!result) notFound();

  const { item, categories } = result;

  return (
    <div>
      <h1 className="font-yatra text-3xl text-brand-heading mb-2">Edit Item</h1>
      <p className="font-hind text-brand-muted mb-1">{item.name}</p>
      <hr className="divider-spice mb-8" />
      <ItemForm categories={categories} defaultValues={item} />
    </div>
  );
}

