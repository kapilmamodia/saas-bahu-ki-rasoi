"use client";
// DeleteButton — client component that shows a confirm dialog before
// calling the server action to soft-delete a menu item.
import { useTransition } from "react";

interface DeleteButtonProps {
  id: string;
  name: string;
  /** Server action bound with item id */
  deleteAction: (id: string) => Promise<void>;
}

/**
 * Shows a native confirm dialog, then calls the server action on confirm.
 * Needs "use client" because window.confirm is browser-only.
 */
export default function DeleteButton({ id, name, deleteAction }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm(`Delete "${name}"? It will be hidden from the menu but preserved in order history.`)) return;
    startTransition(async () => {
      await deleteAction(id);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="font-hind text-xs text-brand-muted hover:text-brand-rust
                 transition-colors disabled:opacity-40"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}

