// Runs on every request matching /admin/* — refreshes the Supabase auth session
// and redirects unauthenticated users away from protected admin routes.
// Login page lives at app/(auth)/admin/login — outside /admin folder — so it
// never gets caught by the admin layout auth check.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js middleware — protects /admin routes.
 * Unauthenticated users are redirected to /admin/login.
 * The login page itself is at app/(auth)/admin/login/page.tsx so it is
 * NOT wrapped by the admin layout and cannot cause an infinite redirect.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow /admin/login and /admin/logout through — no auth needed
  if (pathname === "/admin/login" || pathname.startsWith("/admin/logout")) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

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

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from /admin/*
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
