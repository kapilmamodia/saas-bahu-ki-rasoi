/**
 * app/loading.tsx — pixel-perfect skeleton for the home page.
 * Matches: hero, catering banner, Today's Specials section, 3 MenuCards.
 */
export default function HomeLoading() {
  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-b from-brand-dark to-brand-wood py-16 px-4 text-center space-y-4">
        <div className="skeleton-parchment h-4 w-48 mx-auto opacity-20 rounded-full" />
        <div className="skeleton-parchment h-14 w-72 mx-auto opacity-20" />
        <div className="skeleton-parchment h-7 w-64 mx-auto opacity-20 rounded-full" />
        <div className="flex gap-3 justify-center pt-2">
          <div className="skeleton-parchment h-11 w-36 rounded-full opacity-20" />
          <div className="skeleton-parchment h-11 w-36 rounded-full opacity-20 skeleton-delay-2" />
        </div>
      </div>

      {/* ── Catering banner ── */}
      <div className="bg-brand-wood/10 border-y border-brand-wood/20 py-4 px-4 flex justify-center">
        <div className="skeleton-parchment h-5 w-96 max-w-full rounded-full" />
      </div>

      {/* ── Today's Specials ── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8 space-y-2">
          <div className="skeleton-parchment h-4 w-28 mx-auto rounded-full" />
          <div className="skeleton-parchment h-9 w-52 mx-auto" />
          <div className="skeleton-parchment h-0.5 w-40 mx-auto opacity-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <MenuCardSkeleton key={i} delay={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

/** Pixel-perfect MenuCard skeleton */
function MenuCardSkeleton({ delay = 1 }: { delay?: number }) {
  const d = `skeleton-delay-${Math.min(delay, 6)}`;
  return (
    <div className="bg-brand-card border border-brand-wood/20 rounded-xl overflow-hidden shadow-sm">
      <div className={`skeleton-parchment h-44 w-full rounded-none ${d}`} />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className={`skeleton-parchment h-5 w-36 ${d}`} />
          <div className={`skeleton-parchment h-5 w-14 ${d}`} />
        </div>
        <div className={`skeleton-parchment h-3.5 w-full ${d}`} />
        <div className={`skeleton-parchment h-3.5 w-4/5 ${d}`} />
        <div className={`skeleton-parchment h-5 w-12 rounded-full ${d}`} />
        <div className={`skeleton-parchment h-9 w-full rounded-lg mt-1 ${d}`} />
      </div>
    </div>
  );
}
