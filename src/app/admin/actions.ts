"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-email";
import { parseProfileForm } from "@/lib/validation";
import type { ActionResult, Profile } from "@/lib/types";

const BUCKET = "profile-assets";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const NOT_AUTHORIZED: ActionResult = { ok: false, error: "You are not signed in as an administrator." };

/* ---------------------------------------------------------------- auth */

export async function signInAction(email: string, password: string): Promise<ActionResult> {
  if (!email || !password) return { ok: false, error: "Enter your email and password." };
  if (!isAdminEmail(email)) {
    // Same message as a wrong password so the allowlist is not revealed.
    return { ok: false, error: "Incorrect email or password." };
  }
  const supabase = createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "Incorrect email or password." };
  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = createSessionClient();
  await supabase.auth.signOut();
}

/* ------------------------------------------------------------- uploads */

async function uploadImage(
  db: ReturnType<typeof createAdminClient>,
  file: FormDataEntryValue | null,
  profileId: string,
  kind: "photo" | "logo"
): Promise<{ url?: string; error?: string }> {
  if (!(file instanceof File) || file.size === 0) return {};
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { error: "Use a JPG, PNG or WebP image." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Image is larger than 2 MB." };
  const path = `${profileId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) return { error: `Upload failed: ${error.message}` };
  return { url: db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

async function removeFolder(db: ReturnType<typeof createAdminClient>, profileId: string) {
  try {
    const { data } = await db.storage.from(BUCKET).list(profileId);
    if (data && data.length) {
      await db.storage.from(BUCKET).remove(data.map((f) => `${profileId}/${f.name}`));
    }
  } catch {
    /* best effort */
  }
}


async function saveMenuItems(db: ReturnType<typeof createAdminClient>, raw: string | null, profileId: string, fd: FormData): Promise<{ value?: string | null; error?: string }> {
  if (!raw) return { value: null };
  let items: Array<{ name?: string; description?: string; price?: string | number; imageUrl?: string; formIndex?: number }>;
  try { items = JSON.parse(raw); } catch { return { error: "Menu data is invalid. Please review the product list." }; }
  if (!Array.isArray(items) || items.length > 30) return { error: "The menu can contain up to 30 products." };
  const saved = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const name = String(item.name || "").trim();
    if (!name) continue;
    const price = Number(String(item.price ?? "").replace(/[₱,\s]/g, ""));
    if (!Number.isFinite(price) || price < 0) return { error: `Enter a valid price for ${name}.` };
    let imageUrl = String(item.imageUrl || "");
    const file = fd.get(`menu_photo_${Number.isInteger(item.formIndex) ? item.formIndex : i}`);
    if (file instanceof File && file.size > 0) {
      const ext = IMAGE_TYPES[file.type];
      if (!ext) return { error: `Use JPG, PNG or WebP for ${name}'s photo.` };
      if (file.size > MAX_IMAGE_BYTES) return { error: `The photo for ${name} is larger than 2 MB. Please resize it and try again.` };
      const path = `${profileId}/menu-${i + 1}-${Date.now()}.${ext}`;
      const { error } = await db.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, cacheControl: "31536000", upsert: true });
      if (error) return { error: `Photo upload failed for ${name}: ${error.message}` };
      imageUrl = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }
    saved.push({ name, description: String(item.description || "").trim().slice(0, 240), price, imageUrl });
  }
  return { value: saved.length ? JSON.stringify(saved) : null };
}

/* -------------------------------------------------------------- create */

export async function createProfileAction(fd: FormData): Promise<ActionResult> {
  if (!(await getAdminUser())) return NOT_AUTHORIZED;

  const { values, errors } = parseProfileForm(fd);
  if (Object.keys(errors).length) {
    return { ok: false, error: "Fix the highlighted fields.", fieldErrors: errors };
  }

  const db = createAdminClient();

  const { data: existing } = await db
    .from("profiles")
    .select("id")
    .ilike("profile_id", values.profile_id)
    .maybeSingle();
  if (existing) {
    return {
      ok: false,
      error: "That Profile ID is already taken.",
      fieldErrors: { profile_id: "That Profile ID is already taken. Try another." },
    };
  }

  const photo = await uploadImage(db, fd.get("photo_file"), values.profile_id, "photo");
  if (photo.error) return { ok: false, error: photo.error, fieldErrors: { photo_file: photo.error } };
  const logo = await uploadImage(db, fd.get("logo_file"), values.profile_id, "logo");
  if (logo.error) return { ok: false, error: logo.error, fieldErrors: { logo_file: logo.error } };
  const menu = values.profile_type === "business" ? await saveMenuItems(db, values.menu_items, values.profile_id, fd) : { value: null as string | null };
  if (menu.error) return { ok: false, error: menu.error, fieldErrors: { menu_items: menu.error } };

  const { data, error } = await db
    .from("profiles")
    .insert({
      ...values,
      menu_items: menu.value,
      profile_photo: photo.url ?? null,
      company_logo: logo.url ?? null,
      status: "active",
    })
    .select("id, profile_id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "That Profile ID is already taken.",
        fieldErrors: { profile_id: "That Profile ID is already taken. Try another." },
      };
    }
    return { ok: false, error: `Could not create the profile: ${error.message}` };
  }

  revalidatePath("/admin", "layout");
  return { ok: true, id: data.id, profileId: data.profile_id };
}

