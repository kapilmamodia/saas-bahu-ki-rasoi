// Home page — Today's Specials hero. Server Component with 60s ISR.
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import MenuCard from "@/components/menu/MenuCard";
import type { MenuItem } from "@/types";
import { getHomePageCoupons } from "@/lib/actions/couponActions";
import CouponPopup from "@/components/coupon/CouponPopup";

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
        <p className="font-playfair text-xl md:text-2xl text-brand-gold italic mb-6">
          Order Food For Any Mood
        </p>
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

      {/* ── Our Story — Ek Rasoi, Do Dil ─────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 px-4"
        style={{ background: "linear-gradient(180deg,#1A0A02 0%,#2A0E04 40%,#3B1F0C 100%)" }}>

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(#D4A017 1px,transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Corner ornaments */}
        <div className="absolute top-6 left-6 text-4xl opacity-20 select-none hidden md:block">🪬</div>
        <div className="absolute top-6 right-6 text-4xl opacity-20 select-none hidden md:block">🪬</div>
        <div className="absolute bottom-6 left-6 text-4xl opacity-20 select-none hidden md:block">🏵️</div>
        <div className="absolute bottom-6 right-6 text-4xl opacity-20 select-none hidden md:block">🏵️</div>

        <div className="relative max-w-4xl mx-auto">

          {/* Section heading */}
          <div className="text-center mb-14">
            <p className="font-caveat text-brand-gold text-xl mb-1">💛 &nbsp; Hamare Baare Mein</p>
            <h2 className="font-yatra text-4xl md:text-5xl text-white"
              style={{ textShadow: "0 0 20px rgba(212,160,23,0.3)" }}>
              Ek Rasoi, Do Dil
            </h2>
            <p className="font-playfair text-brand-gold/70 italic text-base mt-1">One Kitchen, Two Hearts</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-px w-16 bg-brand-gold/30" />
              <span className="text-brand-gold">🪔</span>
              <div className="h-px w-16 bg-brand-gold/30" />
            </div>
          </div>

          {/* Person cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

            {/* Veena — the Saas */}
            <div className="relative rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg,rgba(212,160,23,0.08),rgba(212,160,23,0.03))", border: "1px solid rgba(212,160,23,0.25)" }}>
              <div className="h-1 w-full bg-gradient-to-r from-brand-gold via-brand-rust to-brand-gold" />
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl shrink-0 border-2 border-brand-gold/60"
                    style={{ background: "radial-gradient(circle,rgba(212,160,23,0.2),rgba(212,160,23,0.05))" }}>
                    👩‍🍳
                  </div>
                  <div>
                    <p className="font-playfair text-white text-lg font-semibold">Veena Khandelwal</p>
                    <p className="font-caveat text-brand-gold text-base">The Saas &nbsp;·&nbsp; Keeper of Recipes</p>
                    <div className="flex gap-1 mt-1">
                      {["🌶️","🫙","🍲"].map(e => <span key={e} className="text-sm">{e}</span>)}
                    </div>
                  </div>
                </div>
                <p className="font-hind text-brand-on-dark/80 text-sm leading-relaxed">
                  For over four decades, Veena&apos;s hands have been the magic behind every meal.
                  She carries the soul of Rajasthan and Uttar Pradesh in her masalas — dal baati churma, gatte ki sabzi,
                  ker sangri — each dish a chapter of memory, love, and belonging.
                  Her recipes aren&apos;t written anywhere. They live in her heart.
                </p>
                <div className="border-l-2 border-brand-gold/40 pl-4">
                  <p className="font-caveat text-brand-gold text-lg italic leading-snug">
                    &ldquo;Khana sirf pet nahi, dil bhi bharta hai.&rdquo;
                  </p>
                  <p className="font-hind text-brand-on-dark/40 text-xs mt-0.5">— Veena ji</p>
                </div>
              </div>
            </div>

            {/* Rajeshwari — the Bahu */}
            <div className="relative rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg,rgba(192,98,42,0.08),rgba(192,98,42,0.03))", border: "1px solid rgba(192,98,42,0.25)" }}>
              <div className="h-1 w-full bg-gradient-to-r from-brand-rust via-brand-gold to-brand-rust" />
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl shrink-0 border-2 border-brand-rust/60"
                    style={{ background: "radial-gradient(circle,rgba(192,98,42,0.2),rgba(192,98,42,0.05))" }}>
                    👩‍🍳
                  </div>
                  <div>
                    <p className="font-playfair text-white text-lg font-semibold">Rajeshwari Khandelwal</p>
                    <p className="font-caveat text-brand-rust text-base">The Bahu &nbsp;·&nbsp; Spark of the Rasoi</p>
                    <div className="flex gap-1 mt-1">
                      {["🌸","✨","🍛"].map(e => <span key={e} className="text-sm">{e}</span>)}
                    </div>
                  </div>
                </div>
                <p className="font-hind text-brand-on-dark/80 text-sm leading-relaxed">
                  Rajeshwari stepped into Veena&apos;s kitchen with open eyes and an open heart.
                  She didn&apos;t just learn recipes — she absorbed a way of life. Slowly, her own
                  love found its voice between the tadkas and the rolling of rotis.
                  Today she brings the same devotion to every order she prepares.
                </p>
                <div className="border-l-2 border-brand-rust/40 pl-4">
                  <p className="font-caveat text-brand-rust text-lg italic leading-snug">
                    &ldquo;Saas ne sikhaya, maine apnaya — dono ki rasoi, ek hi dil.&rdquo;
                  </p>
                  <p className="font-hind text-brand-on-dark/40 text-xs mt-0.5">— Rajeshwari ji</p>
                </div>
              </div>
            </div>
          </div>


          {/* 4 value tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon:"🌶️", label:"Fresh Every Day",   note:"No frozen, no shortcuts",      cls:"border-brand-rust/20"  },
              { icon:"🫙",  label:"Ancestral Recipes", note:"Passed down from generations",    cls:"border-brand-gold/20"  },
              { icon:"🪔",  label:"Made with Love",    note:"You can taste the difference",  cls:"border-brand-gold/20"  },
              { icon:"🏠",  label:"Ghar ka Khana",     note:"Just like Ma banati thi",       cls:"border-brand-rust/20"  },
            ].map(({icon,label,note,cls}) => (
              <div key={label} className={`rounded-xl p-5 border ${cls}`}
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-3xl block mb-2">{icon}</span>
                <p className="font-playfair text-white text-sm font-semibold mb-1">{label}</p>
                <p className="font-hind text-brand-on-dark/50 text-xs">{note}</p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
