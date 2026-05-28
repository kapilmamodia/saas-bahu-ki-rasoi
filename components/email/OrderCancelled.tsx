/**
 * OrderCancelled — React Email template sent when admin cancels/refunds an order.
 * Informs the customer that their order has been cancelled.
 */
import {
  Html, Head, Body, Container, Section, Heading, Text, Hr,
} from "@react-email/components";
import { Order, OrderItem } from "@/types";

/** Format paise → ₹ */
function fmt(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })}`;
}

interface OrderCancelledProps {
  order: Order;
  orderItems: OrderItem[];
}

/** React Email component — order cancellation notification to customer. */
export default function OrderCancelled({ order, orderItems }: OrderCancelledProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={{ backgroundColor: "#F5EDD6", fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "24px 16px" }}>

          {/* Header */}
          <Section style={{
            backgroundColor: "#3B1F0C", borderRadius: "12px 12px 0 0",
            padding: "24px", textAlign: "center",
          }}>
            <Heading style={{ color: "#F5EDD6", fontSize: "24px", margin: "0 0 4px" }}>
              Saas Bahu Ki Rasoi
            </Heading>
            <Text style={{ color: "#D4A017", fontSize: "13px", margin: 0 }}>
              Order Food For Any Mood
            </Text>
          </Section>

          {/* Body */}
          <Section style={{
            backgroundColor: "#FDF6E3", border: "1px solid #C0622A40",
            borderRadius: "0 0 12px 12px", padding: "28px 24px",
          }}>
            <Heading style={{ color: "#2C1A0E", fontSize: "22px", margin: "0 0 8px" }}>
              ❌ Order Cancelled
            </Heading>
            <Text style={{ color: "#4A3728", fontSize: "14px", margin: "0 0 20px" }}>
              Namaste <strong>{order.customer_name}</strong>, we&apos;re sorry to inform you that
              your order <strong>#{order.id.slice(0, 8).toUpperCase()}</strong> has been cancelled.
              If a payment was made, a refund will be processed shortly.
            </Text>

            {/* Cancelled items summary */}
            <Text style={{ color: "#2C1A0E", fontSize: "15px", fontWeight: "bold", margin: "0 0 8px" }}>
              Cancelled items:
            </Text>
            {orderItems.map((item) => (
              <Text key={item.id} style={{ color: "#4A3728", fontSize: "13px", margin: "0 0 4px" }}>
                • {item.item_name} × {item.quantity} — {fmt(item.item_price_cents * item.quantity)}
              </Text>
            ))}

            <Hr style={{ borderColor: "#D4A017", margin: "16px 0" }} />

            {/* Totals breakdown */}
            <Text style={{ color: "#8B6F5E", fontSize: "12px", margin: "0 0 2px" }}>
              Subtotal: {fmt(order.subtotal_cents)}
            </Text>
            {order.discount_cents > 0 && (
              <Text style={{ color: "#7A9E7E", fontSize: "12px", margin: "0 0 2px" }}>
                Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}: − {fmt(order.discount_cents)}
              </Text>
            )}
            <Text style={{ color: "#8B6F5E", fontSize: "12px", margin: "0 0 6px" }}>
              GST (18%): {fmt(order.tax_cents)}
            </Text>
            <Text style={{ color: "#2C1A0E", fontSize: "16px", fontWeight: "bold", margin: "0 0 4px" }}>
              Order Total: <span style={{ color: "#D4A017" }}>{fmt(order.total_cents)}</span>
            </Text>

            <Hr style={{ borderColor: "#D4A017", margin: "16px 0" }} />

            {/* Contact */}
            <Section style={{
              backgroundColor: "#F5EDD6", borderRadius: "8px",
              padding: "12px 16px", textAlign: "center",
            }}>
              <Text style={{ color: "#4A3728", fontSize: "13px", margin: "0 0 4px" }}>
                Any concerns? Please reach out to us — we&apos;d love to help!
              </Text>
              <Text style={{ color: "#7B4A1E", fontSize: "13px", margin: 0 }}>
                Rajeshwari: +91 XXX-XX-XXXX · Veena: +91 XXX-XX-XXXX
              </Text>
            </Section>
          </Section>

          <Text style={{ color: "#8B6F5E", fontSize: "11px", textAlign: "center", marginTop: "16px" }}>
            Made with ❤️ in our rasoi — Rajeshwari & Veena Khandelwal
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

