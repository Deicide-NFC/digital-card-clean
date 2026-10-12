import {
  ChevronRight,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Music2,
  Phone,
  PhoneCall,
  Send,
  ShoppingBag,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { Profile } from "@/lib/types";
import { profileThemeStyle } from "@/lib/theme";
import { initials } from "@/lib/utils";
import {
  displayWebsite,
  mailHref,
  mapsHref,
  smsHref,
  socialLinks,
  telHref,
  websiteHref,
  type SocialKey,
} from "@/lib/links";
import { BRAND_NAME, TAGLINE } from "@/lib/brand";
import { TrackedLink } from "./TrackedLink";

const SOCIAL_ICONS: Record<SocialKey, LucideIcon> = {
  whatsapp: MessageCircle,
  messenger: Send,
  viber: PhoneCall,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Music2,
  linkedin: Linkedin,
};

const GRID: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" };

const rise = (i: number) => ({ "--i": i } as CSSProperties);

export function ProfileCard({ profile: p, preview = false }: { profile: Profile; preview?: boolean }) {
  const themeClass = p.theme === "dark" ? "pf-dark" : p.theme === "auto" ? "pf-auto" : "";
  const designClass = `pf-design-${p.design_theme || "classic"}`;

  const quick = [
    p.phone && { key: "call", label: "Call", href: telHref(p.phone), Icon: Phone, event: "phone" as const },
    p.phone && { key: "text", label: "Text", href: smsHref(p.phone), Icon: MessageSquare, event: "message" as const },
    p.email && { key: "email", label: "Email", href: mailHref(p.email), Icon: Mail, event: "email" as const },
  ].filter(Boolean) as Array<{ key: string; label: string; href: string; Icon: LucideIcon; event: "phone" | "message" | "email" }>;

  const socials = socialLinks(p);
  const map = mapsHref(p);
  const hasLocation = !!(p.address || p.business_hours || map);

  return (
    <main
      className={`pf pf-bg-${p.background} ${themeClass} ${designClass} min-h-[100dvh]`}
      style={profileThemeStyle(p)}
    >
      <div className="mx-auto max-w-md pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        {/* Cover + avatar */}
        <header className="pf-rise relative" style={rise(0)}>
          <div className="pf-cover relative h-36 rounded-b-[28px]">
            {p.company_logo && (
              <div className="absolute left-5 right-5 top-4 flex h-[96px] items-center justify-center rounded-2xl bg-transparent px-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.company_logo}
                  alt={p.company ? `${p.company} logo` : "Company logo"}
                  className="h-full w-full object-contain object-center"
                />
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-5 z-10 translate-y-1/2">
            {p.profile_photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.profile_photo}
                alt={p.full_name}
                width={112}
                height={112}
                className="h-28 w-28 rounded-full border-4 border-pf-bg bg-pf-surface object-cover shadow-md"
              />
            ) : (
              <div
                aria-label={p.full_name}
                className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-pf-bg bg-pf-accent font-display text-4xl font-bold text-pf-on-accent shadow-md"
              >
                {initials(p.full_name)}
              </div>
            )}
          </div>
        </header>

        {/* Identity */}
        <section className="pf-rise px-5 pt-16" style={rise(1)}>
          <h1 className="font-display text-[30px] font-bold leading-[1.08] tracking-tight text-pf-text">
            {p.profile_type === "business" ? (p.business_name || p.company || p.full_name) : p.full_name}
          </h1>
          {p.profile_type === "business" ? (
            <>
              {p.company && p.company !== (p.business_name || p.company) && <p className="mt-1 text-[16px] font-semibold text-pf-text">{p.company}</p>}
              {p.full_name && p.full_name !== (p.business_name || p.company) && <p className="mt-1.5 text-[15px] text-pf-muted">Contact: {p.full_name}{p.job_title ? ` · ${p.job_title}` : ""}</p>}
            </>
          ) : (
            <>
              {p.job_title && <p className="mt-1.5 text-[17px] text-pf-muted">{p.job_title}</p>}
              {p.company && <p className="text-[17px] font-semibold text-pf-text">{p.company}</p>}
            </>
          )}
        </section>

        {/* Primary action */}
        <section className="pf-rise px-5 pt-5" style={rise(2)}>
          {p.profile_type === "business" && p.menu_items?.trim() && (
            <a
              href={preview ? "#" : `/c/${p.profile_id}/order`}
              onClick={preview ? (e) => e.preventDefault() : undefined}
              className="pf-press mb-3 flex h-14 w-full items-center justify-center gap-2.5 border border-pf-line bg-pf-surface text-[17px] font-bold text-pf-text shadow-sm"
              style={{ borderRadius: "var(--btn-r)" }}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden />
              Order Now
              <ChevronRight className="h-4 w-4" aria-hidden />
            </a>
          )}
          <a
            href={preview ? "#" : `/c/${p.profile_id}/vcard`}
            className="pf-press flex h-14 w-full items-center justify-center gap-2.5 bg-pf-accent text-[17px] font-bold text-pf-on-accent shadow-lg"
            style={{ borderRadius: "var(--btn-r)", boxShadow: "0 10px 24px -10px var(--accent)" }}
          >
            <UserPlus className="h-5 w-5" aria-hidden />
            Save contact
          </a>

          {quick.length > 0 && (
            <div className={`mt-3 grid gap-3 ${GRID[quick.length]}`}>
              {quick.map(({ key, label, href, Icon, event }) => (
                <TrackedLink
                  key={key}
                  href={href}
                  profileId={p.profile_id}
                  event={event}
                  preview={preview}
                  className="pf-press flex flex-col items-center gap-2 border border-pf-line bg-pf-surface py-4 text-[15px] font-semibold text-pf-text"
                  style={{ borderRadius: "var(--tile-r)" }}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pf-soft text-pf-fg">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  {label}
                </TrackedLink>
              ))}
            </div>
          )}
        </section>

        {/* About */}
        {p.bio && (
          <section className="pf-rise px-5 pt-7" style={rise(3)} aria-label="About">
            <h2 className="font-display text-lg font-semibold text-pf-text">About</h2>
            <p className="mt-2 whitespace-pre-line text-[16px] leading-relaxed text-pf-muted">{p.bio}</p>
          </section>
        )}

        {/* Links */}
        {(p.website || socials.length > 0) && (
          <section className="pf-rise px-5 pt-7" style={rise(4)} aria-label="Links">
            <h2 className="font-display text-lg font-semibold text-pf-text">Connect</h2>
            <ul className="mt-3 space-y-3">
              {p.website && (
                <li>
                  <LinkRow
                    href={websiteHref(p.website)}
                    event="website"
                    profileId={p.profile_id}
                    preview={preview}
                    Icon={Globe}
                    label="Website"
                    sub={displayWebsite(p.website)}
                  />
                </li>
              )}
              {socials.map((s) => (
                <li key={s.key}>
                  <LinkRow
                    href={s.href}
                    event={s.event}
                    profileId={p.profile_id}
                    preview={preview}
                    Icon={SOCIAL_ICONS[s.key]}
                    label={s.label}
                    sub={s.handle}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Location + hours */}
        {hasLocation && (
          <section className="pf-rise px-5 pt-7" style={rise(5)} aria-label="Location and hours">
            <div
              className="space-y-5 border border-pf-line bg-pf-surface p-5"
              style={{ borderRadius: "var(--tile-r)" }}
            >
              {(p.address || map) && (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-pf-fg" aria-hidden />
                  <div className="min-w-0 flex-1">
                    {p.address && <p className="whitespace-pre-line text-[16px] text-pf-text">{p.address}</p>}
                    {map && (
                      <TrackedLink
                        href={map}
                        event="map"
                        profileId={p.profile_id}
                        preview={preview}
                        className="mt-2 inline-flex items-center gap-1 text-[15px] font-semibold text-pf-fg underline underline-offset-4"
                      >
                        Open in Maps
                      </TrackedLink>
                    )}
                  </div>
                </div>
              )}
              {p.business_hours && (
                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-pf-fg" aria-hidden />
                  <p className="whitespace-pre-line text-[16px] text-pf-text">{p.business_hours}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {p.profile_type === "business" && [
          { question: p.faq1_question, answer: p.faq1_answer },
          { question: p.faq2_question, answer: p.faq2_answer },
          { question: p.faq3_question, answer: p.faq3_answer },
        ].some((item) => item.question?.trim() && item.answer?.trim()) && (
          <section className="pf-rise px-5 pt-7" style={rise(6)} aria-label="Frequently asked questions">
            <h2 className="mb-3 text-lg font-bold text-pf-text">Frequently asked questions</h2>
            <div className="space-y-2">
              {[
                { question: p.faq1_question, answer: p.faq1_answer },
                { question: p.faq2_question, answer: p.faq2_answer },
                { question: p.faq3_question, answer: p.faq3_answer },
              ].filter((item) => item.question?.trim() && item.answer?.trim()).map((item, index) => (
                <details key={index} className="border border-pf-line bg-pf-surface p-4" style={{ borderRadius: "var(--tile-r)" }}>
                  <summary className="cursor-pointer font-semibold text-pf-text">{item.question}</summary>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-pf-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <footer className="pf-rise px-5 pt-10 text-center text-[13px] text-pf-muted" style={rise(6)}>
          <p className="font-semibold">{TAGLINE}</p>
          <p className="mt-0.5 opacity-80">{BRAND_NAME}</p>
        </footer>
      </div>
    </main>
  );
}

function LinkRow({
  href,
  event,
  profileId,
  preview,
  Icon,
  label,
  sub,
}: {
  href: string;
  event: "website" | "social" | "message";
  profileId: string;
  preview: boolean;
  Icon: LucideIcon;
  label: string;
  sub: string;
}) {
  return (
    <TrackedLink
      href={href}
      event={event}
      profileId={profileId}
      preview={preview}
      className="pf-press flex min-h-[64px] items-center gap-4 border border-pf-line bg-pf-surface px-4 py-3"
      style={{ borderRadius: "var(--btn-r)" }}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pf-soft text-pf-fg">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold text-pf-text">{label}</span>
        <span className="block truncate text-[14px] text-pf-muted">{sub}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-pf-muted" aria-hidden />
    </TrackedLink>
  );
}
