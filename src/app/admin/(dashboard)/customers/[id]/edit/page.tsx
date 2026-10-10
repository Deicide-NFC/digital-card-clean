import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/admin/CustomerForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getProfileById } from "@/lib/profiles";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  if (!UUID.test(params.id)) notFound();
  const profile = await getProfileById(params.id);
  if (!profile) notFound();
  const s = profile.stats;

  const rows = [
    ["Views", s.views],
    ["Contact saves", s.save_contact_clicks],
    ["Calls", s.phone_clicks],
    ["Emails", s.email_clicks],
    ["Messages", s.message_clicks],
    ["Website clicks", s.website_clicks],
    ["Social clicks", s.social_clicks],
    ["Map clicks", s.map_clicks],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold">{profile.full_name}</h1>
          <StatusBadge status={profile.status} />
        </div>
        <div className="flex gap-2 text-sm font-semibold">
          <a href={`/c/${profile.profile_id}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-line bg-white px-4 py-2.5 hover:bg-mist">
            View profile
          </a>
          <Link href={`/admin/qr/${profile.id}`} className="rounded-xl border border-line bg-white px-4 py-2.5 hover:bg-mist">
            QR code
          </Link>
        </div>
      </div>

      <section className="my-6 rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Activity</h2>
          <p className="text-sm text-slate-500">Last viewed: {formatDateTime(s.last_viewed_at)}</p>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium text-slate-500">{label}</dt>
              <dd className="font-display text-2xl font-bold tabular-nums">{value.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-slate-500">Counts only. No visitor names, IP addresses or device details are stored.</p>
      </section>

      <CustomerForm mode="edit" initial={profile} />
    </div>
  );
}
