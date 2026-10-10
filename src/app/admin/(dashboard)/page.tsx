import Link from "next/link";
import { listProfiles } from "@/lib/profiles";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Overview() {
  const profiles = await listProfiles();
  const total = profiles.length;
  const active = profiles.filter((p) => p.status === "active").length;
  const disabled = total - active;
  const views = profiles.reduce((n, p) => n + p.stats.views, 0);
  const saves = profiles.reduce((n, p) => n + p.stats.save_contact_clicks, 0);

  const topViewed = [...profiles].sort((a, b) => b.stats.views - a.stats.views).slice(0, 5);
  const recent = profiles.slice(0, 5);

  const tiles = [
    { label: "Total customers", value: total },
    { label: "Active cards", value: active },
    { label: "Disabled cards", value: disabled },
    { label: "Total profile views", value: views },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-slate-600">How your cards are doing.</p>
        </div>
        <Link href="/admin/customers/new" className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark">
          Add customer
        </Link>
      </div>

      <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-white lg:grid-cols-4">
        {tiles.map((t, i) => (
          <div key={t.label} className={`p-5 ${i % 2 === 1 ? "border-l border-line" : ""} ${i > 0 ? "lg:border-l" : ""} ${i >= 2 ? "border-t border-line lg:border-t-0" : ""}`}>
            <dt className="text-sm font-medium text-slate-500">{t.label}</dt>
            <dd className="mt-2 font-display text-4xl font-bold tabular-nums">{t.value.toLocaleString()}</dd>
          </div>
        ))}
      </dl>

      {total === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="font-display text-xl font-semibold">Create your first card</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-600">
            Add a customer to get a permanent link and a QR code you can print and write to an NFC card.
          </p>
          <Link href="/admin/customers/new" className="mt-5 inline-block rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark">
            Add customer
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg font-semibold">Most viewed</h2>
            <p className="text-sm text-slate-500">{saves.toLocaleString()} contacts saved in total</p>
            <ul className="mt-4 divide-y divide-line">
              {topViewed.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/customers/${p.id}/edit`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{p.full_name}</span>
                      <span className="block truncate text-sm text-slate-500">/c/{p.profile_id}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-display text-lg font-bold tabular-nums">{p.stats.views.toLocaleString()}</span>
                      <span className="block text-xs text-slate-500">views</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg font-semibold">Recently added</h2>
            <ul className="mt-4 divide-y divide-line">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/customers/${p.id}/edit`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{p.full_name}</span>
                      <span className="block truncate text-sm text-slate-500">{p.company || "No company"} · {formatDate(p.created_at)}</span>
                    </span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
