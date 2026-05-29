/**
 * cart/loading.tsx — pixel-perfect skeleton for the cart page.
 * Matches: dark header banner, 3 cart item rows (left col), order summary panel (right col).
 */
export default function CartLoading() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#FDF6E3 0%,#F5EDD6 100%)" }}>

      {/* ── Dark header banner ── */}
      <div className="py-8 px-4 text-center space-y-2"
        style={{ background: "linear-gradient(135deg,#3B1F0C 0%,#7B4A1E 100%)" }}>
        <div className="skeleton-parchment h-4 w-32 mx-auto opacity-20 rounded-full" />
        <div className="skeleton-parchment h-9 w-44 mx-auto opacity-20" />
        <div className="skeleton-parchment h-3 w-28 mx-auto opacity-20 rounded-full" />
      </div>

      {/* ── Two-column layout ── */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* LEFT — cart items */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i}
              className={`bg-white border border-brand-wood/15 rounded-2xl p-4
                          flex items-center gap-4 shadow-sm skeleton-delay-${i}`}>
              {/* Index badge */}
              <div className="skeleton-parchment w-6 h-6 rounded-full hidden sm:block" />
              {/* Thumbnail */}
              <div className={`skeleton-parchment w-20 h-20 rounded-xl shrink-0 skeleton-delay-${i}`} />
              {/* Name + price */}
              <div className="flex-1 space-y-2">
                <div className={`skeleton-parchment h-5 w-36 skeleton-delay-${i}`} />
                <div className={`skeleton-parchment h-3.5 w-24 skeleton-delay-${i}`} />
              </div>
              {/* Qty stepper */}
              <div className="skeleton-parchment h-9 w-24 rounded-full skeleton-delay-2" />
              {/* Line total */}
              <div className="skeleton-parchment h-5 w-16 hidden sm:block skeleton-delay-3" />
            </div>
          ))}

          {/* Continue shopping link */}
          <div className="skeleton-parchment h-4 w-36 rounded-full mt-2" />

          {/* Delivery card */}
          <div className="bg-white border border-brand-wood/15 rounded-2xl overflow-hidden mt-2 shadow-sm">
            <div className="skeleton-parchment h-12 w-full rounded-none" />
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="skeleton-parchment h-14 rounded-xl skeleton-delay-1" />
                <div className="skeleton-parchment h-14 rounded-xl skeleton-delay-2" />
              </div>
              <div className="skeleton-parchment h-4 w-64 mx-auto rounded-full skeleton-delay-3" />
            </div>
          </div>
        </div>

        {/* RIGHT — order summary panel */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-brand-wood/15 rounded-2xl shadow-md overflow-hidden">
            {/* Panel header */}
            <div className="skeleton-parchment h-14 w-full rounded-none" />
            <div className="px-6 py-5 space-y-4">
              {/* Price rows */}
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`flex justify-between skeleton-delay-${i}`}>
                    <div className={`skeleton-parchment h-4 w-28`} />
                    <div className={`skeleton-parchment h-4 w-16`} />
                  </div>
                ))}
                <div className="border-dashed border-t border-brand-wood/15 pt-2 flex justify-between">
                  <div className="skeleton-parchment h-6 w-16" />
                  <div className="skeleton-parchment h-6 w-24 skeleton-delay-2" />
                </div>
              </div>
              {/* Coupon bar */}
              <div className="flex gap-2">
                <div className="skeleton-parchment flex-1 h-10 rounded-xl" />
                <div className="skeleton-parchment w-20 h-10 rounded-xl skeleton-delay-2" />
              </div>
              {/* Name + email fields */}
              <div className="space-y-3">
                <div className="skeleton-parchment h-10 w-full rounded-xl skeleton-delay-1" />
                <div className="skeleton-parchment h-10 w-full rounded-xl skeleton-delay-2" />
                <div className="skeleton-parchment h-10 w-full rounded-xl skeleton-delay-3" />
              </div>
              {/* CTA button */}
              <div className="skeleton-parchment h-12 w-full rounded-xl skeleton-delay-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
