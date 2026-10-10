import { NextResponse } from "next/server";
import { getPublicProfile } from "@/lib/profiles";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildVCard, vcardFilename } from "@/lib/vcard";
import { profileUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function fetchPhoto(url: string) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(timer);
    if (!res.ok) return undefined;
    const type = res.headers.get("content-type") || "";
    const kind = type.includes("png") ? "PNG" : type.includes("jpeg") || type.includes("jpg") ? "JPEG" : null;
    if (!kind) return undefined;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 400_000) return undefined; // keep the .vcf small
    return { base64: buf.toString("base64"), type: kind } as const;
  } catch {
    return undefined;
  }
}

export async function GET(req: Request, { params }: { params: { profileId: string } }) {
  const profile = await getPublicProfile(params.profileId);
  if (!profile || profile.status !== "active") {
    return new NextResponse("Not available", { status: 404 });
  }

  // Count the download (no personal data stored).
  try {
    await createAdminClient().rpc("track_event", { p_profile: profile.id, p_event: "save_contact" });
  } catch {
    /* analytics must never block the download */
  }

  const photo = profile.profile_photo ? await fetchPhoto(profile.profile_photo) : undefined;
  const body = buildVCard(profile, { cardUrl: profileUrl(profile.profile_id), photo });

  // iPhone: "inline" opens the native "Add Contact" sheet.
  // Android and desktop: "attachment" reliably downloads the file.
  const ua = req.headers.get("user-agent") || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `${isIOS ? "inline" : "attachment"}; filename="${vcardFilename(profile)}"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
