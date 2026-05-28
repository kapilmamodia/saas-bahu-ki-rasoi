/**
 * Admin layout — shared shell for all /admin/* pages EXCEPT the (auth) group.
 *
 * On desktop (md+): permanent sidebar on the left.
 * On mobile: sidebar hidden by default; a hamburger button in the top bar
 *   toggles a slide-in drawer overlay. Interaction state lives in the
 *   AdminShell client component so this Server Component stays async.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

/**
 * Verifies session then renders the responsive admin shell.
 * Unauthenticated users are redirected to /admin/login.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify session — redirect to login if not authenticated
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
