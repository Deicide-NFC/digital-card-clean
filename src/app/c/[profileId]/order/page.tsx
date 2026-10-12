import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfile } from "@/lib/profiles";
import { OrderPageClient } from "@/components/profile/OrderPageClient";

export const dynamic = "force-dynamic";

type Props = { params: { profileId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getPublicProfile(params.profileId);
  return { title: profile ? `Order from ${profile.business_name || profile.company || profile.full_name}` : "Order", robots: { index: false, follow: false } };
}

export default async function BusinessOrderPage({ params }: Props) {
  const profile = await getPublicProfile(params.profileId);
  if (!profile || profile.status !== "active") notFound();
  if (profile.profile_type !== "business") redirect(`/c/${profile.profile_id}`);
  let rawItems: Array<{ name?: string; price?: string | number; description?: string; imageUrl?: string }> = [];
  try {
    const parsed = JSON.parse(profile.menu_items || "[]");
    if (Array.isArray(parsed)) rawItems = parsed;
  } catch {
    rawItems = (profile.menu_items || "").split(/\r?\n/).map((line) => { const [name="", price="", description=""] = line.split("|"); return { name, price, description }; });
  }
  const menuItems = rawItems.slice(0, 30).map((item, index) => {
    const name = String(item.name || "").trim();
    const price = Number(String(item.price ?? "").replace(/[₱,\s]/g, ""));
    if (!name || !Number.isFinite(price) || price < 0) return null;
    return { id: `${index}-${name}`, name, price, description: String(item.description || "").trim(), imageUrl: String(item.imageUrl || "") };
  }).filter((item): item is { id: string; name: string; price: number; description: string; imageUrl: string } => !!item);

  return <OrderPageClient profile={profile} menuItems={menuItems} />;
}
