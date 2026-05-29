/**
 * admin/dashboard/loading.tsx — pixel-perfect skeleton for the admin dashboard.
 * Matches: heading, 3 stat cards, filters bar, orders table rows.
 */
export default function AdminDashboardLoading() {
  return (
    <div>
      {/* Heading */}
      <div className="skeleton-parchment h-9 w-48 mb-2" />
      <div className="skeleton-parchment h-0.5 w-full mb-8 opacity-40" />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-brand-card border border-brand-wood/20 rounded-xl p-5 flex items-center gap-4">
            <div className={`skeleton-parchment w-11 h-11 rounded-full skeleton-delay-${i}`} />
            <div className="space-y-2 flex-1">
              <div className={`skeleton-parchment h-3 w-20 rounded-full skeleton-delay-${i}`} />
              <div className={`skeleton-parchment h-7 w-24 skeleton-delay-${i}`} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Orders table ── */}
      <div className="bg-brand-card border border-brand-wood/20 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="px-6 py-4 border-b border-brand-wood/15 flex items-center justify-between">
          <div className="skeleton-parchment h-6 w-32" />
          <div className="skeleton-parchment h-8 w-48 rounded-xl skeleton-delay-2" />
        </div>

        {/* Filter row */}
        <div className="px-6 py-3 border-b border-brand-wood/10 flex gap-3 flex-wrap">
          {[120, 140, 100, 90].map((w, i) => (
            <div key={i} className={`skeleton-parchment h-8 rounded-lg skeleton-delay-${i + 1}`}
              style={{ width: `${w}px` }} />
          ))}
        </div>

        {/* Table column headers */}
        <div className="px-4 py-3 grid grid-cols-6 gap-4 border-b border-brand-wood/10">
          {[60, 120, 60, 70, 80, 60].map((w, i) => (
            <div key={i} className={`skeleton-parchment h-3 rounded-full skeleton-delay-${i + 1}`}
              style={{ width: `${w}px` }} />
          ))}
        </div>

        {/* Table rows */}
        <div className="divide-y divide-brand-wood/8">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={`px-4 py-3.5 flex items-center gap-4 skeleton-delay-${(i % 6) + 1}`}>
              {/* Order # */}
              <div className="skeleton-parchment h-4 w-12" />
              {/* Customer */}
              <div className="flex-1 space-y-1.5">
                <div className="skeleton-parchment h-4 w-28" />
                <div className="skeleton-parchment h-3 w-36 opacity-70" />
              </div>
              {/* Total */}
              <div className="skeleton-parchment h-4 w-16" />
              {/* Status badge */}
              <div className="skeleton-parchment h-6 w-16 rounded-full" />
              {/* Date */}
              <div className="skeleton-parchment h-4 w-24" />
              {/* Action */}
              <div className="skeleton-parchment h-7 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
