// Loading skeleton for the admin menu list page.
export default function AdminMenuLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="skeleton-parchment h-9 w-36" />
        <div className="skeleton-parchment h-10 w-36 rounded-full" />
      </div>
      <div className="skeleton-parchment h-0.5 w-full mb-8 opacity-40" />

      {/* Table skeleton */}
      <div className="bg-brand-card border border-brand-wood/20 rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="bg-brand-bg px-4 py-3 flex gap-4">
          {[120, 80, 60, 80, 60, 60, 80].map((w, i) => (
            <div key={i} className="skeleton-parchment h-3 rounded" style={{ width: `${w}px` }} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-t border-brand-wood/10 px-4 py-3 flex items-center gap-4">
            {/* Photo + name */}
            <div className="flex items-center gap-3 w-32 shrink-0">
              <div className="skeleton-parchment w-10 h-10 rounded-lg shrink-0" />
              <div className="skeleton-parchment h-4 w-20" />
            </div>
            <div className="skeleton-parchment h-4 w-20" />
            <div className="skeleton-parchment h-4 w-14" />
            <div className="skeleton-parchment h-5 w-10 rounded-full" />
            <div className="skeleton-parchment h-6 w-12 rounded-full" />
            <div className="skeleton-parchment h-6 w-12 rounded-full" />
            <div className="flex gap-2">
              <div className="skeleton-parchment h-4 w-8" />
              <div className="skeleton-parchment h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

