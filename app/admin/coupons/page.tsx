/**
 * /admin/coupons — lists all coupons with status, validity, usage, and toggle/delete actions.
 * Server Component: fetches coupons from Supabase at request time.
 */
import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { getCoupons, toggleCouponActive, deleteCoupon } from "@/lib/actions/couponActions";
import type { Coupon } from "@/types";

export const dynamic = "force-dynamic";

/** Format paise → ₹ */
const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

/** Format ISO date → readable */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/** Determine coupon validity status */
function couponStatus(c: Coupon): { label: string; cls: string } {
  if (!c.is_active) return { label: "Inactive", cls: "bg-brand-muted/15 text-brand-muted border-brand-muted/30" };
  const now = new Date();
  if (now < new Date(c.valid_from)) return { label: "Upcoming", cls: "bg-brand-gold/15 text-brand-gold border-brand-gold/30" };
  if (now > new Date(c.valid_until)) return { label: "Expired", cls: "bg-red-100 text-red-600 border-red-200" };
  return { label: "Active", cls: "bg-brand-sage/15 text-brand-sage border-brand-sage/30" };
}

/** Admin coupons list page */
export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-yatra text-3xl text-brand-heading">Coupons</h1>
        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-2 bg-brand-wood hover:bg-brand-rust text-white
                     font-hind font-medium text-sm px-5 py-2.5 rounded-full shadow-sm transition-colors"
        >
          <Plus size={15} /> Create Coupon
        </Link>
      </div>
      <hr className="divider-spice mb-8" />

      {coupons.length === 0 ? (
        <div className="text-center py-20">
          <Tag size={40} className="mx-auto mb-4 text-brand-muted" />
          <p className="font-playfair text-xl text-brand-heading mb-2">No coupons yet</p>
          <p className="font-hind text-brand-muted mb-6">Create your first discount coupon.</p>
          <Link
            href="/admin/coupons/new"
            className="bg-brand-wood hover:bg-brand-rust text-white font-hind px-6 py-2.5 rounded-full transition-colors"
          >
            Create First Coupon
          </Link>
        </div>
      ) : (
        <div className="bg-brand-card border border-brand-wood/25 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-hind">
              <thead className="bg-brand-bg text-brand-muted uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Discount</th>
                  <th className="px-4 py-3 text-left">Min Order</th>
                  <th className="px-4 py-3 text-left">Validity</th>
                  <th className="px-4 py-3 text-center">Uses</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const status = couponStatus(c);
                  return (
                    <tr key={c.id} className="border-t border-brand-wood/10 hover:bg-brand-bg/40">
                      {/* Code + description */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-brand-heading font-caveat text-base tracking-wide">{c.code}</p>
                        {c.description && <p className="text-xs text-brand-muted">{c.description}</p>}
                      </td>

                      {/* Discount value */}
                      <td className="px-4 py-3 text-brand-gold font-semibold whitespace-nowrap">
                        {c.type === "percent" ? `${c.value}% off` : `${fmt(c.value)} off`}
                      </td>

                      {/* Min order */}
                      <td className="px-4 py-3 text-brand-muted whitespace-nowrap">
                        {c.min_order_cents > 0 ? fmt(c.min_order_cents) : "—"}
                      </td>

                      {/* Validity window */}
                      <td className="px-4 py-3 whitespace-nowrap text-brand-body">
                        <p>{fmtDate(c.valid_from)}</p>
                        <p className="text-xs text-brand-muted">to {fmtDate(c.valid_until)}</p>
                      </td>

                      {/* Used / max */}
                      <td className="px-4 py-3 text-center text-brand-body">
                        {c.used_count} / {c.max_uses ?? "∞"}
                      </td>

                      {/* Status badge + active toggle */}
                      <td className="px-4 py-3 text-center">
                        <form action={toggleCouponActive.bind(null, c.id, c.is_active)}>
                          <button
                            type="submit"
                            className={`font-caveat text-sm px-3 py-0.5 rounded-full border transition-colors ${status.cls}`}
                          >
                            {status.label}
                          </button>
                        </form>
                      </td>

                      {/* Edit / Delete */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Link
                            href={`/admin/coupons/${c.id}/edit`}
                            className="font-hind text-xs text-brand-wood hover:text-brand-rust underline underline-offset-2 transition-colors"
                          >
                            Edit
                          </Link>
                          <form action={deleteCoupon.bind(null, c.id)}>
                            <button
                              type="submit"
                              className="font-hind text-xs text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

