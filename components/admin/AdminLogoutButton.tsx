"use client";
// AdminLogoutButton — client component that signs out via Supabase Auth
// and redirects to the login page.
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

/**
 * Logout button for the admin sidebar.
 * Calls supabase.auth.signOut() then redirects to /admin/login.
 */
export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("[AdminLogout] Error:", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2 font-hind text-sm
                 text-brand-on-dark/60 hover:text-brand-rust transition-colors
                 px-3 py-2 rounded-lg hover:bg-white/5"
    >
      <LogOut size={14} />
      Sign Out
    </button>
  );
}

