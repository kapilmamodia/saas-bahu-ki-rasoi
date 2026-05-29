"use client";
/**
 * ReviewsSection — interactive reviews wall + star-rating submission form.
 * Features:
 *  - Animated masonry-style review cards with star display
 *  - Interactive star picker with hover glow
 *  - Submission form with character counter
 *  - Optimistic "Thank you" state after submit
 *  - Average rating badge + count
 *  - Carousel auto-scroll on mobile
 */
import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Send, MessageSquarePlus } from "lucide-react";
import { submitReview } from "@/lib/actions/reviewActions";
import type { Review } from "@/types";

// ── Props ─────────────────────────────────────────────────────────────────────

interface ReviewsSectionProps {
  /** Pre-fetched approved reviews from the server */
  reviews: Review[];
}

// ── Star display helper ───────────────────────────────────────────────────────

/** Renders N filled stars + (5-N) empty stars */
function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? "text-brand-gold fill-brand-gold" : "text-brand-wood/20 fill-brand-wood/10"}
        />
      ))}
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────

/** Single review card — warm parchment style */
function ReviewCard({ review, index }: { review: Review; index: number }) {
  const date = new Date(review.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  // Subtle rotation alternation for a hand-pinned feel
  const rotations = ["rotate-1", "-rotate-1", "rotate-0", "-rotate-0.5", "rotate-0.5"];
  const rot = rotations[index % rotations.length];

  return (
    <div
      className={`relative bg-brand-card border border-brand-wood/20 rounded-2xl p-5
                  shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1
                  flex flex-col gap-3 ${rot}`}
    >
      {/* Quote mark decoration */}
      <span className="absolute top-3 right-4 font-playfair text-5xl text-brand-gold/10 leading-none select-none">
        &ldquo;
      </span>

      {/* Stars */}
      <StarRow rating={review.rating} size={14} />

      {/* Message */}
      <p className="font-hind text-sm text-brand-body leading-relaxed line-clamp-4">
        {review.message}
      </p>

      {/* Dish tag — if reviewer named a dish */}
      {review.dish_name && (
        <span className="inline-flex self-start font-caveat text-xs text-brand-rust
                         bg-brand-rust/10 border border-brand-rust/20 px-2 py-0.5 rounded-full">
          🍛 {review.dish_name}
        </span>
      )}

      {/* Footer — name + date */}
      <div className="flex items-center justify-between mt-auto pt-2
                      border-t border-brand-wood/10">
        <p className="font-caveat text-brand-wood text-base font-semibold">
          — {review.customer_name}
        </p>
        <p className="font-hind text-xs text-brand-muted">{date}</p>
      </div>
    </div>
  );
}

// ── Interactive star picker ───────────────────────────────────────────────────

interface StarPickerProps {
  value: number;
  onChange: (v: number) => void;
}

/** Click or hover to pick a star rating 1–5 */
function StarPicker({ value, onChange }: StarPickerProps) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const v = i + 1;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              onMouseEnter={() => setHovered(v)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`Rate ${v} star${v !== 1 ? "s" : ""}`}
              className="transition-transform duration-150 hover:scale-125 focus:outline-none focus:scale-125"
            >
              <Star
                size={32}
                className={`transition-colors duration-100
                  ${v <= display
                    ? "text-brand-gold fill-brand-gold drop-shadow-sm"
                    : "text-brand-wood/25 fill-transparent"
                  }`}
              />
            </button>
          );
        })}
      </div>
      {/* Label under stars */}
      <p className={`font-caveat text-base transition-all duration-200
        ${display ? "text-brand-rust opacity-100" : "text-brand-muted opacity-50"}`}>
        {display ? labels[display] : "Tap to rate"}
      </p>
    </div>
  );
}

// ── Submission form ───────────────────────────────────────────────────────────

