"use client";
/**
 * ReviewsDrawer — floating ★ tab fixed to the right edge of the screen.
 * Click to slide open a full reviews wall + submission form.
 * Works on every public page. Hidden on /admin routes.
 * Fetches approved reviews lazily (only when opened for the first time).
 */
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, Star, Send, ChevronLeft, ChevronRight, MessageSquarePlus, Loader2 } from "lucide-react";
import { submitReview, getApprovedReviews } from "@/lib/actions/reviewActions";
import type { Review } from "@/types";

// ── Star helpers ──────────────────────────────────────────────────────────────

/** Filled + empty stars row */
function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size}
          className={i < rating ? "text-brand-gold fill-brand-gold" : "text-brand-wood/25 fill-transparent"} />
      ))}
    </div>
  );
}

/** Interactive star picker with hover glow */
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const v = i + 1;
          return (
            <button key={v} type="button"
              onClick={() => onChange(v)}
              onMouseEnter={() => setHovered(v)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`Rate ${v} star${v !== 1 ? "s" : ""}`}
              className="transition-transform duration-100 hover:scale-125 focus:outline-none">
              <Star size={28} className={`transition-colors duration-100
                ${v <= display ? "text-brand-gold fill-brand-gold" : "text-brand-wood/20 fill-transparent"}`} />
            </button>
          );
        })}
      </div>
      <p className={`font-caveat text-sm transition-all ${display ? "text-brand-rust" : "text-brand-muted/50"}`}>
        {display ? labels[display] : "Tap to rate"}
      </p>
    </div>
  );
}

// ── Single review card ────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  return (
    <div className="bg-brand-bg border border-brand-wood/15 rounded-2xl p-4 flex flex-col gap-2">
      {/* Quote + stars */}
      <div className="flex items-start justify-between gap-2">
        <StarRow rating={review.rating} size={13} />
        <span className="font-playfair text-3xl text-brand-gold/15 leading-none select-none">"</span>
      </div>
      {/* Message */}
      <p className="font-hind text-sm text-brand-body leading-relaxed line-clamp-3">{review.message}</p>
      {/* Dish tag */}
      {review.dish_name && (
        <span className="self-start font-caveat text-xs text-brand-rust bg-brand-rust/10
                         border border-brand-rust/20 px-2 py-0.5 rounded-full">
          🍛 {review.dish_name}
        </span>
      )}
      {/* Author + date */}
      <div className="flex items-center justify-between border-t border-brand-wood/10 pt-2 mt-auto">
        <p className="font-caveat text-brand-wood text-sm font-semibold">— {review.customer_name}</p>
        <p className="font-hind text-xs text-brand-muted">{date}</p>
      </div>
    </div>
  );
}

// ── Submission form ───────────────────────────────────────────────────────────

