import type { Profile } from "./types";

export function isUrl(v: string) {
  return /^https?:\/\//i.test(v.trim());
}

export function digits(v: string) {
  return v.replace(/\D/g, "");
}

export function telHref(phone: string) {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

export function smsHref(phone: string) {
  return "sms:" + phone.replace(/[^\d+]/g, "");
}

export function mailHref(email: string) {
  return "mailto:" + email.trim();
}

export function websiteHref(v: string) {
  const t = v.trim();
  return isUrl(t) ? t : `https://${t}`;
}

const stripAt = (v: string) => v.trim().replace(/^@/, "");

export function facebookHref(v: string) {
  return isUrl(v) ? v.trim() : `https://facebook.com/${stripAt(v)}`;
}
export function instagramHref(v: string) {
  return isUrl(v) ? v.trim() : `https://instagram.com/${stripAt(v)}`;
}
export function tiktokHref(v: string) {
  return isUrl(v) ? v.trim() : `https://www.tiktok.com/@${stripAt(v)}`;
}
export function linkedinHref(v: string) {
  return isUrl(v) ? v.trim() : `https://www.linkedin.com/in/${stripAt(v)}`;
}
export function messengerHref(v: string) {
  return isUrl(v) ? v.trim() : `https://m.me/${stripAt(v)}`;
}
export function whatsappHref(v: string) {
  return isUrl(v) ? v.trim() : `https://wa.me/${digits(v)}`;
}
export function viberHref(v: string) {
  return isUrl(v) ? v.trim() : `viber://chat?number=%2B${digits(v)}`;
}

export function mapsHref(p: Pick<Profile, "maps_url" | "address">) {
  if (p.maps_url) return p.maps_url;
  if (p.address)
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`;
  return null;
}

/** Friendly text to show under a link label (hides https://, www., trailing slash). */
export function displayHandle(v: string) {
  const t = v.trim();
  if (!isUrl(t)) return t.startsWith("@") || /^[+\d]/.test(t) ? t : `@${t}`;
  return t.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/+$/, "");
}

export function displayWebsite(v: string) {
  return v.trim().replace(/^https?:\/\/(www\.)?/i, "").replace(/\/+$/, "");
}

export type SocialKey =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "messenger"
  | "whatsapp"
  | "viber";

export interface SocialLink {
  key: SocialKey;
  label: string;
  href: string;
  handle: string;
  event: "social" | "message";
}

/** Only returns links that actually have a value. */
export function socialLinks(p: Profile): SocialLink[] {
  const out: SocialLink[] = [];
  const add = (
    key: SocialKey,
    label: string,
    value: string | null,
    build: (v: string) => string,
    event: "social" | "message" = "social"
  ) => {
    if (value && value.trim()) {
      out.push({
        key,
        label,
        href: build(value),
        handle: key === "whatsapp" || key === "viber" ? value.trim() : displayHandle(value),
        event,
      });
    }
  };
  add("whatsapp", "WhatsApp", p.whatsapp, whatsappHref, "message");
  add("messenger", "Messenger", p.messenger, messengerHref, "message");
  add("viber", "Viber", p.viber, viberHref, "message");
  add("facebook", "Facebook", p.facebook, facebookHref);
  add("instagram", "Instagram", p.instagram, instagramHref);
  add("tiktok", "TikTok", p.tiktok, tiktokHref);
  add("linkedin", "LinkedIn", p.linkedin, linkedinHref);
  return out;
}
