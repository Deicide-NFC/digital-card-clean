"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy URL",
  iconOnly = false,
  className = "",
}: {
  value: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={label}
      aria-label={label}
      className={
        className ||
        (iconOnly
          ? "rounded-lg p-2 text-slate-500 hover:bg-mist hover:text-ink"
          : "inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold hover:bg-mist")
      }
    >
      {done ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      {!iconOnly && (done ? "Copied" : label)}
    </button>
  );
}
