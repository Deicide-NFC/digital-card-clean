import Link from "next/link";
import { BRAND_NAME, TAGLINE } from "@/lib/brand";
import { LogoMark } from "@/components/admin/LogoMark";

export default function Home() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-ink text-white">
      {/* Quiet gold atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-44 h-[560px] w-[560px] rounded-full opacity-40"
        style={{
          background:
            "repeating-radial-gradient(circle at center, rgba(201,164,92,.22) 0 1.5px, transparent 1.5px 34px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-[38rem] h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(201,164,92,.45), transparent 68%)" }}
      />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link href="/" className="flex items-center gap-3" aria-label={`${BRAND_NAME} home`}>
            <LogoMark className="h-10 w-10" />
            <span className="font-display text-sm font-semibold tracking-[0.18em] sm:text-base">
              {BRAND_NAME}
            </span>
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-[#c9a45c]/70 hover:text-[#e5c783]"
          >
            Admin sign in
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-14 md:grid-cols-[1.08fr_.92fr] md:gap-16 md:py-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c9a45c]/35 bg-[#c9a45c]/[0.07] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e5c783] sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9a45c]" />
              The next generation business card
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[#f8f3e8] sm:text-6xl lg:text-7xl">
              {TAGLINE || "Make every introduction memorable."}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
              One elegant tap. Your contact details, social links, and business information—all
              together in a digital card designed to make a lasting impression.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/order"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#c9a45c] px-6 py-3 text-sm font-bold text-[#17140e] shadow-[0_8px_30px_rgba(201,164,92,.15)] transition hover:-translate-y-0.5 hover:bg-[#e0bd76] focus:outline-none focus:ring-2 focus:ring-[#e5c783] focus:ring-offset-2 focus:ring-offset-ink"
              >
                Design Your Card
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/c/charles01"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-[#c9a45c]/60 hover:text-[#e5c783]"
              >
                Explore a Sample Card
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/45">
              <span className="inline-flex items-center gap-2">
                <span className="text-[#e5c783]">✦</span> Personal ID <strong className="font-semibold text-white/80">₱99</strong>
              </span>
              <span className="hidden h-4 w-px bg-white/15 sm:block" />
              <span className="inline-flex items-center gap-2">
                <span className="text-[#e5c783]">✦</span> Business ID <strong className="font-semibold text-white/80">₱149</strong>
              </span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="mb-3 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
              <span>Digital identity, elevated</span>
              <span className="text-[#e5c783]">Tap · Scan · Connect</span>
            </div>
            <div className="rounded-[2rem] border border-[#c9a45c]/45 bg-gradient-to-br from-[#27241e] via-[#15161d] to-[#0e1017] p-5 shadow-[0_25px_90px_rgba(0,0,0,.4)] sm:p-7">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c9a45c]/45 bg-[#c9a45c]/10">
                    <LogoMark className="h-9 w-9" />
                  </div>
                  <span className="rounded-full border border-[#c9a45c]/30 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#e5c783]">
                    NFC Ready
                  </span>
                </div>
                <div className="mt-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c9a45c]">
                    Your digital card
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#f8f3e8] sm:text-3xl">
                    Your Name
                  </h2>
                  <p className="mt-1 text-sm text-white/55">Your Title · Your Business</p>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {[
                    { label: "Phone", icon: "☎" },
                    { label: "Email", icon: "✉" },
                    { label: "Socials", icon: "↗" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-2 py-3"
                    >
                      <span className="text-lg text-[#e5c783]" aria-hidden="true">{item.icon}</span>
                      <span className="text-[11px] text-white/65">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    NFC Digital Card
                  </span>
                  <span className="text-xs tracking-[0.2em] text-[#e5c783]">✦ ✦ ✦</span>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-white/40">
                A refined first impression, wherever you go.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 border-t border-white/10 py-6 sm:grid-cols-3 sm:py-8">
          {[
            {
              title: "Tap to connect",
              description: "Let people open your digital profile with an NFC card or QR code.",
              icon: "⌁",
            },
            {
              title: "Make it yours",
              description: "Choose a style and personalize the details that represent you.",
              icon: "✧",
            },
            {
              title: "One card, many details",
              description: "Keep your contact information, socials, and business details together.",
              icon: "◈",
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-white/[0.09] bg-white/[0.025] p-4 sm:p-5">
              <span className="text-xl text-[#c9a45c]" aria-hidden="true">{feature.icon}</span>
              <h3 className="mt-3 text-sm font-semibold text-white/90">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-white/50">{feature.description}</p>
            </div>
          ))}
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {BRAND_NAME}. Designed to connect.</span>
          <span>Personal ID ₱99 · Business ID ₱149</span>
        </footer>
      </div>
    </main>
  );
}
