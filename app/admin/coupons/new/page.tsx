/**
 * /admin/coupons/new — create a new coupon.
 */
import CouponForm from "@/components/admin/CouponForm";

/** New coupon page */
export default function NewCouponPage() {
  return (
    <div>
      <h1 className="font-yatra text-3xl text-brand-heading mb-2">Create Coupon</h1>
      <hr className="divider-spice mb-8" />
      <CouponForm />
    </div>
  );
}

