// Server-side Supabase client using the SERVICE ROLE key.
// Use ONLY in Server Components and Server Actions for admin operations.
// NEVER import this in client components — it bypasses RLS.
import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with the service role key.
 * Bypasses Row Level Security — use only server-side for admin operations.
 * fetch cache is disabled (no-store) so queries always return fresh data —
 * critical for the order confirmation page showing the latest payment status.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        // Disable auto-refresh — this is a server-side client, not a browser session
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        // Disable Next.js fetch cache for all Supabase queries made via this client.
        // Without this, Next.js can serve a cached "pending" response even after
        // the order has been marked "paid" in the database.
        fetch: (url, options) =>
          fetch(url, { ...options, cache: "no-store" }),
      },
    }
  );
}

