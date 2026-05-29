"use client";
/**
 * components/admin/ReviewActionButtons.tsx
 * Approve / Delete buttons for the admin reviews page.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveReview, deleteReview } from "@/lib/actions/reviewActions";
import { CheckCircle, Trash2 } from "lucide-react";

interface Props {
  id: string;
  isApproved: boolean;
}

/** Approve and Delete buttons for a single review row */
export default function ReviewActionButtons({ id, isApproved }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "delete" | null>(null);

  const handleApprove = async () => {
    setLoading("approve");
    await approveReview(id);
    router.refresh();
    setLoading(null);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this review permanently?")) return;
    setLoading("delete");
    await deleteReview(id);
    router.refresh();
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-2">
      {!isApproved && (
        <button onClick={handleApprove} disabled={loading === "approve"}
          aria-label="Approve review"
          className="flex items-center gap-1 font-hind text-xs bg-green-600 hover:bg-green-700
                     text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
          {loading === "approve"
            ? <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
            : <CheckCircle size={13} />}
          Approve
        </button>
      )}
      <button onClick={handleDelete} disabled={loading === "delete"}
        aria-label="Delete review"
        className="flex items-center gap-1 font-hind text-xs bg-red-50 hover:bg-red-100
                   text-red-600 border border-red-200 px-3 py-1.5 rounded-lg
                   transition-colors disabled:opacity-50">
        {loading === "delete"
          ? <span className="animate-spin h-3 w-3 border-2 border-red-400 border-t-transparent rounded-full" />
          : <Trash2 size={13} />}
        Delete
      </button>
    </div>
  );
}

