// Loading skeleton for the admin dashboard.
export default function AdminDashboardLoading() {
  return (
    <div>
      <div className="skeleton-parchment h-9 w-44 mb-2" />
      <div className="skeleton-parchment h-0.5 w-full mb-8 opacity-40" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-brand-card border border-brand-wood/20 rounded-xl p-5 flex items-center gap-4">
            <div className="skeleton-parchment w-10 h-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="skeleton-parchment h-3 w-24" />
              <div className="skeleton-parchment h-7 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-brand-card border border-brand-wood/20 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-wood/15">
          <div className="skeleton-parchment h-6 w-36" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="skeleton-parchment h-4 w-20" />
              <div className="skeleton-parchment h-4 flex-1" />
              <div className="skeleton-parchment h-4 w-16" />
              <div className="skeleton-parchment h-6 w-16 rounded-full" />
              <div className="skeleton-parchment h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

