/**
 * OrderConfirmation — React Email template for order confirmation emails.
 *
 * Sent via Resend after a successful payment (mock or real Stripe).
 * Brand-styled: espresso brown header, parchment background, turmeric gold accents.
 */
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import { Order, OrderItem } from "@/types";

// ── Helper: format paise → ₹ string ─────────────────────────────────────────
function fmt(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface OrderConfirmationProps {
  order: Order;
  orderItems: OrderItem[];
  invoiceUrl: string | null;
}

/**
 * React Email component — renders a branded HTML order confirmation email.
 * Used in lib/invoice.ts → sent via Resend after payment confirmed.
 */
export default function OrderConfirmation({
  order,
  orderItems,
  invoiceUrl,
}: OrderConfirmationProps) {
  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <Html lang="en">
      <Head />
      <Body style={{ backgroundColor: "#F5EDD6", fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "24px 16px" }}>

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <Section style={{
            backgroundColor: "#3B1F0C",
            borderRadius: "12px 12px 0 0",
            padding: "24px",
            textAlign: "center",
          }}>
            <Heading style={{ color: "#F5EDD6", fontSize: "24px", margin: "0 0 4px" }}>
              Saas Bahu Ki Rasoi
            </Heading>
            <Text style={{ color: "#D4A017", fontSize: "13px", margin: 0 }}>
              Order Food For Any Mood
            </Text>
          </Section>

          {/* ── Body card ──────────────────────────────────────────────────── */}
          <Section style={{
            backgroundColor: "#FDF6E3",
            border: "1px solid #C0622A40",
            borderRadius: "0 0 12px 12px",
            padding: "28px 24px",
          }}>

            {/* Success message */}
            <Heading style={{ color: "#2C1A0E", fontSize: "20px", margin: "0 0 8px" }}>
              🎉 Payment Confirmed!
            </Heading>
            <Text style={{ color: "#4A3728", fontSize: "14px", margin: "0 0 20px" }}>
              Shukriya, <strong>{order.customer_name}</strong>! Your order has been received
              and we are preparing your ghar ka khana with love. 🙏
            </Text>

            {/* Order meta */}
            <Section style={{
              backgroundColor: "#F5EDD6",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
            }}>
              <Row>
                <Column>
                  <Text style={{ color: "#8B6F5E", fontSize: "11px", margin: "0 0 2px", textTransform: "uppercase" }}>Order ID</Text>
                  <Text style={{ color: "#2C1A0E", fontSize: "13px", fontWeight: "bold", margin: 0 }}>
                    #{order.order_number}
                  </Text>
                </Column>
                <Column>
                  <Text style={{ color: "#8B6F5E", fontSize: "11px", margin: "0 0 2px", textTransform: "uppercase" }}>Date</Text>
                  <Text style={{ color: "#2C1A0E", fontSize: "13px", margin: 0 }}>{orderDate}</Text>
                </Column>
                <Column>
                  <Text style={{ color: "#8B6F5E", fontSize: "11px", margin: "0 0 2px", textTransform: "uppercase" }}>Status</Text>
                  <Text style={{ color: "#16a34a", fontSize: "13px", fontWeight: "bold", margin: 0 }}>PAID</Text>
                </Column>
              </Row>
            </Section>

            {/* Items ordered */}
            <Text style={{ color: "#2C1A0E", fontSize: "15px", fontWeight: "bold", margin: "0 0 10px" }}>
              Items Ordered
            </Text>
            {orderItems.map((item) => (
              <Row key={item.id} style={{ marginBottom: "6px" }}>
                <Column style={{ flex: 1 }}>
                  <Text style={{ color: "#4A3728", fontSize: "13px", margin: 0 }}>
                    {item.item_name}
                    <span style={{ color: "#8B6F5E" }}> × {item.quantity}</span>
                  </Text>
                </Column>
                <Column>
                  <Text style={{ color: "#2C1A0E", fontSize: "13px", fontWeight: "bold", margin: 0, textAlign: "right" }}>
                    {fmt(item.item_price_cents * item.quantity)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={{ borderColor: "#D4A017", margin: "16px 0" }} />

            {/* Totals */}
            <Row style={{ marginBottom: "4px" }}>
              <Column><Text style={{ color: "#8B6F5E", fontSize: "12px", margin: 0 }}>Subtotal</Text></Column>
              <Column><Text style={{ color: "#4A3728", fontSize: "12px", margin: 0, textAlign: "right" }}>{fmt(order.subtotal_cents)}</Text></Column>
            </Row>
            {/* Discount row — only shown when coupon was applied */}
            {order.discount_cents > 0 && (
              <Row style={{ marginBottom: "4px" }}>
                <Column>
                  <Text style={{ color: "#7A9E7E", fontSize: "12px", margin: 0 }}>
                    Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}
                  </Text>
                </Column>
                <Column>
                  <Text style={{ color: "#7A9E7E", fontSize: "12px", margin: 0, textAlign: "right" }}>
                    − {fmt(order.discount_cents)}
                  </Text>
                </Column>
              </Row>
            )}
            <Row style={{ marginBottom: "8px" }}>
              <Column><Text style={{ color: "#8B6F5E", fontSize: "12px", margin: 0 }}>GST (18%)</Text></Column>
              <Column><Text style={{ color: "#4A3728", fontSize: "12px", margin: 0, textAlign: "right" }}>{fmt(order.tax_cents)}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={{ color: "#2C1A0E", fontSize: "16px", fontWeight: "bold", margin: 0 }}>Total</Text></Column>
              <Column><Text style={{ color: "#D4A017", fontSize: "16px", fontWeight: "bold", margin: 0, textAlign: "right" }}>{fmt(order.total_cents)}</Text></Column>
            </Row>

            <Hr style={{ borderColor: "#D4A017", margin: "20px 0" }} />

            {/* Download invoice button */}
            {invoiceUrl && (
              <Section style={{ textAlign: "center", marginBottom: "20px" }}>
                <Button
                  href={invoiceUrl}
                  style={{
                    backgroundColor: "#7B4A1E",
                    color: "#FFFFFF",
                    padding: "12px 28px",
                    borderRadius: "24px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    textDecoration: "none",
                  }}
                >
                  📄 Download Invoice
                </Button>
              </Section>
            )}

            {/* Contact */}
            <Section style={{
              backgroundColor: "#F5EDD6",
              borderRadius: "8px",
              padding: "12px 16px",
              textAlign: "center",
            }}>
              <Text style={{ color: "#4A3728", fontSize: "13px", margin: "0 0 4px" }}>
                Questions? We are always here!
              </Text>
              <Text style={{ color: "#7B4A1E", fontSize: "13px", margin: 0 }}>
                Rajeshwari: +91 XXX-XX-XXXX · Veena: +91 XXX-XX-XXXX
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Text style={{ color: "#8B6F5E", fontSize: "11px", textAlign: "center", marginTop: "16px" }}>
            Made with ❤️ in our rasoi — Rajeshwari & Veena Khandelwal
          </Text>

        </Container>
      </Body>
    </Html>
  );
}

