import Link from "next/link";
import { QrThumb } from "@/components/admin/QrPanel";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listProfiles } from "@/lib/profiles";
import { profileUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function QrListPage() {
  const profiles = await listProfiles();
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-bold">QR codes</h1>
      <p className="mb-6 mt-1 text-slate-600">Each QR code opens the same address that is written to the NFC card.</p>

      {profiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          QR codes appear here after you add a customer.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/qr/${p.id}`}
                className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 hover:border-brand"
              >
                <QrThumb url={profileUrl(p.profile_id)} size={88} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.profile_type === "business" ? (p.business_name || p.full_name) : p.full_name}</p>
                  <p className="truncate font-mono text-xs text-slate-500">/c/{p.profile_id}</p>
                  <div className="mt-2"><StatusBadge status={p.status} /></div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
