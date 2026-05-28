/**
 * /admin/coupons/[id]/edit — edit an existing coupon.
 * Fetches the coupon server-side and passes it to CouponForm in edit mode.
 */
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import CouponForm from "@/components/admin/CouponForm";
import type { Coupon } from "@/types";

interface EditCouponPageProps {
  params: { id: string };
}

/** Edit coupon page */
export default async function EditCouponPage({ params }: EditCouponPageProps) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();

  return (
    <div>
      <h1 className="font-yatra text-3xl text-brand-heading mb-2">Edit Coupon</h1>
      <hr className="divider-spice mb-8" />
      <CouponForm existing={data as Coupon} />
    </div>
  );
}

