"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy as CopyIcon, ExternalLink, Pencil, Power, QrCode, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
  deleteProfileAction,
  duplicateProfileAction,
  toggleStatusAction,
} from "@/app/admin/actions";
import { CopyButton } from "./CopyButton";

export function RowActions({
  id,
  profileId,
  name,
  status,
  url,
}: {
  id: string;
  profileId: string;
  name: string;
  status: "active" | "disabled";
  url: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string; id?: string }>, goto?: boolean) {
    setError(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) {
        setError(r.error || "Something went wrong.");
        return;
      }
      if (goto && r.id) router.push(`/admin/customers/${r.id}/edit`);
      else router.refresh();
    });
  }

  const btn = "rounded-lg p-2 text-slate-500 hover:bg-mist hover:text-ink disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      <a href={`/c/${profileId}`} target="_blank" rel="noopener noreferrer" title="View profile" aria-label="View profile" className={btn}>
        <ExternalLink className="h-4 w-4" />
      </a>
      <Link href={`/admin/customers/${id}/edit`} title="Edit" aria-label="Edit" className={btn}>
        <Pencil className="h-4 w-4" />
      </Link>
      <Link href={`/admin/qr/${id}`} title="Generate QR" aria-label="Generate QR" className={btn}>
        <QrCode className="h-4 w-4" />
      </Link>
      <CopyButton value={url} iconOnly label="Copy URL" />
      <button
        disabled={pending}
        title="Duplicate"
        aria-label="Duplicate"
        className={btn}
        onClick={() => run(() => duplicateProfileAction(id), true)}
      >
        <CopyIcon className="h-4 w-4" />
      </button>
      <button
        disabled={pending}
        title={status === "active" ? "Disable" : "Enable"}
        aria-label={status === "active" ? "Disable" : "Enable"}
        className={`${btn} ${status === "active" ? "" : "text-emerald-600"}`}
        onClick={() => {
          if (status === "active" && !confirm(`Disable ${name}'s card? Visitors will see an "unavailable" message.`)) return;
          run(() => toggleStatusAction(id));
        }}
      >
        <Power className="h-4 w-4" />
      </button>
      <button
        disabled={pending}
        title="Delete"
        aria-label="Delete"
        className={`${btn} hover:!bg-red-50 hover:!text-red-600`}
        onClick={() => {
          if (!confirm(`Delete ${name} permanently?\n\nThe card at /c/${profileId} will stop working and this cannot be undone.`)) return;
          run(() => deleteProfileAction(id));
        }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}
