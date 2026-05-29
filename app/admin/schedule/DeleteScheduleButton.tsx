"use client";
/**
 * DeleteScheduleButton — removes a kitchen schedule override.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteScheduleOverride } from "@/lib/actions/scheduleActions";
import { Trash2 } from "lucide-react";

export default function DeleteScheduleButton({ id, date }: { id: string; date: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Remove override for ${date}?`)) return;
    try {
      setLoading(true);
      await deleteScheduleOverride(id);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading}
      aria-label="Delete override"
      className="text-brand-muted hover:text-brand-rust transition-colors p-1.5 rounded-lg
                 hover:bg-red-50 disabled:opacity-40 flex-shrink-0">
      {loading
        ? <span className="w-4 h-4 border-2 border-brand-muted border-t-transparent rounded-full animate-spin block" />
        : <Trash2 size={15} />
      }
    </button>
  );
}

