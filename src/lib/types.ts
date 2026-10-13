
export type ProfileStatus = "active" | "disabled";
export type ProfileType = "personal" | "business";
export type ThemeMode = "light" | "dark" | "auto";
export type BackgroundStyle = "soft" | "gradient" | "mesh" | "dots";
export type ButtonStyle = "rounded" | "pill" | "square";

export type DesignTheme =
  | "classic"
  | "obsidian-gold"
  | "royal-prestige"
  | "ivory-minimal"
  | "emerald-luxe"
  | "titanium"
  | "artisan-classic";

export interface Profile {
  id: string;
  profile_id: string;
  profile_type: ProfileType;
  business_name: string | null;
  full_name: string;
  job_title: string | null;
  company: string | null;
  bio: string | null;
  profile_photo: string | null;
  company_logo: string | null;
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
  google_review_url: string | null;
  business_hours: string | null;
  menu_items: string | null;
  faq1_question: string | null;
  faq1_answer: string | null;
  faq2_question: string | null;
  faq2_answer: string | null;
  faq3_question: string | null;
  faq3_answer: string | null;
  theme: ThemeMode;
  design_theme: DesignTheme;
  primary_color: string;
  background: BackgroundStyle;
  button_style: ButtonStyle;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
}

export interface ProfileStats {
  views: number;
  last_viewed_at: string | null;
  save_contact_clicks: number;
  phone_clicks: number;
  email_clicks: number;
  message_clicks: number;
  website_clicks: number;
  social_clicks: number;
  map_clicks: number;
}

export type ProfileWithStats = Profile & { stats: ProfileStats };

export type TrackEvent =
  | "view"
  | "save_contact"
  | "phone"
  | "email"
  | "message"
  | "website"
  | "social"
  | "map";

export const TRACK_EVENTS: TrackEvent[] = [
  "view",
  "save_contact",
  "phone",
  "email",
  "message",
  "website",
  "social",
  "map",
];

export type ActionResult =
  | { ok: true; id?: string; profileId?: string; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
