/**
 * app/admin/reviews/page.tsx — Admin reviews moderation page.
 * Shows all reviews (approved + pending). Admins can approve or delete.
 */
import { getAllReviews } from "@/lib/actions/reviewActions";
import ReviewActionButtons from "@/components/admin/ReviewActionButtons";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

/** Render N filled stars inline */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12}
          className={i < rating ? "text-brand-gold fill-brand-gold" : "text-brand-wood/20 fill-brand-wood/10"} />
      ))}
    </span>
  );
}

/** Admin reviews moderation page */
export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  const pending   = reviews.filter(r => !r.is_approved);
  const approved  = reviews.filter(r => r.is_approved);

  return (
    <div className="max-w-4xl">
      <h1 className="font-yatra text-3xl text-brand-heading mb-2">Customer Reviews</h1>
      <hr className="divider-spice mb-8" />

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Reviews",    value: reviews.length,  icon: "⭐" },
          { label: "Pending Approval", value: pending.length,  icon: "⏳" },
          { label: "Published",        value: approved.length, icon: "✅" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-brand-card border border-brand-wood/20 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="font-playfair text-2xl font-bold text-brand-heading">{value}</p>
            <p className="font-hind text-xs text-brand-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Pending reviews ── */}
      {pending.length > 0 && (
        <div className="mb-10">
          <h2 className="font-playfair text-lg text-brand-heading mb-4 flex items-center gap-2">
            ⏳ Pending Approval
            <span className="font-hind text-sm font-normal text-brand-muted">({pending.length})</span>
          </h2>
          <div className="flex flex-col gap-3">
            {pending.map(r => (
              <div key={r.id}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-playfair font-semibold text-brand-heading">{r.customer_name}</p>
                    <Stars rating={r.rating} />
                    {r.dish_name && (
                      <span className="font-caveat text-xs text-brand-rust bg-brand-rust/10
                                       border border-brand-rust/20 px-2 py-0.5 rounded-full">
                        🍛 {r.dish_name}
                      </span>
                    )}
                  </div>
                  <p className="font-hind text-sm text-brand-body">{r.message}</p>
                  <p className="font-hind text-xs text-brand-muted mt-1">
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <ReviewActionButtons id={r.id} isApproved={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Approved reviews ── */}
      <div>
        <h2 className="font-playfair text-lg text-brand-heading mb-4 flex items-center gap-2">
          ✅ Published Reviews
          <span className="font-hind text-sm font-normal text-brand-muted">({approved.length})</span>
        </h2>
        {approved.length === 0 ? (
          <div className="bg-brand-card border border-brand-wood/15 rounded-2xl px-5 py-8 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="font-hind text-brand-muted">No approved reviews yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {approved.map(r => (
              <div key={r.id}
                className="bg-brand-card border border-brand-wood/15 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-playfair font-semibold text-brand-heading">{r.customer_name}</p>
                    <Stars rating={r.rating} />
                    {r.dish_name && (
                      <span className="font-caveat text-xs text-brand-rust bg-brand-rust/10
                                       border border-brand-rust/20 px-2 py-0.5 rounded-full">
                        🍛 {r.dish_name}
                      </span>
                    )}
                  </div>
                  <p className="font-hind text-sm text-brand-body">{r.message}</p>
                  <p className="font-hind text-xs text-brand-muted mt-1">
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <ReviewActionButtons id={r.id} isApproved={true} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

