import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TRACK_EVENTS, type TrackEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Privacy-friendly analytics: increments a counter. Stores no IP address,
 * user agent, cookie or any other personal data.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const profileId = typeof body?.p === "string" ? body.p.toLowerCase() : "";
    const event = body?.e as TrackEvent;
    if (!/^[a-z0-9][a-z0-9_-]{2,29}$/.test(profileId) || !TRACK_EVENTS.includes(event)) {
      return new NextResponse(null, { status: 400 });
    }
    const db = createAdminClient();
    const { data } = await db
      .from("profiles")
      .select("id")
      .eq("profile_id", profileId)
      .eq("status", "active")
      .maybeSingle();
    if (data) await db.rpc("track_event", { p_profile: data.id, p_event: event });
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
