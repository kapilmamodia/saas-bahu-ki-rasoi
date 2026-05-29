/**
 * /orders — Customer order history lookup.
 * Gen Z redesign: bold gradient hero, glassmorphism cards, emoji status pills.
 */
import OrdersLookup from "@/components/OrdersLookup";

export default function OrdersPage() {
  return (
    <div className="min-h-screen">

      {/* ── Bold gradient hero header ── */}
      <div className="relative overflow-hidden py-12 px-4 text-center"
        style={{ background: "linear-gradient(135deg,#1A0A02 0%,#3B1F0C 50%,#7B4A1E 100%)" }}>
        {/* Dot grid texture */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(#D4A017 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10">
          <p className="font-caveat text-brand-gold text-lg mb-1">📦 Order History</p>
          <h1 className="font-yatra text-4xl md:text-5xl text-brand-gold leading-tight mb-2"
            style={{ textShadow: "0 0 30px rgba(212,160,23,0.4)" }}>
            My Orders
          </h1>
          <p className="font-hind text-brand-on-dark/60 text-sm max-w-sm mx-auto">
            Enter your email or phone number to track all your past orders
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <OrdersLookup />
      </div>
    </div>
  );
}
