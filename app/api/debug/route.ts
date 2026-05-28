// Debug endpoint — checks if Supabase env vars are present and can fetch data.
// DELETE THIS FILE before going to production!
import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check env vars are present
  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: url ? `set (${url})` : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey ? `set (${anonKey.slice(0, 20)}...)` : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: serviceKey ? `set (${serviceKey.slice(0, 20)}...)` : "MISSING",
  };

  // Try to fetch categories
  let dbTest: { ok: boolean; data?: unknown; error?: string } = { ok: false };
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("categories").select("name").limit(3);
    if (error) dbTest = { ok: false, error: error.message };
    else dbTest = { ok: true, data };
  } catch (e) {
    dbTest = { ok: false, error: String(e) };
  }

  return NextResponse.json({ envCheck, dbTest });
}

