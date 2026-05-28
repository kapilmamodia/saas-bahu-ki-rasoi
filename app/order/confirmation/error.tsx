"use client";
/**
 * Error boundary for the order confirmation page.
 * Shown when the Server Component throws (e.g. DB error, invalid session).
 */
export default function ConfirmationError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-5xl mb-4">😟</p>
      <h1 className="font-playfair text-2xl text-brand-heading mb-3">
        Order not found
      </h1>
      <p className="font-hind text-brand-muted mb-6 max-w-md">
        We couldn&apos;t find your order. If you just placed it, please contact us —
        we&apos;ll sort it out!
      </p>
      {/* Contact numbers */}
      <div className="font-hind text-brand-body">
        <p>
          Rajeshwari{" "}
          <a href="tel:+919982128866" className="text-brand-wood hover:text-brand-rust underline">
            +91 99821 28866
          </a>
        </p>
        <p>
          Veena{" "}
          <a href="tel:+919829075457" className="text-brand-wood hover:text-brand-rust underline">
            +91 98290 75457
          </a>
        </p>
      </div>
    </div>
  );
}

