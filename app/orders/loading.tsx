/**
 * orders/loading.tsx — pixel-perfect skeleton for the My Orders page.
 * Matches: heading, email search bar, 3 order timeline cards.
 */
export default function OrdersLoading() {
  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-10">
      {/* Heading */}
      <div className="skeleton-parchment h-10 w-44 mb-2" />
      <div className="skeleton-parchment h-4 w-80 max-w-full mb-2 rounded-full" />
      <div className="skeleton-parchment h-0.5 w-full mb-8 opacity-40" />

      {/* Email search box */}
      <div className="flex gap-2 mb-8">
        <div className="skeleton-parchment h-11 flex-1 rounded-xl" />
        <div className="skeleton-parchment h-11 w-24 rounded-xl skeleton-delay-2" />
      </div>

      {/* 3 order card skeletons — timeline style */}
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((i) => (
          <OrderCardSkeleton key={i} delay={i} />
        ))}
      </div>
    </div>
  );
}

/** Mirrors the OrderCard timeline layout — dot, accent stripe, header row */
function OrderCardSkeleton({ delay = 1 }: { delay?: number }) {
  const d = `skeleton-delay-${Math.min(delay, 6)}`;
  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-brand-wood/15" />
      {/* Timeline dot */}
      <div className="absolute left-0 top-5 w-6 h-6 rounded-full skeleton-parchment ring-2 ring-white" />

      {/* Card */}
      <div className="bg-brand-card border border-brand-wood/20 rounded-2xl overflow-hidden shadow-sm">
        {/* Colour accent stripe */}
        <div className={`skeleton-parchment h-1 w-full rounded-none ${d}`} />
        <div className="px-5 py-4 flex items-start justify-between gap-3">
          {/* Left */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className={`skeleton-parchment h-5 w-28 ${d}`} />
              <div className={`skeleton-parchment h-4 w-14 ${d}`} />
            </div>
            <div className="flex gap-2">
              <div className={`skeleton-parchment h-5 w-14 rounded-full ${d}`} />
              <div className={`skeleton-parchment h-5 w-20 rounded-full skeleton-delay-2 ${d}`} />
            </div>
            {/* Item chips */}
            <div className="flex gap-1 flex-wrap mt-1">
              {[80, 90, 72].map((w, j) => (
                <div key={j} className={`skeleton-parchment h-5 rounded-full skeleton-delay-${j + 1}`}
                  style={{ width: `${w}px` }} />
              ))}
            </div>
          </div>
          {/* Right — total + chevron */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className={`skeleton-parchment h-6 w-20 ${d}`} />
            <div className="skeleton-parchment w-7 h-7 rounded-full skeleton-delay-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
