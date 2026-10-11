import { NextResponse } from "next/server";
import { getPublicProfile } from "@/lib/profiles";
import { socialLinks, type SocialKey } from "@/lib/links";

export const dynamic = "force-dynamic";

const ALLOWED: SocialKey[] = ["facebook", "instagram", "tiktok", "linkedin", "messenger", "whatsapp", "viber"];

export async function GET(_request: Request, { params }: { params: { profileId: string; platform: string } }) {
  if (!ALLOWED.includes(params.platform as SocialKey)) {
    return new NextResponse("Social link not found", { status: 404 });
  }
  const profile = await getPublicProfile(params.profileId);
  if (!profile || profile.status !== "active") {
    return new NextResponse("This digital business card is unavailable", { status: 404 });
  }
  const link = socialLinks(profile).find((item) => item.key === params.platform);
  if (!link) return new NextResponse("This social link has not been added", { status: 404 });
  return NextResponse.redirect(link.href, 302);
}
