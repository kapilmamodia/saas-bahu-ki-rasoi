/**
 * /about — About Us page.
 * Full story of Saas Bahu Ki Rasoi — Veena & Rajeshwari Khandelwal.
 */
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Saas Bahu Ki Rasoi",
  description:
    "Meet Veena & Rajeshwari Khandelwal — the Saas and Bahu behind Saas Bahu Ki Rasoi. A story of love, tradition and Rajasthani home cooking.",
};

/** About Us page — full story, person cards, values */
export default function AboutPage() {
  return (
    <div className="min-h-screen">

      {/* ── Hero strip ── */}
      <section className="relative overflow-hidden py-14 px-4 text-center"
        style={{ background: "linear-gradient(160deg,#1A0A02 0%,#2A0E04 50%,#3B1F0C 100%)" }}>
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(#D4A017 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* Corner ornaments */}
        <div className="absolute top-4 left-4 text-3xl opacity-20 hidden md:block select-none">🪬</div>
        <div className="absolute top-4 right-4 text-3xl opacity-20 hidden md:block select-none">🪬</div>

        <div className="relative z-10">
          <p className="font-caveat text-brand-gold text-xl mb-1">💛 Hamare Baare Mein</p>
          <h1 className="font-yatra text-4xl md:text-5xl text-white mb-2"
            style={{ textShadow: "0 0 20px rgba(212,160,23,0.4)" }}>
            Ek Rasoi, Do Dil
          </h1>
          <p className="font-playfair text-brand-gold/70 italic text-base mb-4">
            One Kitchen, Two Hearts
          </p>
          <div className="flex items-center justify-center gap-2 opacity-40">
            <div className="h-px w-12 bg-brand-gold" />
            <span className="text-brand-gold">🪔</span>
            <div className="h-px w-12 bg-brand-gold" />
          </div>
        </div>
      </section>

      {/* ── Story section ── */}
      <section className="relative overflow-hidden py-14 px-4"
        style={{ background: "linear-gradient(180deg,#3B1F0C 0%,#2A0E04 100%)" }}>
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(#D4A017 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* Corner ornaments */}
        <div className="absolute top-6 left-6 text-4xl opacity-20 select-none hidden md:block">🏵️</div>
        <div className="absolute top-6 right-6 text-4xl opacity-20 select-none hidden md:block">🏵️</div>
        <div className="absolute bottom-6 left-6 text-4xl opacity-20 select-none hidden md:block">🪬</div>
        <div className="absolute bottom-6 right-6 text-4xl opacity-20 select-none hidden md:block">🪬</div>

        <div className="relative max-w-4xl mx-auto">

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
                  She carries the soul of Rajasthan and Uttar Pradesh in her masalas — dal baati churma,
                  gatte ki sabzi, ker sangri — each dish a chapter of memory, love, and belonging.
                  Her recipes aren&apos;t written anywhere. They live in her heart.
                </p>
                <div className="border-l-2 border-brand-gold/40 pl-4">
                  <p className="font-caveat text-brand-gold text-lg italic leading-snug">
                    &ldquo;Khana sirf pet nahi, dil bhi bharta hai.&rdquo;
                  </p>
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
                </div>
              </div>
            </div>
          </div>

          {/* 4 value tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-10">
            {[
              { icon:"🌶️", label:"Fresh Every Day",   note:"No frozen, no shortcuts",        cls:"border-brand-rust/20"  },
              { icon:"🫙",  label:"Ancestral Recipes", note:"Passed down from generations",   cls:"border-brand-gold/20"  },
              { icon:"🪔",  label:"Made with Love",    note:"You can taste the difference",   cls:"border-brand-gold/20"  },
              { icon:"🏠",  label:"Ghar ka Khana",     note:"Just like Ma banati thi",        cls:"border-brand-rust/20"  },
            ].map(({ icon, label, note, cls }) => (
              <div key={label} className={`rounded-xl p-5 border ${cls}`}
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-3xl block mb-2">{icon}</span>
                <p className="font-playfair text-white text-sm font-semibold mb-1">{label}</p>
                <p className="font-hind text-brand-on-dark/50 text-xs">{note}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="font-caveat text-brand-gold/70 text-base mb-4">
              Taste the love yourself 🙏
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/menu"
                className="bg-brand-gold hover:bg-brand-rust text-brand-dark font-hind
                           font-semibold px-8 py-3 rounded-full transition-colors shadow-md">
                🍽️ Browse Menu
              </Link>
              <Link href="/"
                className="border-2 border-brand-gold/50 text-brand-gold hover:bg-brand-gold/10
                           font-hind font-semibold px-8 py-3 rounded-full transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

