import { CopyButton } from "@/components/admin/CopyButton";
import { listProfiles } from "@/lib/profiles";
import { profileUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STEPS = [
  "Create the customer and copy the card address from the QR page.",
  "Install NFC Tools (free, iPhone and Android) and open the Write tab.",
  "Tap Add a record, choose URL / URI, and paste the address. Always use the full https:// address.",
  "Tap Write, then hold the back of your phone against the NTAG215 card until it confirms.",
  "Test: lock the phone, wait a second, and tap the card again. The profile should open.",
  "Scan the printed QR code with the camera app. It should open the same profile.",
];

export default async function NfcPage() {
  const profiles = await listProfiles();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-bold">NFC guide</h1>
      <p className="mb-6 mt-1 text-slate-600">
        The card only stores the profile address. All the changing details live on the website.
      </p>

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Write a card</h2>
        <ol className="mt-4 space-y-3">
          {STEPS.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">{i + 1}</span>
              <span className="text-[15px] text-slate-700">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-base font-semibold">About NTAG215</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
            <li>504 bytes of user memory. A short https address uses well under 100.</li>
            <li>Works with iPhone XS and newer (no app needed) and almost every Android phone with NFC turned on.</li>
            <li>Plastic cases and thick wallets can weaken the signal. Metal blocks it unless the card is a metal-safe type.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-display text-base font-semibold text-amber-900">Locking a card</h2>
          <p className="mt-3 text-sm text-amber-900">
            NFC Tools can lock a tag so nobody can overwrite it. Locking is permanent. Test the card thoroughly first, and only lock it once the address is final.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Addresses to write</h2>
        {profiles.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No customers yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {profiles.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.full_name}</p>
                  <p className="truncate font-mono text-xs text-slate-500">{profileUrl(p.profile_id)}</p>
                </div>
                <CopyButton value={profileUrl(p.profile_id)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