/* -------------------------------------------------------------- update */

export async function updateProfileAction(id: string, fd: FormData): Promise<ActionResult> {
  if (!(await getAdminUser())) return NOT_AUTHORIZED;

  const db = createAdminClient();
  const { data: current } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!current) return { ok: false, error: "This profile no longer exists." };
  const cur = current as Profile;

  // The Profile ID is the permanent URL on the NFC card, so it is never changed here.
  fd.set("profile_id", cur.profile_id);
  const { values, errors } = parseProfileForm(fd);
  if (Object.keys(errors).length) {
    return { ok: false, error: "Fix the highlighted fields.", fieldErrors: errors };
  }

  let profile_photo = cur.profile_photo;
  let company_logo = cur.company_logo;

  if (fd.get("remove_photo") === "1") profile_photo = null;
  if (fd.get("remove_logo") === "1") company_logo = null;

  const photo = await uploadImage(db, fd.get("photo_file"), cur.profile_id, "photo");
  if (photo.error) return { ok: false, error: photo.error, fieldErrors: { photo_file: photo.error } };
  if (photo.url) profile_photo = photo.url;

  const logo = await uploadImage(db, fd.get("logo_file"), cur.profile_id, "logo");
  if (logo.error) return { ok: false, error: logo.error, fieldErrors: { logo_file: logo.error } };
  if (logo.url) company_logo = logo.url;
  const menu = values.profile_type === "business" ? await saveMenuItems(db, values.menu_items, cur.profile_id, fd) : { value: null as string | null };
  if (menu.error) return { ok: false, error: menu.error, fieldErrors: { menu_items: menu.error } };

  const { profile_id: _ignored, ...editable } = values;
  void _ignored;
  const { error } = await db
    .from("profiles")
    .update({ ...editable, menu_items: menu.value, profile_photo, company_logo })
    .eq("id", id);
  if (error) return { ok: false, error: `Could not save changes: ${error.message}` };

  revalidatePath("/admin", "layout");
  return { ok: true, id, profileId: cur.profile_id, message: "Changes saved. The card is already updated." };
}

/* ------------------------------------------------- status / delete / copy */

export async function toggleStatusAction(id: string): Promise<ActionResult> {
  if (!(await getAdminUser())) return NOT_AUTHORIZED;
  const db = createAdminClient();
  const { data } = await db.from("profiles").select("status").eq("id", id).maybeSingle();
  if (!data) return { ok: false, error: "This profile no longer exists." };
  const next = data.status === "active" ? "disabled" : "active";
  const { error } = await db.from("profiles").update({ status: next }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true, message: next === "active" ? "Card enabled." : "Card disabled." };
}

export async function deleteProfileAction(id: string): Promise<ActionResult> {
  if (!(await getAdminUser())) return NOT_AUTHORIZED;
  const db = createAdminClient();
  const { data } = await db.from("profiles").select("profile_id").eq("id", id).maybeSingle();
  if (!data) return { ok: true };
  const { error } = await db.from("profiles").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  // A duplicated profile may still point at this profile's images, so only clean up when unused.
  const { data: stillUsed } = await db
    .from("profiles")
    .select("id")
    .or(`profile_photo.ilike.%/${data.profile_id}/%,company_logo.ilike.%/${data.profile_id}/%`)
    .limit(1);
  if (!stillUsed || stillUsed.length === 0) await removeFolder(db, data.profile_id);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Profile deleted." };
}

export async function duplicateProfileAction(id: string): Promise<ActionResult> {
  if (!(await getAdminUser())) return NOT_AUTHORIZED;
  const db = createAdminClient();
  const { data } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!data) return { ok: false, error: "This profile no longer exists." };
  const src = data as Profile;

  const base = src.profile_id.replace(/-copy\d*$/, "").slice(0, 22);
  let newId = `${base}-copy`;
  for (let i = 2; i < 50; i++) {
    const { data: hit } = await db.from("profiles").select("id").ilike("profile_id", newId).maybeSingle();
    if (!hit) break;
    newId = `${base}-copy${i}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at, updated_at, ...rest } = src;
  void _id; void created_at; void updated_at;
  const { data: created, error } = await db
    .from("profiles")
    .insert({
      ...rest,
      profile_id: newId,
      full_name: `${src.full_name} (copy)`,
      // Disabled until the admin edits it, so a half-finished copy is never public.
      status: "disabled",
    })
    .select("id, profile_id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin", "layout");
  return { ok: true, id: created.id, profileId: created.profile_id, message: "Profile duplicated (disabled)." };
}
