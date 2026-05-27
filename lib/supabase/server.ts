// Server-side Supabase client — used in Server Components, Server Actions, API routes.
// Reads cookies for session — never call this in a Client Component.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use in server-side code.
 * Reads the session from cookies so auth state is preserved across requests.
 */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read all cookies from the incoming request
        getAll: () => cookieStore.getAll(),
        // Write cookies back to the response
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can throw in Server Components — safe to ignore
            // (the middleware will handle session refresh)
          }
        },
      },
    }
  );
}

