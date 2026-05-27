// Simple health endpoint — returns 200 + timestamp so deployment verification
// can confirm the deployed app is alive without needing real credentials.
import { NextResponse } from "next/server";

/** GET /api/health — liveness check used by CI/CD smoke tests */
export async function GET() {
  return NextResponse.json({ status: "ok", ts: new Date().toISOString() });
}

