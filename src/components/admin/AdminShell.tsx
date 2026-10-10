"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, Plus, QrCode, Settings, Smartphone, Users, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { signOutAction } from "@/app/admin/actions";
import { LogoMark } from "./LogoMark";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/customers", label: "Customers", Icon: Users },
  { href: "/admin/qr", label: "QR codes", Icon: QrCode },
  { href: "/admin/nfc", label: "NFC guide", Icon: Smartphone },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminShell({
  email,
  brand,
  children,
}: {
  email: string;
  brand: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await signOutAction();
    router.push("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Admin">
      <Link
        href="/admin/customers/new"
        onClick={() => setOpen(false)}
        className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white hover:bg-brand-dark"
      >
        <Plus className="h-4 w-4" /> Add customer
      </Link>
      {NAV.map(({ href, label, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
              active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </Link>
        );
      })}
      <div className="mt-auto border-t border-white/10 px-1 pb-4 pt-4">
        <p className="truncate px-2 text-xs text-white/50">{email}</p>
        <button
          onClick={signOut}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" /> Sign out
        </button>
      </div>
    </nav>
  );

  const brandRow = (
    <div className="flex items-center gap-3 px-5 py-5">
      <LogoMark />
      <span className="truncate font-display text-base font-semibold text-white">{brand}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-mist lg:flex">
      {/* Desktop sidebar */}
      <aside className="no-print hidden w-64 shrink-0 flex-col bg-ink lg:sticky lg:top-0 lg:flex lg:h-screen">
        {brandRow}
        {nav}
      </aside>

      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <LogoMark className="h-8 w-8" />
          <span className="font-display text-sm font-semibold text-white">{brand}</span>
        </div>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-white">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="no-print fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-ink">
            <div className="flex items-center justify-between pr-3">
              {brandRow}
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-2 text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
