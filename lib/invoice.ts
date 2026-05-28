/**
 * lib/invoice.ts — PDF invoice generation, Supabase Storage upload, and email dispatch.
 *
 * Server-side only. Called from /api/mock-confirm (and later /api/webhook for real Stripe).
 *
 * Flow:
 *   1. Render InvoiceTemplate → PDF Buffer using @react-pdf/renderer
 *   2. Upload PDF to Supabase Storage bucket "invoices" (private)
 *   3. Generate a signed URL valid for 1 year
 *   4. Save signed URL to orders.invoice_url in DB
 *   5. Send order confirmation email via Resend with the signed URL
 */
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement, ReactElement } from "react";
import { DocumentProps } from "@react-pdf/renderer";
import { Order, OrderItem } from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient, EMAIL_FROM } from "@/lib/resend";
import InvoiceTemplate from "@/components/invoice/InvoiceTemplate";
import OrderConfirmation from "@/components/email/OrderConfirmation";
import { render as renderEmail } from "@react-email/components";

/**
 * Full Phase 4 pipeline — generates PDF, uploads to Storage, sends confirmation email.
 * Returns the signed invoice URL (or null if upload failed).
 *
 * Safe to call fire-and-forget — all errors are caught and logged, never thrown.
 */
export async function generateAndSendInvoice(
  order: Order,
  orderItems: OrderItem[]
): Promise<string | null> {
  try {
    // ── Step 1: Render PDF to Buffer ────────────────────────────────────────
    console.log("[invoice] rendering PDF for order", order.id);
    // Cast needed: renderToBuffer expects ReactElement<DocumentProps> — our component
    // returns a <Document> which satisfies this at runtime, but TS needs the cast.
    const element = createElement(InvoiceTemplate, { order, orderItems }) as ReactElement<DocumentProps>;
    const pdfBuffer = await renderToBuffer(element);
    console.log("[invoice] PDF rendered, size:", pdfBuffer.byteLength, "bytes");

    // ── Step 2: Upload to Supabase Storage ──────────────────────────────────
    const supabase = createAdminClient();
    const fileName = `invoice_${order.id}.pdf`;
    const filePath = `${order.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("invoices") // private bucket — must exist in Supabase Storage
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true, // overwrite if regenerating
      });

    if (uploadError) {
      console.error("[invoice] Storage upload failed:", uploadError);
      // Continue without invoice URL — don't block the whole flow
      return null;
    }
    console.log("[invoice] PDF uploaded to Storage at", filePath);

    // ── Step 3: Generate signed URL (valid 1 year = 31536000 seconds) ───────
    const { data: signedData, error: signedError } = await supabase.storage
      .from("invoices")
      .createSignedUrl(filePath, 31_536_000);

    if (signedError || !signedData?.signedUrl) {
      console.error("[invoice] Failed to create signed URL:", signedError);
      return null;
    }

    const invoiceUrl = signedData.signedUrl;
    console.log("[invoice] signed URL created");

    // ── Step 4: Save invoice_url to the orders row ──────────────────────────
    const { error: updateError } = await supabase
      .from("orders")
      .update({ invoice_url: invoiceUrl })
      .eq("id", order.id);

    if (updateError) {
      console.error("[invoice] Failed to save invoice_url to DB:", updateError);
      // Non-fatal — URL was generated, continue to email
    }

    // ── Step 5: Send confirmation email via Resend ──────────────────────────
    await sendConfirmationEmail(order, orderItems, invoiceUrl);

    return invoiceUrl;
  } catch (err) {
    console.error("[invoice] Unexpected error in generateAndSendInvoice:", err);
    return null;
  }
}

/**
 * Renders the React Email template and sends via Resend.
 * Skips silently if RESEND_API_KEY is not configured.
 */
async function sendConfirmationEmail(
  order: Order,
  orderItems: OrderItem[],
  invoiceUrl: string | null
): Promise<void> {
  try {
    const resend = getResendClient();
    if (!resend) {
      // RESEND_API_KEY not set — skip email, log and continue
      console.log("[invoice] Email skipped — RESEND_API_KEY not configured");
      return;
    }

    // Render the React Email template to HTML
    const emailHtml = await renderEmail(
      createElement(OrderConfirmation, { order, orderItems, invoiceUrl })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: order.customer_email,
      subject: `Your order is confirmed — Saas Bahu Ki Rasoi (#${order.id.slice(0, 8).toUpperCase()})`,
      html: emailHtml,
    });

    if (error) {
      console.error("[invoice] Resend email failed:", error);
    } else {
      console.log("[invoice] Confirmation email sent, id:", data?.id);
    }
  } catch (err) {
    console.error("[invoice] Unexpected error sending email:", err);
  }
}

