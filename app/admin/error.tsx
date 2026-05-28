"use client";
// Error boundary for all admin pages.
import Link from "next/link";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <p className="text-5xl mb-4">⚠️</p>
      <h2 className="font-playfair text-2xl text-brand-heading mb-2">
        Something went wrong
      </h2>
      <p className="font-hind text-brand-muted mb-6">
        An error occurred in the admin panel. Please try again.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-brand-wood hover:bg-brand-rust text-white font-hind
                     font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          Try Again
        </button>
        <Link href="/admin/dashboard" className="border border-brand-wood text-brand-wood
                                                  hover:bg-brand-wood hover:text-white font-hind
                                                  font-semibold px-6 py-2.5 rounded-full transition-colors">
          Dashboard
        </Link>
      </div>
    </div>
  );
}

