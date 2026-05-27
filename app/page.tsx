// Home page — Today's Specials hero. Server Component with 60s ISR.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MenuCard from "@/components/menu/MenuCard";
import type { MenuItem } from "@/types";

/**
 * ISR: revalidate every 60 seconds so admin changes to specials appear quickly.
 */
export const revalidate = 60;

/** Fetch today's specials — returns empty array on error */
async function getSpecials(): Promise<MenuItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*, category:categories(id, name, sort_order)")
      .eq("is_special", true)
      .is("deleted_at", null)
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Home] Error fetching specials:", error);
      return [];
    }
    return (data as MenuItem[]) ?? [];
  } catch (err) {
    console.error("[Home] Unexpected error:", err);
    return [];
  }
}

/** Home page — hero section + today's specials grid */
export default async function HomePage() {
  const specials = await getSpecials();

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-brand-dark to-brand-wood text-brand-on-dark py-16 px-4 text-center">
        <p className="font-caveat text-brand-gold text-xl mb-2">🍛 Ghar ka khana, dil se banaya</p>
        <h1 className="font-yatra text-4xl md:text-6xl text-white leading-tight mb-3">
          Saas Bahu Ki Rasoi
        </h1>
        <p className="font-playfair text-xl md:text-2xl text-brand-gold italic mb-6">
          Order Food For Any Mood
        </p>
        <p className="font-hind text-brand-on-dark/80 max-w-xl mx-auto mb-8 text-base md:text-lg">
          Home-cooked Indian food made with love by Rajeshwari &amp; Veena Khandelwal.
          Individual orders, Kitty Party and Get Together catering — we&apos;ve got you covered.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/menu" className="bg-brand-gold hover:bg-brand-rust text-brand-dark font-hind font-semibold px-8 py-3 rounded-full shadow-md transition-colors text-base">
            Browse Menu
          </Link>
          <a href="tel:+919982128866" className="border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-dark font-hind font-semibold px-8 py-3 rounded-full transition-colors text-base">
            📞 Call to Order
          </a>
        </div>
      </section>

      <hr className="divider-spice mx-auto max-w-3xl my-0" />

      {/* ── Catering Banner ───────────────────────────────────────────────── */}
      <section className="bg-brand-wood/10 border-y border-brand-wood/20 py-4 px-4 text-center">
        <p className="font-caveat text-lg text-brand-wood">
          🎉 Planning a Kitty Party or Get Together? We&apos;ve got you covered.{" "}
          <a href="tel:+919829075457" className="underline hover:text-brand-rust transition-colors">
            Call Veena: +91 98290 75457
          </a>
        </p>
      </section>

      {/* ── Today&apos;s Specials ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <span className="font-caveat text-brand-rust text-lg">✨ Aaj ka Special</span>
          <h2 className="font-playfair text-3xl md:text-4xl text-brand-heading mt-1">Today&apos;s Specials</h2>
          <hr className="divider-spice max-w-xs mx-auto mt-4" />
        </div>

        {specials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">🍲</p>
            <p className="font-playfair text-xl text-brand-heading mb-2">Check back soon for today&apos;s specials!</p>
            <p className="font-hind text-brand-muted">Our kitchen is busy cooking something wonderful for you.</p>
            <Link href="/menu" className="mt-6 inline-block bg-brand-wood hover:bg-brand-rust text-white font-hind font-medium px-6 py-2 rounded-full transition-colors">
              See Full Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {specials.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {specials.length > 0 && (
          <div className="text-center mt-10">
            <Link href="/menu" className="font-hind text-brand-wood hover:text-brand-rust underline underline-offset-4 transition-colors">
              View full menu →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
