import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/admin/CopyButton";
import { QrPanel } from "@/components/admin/QrPanel";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getProfileById } from "@/lib/profiles";
import { profileUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function QrDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { created?: string };
}) {
  if (!UUID.test(params.id)) notFound();
  const p = await getProfileById(params.id);
  if (!p) notFound();
  const url = profileUrl(p.profile_id);

  return (
    <div className="mx-auto max-w-4xl">
      {searchParams.created && (
        <div className="no-print mb-6 rounded-2xl bg-emerald-50 p-5 text-emerald-900">
          <p className="font-display text-lg font-semibold">Profile created</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            <li>Print or download the QR code below.</li>
            <li>Copy the address and write it to the NFC card with NFC Tools.</li>
            <li>Test the tap and the scan with a phone before handing over the card.</li>
          </ol>
        </div>
      )}

      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold">{p.full_name}</h1>
          <StatusBadge status={p.status} />
        </div>
        <div className="flex gap-2 text-sm font-semibold">
          <Link href={`/admin/customers/${p.id}/edit`} className="rounded-xl border border-line bg-white px-4 py-2.5 hover:bg-mist">Edit</Link>
          <a href={`/c/${p.profile_id}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-line bg-white px-4 py-2.5 hover:bg-mist">View profile</a>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <QrPanel url={url} name={p.full_name} />

        <div className="no-print space-y-4">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base font-semibold">Address for the NFC card</h2>
            <p className="mt-2 break-all rounded-xl bg-mist px-3 py-2.5 font-mono text-sm">{url}</p>
            <div className="mt-3"><CopyButton value={url} label="Copy URL" /></div>
            <p className="mt-3 text-xs text-slate-500">
              The QR code and the NFC card use this exact address, so edits to the profile show up on both.
            </p>
          </section>
          {p.status === "disabled" && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              This card is disabled. Visitors see an &quot;unavailable&quot; message until you enable it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
