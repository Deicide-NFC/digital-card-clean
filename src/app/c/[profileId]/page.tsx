import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/profiles";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ViewTracker } from "@/components/profile/TrackedLink";
import { BRAND_NAME } from "@/lib/brand";

// Always render fresh so edits appear on the card immediately.
export const dynamic = "force-dynamic";

type Props = { params: { profileId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPublicProfile(params.profileId);
  const robots = { index: false, follow: false };
  if (!p || p.status !== "active") return { title: "Digital business card", robots };
  const role = [p.job_title, p.company].filter(Boolean).join(" at ");
  return {
    title: p.full_name,
    description: p.bio || role || `Digital business card of ${p.full_name}`,
    robots, // Private by default: cards are shared by tap/scan, not found on Google.
    openGraph: {
      title: p.full_name,
      description: role || `Digital business card of ${p.full_name}`,
      images: p.profile_photo ? [p.profile_photo] : undefined,
      type: "profile",
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const p = await getPublicProfile(params.profileId);
  if (!p) notFound();

  if (p.status !== "active") {
    // No name, no data, no admin details.
    return (
      <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-2xl font-bold">This digital business card is currently unavailable.</h1>
        <p className="mt-3 text-slate-600">Please contact the card owner directly for their details.</p>
        <p className="mt-10 text-sm text-slate-400">{BRAND_NAME}</p>
      </main>
    );
  }

  return (
    <>
      <ProfileCard profile={p} />
      <ViewTracker profileId={p.profile_id} />
    </>
  );
}
