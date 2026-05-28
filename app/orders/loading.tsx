/**
 * loading.tsx — skeleton for /orders page while server resolves
 */
export default function OrdersLoading() {
  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-10">
      <div className="h-10 w-48 bg-brand-wood/10 rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-72 bg-brand-wood/10 rounded animate-pulse mb-8" />
      <div className="h-14 w-full bg-brand-wood/10 rounded-xl animate-pulse" />
    </div>
  );
}

