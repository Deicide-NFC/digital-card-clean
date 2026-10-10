import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl font-bold">We couldn&apos;t find that card</h1>
      <p className="mt-3 text-slate-600">
        The link may have a typo, or the card was never created. Check the address and try again.
      </p>
      <Link href="/" className="mt-8 rounded-xl bg-ink px-5 py-3 font-semibold text-white">
        Go to home page
      </Link>
    </main>
  );
}