function ReviewForm({ onDone }: { onDone: () => void }) {
  const [rating, setRating]       = useState(0);
  const [name, setName]           = useState("");
  const [dish, setDish]           = useState("");
  const [message, setMessage]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError("Please select a star rating."); return; }
    setError(null);
    try {
      setLoading(true);
      const result = await submitReview({ customer_name: name, rating, message, dish_name: dish.trim() || null });
      if (!result.success) { setError(result.error ?? "Failed to submit."); return; }
      setSubmitted(true);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-4xl mb-3">🙏</p>
        <h3 className="font-yatra text-xl text-brand-heading mb-1">Shukriya!</h3>
        <p className="font-hind text-brand-muted text-sm mb-4">
          Your review is pending approval and will appear here soon.
        </p>
        <button onClick={onDone}
          className="font-hind text-sm bg-brand-wood hover:bg-brand-rust text-white
                     px-5 py-2 rounded-full transition-colors">
          Back to Reviews
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <h3 className="font-playfair text-base text-brand-heading text-center">Share Your Experience 🍽️</h3>

      <StarPicker value={rating} onChange={setRating} />

      {/* Name */}
      <div>
        <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
          Your Name <span className="text-brand-rust">*</span>
        </label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Priya Sharma" required maxLength={60}
          className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                     font-hind text-sm bg-brand-bg placeholder:text-brand-muted/50
                     focus:outline-none focus:ring-2 focus:ring-brand-wood/30" />
      </div>

      {/* Dish */}
      <div>
        <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
          Favourite Dish (optional)
        </label>
        <input type="text" value={dish} onChange={e => setDish(e.target.value)}
          placeholder="e.g. Dal Makhani" maxLength={80}
          className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                     font-hind text-sm bg-brand-bg placeholder:text-brand-muted/50
                     focus:outline-none focus:ring-2 focus:ring-brand-wood/30" />
      </div>

      {/* Message */}
      <div>
        <div className="flex justify-between mb-1">
          <label className="font-hind text-xs text-brand-muted uppercase tracking-wide">
            Review <span className="text-brand-rust">*</span>
          </label>
          <span className={`font-hind text-xs ${message.length > 450 ? "text-brand-rust" : "text-brand-muted"}`}>
            {message.length}/500
          </span>
        </div>
        <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Tell us about your experience…"
          required minLength={10} maxLength={500}
          className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                     font-hind text-sm bg-brand-bg resize-none
                     placeholder:text-brand-muted/50 focus:outline-none
                     focus:ring-2 focus:ring-brand-wood/30" />
      </div>

      {error && (
        <p className="font-hind text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          ⚠️ {error}
        </p>
      )}

      <button type="submit" disabled={loading}
        className="flex items-center justify-center gap-2 bg-brand-wood hover:bg-brand-rust
                   text-white font-hind font-semibold py-2.5 rounded-xl
                   transition-colors disabled:opacity-50">
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

// ── Main FloatingReviewsDrawer ────────────────────────────────────────────────

/**
 * Floating ★ tab on the right edge — opens a slide-in reviews drawer.
 * Lazy-loads reviews on first open. Hidden on /admin routes.
 */
export default function ReviewsDrawer() {
  const pathname = usePathname();
  const [mounted, setMounted]     = useState(false);
  const [open, setOpen]           = useState(false);
  const [view, setView]           = useState<"list" | "form">("list");
  const [reviews, setReviews]     = useState<Review[] | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [page, setPage]           = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  const CARDS_PER_PAGE = 4;

  // Ensure we only render after hydration to avoid mismatch
  useEffect(() => setMounted(true), []);

  // Lazy-fetch reviews when drawer opens for the first time
  useEffect(() => {
    if (open && reviews === null) {
      setLoadingReviews(true);
      getApprovedReviews()
        .then(setReviews)
        .finally(() => setLoadingReviews(false));
    }
  }, [open, reviews]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Hide on admin routes or before hydration
  if (!mounted || pathname?.startsWith("/admin")) return null;

  const totalReviews = reviews?.length ?? 0;
  const totalPages   = Math.ceil(totalReviews / CARDS_PER_PAGE);
  const visibleCards = reviews?.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE) ?? [];

  const avg = totalReviews
    ? (reviews!.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : null;

  return (
    <>
      {/* ── Floating tab ── fixed right edge, vertically centred */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open customer reviews"
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-50
                    flex flex-col items-center gap-1.5
                    bg-brand-wood hover:bg-brand-rust text-white
                    px-2.5 py-5 rounded-l-2xl shadow-2xl
                    transition-all duration-300 border-l-0
                    hover:-translate-x-1 hover:shadow-brand-wood/30
                    ${open ? "opacity-0 pointer-events-none translate-x-4" : "opacity-100 translate-x-0"}`}
      >
        {/* Gold star */}
        <Star size={20} className="fill-brand-gold text-brand-gold flex-shrink-0" />
        {/* Vertical "Reviews" label */}
        <span
          className="font-caveat text-sm text-white font-semibold tracking-wide select-none"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
        >
          Reviews
        </span>
        {/* Average rating pill — shown when reviews exist */}
        {avg && (
          <span className="font-hind text-xs font-bold text-brand-gold bg-white/10 rounded-full px-1.5 py-0.5">
            {avg}
          </span>
        )}
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Drawer panel ── */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full z-50 w-full sm:w-96
                    bg-brand-card shadow-2xl flex flex-col
                    transition-transform duration-350 ease-in-out
                    ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-wood/15"
          style={{ background: "linear-gradient(135deg,#3B1F0C,#7B4A1E)" }}>
          <div>
            <p className="font-yatra text-brand-gold text-lg leading-none">Customer Reviews</p>
            {avg && totalReviews > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <StarRow rating={Math.round(Number(avg))} size={12} />
                <span className="font-hind text-xs text-white/60">{avg} · {totalReviews} review{totalReviews !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close reviews"
            className="text-white/60 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* View toggle */}
        <div className="flex border-b border-brand-wood/15">
          <button onClick={() => setView("list")}
            className={`flex-1 font-hind text-sm py-2.5 transition-colors
              ${view === "list" ? "text-brand-wood border-b-2 border-brand-wood font-semibold" : "text-brand-muted hover:text-brand-body"}`}>
            ⭐ Read Reviews
          </button>
          <button onClick={() => setView("form")}
            className={`flex-1 font-hind text-sm py-2.5 transition-colors flex items-center justify-center gap-1.5
              ${view === "form" ? "text-brand-wood border-b-2 border-brand-wood font-semibold" : "text-brand-muted hover:text-brand-body"}`}>
            <MessageSquarePlus size={14} /> Write One
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {view === "list" ? (
            <div className="p-4 flex flex-col gap-3">
              {/* Loading state */}
              {loadingReviews && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-brand-gold" />
                </div>
              )}

              {/* Empty state */}
              {!loadingReviews && totalReviews === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🍲</p>
                  <p className="font-playfair text-brand-heading text-base mb-1">No reviews yet</p>
                  <p className="font-hind text-brand-muted text-sm mb-4">Be the first to share your experience!</p>
                  <button onClick={() => setView("form")}
                    className="font-hind text-sm bg-brand-wood hover:bg-brand-rust text-white
                               px-5 py-2 rounded-full transition-colors">
                    Write a Review
                  </button>
                </div>
              )}

              {/* Review cards */}
              {!loadingReviews && visibleCards.map(r => (
                <ReviewCard key={r.id} review={r} />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 py-2">
                  <button onClick={() => setPage(p => (p - 1 + totalPages) % totalPages)}
                    aria-label="Previous"
                    className="w-8 h-8 rounded-full border border-brand-wood/25 flex items-center justify-center
                               text-brand-wood hover:bg-brand-wood hover:text-white transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  {/* Dot indicators */}
                  <div className="flex gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i} onClick={() => setPage(i)}
                        className={`rounded-full transition-all duration-300
                          ${i === page ? "w-5 h-2 bg-brand-gold" : "w-2 h-2 bg-brand-wood/25"}`} />
                    ))}
                  </div>
                  <button onClick={() => setPage(p => (p + 1) % totalPages)}
                    aria-label="Next"
                    className="w-8 h-8 rounded-full border border-brand-wood/25 flex items-center justify-center
                               text-brand-wood hover:bg-brand-wood hover:text-white transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* CTA to write */}
              {!loadingReviews && totalReviews > 0 && (
                <div className="border-t border-brand-wood/15 pt-4 text-center">
                  <button onClick={() => setView("form")}
                    className="inline-flex items-center gap-2 font-hind text-sm text-brand-wood
                               hover:text-brand-rust transition-colors underline underline-offset-4">
                    <MessageSquarePlus size={14} /> Add your review
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ReviewForm onDone={() => setView("list")} />
          )}
        </div>
      </div>
    </>
  );
}

