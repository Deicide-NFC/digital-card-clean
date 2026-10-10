"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signInAction } from "@/app/admin/actions";
import { LogoMark } from "@/components/admin/LogoMark";
import { BRAND_NAME } from "@/lib/brand";

export default function LoginPage() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    setError(null);
    start(async () => {
      const res = await signInAction(email, password);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <div>
            <p className="font-display text-lg font-bold leading-tight">{BRAND_NAME}</p>
            <p className="text-sm text-slate-500">Administrator sign in</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              autoCapitalize="none"
              className="w-full rounded-xl border border-line px-3.5 py-3 text-[15px] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-line px-3.5 py-3 text-[15px] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-[15px] font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
