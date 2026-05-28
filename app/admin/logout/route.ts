// Quick logout route — clears the Supabase session and redirects to login.
// Visit /admin/logout directly to sign out from any page.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/** GET /admin/logout — signs out and redirects to login */
export async function GET() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

