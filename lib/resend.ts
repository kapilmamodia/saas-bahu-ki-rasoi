/**
 * lib/resend.ts — Resend email client helper.
 *
 * Server-side only — never import in Client Components.
 * Skips sending if RESEND_API_KEY is not set (dev mode without email configured).
 */
import { Resend } from "resend";

/**
 * Lazily creates the Resend client only when the API key is present.
 * Returns null if key is missing — callers must check before sending.
 */
export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[resend] RESEND_API_KEY not set — email sending skipped");
    return null;
  }
  return new Resend(key);
}

/** The "from" address used for all outgoing emails */
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "orders@saas-bahu-ki-rasoi.com";

