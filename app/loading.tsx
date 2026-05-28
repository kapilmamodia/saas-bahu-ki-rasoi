// Loading skeleton for the home page — parchment shimmer while specials load.
export default function HomeLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero shimmer */}
      <div className="bg-brand-dark py-16 px-4 text-center">
        <div className="skeleton-parchment h-5 w-48 mx-auto mb-3 opacity-30" />
        <div className="skeleton-parchment h-12 w-72 mx-auto mb-4 opacity-30" />
        <div className="skeleton-parchment h-6 w-56 mx-auto mb-6 opacity-30" />
        <div className="flex gap-3 justify-center">
          <div className="skeleton-parchment h-11 w-36 rounded-full opacity-30" />
          <div className="skeleton-parchment h-11 w-36 rounded-full opacity-30" />
        </div>
      </div>

      {/* Specials grid shimmer */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="skeleton-parchment h-5 w-32 mx-auto mb-2" />
          <div className="skeleton-parchment h-9 w-48 mx-auto" />
        </div>
        {/* 3-col skeleton cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

/** Reusable menu card skeleton */
function CardSkeleton() {
  return (
    <div className="bg-brand-card border border-brand-wood/20 rounded-xl overflow-hidden">
      {/* Photo area */}
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

