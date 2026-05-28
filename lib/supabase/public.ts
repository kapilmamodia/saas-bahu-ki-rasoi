// Server-side Supabase client for PUBLIC pages (menu, home).
// Uses the anon key directly without cookies — safe for public data fetching.
// Import this in Server Components that don't need auth (menu, home page).
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for public server-side data fetching.
 * Does NOT read cookies — use lib/supabase/server.ts for auth-protected routes.
 *
 * fetch cache is disabled (no-store) so queries always return live data on Vercel.
 * Without this, Next.js caches the Supabase response at build time and the menu
 * appears empty until the next deployment.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Bypass Next.js fetch cache — every request fetches live data from Supabase
        fetch: (url, options) =>
          fetch(url, { ...options, cache: "no-store" }),
      },
    }
  );
}

