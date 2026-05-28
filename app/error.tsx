"use client";
// Error boundary for the home page.
export default function HomeError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-20">
      <p className="text-5xl mb-4">😢</p>
      <h2 className="font-playfair text-2xl text-brand-heading mb-2">
        Oops! Something went wrong
      </h2>
      <p className="font-hind text-brand-muted mb-6">
        We couldn&apos;t load the page. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-brand-wood hover:bg-brand-rust text-white font-hind
                   font-semibold px-6 py-2.5 rounded-full transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

