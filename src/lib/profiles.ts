import { cache } from "react";
import { createAdminClient } from "./supabase/admin";
import type { Profile, ProfileStats, ProfileWithStats } from "./types";
import { EMPTY_STATS } from "./utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
function withStats(row: any): ProfileWithStats {
  const { profile_stats, ...profile } = row;
  const s = Array.isArray(profile_stats) ? profile_stats[0] : profile_stats;
  const stats: ProfileStats = s
    ? {
        views: Number(s.views ?? 0),
        last_viewed_at: s.last_viewed_at ?? null,
        save_contact_clicks: Number(s.save_contact_clicks ?? 0),
        phone_clicks: Number(s.phone_clicks ?? 0),
        email_clicks: Number(s.email_clicks ?? 0),
        message_clicks: Number(s.message_clicks ?? 0),
        website_clicks: Number(s.website_clicks ?? 0),
        social_clicks: Number(s.social_clicks ?? 0),
        map_clicks: Number(s.map_clicks ?? 0),
      }
    : { ...EMPTY_STATS };
  return { ...(profile as Profile), stats };
}

/** Public lookup used by /c/[profileId]. Returns active AND disabled so the page can show the right message. */
export const getPublicProfile = cache(async (profileId: string): Promise<Profile | null> => {
  const id = profileId.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{2,29}$/.test(id)) return null;
  const db = createAdminClient();
  const { data, error } = await db.from("profiles").select("*").eq("profile_id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Profile | null) ?? null;
});

export async function getProfileById(id: string): Promise<ProfileWithStats | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("profiles")
    .select("*, profile_stats(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? withStats(data) : null;
}

export async function listProfiles(opts: { q?: string; status?: string } = {}) {
  const db = createAdminClient();
  let query = db
    .from("profiles")
    .select("*, profile_stats(*)")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (opts.status === "active" || opts.status === "disabled") query = query.eq("status", opts.status);

  const q = (opts.q || "").replace(/[,()%*\\]/g, " ").trim();
  if (q) {
    query = query.or(
      `full_name.ilike.%${q}%,company.ilike.%${q}%,profile_id.ilike.%${q}%,job_title.ilike.%${q}%`
    );
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(withStats);
}
