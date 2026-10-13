"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Facebook, MessageCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Profile } from "@/lib/types";
import { facebookHref, messengerHref } from "@/lib/links";

type MenuItem = { id: string; name: string; price: number; description: string; imageUrl: string };
type Props = { profile: Profile; menuItems: MenuItem[] };
const money = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 }).format(value);

export function OrderPageClient({ profile, menuItems }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState("Pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [neededDate, setNeededDate] = useState("");
  const [neededTime, setNeededTime] = useState("");
  const [message, setMessage] = useState("");
  const chosen = useMemo(() => menuItems.filter((item) => (quantities[item.id] || 0) > 0), [menuItems, quantities]);
  const total = chosen.reduce((sum, item) => sum + item.price * quantities[item.id], 0);
  const contactLink = profile.messenger ? messengerHref(profile.messenger) : profile.facebook ? facebookHref(profile.facebook) : "";
  const facebookLink = profile.facebook ? facebookHref(profile.facebook) : contactLink;

  function buildOrder() {
    return [
      `Hello ${profile.business_name || profile.company || profile.full_name}! I'd like to place an order:`,
      "",
      ...chosen.map((item) => `${quantities[item.id]} × ${item.name} — ${money(item.price * quantities[item.id])}`),
      "",
      `Estimated total: ${money(total)}`,
      `Customer: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Needed date: ${neededDate || "Not specified"}`,
      `Needed time: ${neededTime || "Not specified"}`,
      `Fulfillment: ${fulfillment}`,
      ...(fulfillment === "Delivery" && address.trim() ? [`Delivery address: ${address.trim()}`] : []),
      ...(notes.trim() ? [`Notes: ${notes.trim()}`] : []),
      "",
      "Please confirm availability, delivery fee, and final total. Thank you!",
    ].join("\n");
  }

  async function sendOrder() {
    setMessage("");
    if (!chosen.length) { setMessage("Please select at least one menu item."); return; }
    if (!name.trim() || !phone.trim()) { setMessage("Please enter your name and phone number."); return; }
    if (fulfillment === "Delivery" && !address.trim()) { setMessage("Please enter your delivery address."); return; }
    if (!contactLink) { setMessage("The business has not added a Messenger or Facebook contact yet. Please use the contact details on its card."); return; }
    const orderText = buildOrder();
    // Open synchronously from the button click so mobile browsers are less likely to block it.
    window.open(contactLink, "_blank", "noopener,noreferrer");
    try {
      await navigator.clipboard.writeText(orderText);
      setMessage("Your order details were copied. Paste them into the Messenger/Facebook chat that just opened, then send.");
    } catch {
      setMessage("Messenger opened. Copy the order summary below and paste it into the chat.");
    }
  }

  return (
    <main className="min-h-[100dvh] bg-slate-50 px-4 py-6 text-slate-900 sm:py-10">
      <div className="mx-auto max-w-xl">
        <a href={`/c/${profile.profile_id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Back to business card</a>
        <header className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="bg-slate-900 px-6 py-7 text-white">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><ShoppingBag className="h-6 w-6" /></div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">Online menu</p>
            <h1 className="mt-1 text-3xl font-bold">{profile.business_name || profile.company || profile.full_name}</h1>
            <p className="mt-2 text-sm text-white/75">Choose your items and prepare your order for Messenger.</p>
          </div>
          <div className="space-y-3 p-4 sm:p-6">
            {menuItems.length ? menuItems.map((item) => {
              const qty = quantities[item.id] || 0;
              return <article key={item.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-3 rounded-2xl border border-slate-200 p-3 sm:flex sm:items-center sm:gap-3 sm:p-4">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl object-cover sm:h-24 sm:w-24" /> : <div className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl bg-slate-100 sm:h-24 sm:w-24" />}
                <div className="min-w-0 sm:flex-1">
                  <h2 className="font-bold leading-snug">{item.name}</h2>
                  {item.description && <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.description}</p>}
                  <p className="mt-2 font-semibold">{money(item.price)}</p>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-3 sm:col-span-1 sm:ml-auto sm:shrink-0">
                  <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => setQuantities((old) => ({ ...old, [item.id]: Math.max(0, (old[item.id] || 0) - 1) }))} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 disabled:opacity-40" disabled={!qty}><Minus className="h-4 w-4" /></button>
                  <span className="w-5 text-center text-sm font-bold tabular-nums">{qty}</span>
                  <button type="button" aria-label={`Add one ${item.name}`} onClick={() => setQuantities((old) => ({ ...old, [item.id]: (old[item.id] || 0) + 1 }))} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white"><Plus className="h-4 w-4" /></button>
                </div>
              </article>;
            }) : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">The menu hasn't been configured yet. Please contact the business directly.</p>}
          </div>
        </header>

        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4"><h2 className="text-xl font-bold">Your order</h2><span className="text-sm text-slate-500">{chosen.reduce((n, item) => n + quantities[item.id], 0)} item(s)</span></div>
          {chosen.length ? <div className="space-y-2 py-4">{chosen.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{quantities[item.id]} × {item.name}</span><span className="font-semibold tabular-nums">{money(item.price * quantities[item.id])}</span></div>)}<div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold"><span>Estimated total</span><span>{money(total)}</span></div><p className="text-xs leading-relaxed text-slate-500">Final price, stock, delivery fees, and payment details must be confirmed by the business.</p></div> : <p className="py-4 text-sm text-slate-500">Choose items from the menu above to get started.</p>}
          <form className="mt-2 space-y-4" onSubmit={(e) => { e.preventDefault(); void sendOrder(); }}>
            <div><label htmlFor="order-name" className="mb-1.5 block text-sm font-semibold">Your name *</label><input id="order-name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3.5 py-3 outline-none focus:border-slate-700" placeholder="Full name" /></div>
            <div><label htmlFor="order-phone" className="mb-1.5 block text-sm font-semibold">Phone number *</label><input id="order-phone" required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3.5 py-3 outline-none focus:border-slate-700" placeholder="09xx xxx xxxx" /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="order-date" className="mb-1.5 block text-sm font-semibold">When do you need it?</label><input id="order-date" type="date" required min={new Date().toISOString().slice(0,10)} value={neededDate} onChange={(e)=>setNeededDate(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3.5 py-3" /></div><div><label htmlFor="order-time" className="mb-1.5 block text-sm font-semibold">Preferred time</label><input id="order-time" type="time" required value={neededTime} onChange={(e)=>setNeededTime(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3.5 py-3" /></div></div>
            <div><label htmlFor="order-fulfillment" className="mb-1.5 block text-sm font-semibold">Pickup or delivery?</label><select id="order-fulfillment" value={fulfillment} onChange={(e) => setFulfillment(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3"><option>Pickup</option><option>Delivery</option></select></div>
            {fulfillment === "Delivery" && <div><label htmlFor="order-address" className="mb-1.5 block text-sm font-semibold">Delivery address *</label><textarea id="order-address" required rows={2} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3.5 py-3 outline-none focus:border-slate-700" placeholder="Complete delivery address" /></div>}
            <div><label htmlFor="order-notes" className="mb-1.5 block text-sm font-semibold">Notes (optional)</label><textarea id="order-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3.5 py-3 outline-none focus:border-slate-700" placeholder="Preferences or special instructions" /></div>
            {message && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">{message}</p>}
            {chosen.length > 0 && <div className="rounded-2xl bg-slate-50 p-4 text-sm"><p className="font-bold">Order summary</p><pre className="mt-2 whitespace-pre-wrap break-words font-sans text-slate-600">{buildOrder()}</pre></div>}
            <button type="submit" disabled={!menuItems.length} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"><MessageCircle className="h-5 w-5" /> Send order on Messenger</button>
            {facebookLink && <a href={facebookLink} target="_blank" rel="noreferrer" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-800 hover:bg-slate-50"><Facebook className="h-5 w-5" /> Message on Facebook</a>}
          </form>
        </section>
        <p className="px-4 pb-6 pt-6 text-center text-xs leading-relaxed text-slate-500">Orders are sent to the business through Messenger. Your order is not confirmed until the business replies.</p>
      </div>
    </main>
  );
}
