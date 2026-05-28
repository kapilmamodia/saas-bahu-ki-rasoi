"use client";
// ConditionalShell — shows the public Navbar + Footer only on non-admin pages.
// Admin pages have their own sidebar layout via app/admin/layout.tsx.
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

/**
 * Wraps children with the public Navbar and Footer,
 * but skips them for /admin/* routes which have their own shell.
 */
export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Hide public nav/footer on all admin routes (they have their own layout)
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      {/* Public footer */}
      <footer className="bg-brand-dark text-brand-on-dark py-8 px-4 text-center">
        <p className="font-caveat text-lg">
          Made with ❤️ in our rasoi — Rajeshwari &amp; Veena Khandelwal
        </p>
        <p className="text-sm text-brand-muted mt-2">
          📞 +91 99821 28866 &nbsp;·&nbsp; +91 98290 75457
        </p>
      </footer>
    </>
  );
}

