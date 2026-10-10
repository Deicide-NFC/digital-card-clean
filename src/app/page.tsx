import Link from "next/link";
import { BRAND_NAME, TAGLINE } from "@/lib/brand";
import { LogoMark } from "@/components/admin/LogoMark";

export default function Home() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-ink text-white">
      <div
        aria-hidden
        className="absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full opacity-60"
        style={{
          background:
            "repeating-radial-gradient(circle at center, rgba(255,255,255,.14) 0 1.5px, transparent 1.5px 34px)",
        }}
      />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-3xl flex-col justify-between px-6 py-10">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <span className="font-display text-lg font-semibold">{BRAND_NAME}</span>
        </div>

        <div className="py-16">
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
            {TAGLINE}
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/70">
            A business card that updates itself. Change a phone number or job title once, and every
            card already in someone&apos;s wallet shows the new details.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/c/charles01"
              className="rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark"
            >
              See a sample card
            </Link>
          </div>
        </div>

        <footer className="text-sm text-white/50">
          <Link href="/admin" className="hover:text-white">
            Admin sign in
          </Link>
        </footer>
      </div>
    </main>
  );
}
