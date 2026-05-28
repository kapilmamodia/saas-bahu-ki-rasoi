// Server-side Supabase client — used in Server Components, Server Actions, API routes.
// Reads cookies for session — never call this in a Client Component.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use in server-side code.
 * Reads the session from cookies so auth state is preserved across requests.
 * fetch cache is disabled (no-store) so Vercel never serves stale data.
 */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can throw in Server Components — safe to ignore
          }
        },
      },
      global: {
        // Bypass Next.js fetch cache — prevents Vercel CDN from serving stale data
        fetch: (url, options) =>
          fetch(url, { ...options, cache: "no-store" }),
      },
    }
  );
}

