import type { BackgroundStyle, ButtonStyle, DesignTheme, ThemeMode } from "./types";

export const PROFILE_ID_RE = /^[a-z0-9][a-z0-9_-]{2,29}$/;

export function normalizeProfileId(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, "-");
}

export interface ProfileInput {
  profile_id: string;
  full_name: string;
  job_title: string | null;
  company: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  linkedin: string | null;
  messenger: string | null;
  whatsapp: string | null;
  viber: string | null;
  address: string | null;
  maps_url: string | null;
  business_hours: string | null;
  theme: ThemeMode;
  design_theme: DesignTheme;
  primary_color: string;
  background: BackgroundStyle;
  button_style: ButtonStyle;
}

const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
};
const opt = (fd: FormData, key: string) => str(fd, key) || null;

function normalizeUrl(v: string): string | null {
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

const THEMES: ThemeMode[] = ["light", "dark", "auto"];
const BACKGROUNDS: BackgroundStyle[] = ["soft", "gradient", "mesh", "dots"];
const BUTTONS: ButtonStyle[] = ["rounded", "pill", "square"];
const DESIGN_THEMES: DesignTheme[] = [
  "classic", "obsidian-gold", "royal-prestige", "ivory-minimal",
  "emerald-luxe", "titanium", "artisan-classic",
];

/** Server-side validation. This is the source of truth; the browser form is a convenience. */
export function parseProfileForm(fd: FormData) {
  const errors: Record<string, string> = {};

  const profile_id = normalizeProfileId(str(fd, "profile_id"));
  const full_name = str(fd, "full_name");

  if (!full_name) errors.full_name = "Enter the person's full name.";
  else if (full_name.length > 100) errors.full_name = "Keep the name under 100 characters.";

  if (!profile_id) errors.profile_id = "Enter a Profile ID, for example charles01.";
  else if (!PROFILE_ID_RE.test(profile_id))
    errors.profile_id =
      "Use 3 to 30 lowercase letters, numbers, dashes or underscores. Start with a letter or number.";

  const limit = (key: string, max: number, label: string) => {
    const v = str(fd, key);
    if (v.length > max) errors[key] = `${label} must be ${max} characters or fewer.`;
    return v || null;
  };

  const job_title = limit("job_title", 100, "Job title");
  const company = limit("company", 100, "Company");
  const bio = limit("bio", 500, "Bio");
  const business_hours = limit("business_hours", 500, "Business hours");
  const address = limit("address", 300, "Address");
  const facebook = limit("facebook", 200, "Facebook");
  const instagram = limit("instagram", 200, "Instagram");
  const tiktok = limit("tiktok", 200, "TikTok");
  const linkedin = limit("linkedin", 200, "LinkedIn");
  const messenger = limit("messenger", 200, "Messenger");
  const whatsapp = limit("whatsapp", 200, "WhatsApp");
  const viber = limit("viber", 200, "Viber");

  let phone = opt(fd, "phone");
  if (phone && (!/^[+()\d\s.\-]{5,25}$/.test(phone) || phone.replace(/\D/g, "").length < 5))
    errors.phone = "Enter a valid phone number, for example +63 917 123 4567.";

  let email = opt(fd, "email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";

  let website = opt(fd, "website");
  if (website) {
    const n = normalizeUrl(website);
    if (!n) errors.website = "Enter a valid website address, for example example.com.";
    else website = n;
  }

  let maps_url = opt(fd, "maps_url");
  if (maps_url) {
    const n = normalizeUrl(maps_url);
    if (!n) errors.maps_url = "Paste a valid Google Maps link.";
    else maps_url = n;
  }

  const themeRaw = str(fd, "theme") as ThemeMode;
  const theme: ThemeMode = THEMES.includes(themeRaw) ? themeRaw : "light";
  const designRaw = str(fd, "design_theme") as DesignTheme;
  const design_theme: DesignTheme = DESIGN_THEMES.includes(designRaw) ? designRaw : "classic";

  let primary_color = str(fd, "primary_color");
  if (!/^#[0-9a-fA-F]{6}$/.test(primary_color)) {
    if (primary_color) errors.primary_color = "Choose a colour in #RRGGBB format.";
    primary_color = "#2347F0";
  }

  const bgRaw = str(fd, "background") as BackgroundStyle;
  const background: BackgroundStyle = BACKGROUNDS.includes(bgRaw) ? bgRaw : "soft";

  const btnRaw = str(fd, "button_style") as ButtonStyle;
  const button_style: ButtonStyle = BUTTONS.includes(btnRaw) ? btnRaw : "rounded";

  const values: ProfileInput = {
    profile_id,
    full_name,
    job_title,
    company,
    bio,
    phone,
    email,
    website,
    facebook,
    instagram,
    tiktok,
    linkedin,
    messenger,
    whatsapp,
    viber,
    address,
    maps_url,
    business_hours,
    theme,
    design_theme,
    primary_color,
    background,
    button_style,
  };

  return { values, errors };
}
