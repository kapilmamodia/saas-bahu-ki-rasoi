"use client";
/**
 * CouponForm — admin form to create or edit a coupon.
 * Used on /admin/coupons/new and /admin/coupons/[id]/edit pages.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "lucide-react";
import type { Coupon } from "@/types";
import { createCoupon, updateCoupon } from "@/lib/actions/couponActions";

interface CouponFormProps {
  /** If provided, form is in edit mode */
  existing?: Coupon;
}

/** Helper: convert ISO timestamptz → "YYYY-MM-DD" for <input type="date"> */
function toDateInput(iso: string): string {
  return iso ? iso.slice(0, 10) : "";
}

/** Admin create/edit coupon form */
export default function CouponForm({ existing }: CouponFormProps) {
  const router = useRouter();
  const isEdit = !!existing;

  // ── Form state ────────────────────────────────────────────────────────────
  const [code, setCode] = useState(existing?.code ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [type, setType] = useState<"percent" | "flat">(existing?.type ?? "percent");
  // For flat coupons, existing.value is stored in paise — show in rupees
  const [value, setValue] = useState(
    existing
      ? existing.type === "flat"
        ? String(existing.value / 100)
        : String(existing.value)
      : ""
  );
  const [minOrder, setMinOrder] = useState(
    existing ? String(existing.min_order_cents / 100) : "0"
  );
  const [maxUses, setMaxUses] = useState(
    existing?.max_uses != null ? String(existing.max_uses) : ""
  );
  const [validFrom, setValidFrom] = useState(
    existing ? toDateInput(existing.valid_from) : ""
  );
  const [validUntil, setValidUntil] = useState(
    existing ? toDateInput(existing.valid_until) : ""
  );
  const [isActive, setIsActive] = useState(existing?.is_active ?? true);
  const [showOnHome, setShowOnHome] = useState(existing?.show_on_home ?? false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Submit handler — calls createCoupon or updateCoupon server action */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic client-side validation
    if (!code.trim()) { setError("Coupon code is required."); return; }
    if (!value || Number(value) <= 0) { setError("Value must be greater than 0."); return; }
    if (type === "percent" && Number(value) > 100) { setError("Percent discount cannot exceed 100%."); return; }
    if (!validFrom || !validUntil) { setError("Please set validity dates."); return; }
    if (new Date(validFrom) >= new Date(validUntil)) { setError("Valid Until must be after Valid From."); return; }

    try {
      setLoading(true);
      const payload = {
        code,
        description,
        type,
        value: Number(value),
        min_order_rupees: Number(minOrder) || 0,
        max_uses: maxUses ? Number(maxUses) : null,
        valid_from: validFrom,
        valid_until: validUntil,
        is_active: isActive,
        show_on_home: showOnHome,
      };

      const result = isEdit
        ? await updateCoupon(existing!.id, payload)
        : await createCoupon(payload);

      if (result.error) { setError(result.error); return; }

      // Navigate back to coupons list on success
      router.push("/admin/coupons");
      router.refresh();
    } catch (err) {
      console.error("[CouponForm]", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-5">

      {/* Coupon code */}
      <FormField label="Coupon Code *" hint="e.g. WELCOME20 — auto-uppercased">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="SAVE50"
          required
          className={inputCls}
        />
      </FormField>

      {/* Description */}
      <FormField label="Description (admin note)">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="20% off for new customers"
          className={inputCls}
        />
      </FormField>

      {/* Type + Value row */}
      <div className="flex gap-3">
        {/* Discount type */}
        <FormField label="Type *" className="flex-1">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "percent" | "flat")}
            className={inputCls}
          >
            <option value="percent">% Percent off</option>
            <option value="flat">₹ Flat amount off</option>
          </select>
        </FormField>

        {/* Value */}
        <FormField
          label={type === "percent" ? "Percent (1–100) *" : "Amount (₹) *"}
          className="flex-1"
        >
          <input
            type="number"
            min={1}
            max={type === "percent" ? 100 : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === "percent" ? "20" : "50"}
            required
            className={inputCls}
          />
        </FormField>
      </div>

      {/* Min order value */}
      <FormField label="Minimum Order Value (₹)" hint="0 = no minimum">
        <input
          type="number"
          min={0}
          value={minOrder}
          onChange={(e) => setMinOrder(e.target.value)}
          placeholder="0"
          className={inputCls}
        />
      </FormField>

      {/* Max uses */}
      <FormField label="Max Uses" hint="Leave blank for unlimited">
        <input
          type="number"
          min={1}
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          placeholder="Unlimited"
          className={inputCls}
        />
      </FormField>

      {/* Validity dates */}
      <div className="flex gap-3">
        <FormField label="Valid From *" className="flex-1">
          <input
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            required
            className={inputCls}
          />
        </FormField>
        <FormField label="Valid Until *" className="flex-1">
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            required
            className={inputCls}
          />
        </FormField>
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 accent-brand-wood"
        />
        <span className="font-hind text-sm text-brand-body">Active (customers can redeem this coupon)</span>
      </label>

      {/* Show on home toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={showOnHome}
          onChange={(e) => setShowOnHome(e.target.checked)}
          className="w-4 h-4 accent-brand-wood"
        />
        <div>
          <span className="font-hind text-sm text-brand-body">Show promo banner on Home page</span>
          <p className="font-hind text-xs text-brand-muted/70 mt-0.5">
            Displays the coupon code + discount visibly to all visitors on the homepage
          </p>
        </div>
      </label>

      {/* Error message */}
      {error && (
        <p className="font-hind text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-brand-wood hover:bg-brand-rust text-white
                     font-hind font-semibold px-6 py-2.5 rounded-full shadow-sm transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Tag size={15} />
          )}
          {loading ? "Saving..." : isEdit ? "Update Coupon" : "Create Coupon"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/coupons")}
          className="px-5 py-2.5 rounded-full border border-brand-wood/40 font-hind
                     text-sm text-brand-body hover:bg-brand-bg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Shared input class */
const inputCls =
  "w-full border border-brand-wood/30 rounded-lg px-3 py-2 font-hind text-sm " +
  "text-brand-body bg-brand-bg placeholder:text-brand-muted/60 " +
  "focus:outline-none focus:ring-2 focus:ring-brand-wood/40";

/** Labelled form field wrapper */
function FormField({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="font-hind text-sm text-brand-muted">{label}</label>
      {children}
      {hint && <p className="font-hind text-xs text-brand-muted/70">{hint}</p>}
    </div>
  );
}

