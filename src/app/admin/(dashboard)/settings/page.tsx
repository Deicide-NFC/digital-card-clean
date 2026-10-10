import { CheckCircle2, CircleAlert } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireAdmin();
  const site = siteUrl();
  const isLocal = site.includes("localhost");

  const checks = [
    { label: "Supabase URL", ok: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
    { label: "Supabase anon key", ok: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { label: "Supabase service role key (server only)", ok: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
    { label: "Admin email list", ok: !!process.env.ADMIN_EMAILS },
    { label: "Public site address", ok: !!process.env.NEXT_PUBLIC_SITE_URL && !isLocal, note: isLocal ? "Still set to localhost. Cards printed now would not work online." : undefined },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <p className="mb-6 mt-1 text-slate-600">Settings come from environment variables, so no secrets are stored in the app.</p>

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Setup check</h2>
        <ul className="mt-4 space-y-3">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-3">
              {c.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /> : <CircleAlert className="mt-0.5 h-5 w-5 text-amber-500" />}
              <div>
                <p className="text-sm font-semibold">{c.label}</p>
                {c.note && <p className="text-xs text-amber-700">{c.note}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Account</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <div><dt className="text-slate-500">Signed in as</dt><dd className="font-semibold">{user.email}</dd></div>
          <div><dt className="text-slate-500">Cards are served from</dt><dd className="font-mono font-semibold">{site}/c/&lt;profile-id&gt;</dd></div>
        </dl>
        <p className="mt-4 text-sm text-slate-600">
          To change your password or add another administrator, use Supabase Dashboard, Authentication, Users. Then add the email to ADMIN_EMAILS.
        </p>
      </section>
    </div>
  );
}
