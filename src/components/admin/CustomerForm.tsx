"use client";

import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { createProfileAction, updateProfileAction } from "@/app/admin/actions";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { CopyButton } from "./CopyButton";
import { BACKGROUND_OPTIONS, BUTTON_OPTIONS, COLOR_PRESETS, DESIGN_THEME_OPTIONS, THEME_OPTIONS } from "@/lib/theme";
import type { Profile } from "@/lib/types";
import { profileUrl, slugify } from "@/lib/utils";

type Values = {
  full_name: string;
  profile_id: string;
  job_title: string;
  company: string;
  bio: string;
  phone: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
  messenger: string;
  whatsapp: string;
  viber: string;
  address: string;
  maps_url: string;
  business_hours: string;
  theme: string;
  design_theme: string;
  primary_color: string;
  background: string;
  button_style: string;
};

const TEXT_KEYS = [
  "full_name", "profile_id", "job_title", "company", "bio", "phone", "email", "website",
  "facebook", "instagram", "tiktok", "linkedin", "messenger", "whatsapp", "viber",
  "address", "maps_url", "business_hours", "theme", "design_theme", "primary_color", "background", "button_style",
] as const;

function toValues(p?: Profile): Values {
  const v = (x: string | null | undefined) => x ?? "";
  return {
    full_name: v(p?.full_name),
    profile_id: v(p?.profile_id),
    job_title: v(p?.job_title),
    company: v(p?.company),
    bio: v(p?.bio),
    phone: v(p?.phone),
    email: v(p?.email),
    website: v(p?.website),
    facebook: v(p?.facebook),
    instagram: v(p?.instagram),
    tiktok: v(p?.tiktok),
    linkedin: v(p?.linkedin),
    messenger: v(p?.messenger),
    whatsapp: v(p?.whatsapp),
    viber: v(p?.viber),
    address: v(p?.address),
    maps_url: v(p?.maps_url),
    business_hours: v(p?.business_hours),
    theme: p?.theme ?? "light",
    design_theme: p?.design_theme ?? "classic",
    primary_color: p?.primary_color ?? "#2347F0",
    background: p?.background ?? "soft",
    button_style: p?.button_style ?? "rounded",
  };
}

/** Resize in the browser so uploads stay small and fast on mobile data. */
async function prepareImage(file: File, kind: "photo" | "logo"): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  if (kind === "photo") {
    const side = Math.min(bmp.width, bmp.height);
    const out = Math.min(640, side);
    canvas.width = out;
    canvas.height = out;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out, out);
    ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, out, out);
    return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", 0.86));
  }
  const scale = Math.min(1, 480 / Math.max(bmp.width, bmp.height));
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/png"));
}

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-mist disabled:text-slate-500";

