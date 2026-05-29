// Home page — Today's Specials hero. Server Component with 60s ISR.
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import MenuCard from "@/components/menu/MenuCard";
import type { MenuItem } from "@/types";
import { getHomePageCoupons } from "@/lib/actions/couponActions";
import CouponPopup from "@/components/coupon/CouponPopup";
import TypewriterMood from "@/components/TypewriterMood";

/**
 * Force dynamic rendering — never pre-render at build time with empty data.
 * Data is fetched fresh on every request from Supabase.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Fetch today's specials — returns empty array on error */
async function getSpecials(): Promise<MenuItem[]> {
  try {
    const supabase = createPublicClient();
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
  // Coupons flagged to show on home (active + within validity window)
  const promoCoupons = await getHomePageCoupons();

  return (
    <div className="min-h-screen">

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-brand-dark to-brand-wood text-brand-on-dark py-16 px-4 text-center">
        <p className="font-caveat text-brand-gold text-xl mb-2">🍛 Ghar ka khana, dil se banaya</p>
        <h1 className="font-yatra text-4xl md:text-6xl text-white leading-tight mb-3">
          Saas Bahu Ki Rasoi
        </h1>
        {/* Typewriter cycling moods — client island */}
        <TypewriterMood />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/menu" className="bg-brand-gold hover:bg-brand-rust text-brand-dark font-hind font-semibold px-8 py-3 rounded-full shadow-md transition-colors text-base">
            Browse Menu
          </Link>
          <a href="tel:+91XXXXXXXXXX" className="border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-dark font-hind font-semibold px-8 py-3 rounded-full transition-colors text-base">
            📞 Call to Order
          </a>
        </div>
      </section>

      <hr className="divider-spice mx-auto max-w-3xl my-0" />

      {/* ── Catering Banner ───────────────────────────────────────────────── */}
      <section className="bg-brand-wood/10 border-y border-brand-wood/20 py-4 px-4 text-center">
        <p className="font-caveat text-lg text-brand-wood">
          🎉 Planning a Kitty Party or Get Together? We&apos;ve got you covered.{" "}
          <a href="tel:+91XXXXXXXXXX" className="underline hover:text-brand-rust transition-colors">
            Call Veena / Rajeshwari: +91 XXX-XX-XXXX
          </a>
        </p>
      </section>

      {/* ── Coupon Popup ── */}
      {promoCoupons.length > 0 && <CouponPopup coupons={promoCoupons} />}

      {/* ── Today's Specials ──────────────────────────────────────────── */}
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
            {specials.map((item) => <MenuCard key={item.id} item={item} />)}
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

      {/* ── Our Story teaser — links to full /about page ─────────────────── */}
      <section className="relative overflow-hidden py-12 px-4 text-center"
        style={{ background: "linear-gradient(180deg,#1A0A02 0%,#3B1F0C 100%)" }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(#D4A017 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-4xl mx-auto">
          <p className="font-caveat text-brand-gold text-xl mb-1">💛 Hamare Baare Mein</p>
          <h2 className="font-yatra text-3xl md:text-4xl text-white mb-2"
            style={{ textShadow: "0 0 20px rgba(212,160,23,0.3)" }}>
            Ek Rasoi, Do Dil
          </h2>
          <p className="font-playfair text-brand-gold/70 italic text-base mb-6">
            One Kitchen, Two Hearts
          </p>

          {/* 4 value tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
            {[
              { icon:"🌶️", label:"Fresh Every Day",    note:"No frozen, no shortcuts",       cls:"border-brand-rust/20"  },
              { icon:"🫙",  label:"Ancestral Recipes",  note:"Passed down from generations",  cls:"border-brand-gold/20"  },
              { icon:"🪔",  label:"Made with Love",     note:"You can taste the difference",  cls:"border-brand-gold/20"  },
              { icon:"🏠",  label:"Ghar ka Khana",      note:"Just like Ma banati thi",       cls:"border-brand-rust/20"  },
            ].map(({ icon, label, note, cls }) => (
              <div key={label} className={`rounded-xl p-5 border ${cls}`}
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-3xl block mb-2">{icon}</span>
                <p className="font-playfair text-white text-sm font-semibold mb-1">{label}</p>
                <p className="font-hind text-brand-on-dark/50 text-xs">{note}</p>
              </div>
            ))}
          </div>

          <Link href="/about"
            className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-rust
                       text-brand-dark font-hind font-semibold px-7 py-2.5 rounded-full
                       transition-colors shadow-md">
            Read Our Story →
          </Link>
        </div>
      </section>
    </div>
  );
}
