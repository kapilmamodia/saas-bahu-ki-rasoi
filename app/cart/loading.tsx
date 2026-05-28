// Loading skeleton for the cart page.
export default function CartLoading() {
  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-10">
      <div className="skeleton-parchment h-9 w-36 mb-2" />
      <div className="skeleton-parchment h-0.5 w-full mb-8 opacity-40" />

      {/* Cart item rows */}
      <div className="flex flex-col gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-brand-card border border-brand-wood/20 rounded-xl p-4
                       flex items-center gap-4"
          >
            <div className="skeleton-parchment w-16 h-16 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-parchment h-5 w-40" />
              <div className="skeleton-parchment h-4 w-24" />
            </div>
            <div className="skeleton-parchment h-7 w-24 rounded-full" />
            <div className="skeleton-parchment h-5 w-16" />
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="bg-brand-card border border-brand-wood/20 rounded-xl p-6 space-y-3">
        <div className="skeleton-parchment h-4 w-full" />
        <div className="skeleton-parchment h-4 w-3/4" />
        <div className="skeleton-parchment h-0.5 w-full opacity-40" />
        <div className="skeleton-parchment h-6 w-full" />
        <div className="skeleton-parchment h-11 w-full rounded-full mt-2" />
      </div>
    </div>
  );
}