/** Review submission form — slides in from below */
function ReviewForm({ onClose }: { onClose: () => void }) {
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
      const result = await submitReview({
        customer_name: name,
        rating,
        message,
        dish_name: dish.trim() || null,
      });
      if (!result.success) { setError(result.error ?? "Failed to submit."); return; }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10 px-6">
        <p className="text-5xl mb-4">🙏</p>
        <h3 className="font-yatra text-2xl text-brand-heading mb-2">Shukriya!</h3>
        <p className="font-caveat text-brand-wood text-lg mb-1">Thank you for your kind words!</p>
        <p className="font-hind text-brand-muted text-sm mb-6">
          Your review is being reviewed and will appear here shortly.
        </p>
        <button onClick={onClose}
          className="font-hind text-sm bg-brand-wood hover:bg-brand-rust text-white
                     px-6 py-2.5 rounded-full transition-colors">
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
      <h3 className="font-playfair text-xl text-brand-heading text-center">
        Share Your Experience 🍽️
      </h3>

      {/* Star picker */}
      <StarPicker value={rating} onChange={setRating} />

      {/* Name + Dish row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
            Your Name <span className="text-brand-rust">*</span>
          </label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Priya Sharma" required maxLength={60}
            className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                       font-hind text-sm text-brand-body bg-brand-bg
                       placeholder:text-brand-muted/50 focus:outline-none
                       focus:ring-2 focus:ring-brand-wood/30" />
        </div>
        <div>
          <label className="font-hind text-xs text-brand-muted uppercase tracking-wide block mb-1">
            Favourite Dish (optional)
          </label>
          <input type="text" value={dish} onChange={e => setDish(e.target.value)}
            placeholder="e.g. Dal Makhani" maxLength={80}
            className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                       font-hind text-sm text-brand-body bg-brand-bg
                       placeholder:text-brand-muted/50 focus:outline-none
                       focus:ring-2 focus:ring-brand-wood/30" />
        </div>
      </div>

      {/* Message */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="font-hind text-xs text-brand-muted uppercase tracking-wide">
            Your Review <span className="text-brand-rust">*</span>
          </label>
          {/* Character counter */}
          <span className={`font-hind text-xs transition-colors
            ${message.length > 450 ? "text-brand-rust" : "text-brand-muted"}`}>
            {message.length}/500
          </span>
        </div>
        <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Tell us about your experience — the food, the warmth, the memories…"
          required minLength={10} maxLength={500}
          className="w-full border border-brand-wood/25 rounded-xl px-3 py-2
                     font-hind text-sm text-brand-body bg-brand-bg resize-none
                     placeholder:text-brand-muted/50 focus:outline-none
                     focus:ring-2 focus:ring-brand-wood/30" />
      </div>

      {error && (
        <p className="font-hind text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          ⚠️ {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-wood hover:bg-brand-rust
                     text-white font-hind font-semibold py-2.5 rounded-xl shadow-sm
                     transition-colors disabled:opacity-50">
          {loading
            ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            : <Send size={15} />}
          {loading ? "Submitting…" : "Submit Review"}
        </button>
        <button type="button" onClick={onClose}
          className="font-hind text-sm text-brand-muted hover:text-brand-rust px-4 py-2.5
                     rounded-xl transition-colors border border-brand-wood/20">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Main ReviewsSection ───────────────────────────────────────────────────────

/**
 * ReviewsSection — full reviews wall with average badge, carousel, and submission form.
 * Server fetches approved reviews and passes them as props; form uses server action.
 */
export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [showForm, setShowForm]   = useState(false);
  const [page, setPage]           = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const CARDS_PER_PAGE = 3;

  // Auto-scroll carousel every 5 seconds when not viewing form
  useEffect(() => {
    if (showForm || reviews.length <= CARDS_PER_PAGE) return;
    const t = setInterval(() => {
      setPage(p => (p + 1) % Math.ceil(reviews.length / CARDS_PER_PAGE));
    }, 5000);
    return () => clearInterval(t);
  }, [showForm, reviews.length]);

  // Average rating
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const totalPages = Math.ceil(reviews.length / CARDS_PER_PAGE);
  const visibleReviews = reviews.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  return (
    <section className="max-w-6xl mx-auto px-4 py-14">

      {/* ── Section header ── */}
      <div className="text-center mb-8">
        <p className="font-caveat text-brand-rust text-lg mb-1">💬 Log ki baatein</p>
        <h2 className="font-playfair text-3xl md:text-4xl text-brand-heading">
          What Our Customers Say
        </h2>
        <hr className="divider-spice max-w-xs mx-auto mt-4 mb-5" />

        {/* Average rating badge */}
        {avg && (
          <div className="inline-flex items-center gap-3 bg-brand-card border border-brand-wood/20
                          rounded-2xl px-5 py-3 shadow-sm mb-2">
            <span className="font-yatra text-4xl text-brand-gold leading-none">{avg}</span>
            <div className="flex flex-col items-start gap-1">
              <StarRow rating={Math.round(Number(avg))} size={16} />
              <p className="font-hind text-xs text-brand-muted">
                Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Review cards + carousel ── */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-brand-card border border-brand-wood/15 rounded-2xl mb-8">
          <p className="text-4xl mb-3">🍲</p>
          <p className="font-playfair text-brand-heading text-lg mb-1">No reviews yet</p>
          <p className="font-hind text-brand-muted text-sm">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="relative mb-6" ref={scrollRef}>
          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleReviews.map((r, i) => (
              <ReviewCard key={r.id} review={r} index={page * CARDS_PER_PAGE + i} />
            ))}
          </div>

          {/* Pagination controls — only when multiple pages */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage(p => (p - 1 + totalPages) % totalPages)}
                aria-label="Previous reviews"
                className="w-9 h-9 rounded-full border border-brand-wood/25 flex items-center justify-center
                           text-brand-wood hover:bg-brand-wood hover:text-white transition-colors">
                <ChevronLeft size={16} />
              </button>

              {/* Page dots */}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)} aria-label={`Page ${i + 1}`}
                    className={`rounded-full transition-all duration-300
                      ${i === page
                        ? "w-6 h-2.5 bg-brand-gold"
                        : "w-2.5 h-2.5 bg-brand-wood/25 hover:bg-brand-wood/50"
                      }`} />
                ))}
              </div>

              <button
                onClick={() => setPage(p => (p + 1) % totalPages)}
                aria-label="Next reviews"
                className="w-9 h-9 rounded-full border border-brand-wood/25 flex items-center justify-center
                           text-brand-wood hover:bg-brand-wood hover:text-white transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Submit form card or CTA button ── */}
      <div className="max-w-xl mx-auto">
        {showForm ? (
          <div className="bg-brand-card border border-brand-wood/25 rounded-2xl shadow-md overflow-hidden">
            <ReviewForm onClose={() => setShowForm(false)} />
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-brand-wood hover:bg-brand-rust
                         text-white font-hind font-semibold px-7 py-3 rounded-full
                         shadow-md transition-colors text-base">
              <MessageSquarePlus size={18} />
              Write a Review
            </button>
            <p className="font-caveat text-brand-muted text-sm mt-2">
              Your feedback means the world to our kitchen 🙏
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

