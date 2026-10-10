import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { BRAND_NAME } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Second layer of protection (the first is middleware.ts).
  const user = await requireAdmin();
  return (
    <AdminShell email={user.email ?? ""} brand={BRAND_NAME}>
      {children}
    </AdminShell>
  );
}
