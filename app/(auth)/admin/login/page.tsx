"use client";
// Admin login page — email/password authentication via Supabase Auth.
// On success redirects to /admin/dashboard.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Admin login form — protected by Supabase Auth.
 * Only the restaurant owner should have login credentials.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** Handle sign-in via Supabase email/password */
  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Show a friendly error — never expose raw Supabase error details
        setError("Invalid email or password. Please try again.");
        return;
      }

      // Redirect to dashboard on successful login
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.error("[AdminLogin] Unexpected error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      {/* Login card — espresso brown border, cream background */}
      <div className="bg-brand-card border border-brand-wood/40 rounded-2xl shadow-lg
                      w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-yatra text-3xl text-brand-heading">Saas Bahu Ki Rasoi</h1>
          <p className="font-caveat text-brand-rust text-lg mt-1">Admin Panel</p>
          <hr className="divider-spice max-w-xs mx-auto mt-4" />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-brand-rust/10 border border-brand-rust/40 text-brand-rust
                          font-hind text-sm rounded-lg px-4 py-3 mb-5"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Email field */}
        <div className="mb-4">
          <label htmlFor="email" className="block font-hind text-sm font-medium text-brand-body mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
            className="w-full border border-brand-wood/30 rounded-lg px-4 py-2.5
                       font-hind text-brand-body bg-white placeholder:text-brand-muted
                       focus:outline-none focus:ring-2 focus:ring-brand-wood/40"
          />
        </div>

        {/* Password field */}
        <div className="mb-6">
          <label htmlFor="password" className="block font-hind text-sm font-medium text-brand-body mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border border-brand-wood/30 rounded-lg px-4 py-2.5
                       font-hind text-brand-body bg-white placeholder:text-brand-muted
                       focus:outline-none focus:ring-2 focus:ring-brand-wood/40"
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full bg-brand-wood hover:bg-brand-rust text-white font-hind
                     font-semibold py-3 rounded-full shadow-md transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </div>
    </div>
  );
}

