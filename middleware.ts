// Runs on every request matching /admin/* — refreshes the Supabase auth session
// and redirects unauthenticated users away from protected admin routes.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js middleware — protects /admin routes.
 * Unauthenticated users are redirected to /admin/login.
 */
export async function middleware(request: NextRequest) {
  // Start with a pass-through response so we can attach Set-Cookie headers
  let supabaseResponse = NextResponse.next({ request });

  // Create a server-side Supabase client that reads/writes cookies on the request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Write refreshed session cookies back to the response
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired — required for Server Component auth to work
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users trying to access /admin (except login page)
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login") &&
    !user
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  // Only run this middleware on /admin routes
  matcher: ["/admin/:path*"],
};

