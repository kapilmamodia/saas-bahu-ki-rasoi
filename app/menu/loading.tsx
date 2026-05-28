// Loading skeleton for the menu page — category tabs + parchment card shimmer.
export default function MenuLoading() {
  return (
    <div className="min-h-screen">
      {/* Page header shimmer */}
      <div className="bg-brand-dark py-10 px-4 text-center">
        <div className="skeleton-parchment h-5 w-32 mx-auto mb-2 opacity-30" />
        <div className="skeleton-parchment h-10 w-48 mx-auto opacity-30" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab bar shimmer */}
        <div className="flex gap-2 mb-8 overflow-hidden">
          {[80, 60, 70, 55, 75, 65].map((w, i) => (
            <div
              key={i}
              className="skeleton-parchment h-8 rounded-full shrink-0"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>

        {/* Category heading shimmer */}
        <div className="skeleton-parchment h-7 w-28 mb-4" />
        <div className="skeleton-parchment h-0.5 w-full mb-6 opacity-40" />

        {/* Cards grid — 1→2→3 col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-brand-card border border-brand-wood/20 rounded-xl overflow-hidden">
      <div className="skeleton-parchment h-44 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="skeleton-parchment h-5 w-32" />
          <div className="skeleton-parchment h-5 w-16" />
        </div>
        <div className="skeleton-parchment h-4 w-full" />
        <div className="skeleton-parchment h-4 w-3/4" />
        <div className="skeleton-parchment h-9 w-full rounded-lg mt-2" />
      </div>
    </div>
  );
}

