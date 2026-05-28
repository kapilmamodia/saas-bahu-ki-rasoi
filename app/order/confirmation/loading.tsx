/**
 * Loading skeleton for the order confirmation page.
 * Shown by Next.js while the Server Component fetches order data.
 */
export default function ConfirmationLoading() {
  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-10 animate-pulse">
      {/* Status banner skeleton */}
      <div className="bg-brand-card border border-brand-wood/25 rounded-2xl p-6 mb-8 h-24" />
      {/* Order meta skeleton */}
      <div className="bg-brand-card border border-brand-wood/25 rounded-xl p-5 mb-6 h-36" />
      {/* Items list skeleton */}
      <div className="bg-brand-card border border-brand-wood/25 rounded-xl p-5 mb-6 h-48" />
      {/* Action skeleton */}
      <div className="bg-brand-card border border-brand-wood/25 rounded-xl p-5 h-28" />
    </div>
  );
}

