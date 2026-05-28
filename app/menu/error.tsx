"use client";
// Error boundary for the menu page.
import Link from "next/link";
export default function MenuError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-20">
      <p className="text-5xl mb-4">🍽️</p>
      <h2 className="font-playfair text-2xl text-brand-heading mb-2">
        Couldn&apos;t load the menu
      </h2>
      <p className="font-hind text-brand-muted mb-6">
        Please refresh the page or try again in a moment.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-brand-wood hover:bg-brand-rust text-white font-hind
                     font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          Try Again
        </button>
        <Link href="/" className="border border-brand-wood text-brand-wood hover:bg-brand-wood
                                   hover:text-white font-hind font-semibold px-6 py-2.5
                                   rounded-full transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}