function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Segmented({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-xl border px-3.5 py-2 text-sm font-semibold ${
            value === o.value ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-slate-600 hover:bg-mist"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ImagePicker({
  label,
  hint,
  previewUrl,
  rounded,
  error,
  onPick,
  onRemove,
}: {
  label: string;
  hint: string;
  previewUrl: string | null;
  rounded: boolean;
  error?: string;
  onPick: (f: File) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-dashed border-line bg-mist ${
            rounded ? "rounded-full" : "rounded-xl"
          }`}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className={`h-full w-full ${rounded ? "object-cover" : "object-contain p-1"}`} />
          ) : (
            <ImagePlus className="h-6 w-6 text-slate-400" />
          )}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold hover:bg-mist"
            >
              {previewUrl ? "Replace" : "Upload"}
            </button>
            {previewUrl && (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">{hint}</p>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function CustomerForm({ mode, initial }: { mode: "create" | "edit"; initial?: Profile }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [v, setV] = useState<Values>(() => toValues(initial));
  const [idTouched, setIdTouched] = useState(mode === "edit");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [logo, setLogo] = useState<{ blob: Blob; url: string } | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [removeLogo, setRemoveLogo] = useState(false);

  const set = (k: keyof Values, val: string) => setV((s) => ({ ...s, [k]: val }));

  // Suggest a Profile ID from the first name until the admin types their own (create mode only).
  useEffect(() => {
    if (mode !== "create" || idTouched) return;
    const first = slugify(v.full_name.trim().split(/\s+/)[0] || "");
    setV((s) => ({ ...s, profile_id: first.length >= 2 ? `${first}01` : "" }));
  }, [v.full_name, idTouched, mode]);

  const photoUrl = photo?.url ?? (removePhoto ? null : initial?.profile_photo ?? null);
  const logoUrl = logo?.url ?? (removeLogo ? null : initial?.company_logo ?? null);

  async function pickImage(file: File, kind: "photo" | "logo") {
    try {
      const blob = await prepareImage(file, kind);
      const url = URL.createObjectURL(blob);
      if (kind === "photo") {
        setPhoto({ blob, url });
        setRemovePhoto(false);
      } else {
        setLogo({ blob, url });
        setRemoveLogo(false);
      }
      setErrors((e) => ({ ...e, [`${kind === "photo" ? "photo" : "logo"}_file`]: "" }));
    } catch {
      setErrors((e) => ({
        ...e,
        [`${kind === "photo" ? "photo" : "logo"}_file`]: "That image could not be read. Try a JPG or PNG.",
      }));
    }
  }

  const previewProfile: Profile = useMemo(() => {
    const n = (s: string) => (s.trim() ? s.trim() : null);
    return {
      id: "preview",
      profile_id: v.profile_id || "preview",
      full_name: v.full_name.trim() || "Full Name",
      job_title: n(v.job_title) ?? (v.full_name ? null : "Job title"),
      company: n(v.company) ?? (v.full_name ? null : "Company"),
      bio: n(v.bio),
      profile_photo: photoUrl,
      company_logo: logoUrl,
      phone: n(v.phone),
      email: n(v.email),
      website: n(v.website),
      facebook: n(v.facebook),
      instagram: n(v.instagram),
      tiktok: n(v.tiktok),
      linkedin: n(v.linkedin),
      messenger: n(v.messenger),
      whatsapp: n(v.whatsapp),
      viber: n(v.viber),
      address: n(v.address),
      maps_url: n(v.maps_url),
      business_hours: n(v.business_hours),
      theme: v.theme as Profile["theme"],
      design_theme: v.design_theme as Profile["design_theme"],
      primary_color: /^#[0-9a-fA-F]{6}$/.test(v.primary_color) ? v.primary_color : "#2347F0",
      background: v.background as Profile["background"],
      button_style: v.button_style as Profile["button_style"],
      status: "active",
      created_at: "",
      updated_at: "",
    };
  }, [v, photoUrl, logoUrl]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);
    setErrors({});

    const fd = new FormData();
    TEXT_KEYS.forEach((k) => fd.set(k, v[k]));
    if (photo) fd.set("photo_file", new File([photo.blob], "photo.jpg", { type: photo.blob.type }));
    if (logo) fd.set("logo_file", new File([logo.blob], "logo.png", { type: logo.blob.type }));
    if (removePhoto && !photo) fd.set("remove_photo", "1");
    if (removeLogo && !logo) fd.set("remove_logo", "1");

    start(async () => {
      const res = mode === "create" ? await createProfileAction(fd) : await updateProfileAction(initial!.id, fd);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setBanner({ kind: "error", text: res.error });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (mode === "create") {
        router.push(`/admin/qr/${res.id}?created=1`);
      } else {
        setBanner({ kind: "success", text: res.message || "Saved." });
        setPhoto(null);
        setLogo(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
        router.refresh();
      }
    });
  }

  const url = profileUrl(v.profile_id || "your-id");

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        {banner && (
          <div
            role={banner.kind === "error" ? "alert" : "status"}
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              banner.kind === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {banner.text}
          </div>
        )}

        <Section title="Basic info">
          <Field label="Full name *" error={errors.full_name} htmlFor="full_name">
            <input id="full_name" required maxLength={100} className={inputCls} value={v.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Charles Arthur Salamat" />
          </Field>

          <Field
            label="Profile ID *"
            error={errors.profile_id}
            htmlFor="profile_id"
            hint={mode === "edit" ? "Locked. The NFC card and QR code point to this address." : undefined}
          >
            <input
              id="profile_id"
              required
              maxLength={30}
              disabled={mode === "edit"}
              className={inputCls}
              value={v.profile_id}
              onChange={(e) => {
                setIdTouched(true);
                set("profile_id", e.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
              placeholder="charles01"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </Field>

          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-soft px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-brand">Permanent card address</p>
              <p className="truncate font-mono text-sm text-ink">{url}</p>
            </div>
            {mode === "edit" && <CopyButton value={url} />}
          </div>

          <Field label="Job title" error={errors.job_title} htmlFor="job_title">
            <input id="job_title" className={inputCls} value={v.job_title} onChange={(e) => set("job_title", e.target.value)} placeholder="Assistant Restaurant Manager" />
          </Field>
          <Field label="Company" error={errors.company} htmlFor="company">
            <input id="company" className={inputCls} value={v.company} onChange={(e) => set("company", e.target.value)} placeholder="Red Ribbon" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Bio" error={errors.bio} htmlFor="bio" hint={`${v.bio.length}/500`}>
              <textarea id="bio" rows={3} maxLength={500} className={inputCls} value={v.bio} onChange={(e) => set("bio", e.target.value)} placeholder="A short introduction visitors will read first." />
            </Field>
          </div>
          <ImagePicker
            label="Profile photo"
            hint="Cropped to a square. JPG, PNG or WebP."
            previewUrl={photoUrl}
            rounded
            error={errors.photo_file}
            onPick={(f) => pickImage(f, "photo")}
            onRemove={() => {
              setPhoto(null);
              setRemovePhoto(true);
            }}
          />
          <ImagePicker
            label="Company logo"
            hint="Transparent PNG works best."
            previewUrl={logoUrl}
            rounded={false}
            error={errors.logo_file}
            onPick={(f) => pickImage(f, "logo")}
            onRemove={() => {
              setLogo(null);
              setRemoveLogo(true);
            }}
          />
        </Section>

        <Section title="Contact" description="Leave a field empty and it will not appear on the card.">
          <Field label="Phone" error={errors.phone} htmlFor="phone" hint="Include the country code.">
            <input id="phone" type="tel" className={inputCls} value={v.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+63 917 123 4567" />
          </Field>
          <Field label="Email" error={errors.email} htmlFor="email">
            <input id="email" type="email" className={inputCls} value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="name@company.com" autoCapitalize="none" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Website" error={errors.website} htmlFor="website">
              <input id="website" className={inputCls} value={v.website} onChange={(e) => set("website", e.target.value)} placeholder="www.company.com" autoCapitalize="none" />
            </Field>
          </div>
        </Section>

        <Section title="Social and messaging" description="Paste a username, a phone number or a full link.">
          <Field label="Facebook" error={errors.facebook} htmlFor="facebook">
            <input id="facebook" className={inputCls} value={v.facebook} onChange={(e) => set("facebook", e.target.value)} placeholder="username or link" autoCapitalize="none" />
          </Field>
          <Field label="Instagram" error={errors.instagram} htmlFor="instagram">
            <input id="instagram" className={inputCls} value={v.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@username" autoCapitalize="none" />
          </Field>
          <Field label="TikTok" error={errors.tiktok} htmlFor="tiktok">
            <input id="tiktok" className={inputCls} value={v.tiktok} onChange={(e) => set("tiktok", e.target.value)} placeholder="@username" autoCapitalize="none" />
          </Field>
          <Field label="LinkedIn" error={errors.linkedin} htmlFor="linkedin">
            <input id="linkedin" className={inputCls} value={v.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="username or link" autoCapitalize="none" />
          </Field>
          <Field label="Messenger" error={errors.messenger} htmlFor="messenger">
            <input id="messenger" className={inputCls} value={v.messenger} onChange={(e) => set("messenger", e.target.value)} placeholder="Facebook username" autoCapitalize="none" />
          </Field>
          <Field label="WhatsApp" error={errors.whatsapp} htmlFor="whatsapp">
            <input id="whatsapp" type="tel" className={inputCls} value={v.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+63 917 123 4567" />
          </Field>
          <Field label="Viber" error={errors.viber} htmlFor="viber" hint="Use the international format, starting with +.">
            <input id="viber" type="tel" className={inputCls} value={v.viber} onChange={(e) => set("viber", e.target.value)} placeholder="+63 917 123 4567" />
          </Field>
        </Section>

        <Section title="Location and hours">
          <div className="sm:col-span-2">
            <Field label="Address" error={errors.address} htmlFor="address">
              <textarea id="address" rows={2} maxLength={300} className={inputCls} value={v.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, city, country" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Google Maps link" error={errors.maps_url} htmlFor="maps_url" hint="Optional. If empty, the address is used to open Maps.">
              <input id="maps_url" className={inputCls} value={v.maps_url} onChange={(e) => set("maps_url", e.target.value)} placeholder="https://maps.google.com/..." autoCapitalize="none" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Business hours" error={errors.business_hours} htmlFor="business_hours" hint="One line per schedule.">
              <textarea id="business_hours" rows={3} maxLength={500} className={inputCls} value={v.business_hours} onChange={(e) => set("business_hours", e.target.value)} placeholder={"Mon to Fri: 9:00 AM to 6:00 PM\nSat: 9:00 AM to 1:00 PM"} />
            </Field>
          </div>
        </Section>

        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Design</h2>
          <div className="mt-5 space-y-5">
            <Field label="Theme">
              <Segmented name="Theme" value={v.theme} options={THEME_OPTIONS} onChange={(x) => set("theme", x)} />
            </Field>
            <Field label="Card design">
              <select
                aria-label="Card design"
                className={inputCls}
                value={v.design_theme}
                onChange={(e) => set("design_theme", e.target.value)}
              >
                {DESIGN_THEME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Primary color" error={errors.primary_color}>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Use ${c}`}
                    onClick={() => set("primary_color", c)}
                    className={`h-9 w-9 rounded-full border-2 ${v.primary_color.toLowerCase() === c.toLowerCase() ? "border-ink" : "border-white ring-1 ring-line"}`}
                    style={{ background: c }}
                  />
                ))}
                <input
                  type="color"
                  aria-label="Custom color"
                  value={/^#[0-9a-fA-F]{6}$/.test(v.primary_color) ? v.primary_color : "#2347F0"}
                  onChange={(e) => set("primary_color", e.target.value.toUpperCase())}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-white p-0.5"
                />
                <input
                  aria-label="Color hex code"
                  className={`${inputCls} !w-28 font-mono`}
                  value={v.primary_color}
                  maxLength={7}
                  onChange={(e) => set("primary_color", e.target.value)}
                />
              </div>
            </Field>
            <Field label="Background">
              <Segmented name="Background" value={v.background} options={BACKGROUND_OPTIONS} onChange={(x) => set("background", x)} />
            </Field>
            <Field label="Button style">
              <Segmented name="Button style" value={v.button_style} options={BUTTON_OPTIONS} onChange={(x) => set("button_style", x)} />
            </Field>
          </div>
        </section>

        <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-line bg-mist/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-[15px] font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create profile" : "Save changes"}
          </button>
          <button type="button" onClick={() => router.push("/admin/customers")} className="rounded-xl px-4 py-3 text-[15px] font-semibold text-slate-600 hover:bg-white">
            Cancel
          </button>
        </div>
      </div>

      {/* Live preview */}
      <aside className="hidden xl:block">
        <div className="sticky top-6">
          <p className="mb-3 text-sm font-semibold text-slate-600">Live preview</p>
          <div className="h-[680px] w-[340px] overflow-y-auto overflow-x-hidden rounded-[38px] border-[9px] border-ink bg-white shadow-xl">
            <ProfileCard profile={previewProfile} preview />
          </div>
        </div>
      </aside>
    </form>
  );
}
