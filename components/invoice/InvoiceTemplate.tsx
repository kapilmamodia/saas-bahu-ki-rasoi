/**
 * InvoiceTemplate — PDF invoice document for Saas Bahu Ki Rasoi orders.
 *
 * Built with @react-pdf/renderer. Used server-side only via lib/invoice.ts.
 * Brand colors: espresso brown headings, parchment background, turmeric gold accents.
 */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { Order, OrderItem } from "@/types";

// ── Brand color constants ────────────────────────────────────────────────────
const COLORS = {
  bg:       "#F5EDD6", // parchment cream
  dark:     "#3B1F0C", // espresso brown
  wood:     "#7B4A1E", // wood brown
  gold:     "#D4A017", // turmeric gold
  muted:    "#8B6F5E", // muted text
  body:     "#4A3728", // body text
  divider:  "#C0622A", // terracotta
  white:    "#FFFFFF",
};

// ── PDF styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.bg,
    padding: 40,
    fontFamily: "Helvetica",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold,
    paddingBottom: 16,
  },
  logo: { width: 60, height: 60, marginRight: 16 },
  headerText: { flex: 1 },
  restaurantName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: COLORS.dark,
  },
  tagline: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  invoiceLabel: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: COLORS.gold,
    textAlign: "right",
  },
  // Meta section
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metaBlock: { flex: 1 },
  metaLabel: { fontSize: 8, color: COLORS.muted, marginBottom: 1, marginTop: 0, textTransform: "uppercase" },
  metaValue: { fontSize: 11, color: COLORS.body, fontFamily: "Helvetica-Bold" },
  metaValueLight: { fontSize: 10, color: COLORS.body },
  // Items table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.dark,
    padding: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 9,
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E8DCC8",
  },
  tableRowAlt: { backgroundColor: "#FDF6E3" },
  col_item:  { flex: 4, fontSize: 10, color: COLORS.body },
  col_qty:   { flex: 1, fontSize: 10, color: COLORS.body, textAlign: "center" },
  col_price: { flex: 2, fontSize: 10, color: COLORS.body, textAlign: "right" },
  col_total: { flex: 2, fontSize: 10, color: COLORS.body, textAlign: "right", fontFamily: "Helvetica-Bold" },
  // Totals
  totalsSection: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
    width: 220,
  },
  totalLabel: { fontSize: 10, color: COLORS.muted, flex: 1 },
  totalValue: { fontSize: 10, color: COLORS.body, textAlign: "right", width: 80 },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: COLORS.gold,
    width: 220,
  },
  grandTotalLabel: { fontSize: 13, fontFamily: "Helvetica-Bold", color: COLORS.dark, flex: 1 },
  grandTotalValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: COLORS.gold, textAlign: "right", width: 80 },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.gold,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: COLORS.muted },
  footerBrand: { fontSize: 8, color: COLORS.wood, fontFamily: "Helvetica-Bold" },
});

// ── Helper: format paise → ₹ string ─────────────────────────────────────────
function fmt(paise: number): string {
  return `Rs. ${(paise / 100).toFixed(2)}`;
}

// ── Props ────────────────────────────────────────────────────────────────────
interface InvoiceTemplateProps {
  order: Order;
  orderItems: OrderItem[];
}

/**
 * React PDF Document component — renders a branded invoice PDF.
 * Import and use via @react-pdf/renderer's renderToBuffer() in lib/invoice.ts.
 */
export default function InvoiceTemplate({ order, orderItems }: InvoiceTemplateProps) {
  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <Document title={`Invoice — Saas Bahu Ki Rasoi — #${order.order_number}`}>
      <Page size="A4" style={styles.page}>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.restaurantName}>Saas Bahu Ki Rasoi</Text>
            <Text style={styles.tagline}>Order Food For Any Mood</Text>
            <Text style={[styles.tagline, { marginTop: 4 }]}>
              Rajeshwari: +91 XXX-XXX-XXXX  ·  Veena: +91 XXX-XXX-XXXX
            </Text>
          </View>
          <Text style={styles.invoiceLabel}>INVOICE</Text>
        </View>

        {/* ── Order meta ───────────────────────────────────────────────────── */}
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Bill To</Text>
            <Text style={styles.metaValue}>{order.customer_name}</Text>
            <Text style={styles.metaValueLight}>{order.customer_email}</Text>
            {/* Phone — only rendered when provided */}
            {order.customer_phone && (
              <Text style={styles.metaValueLight}>{order.customer_phone}</Text>
            )}
            {/* Delivery type */}
            <Text style={[styles.metaLabel, { marginTop: 8 }]}>Order Type</Text>
            <Text style={styles.metaValueLight}>
              {order.delivery_type === "delivery" ? "Home Delivery" : "Self Pickup"}
            </Text>
            {/* Delivery address — only shown when applicable */}
            {order.delivery_type === "delivery" && order.delivery_address && (
              <>
                <Text style={[styles.metaLabel, { marginTop: 4 }]}>Delivery Address</Text>
                <Text style={styles.metaValueLight}>{order.delivery_address}</Text>
              </>
            )}
          </View>
          <View style={[styles.metaBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.metaLabel}>Invoice No.</Text>
            <Text style={[styles.metaValue, { marginBottom: 6 }]}>#{order.order_number}</Text>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={[styles.metaValueLight, { marginBottom: 6 }]}>{orderDate}</Text>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={[styles.metaValue, { color: "#16a34a" }]}>PAID</Text>
          </View>
        </View>

        {/* ── Items table header ───────────────────────────────────────────── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 4 }]}>Item</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "center" }]}>Qty</Text>
          <Text style={[styles.tableHeaderText, { flex: 2, textAlign: "right" }]}>Unit Price</Text>
          <Text style={[styles.tableHeaderText, { flex: 2, textAlign: "right" }]}>Total</Text>
        </View>

        {/* ── Items rows ───────────────────────────────────────────────────── */}
        {orderItems.map((item, idx) => (
          <View
            key={item.id}
            style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
          >
            <Text style={styles.col_item}>{item.item_name}</Text>
            <Text style={styles.col_qty}>{item.quantity}</Text>
            <Text style={styles.col_price}>{fmt(item.item_price_cents)}</Text>
            <Text style={styles.col_total}>{fmt(item.item_price_cents * item.quantity)}</Text>
          </View>
        ))}

        {/* ── Totals ───────────────────────────────────────────────────────── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{fmt(order.subtotal_cents)}</Text>
          </View>
          {/* Discount row — only rendered when a coupon was applied */}
          {order.discount_cents > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: "#7A9E7E" }]}>
                Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}
              </Text>
              <Text style={[styles.totalValue, { color: "#7A9E7E" }]}>
                − {fmt(order.discount_cents)}
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GST (18%)</Text>
            <Text style={styles.totalValue}>{fmt(order.tax_cents)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{fmt(order.total_cents)}</Text>
          </View>
        </View>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for ordering from our rasoi! 🙏</Text>
          <Text style={styles.footerBrand}>Made with ❤️ — Rajeshwari & Veena Khandelwal</Text>
        </View>

      </Page>
    </Document>
  );
}

