"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

type CardDesign = {
  plan: "personal" | "business";
  fullName: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
  primaryColor: string;
  backgroundColor: string;
};

const prices = { personal: 99, business: 149 } as const;

export default function CardOrderBuilder() {
  const [design, setDesign] = useState<CardDesign>({
    plan: "personal",
    fullName: "",
    title: "",
    company: "",
    phone: "",
    email: "",
    website: "",
    facebook: "",
    instagram: "",
    primaryColor: "#b99a56",
    backgroundColor: "#111111",
  });
  const [paymentReference, setPaymentReference] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const price = prices[design.plan];
  const qrImage = process.env.NEXT_PUBLIC_QRPH_IMAGE_URL;
  const merchantName = process.env.NEXT_PUBLIC_QRPH_MERCHANT_NAME || "MariBank";
  const instructions = process.env.NEXT_PUBLIC_QRPH_INSTRUCTIONS ||
    "Scan using your supported bank or e-wallet app. Confirm the recipient and amount before paying.";

  const update = (key: keyof CardDesign, value: string) =>
    setDesign((current) => ({ ...current, [key]: value }));

  const safeDesign = useMemo(() => ({
    ...design,
    fullName: design.fullName.trim(),
    title: design.title.trim(),
    company: design.company.trim(),
  }), [design]);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch("/api/card-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: design.plan,
          price,
          customerEmail: customerEmail.trim(),
          paymentReference: paymentReference.trim(),
          design: safeDesign,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't submit your order. Please try again.");
      setMessage(`Order submitted successfully. Your order number is ${result.orderNumber}. Payment is pending manual verification.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const fieldClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-700";
  const labelClass = "mb-1 block text-sm font-semibold text-slate-700";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">NFC Digital Card</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Design your card</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Customize the details and colors, preview your card, then submit your order for manual payment verification.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <form onSubmit={submitOrder} className="space-y-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <section>
              <h2 className="text-lg font-bold">1. Choose your plan</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(["personal", "business"] as const).map((plan) => (
                  <button key={plan} type="button" onClick={() => update("plan", plan)} className={`rounded-2xl border p-4 text-left ${design.plan === plan ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" : "border-slate-200"}`}>
                    <span className="block font-bold capitalize">{plan} ID</span>
                    <span className="mt-1 block text-2xl font-extrabold">₱{prices[plan]}</span>
                    <span className="mt-1 block text-xs text-slate-500">{plan === "personal" ? "For individual contact details" : "For business details and company identity"}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold">2. Card details</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div><label className={labelClass}>Full name *</label><input required maxLength={100} className={fieldClass} value={design.fullName} onChange={(e) => update("fullName", e.target.value)} /></div>
                <div><label className={labelClass}>Job title</label><input maxLength={100} className={fieldClass} value={design.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Dentist" /></div>
                {design.plan === "business" && <div className="sm:col-span-2"><label className={labelClass}>Business / company name *</label><input required maxLength={120} className={fieldClass} value={design.company} onChange={(e) => update("company", e.target.value)} /></div>}
                <div><label className={labelClass}>Phone</label><input type="tel" maxLength={40} className={fieldClass} value={design.phone} onChange={(e) => update("phone", e.target.value)} /></div>
                <div><label className={labelClass}>Email</label><input type="email" maxLength={254} className={fieldClass} value={design.email} onChange={(e) => update("email", e.target.value)} /></div>
                <div><label className={labelClass}>Website</label><input type="url" maxLength={500} className={fieldClass} value={design.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" /></div>
                <div><label className={labelClass}>Facebook URL</label><input type="url" maxLength={500} className={fieldClass} value={design.facebook} onChange={(e) => update("facebook", e.target.value)} placeholder="https://" /></div>
                <div><label className={labelClass}>Instagram URL</label><input type="url" maxLength={500} className={fieldClass} value={design.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="https://" /></div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold">3. Colors</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><span className="text-sm font-medium">Accent color</span><input aria-label="Accent color" type="color" value={design.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent" /></label>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><span className="text-sm font-medium">Card background</span><input aria-label="Card background" type="color" value={design.backgroundColor} onChange={(e) => update("backgroundColor", e.target.value)} className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent" /></label>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold">4. Payment</h2>
              <p className="mt-1 text-sm text-slate-600">Amount due: <strong>₱{price.toFixed(2)}</strong>. Please verify the recipient name in your banking app before paying.</p>
              {qrImage ? <div className="mt-3 flex flex-col items-center rounded-2xl border border-slate-200 p-4"><img src={qrImage} alt="QR Ph payment QR code" className="max-h-64 w-auto max-w-full object-contain" /><p className="mt-2 text-sm font-semibold">{merchantName}</p></div> : <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Payment QR is not configured yet. The site administrator must set NEXT_PUBLIC_QRPH_IMAGE_URL in Vercel before accepting live orders.</div>}
              <p className="mt-3 text-sm text-slate-600">{instructions}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><label className={labelClass}>Payment reference number *</label><input required maxLength={120} className={fieldClass} value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} /></div>
                <div><label className={labelClass}>Your email for order updates *</label><input required type="email" maxLength={254} className={fieldClass} value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} /></div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">Submitting this form does not automatically confirm payment. Your order will remain pending until the administrator verifies the payment reference.</p>
            </section>

            <button disabled={busy} type="submit" className="w-full rounded-xl bg-slate-900 px-5 py-3.5 font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Submitting…" : `Submit order · ₱${price}`}</button>
            {message && <p role="status" className="rounded-xl bg-slate-100 p-3 text-sm font-medium">{message}</p>}
          </form>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Live preview</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">{design.plan} ID</span></div>
              <div className="mx-auto mt-5 aspect-[1.586/1] w-full max-w-md overflow-hidden rounded-2xl p-5 shadow-xl" style={{ background: design.backgroundColor, color: "#ffffff", border: `2px solid ${design.primaryColor}` }}>
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[.2em]" style={{ color: design.primaryColor }}>NFC DIGITAL CARD</span><span className="h-3 w-3 rounded-full" style={{ background: design.primaryColor }} /></div>
                  <div><p className="break-words text-xl font-extrabold sm:text-2xl">{design.fullName || "Your name"}</p><p className="mt-1 text-sm text-white/75">{design.title || "Your title"}</p>{design.plan === "business" && <p className="mt-1 text-sm font-semibold" style={{ color: design.primaryColor }}>{design.company || "Your business"}</p>}</div>
                  <div className="space-y-1 text-xs text-white/75">{design.phone && <p>{design.phone}</p>}{design.email && <p className="break-all">{design.email}</p>}{design.website && <p className="break-all">{design.website}</p>}<p className="pt-1 text-[9px] font-bold tracking-widest" style={{ color: design.primaryColor }}>TAP · SCAN · CONNECT</p></div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between text-sm"><span className="text-slate-600">Card price</span><strong>₱{price.toFixed(2)}</strong></div><div className="mt-2 flex items-center justify-between text-sm"><span className="text-slate-600">Payment status</span><span className="font-semibold text-amber-700">Pending verification</span></div></div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">This is a visual concept preview. Profile photos, logo uploads, additional themes, business menus, FAQs, and a private one-hour trial are not included in this first integration stage.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
