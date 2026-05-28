"use client";
// ConditionalShell — shows the public Navbar + Footer only on non-admin pages.
// Admin pages have their own sidebar layout via app/admin/layout.tsx.
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Wraps children with the public Navbar and Footer,
 * but skips them for /admin/* routes which have their own shell.
 */
export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

