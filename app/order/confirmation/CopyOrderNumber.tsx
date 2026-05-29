 "use client";
/**
 * CopyOrderNumber — small clipboard copy button for the order number.
 * Shows a ✓ checkmark for 2s after copying, then resets.
 */
import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyOrderNumberProps {
  orderNumber: number;
}

/** Copies "#<orderNumber>" to clipboard with visual feedback */
export default function CopyOrderNumber({ orderNumber }: CopyOrderNumberProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`#${orderNumber}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — silently ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy order number"
      title={copied ? "Copied!" : "Copy order number"}
      className={`p-1 rounded-md transition-colors
        ${copied
          ? "text-green-600 bg-green-50"
          : "text-brand-muted hover:text-brand-wood hover:bg-brand-bg"
        }`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

