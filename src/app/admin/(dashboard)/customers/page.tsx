import Link from "next/link";
import { Search } from "lucide-react";
import { listProfiles } from "@/lib/profiles";
import { RowActions } from "@/components/admin/RowActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate, profileUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const q = searchParams.q ?? "";
  const status = searchParams.status ?? "all";
  const profiles = await listProfiles({ q, status });

  const chip = (value: string, label: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (value !== "all") params.set("status", value);
    const active = status === value;
    return (
      <Link
        key={value}
        href={`/admin/customers${params.toString() ? `?${params}` : ""}`}
        className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${active ? "bg-ink text-white" : "bg-white text-slate-600 ring-1 ring-line hover:bg-mist"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Customers</h1>
          <p className="mt-1 text-slate-600">{profiles.length} {profiles.length === 1 ? "card" : "cards"}</p>
        </div>
        <Link href="/admin/customers/new" className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark">
          Add customer
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap items-center gap-3" action="/admin/customers">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, company or Profile ID"
            className="w-full rounded-xl border border-line bg-white py-3 pl-10 pr-3 text-[15px] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        {status !== "all" && <input type="hidden" name="status" value={status} />}
        <button className="rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white">Search</button>
        <div className="flex gap-2">
          {chip("all", "All")}
          {chip("active", "Active")}
          {chip("disabled", "Disabled")}
        </div>
      </form>

      {profiles.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          {q || status !== "all" ? "No customers match this search." : "No customers yet. Add your first one."}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-hidden rounded-2xl border border-line bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist/60 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Profile ID</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {profiles.map((p) => (
                  <tr key={p.id} className="align-top">
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/customers/${p.id}/edit`} className="font-semibold hover:underline">{p.full_name}</Link>
                      {p.job_title && <p className="text-slate-500">{p.job_title}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{p.company || "-"}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-mono font-semibold">{p.profile_id}</p>
                      <p className="max-w-[220px] truncate text-xs text-slate-500">{profileUrl(p.profile_id)}</p>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-2.5">
                      <RowActions id={p.id} profileId={p.profile_id} name={p.full_name} status={p.status} url={profileUrl(p.profile_id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="mt-6 space-y-3 md:hidden">
            {profiles.map((p) => (
              <li key={p.id} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/customers/${p.id}/edit`} className="block truncate font-semibold">{p.full_name}</Link>
                    <p className="truncate text-sm text-slate-500">{p.company || "No company"}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-2 truncate font-mono text-xs text-slate-500">{profileUrl(p.profile_id)}</p>
                <p className="mt-1 text-xs text-slate-400">Created {formatDate(p.created_at)}</p>
                <div className="mt-3 border-t border-line pt-2">
                  <RowActions id={p.id} profileId={p.profile_id} name={p.full_name} status={p.status} url={profileUrl(p.profile_id)} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
