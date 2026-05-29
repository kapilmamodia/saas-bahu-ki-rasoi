/**
 * menu/loading.tsx — pixel-perfect skeleton for the menu page.
 * Matches: dark header, sticky tab bar, search bar, category heading, 6 MenuCards.
 */
export default function MenuLoading() {
  return (
    <div className="min-h-screen">

      {/* ── Dark header ── */}
      <div className="bg-brand-dark py-10 px-4 text-center space-y-3">
        <div className="skeleton-parchment h-4 w-28 mx-auto opacity-20 rounded-full" />
        <div className="skeleton-parchment h-11 w-56 mx-auto opacity-20" />
        <div className="skeleton-parchment h-4 w-64 mx-auto opacity-20 rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Sticky tab bar ── */}
        <div className="flex gap-2 mb-3 overflow-hidden">
          {[72, 52, 68, 58, 76, 60, 64].map((w, i) => (
            <div key={i}
              className={`skeleton-parchment h-8 rounded-full shrink-0 skeleton-delay-${(i % 6) + 1}`}
              style={{ width: `${w}px` }} />
          ))}
        </div>

        {/* ── Search bar ── */}
        <div className="skeleton-parchment h-9 w-72 rounded-full mb-8" />

        {/* ── Category block ── */}
        <div className="skeleton-parchment h-7 w-32 mb-3" />
        <div className="skeleton-parchment h-0.5 w-full mb-6 opacity-40" />

        {/* ── 6 card skeletons ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <MenuCardSkeleton key={i} delay={i + 1} />
          ))}
        </div>

        {/* ── Second category block ── */}
        <div className="skeleton-parchment h-7 w-24 mb-3 skeleton-delay-2" />
        <div className="skeleton-parchment h-0.5 w-full mb-6 opacity-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <MenuCardSkeleton key={i} delay={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Pixel-perfect MenuCard skeleton — mirrors: photo, name+price row,
 * 2 description lines, dietary badge row, Add to Cart button.
 */
function MenuCardSkeleton({ delay = 1 }: { delay?: number }) {
  const d = `skeleton-delay-${Math.min(delay, 6)}`;
  return (
    <div className="bg-brand-card border border-brand-wood/20 rounded-xl overflow-hidden shadow-sm">
      {/* Photo area — h-44 matches real card */}
      <div className={`skeleton-parchment h-44 w-full rounded-none ${d}`} />
      <div className="p-4 space-y-3">
        {/* Name + price row */}
        <div className="flex justify-between items-start gap-2">
          <div className={`skeleton-parchment h-5 w-36 ${d}`} />
          <div className={`skeleton-parchment h-5 w-14 skeleton-delay-2 ${d}`} />
        </div>
        {/* Description lines */}
        <div className={`skeleton-parchment h-3.5 w-full ${d}`} />
        <div className={`skeleton-parchment h-3.5 w-4/5 ${d}`} />
        {/* Dietary badge */}
        <div className={`skeleton-parchment h-5 w-12 rounded-full ${d}`} />
        {/* Add to Cart button — py-2 rounded-lg matches real card */}
        <div className={`skeleton-parchment h-9 w-full rounded-lg mt-1 ${d}`} />
      </div>
    </div>
  );
}
