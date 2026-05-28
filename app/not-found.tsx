// Custom 404 not-found page — warm brand style.
import Link from "next/link";

/** Shown for any unmatched URL */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-20">
      <p className="text-6xl mb-4">🍛</p>
      <h1 className="font-yatra text-4xl text-brand-heading mb-2">404</h1>
      <h2 className="font-playfair text-xl text-brand-heading mb-3">
        This page doesn&apos;t exist
      </h2>
      <p className="font-hind text-brand-muted mb-8 max-w-sm">
        Looks like this dish isn&apos;t on our menu. Let&apos;s get you back to the rasoi.
      </p>
      <Link
        href="/"
        className="bg-brand-wood hover:bg-brand-rust text-white font-hind
                   font-semibold px-8 py-3 rounded-full shadow-md transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}

