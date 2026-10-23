"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { BACKGROUND_OPTIONS, BUTTON_OPTIONS, COLOR_PRESETS, DESIGN_THEME_OPTIONS, THEME_OPTIONS } from "@/lib/theme";
import { ProfileCard } from "@/components/profile/ProfileCard";
import type { Profile } from "@/lib/types";

type Plan = "personal" | "business";
type Design = {
  fullName: string; jobTitle: string; company: string; businessName: string; bio: string;
  phone: string; email: string; website: string; facebook: string; instagram: string;
  tiktok: string; linkedin: string; messenger: string; whatsapp: string; viber: string;
  address: string; mapsUrl: string; googleReviewUrl: string; businessHours: string;
  faq1Question: string; faq1Answer: string; faq2Question: string; faq2Answer: string;
  faq3Question: string; faq3Answer: string; theme: string; designTheme: string;
  primaryColor: string; background: string; buttonStyle: string;
};
const prices: Record<Plan, number> = { personal: 99, business: 149 };
const emptyDesign: Design = {
  fullName: "", jobTitle: "", company: "", businessName: "", bio: "", phone: "", email: "",
  website: "", facebook: "", instagram: "", tiktok: "", linkedin: "", messenger: "", whatsapp: "",
  viber: "", address: "", mapsUrl: "", googleReviewUrl: "", businessHours: "", faq1Question: "",
  faq1Answer: "", faq2Question: "", faq2Answer: "", faq3Question: "", faq3Answer: "",
  theme: "light", designTheme: "obsidian-gold", primaryColor: "#c9a646", background: "gradient",
  buttonStyle: "rounded",
};
const input = "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
const label = "mb-1.5 block text-sm font-semibold text-ink";
function Field({ title, value, onChange, placeholder = "", type = "text" }: { title: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <label className="block"><span className={label}>{title}</span><input className={input} type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} /></label>;
}
function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-line bg-white p-5 sm:p-6"><h2 className="font-display text-lg font-semibold text-ink">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}<div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div></section>;
}
function ImageUpload({ title, image, onImage, square = false }: { title: string; image: string; onImage: (value: string) => void; square?: boolean }) {
  const change = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { alert("Please choose a JPG, PNG, or WebP image."); e.target.value = ""; return; }
    if (file.size > 5 * 1024 * 1024) { alert("Please choose an image smaller than 5 MB."); e.target.value = ""; return; }
    const reader = new FileReader(); reader.onload = () => onImage(String(reader.result || "")); reader.readAsDataURL(file);
    e.target.value = "";
  };
  return <div><span className={label}>{title}</span><div className="flex items-center gap-4"><div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-dashed border-line bg-mist ${square ? "rounded-xl" : "rounded-full"}`}>{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <span className="px-2 text-center text-xs text-slate-400">No image</span>}</div><div className="space-y-2"><label className="inline-block cursor-pointer rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold hover:bg-mist">{image ? "Replace image" : "Upload image"}<input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={change} /></label>{image && <button type="button" className="ml-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50" onClick={() => onImage("")}>Remove</button>}<p className="text-xs text-slate-500">JPG, PNG, or WebP; max 5 MB.</p></div></div></div>;
}

export default function CardOrderBuilder() {
  const [plan, setPlan] = useState<Plan>("personal");
  const [d, setD] = useState<Design>(emptyDesign);
  const [photo, setPhoto] = useState("");
  const [logo, setLogo] = useState("");
  const [products, setProducts] = useState<{name:string; description:string; price:string; image:string}[]>([]);
  const [paymentReference, setPaymentReference] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const update = (key: keyof Design, value: string) => setD(old => ({ ...old, [key]: value }));
  const profile = useMemo(() => ({
    id: "preview", profile_id: "preview", profile_type: plan, business_name: d.businessName || d.company || null,
    full_name: d.fullName || "Your name", job_title: d.jobTitle || null, company: d.company || null, bio: d.bio || null,
    profile_photo: photo || null, company_logo: logo || null, phone: d.phone || null, email: d.email || null,
    website: d.website || null, facebook: d.facebook || null, instagram: d.instagram || null, tiktok: d.tiktok || null,
    linkedin: d.linkedin || null, messenger: d.messenger || null, whatsapp: d.whatsapp || null, viber: d.viber || null,
    address: d.address || null, maps_url: d.mapsUrl || null, google_review_url: d.googleReviewUrl || null,
    business_hours: d.businessHours || null,
    menu_items: JSON.stringify(products.filter(p => p.name.trim()).map(p => ({name:p.name,description:p.description,price:p.price,imageUrl:p.image}))),
    faq1_question:d.faq1Question||null, faq1_answer:d.faq1Answer||null, faq2_question:d.faq2Question||null,
    faq2_answer:d.faq2Answer||null, faq3_question:d.faq3Question||null, faq3_answer:d.faq3Answer||null,
    theme: d.theme, design_theme:d.designTheme, primary_color:d.primaryColor, background:d.background,
    button_style:d.buttonStyle, status:"active", created_at:"", updated_at:"",
  } as unknown as Profile), [plan,d,photo,logo,products]);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setMessage("");
    if (!d.fullName.trim() || !customerEmail.includes("@") || !paymentReference.trim()) { setMessage("Please enter your full name, order email, and payment reference."); return; }
    if (plan === "business" && !(d.businessName.trim() || d.company.trim())) { setMessage("Please enter your business or company name."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/card-orders", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({
        plan, customerEmail, paymentReference,
        design: { fullName:d.fullName, title:d.jobTitle, company:d.company || d.businessName, phone:d.phone, email:d.email,
          website:d.website, facebook:d.facebook, instagram:d.instagram, tiktok:d.tiktok, linkedin:d.linkedin,
          messenger:d.messenger, whatsapp:d.whatsapp, viber:d.viber, bio:d.bio, address:d.address, mapsUrl:d.mapsUrl,
          businessHours:d.businessHours, faq1Question:d.faq1Question, faq1Answer:d.faq1Answer, faq2Question:d.faq2Question,
          faq2Answer:d.faq2Answer, faq3Question:d.faq3Question, faq3Answer:d.faq3Answer,
          designTheme:d.designTheme, theme:d.theme, buttonStyle:d.buttonStyle, background:d.background,
          primaryColor:d.primaryColor, products
        }
      })});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit order.");
      setMessage(`Order submitted: ${data.orderNumber}. Your payment is pending manual verification.`);
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not submit order."); }
    finally { setSubmitting(false); }
  };
  const textField = (title: string, key: keyof Design, placeholder = "", type = "text") => <Field title={title} value={d[key]} onChange={v => update(key,v)} placeholder={placeholder} type={type} />;
  return <main className="min-h-screen bg-mist text-ink"><header className="border-b border-line bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6"><div className="font-display text-lg font-bold tracking-wide">NFC DIGITAL CARD</div><span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Order builder</span></div></header>
  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Made for you</p><h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Design your card</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">Customize your details, photos, links, and theme. The preview updates as you edit.</p></div>
  <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]"><form onSubmit={submit} className="space-y-5">
    <Section title="1. Choose your plan" description="Choose the card type that fits you."><div className="sm:col-span-2 grid grid-cols-2 gap-3">{(["personal","business"] as Plan[]).map(p => <button key={p} type="button" onClick={()=>setPlan(p)} className={`rounded-2xl border p-4 text-left transition ${plan===p?"border-brand bg-brand-soft ring-2 ring-brand/15":"border-line hover:bg-mist"}`}><span className="block font-semibold capitalize">{p} ID</span><span className="mt-1 block text-2xl font-extrabold">₱{prices[p]}</span><span className="mt-1 block text-xs text-slate-500">{p==="personal"?"For personal contact details":"For business identity and information"}</span></button>)}</div></Section>
    <Section title="2. Profile images" description="Add a profile photo and, for businesses, a company logo."><ImageUpload title="Profile photo" image={photo} onImage={setPhoto}/>{plan==="business" && <ImageUpload title="Company logo" image={logo} onImage={setLogo} square/>}</Section>
    <Section title="3. Card details" description="These details appear on your digital card.">{textField("Full name *","fullName","Your full name")}{textField("Job title","jobTitle","e.g. Dentist")}{textField("Company","company","Company name")}{plan==="business" && textField("Business name *","businessName","Business name")}<div className="sm:col-span-2"><label className="block"><span className={label}>Short bio</span><textarea className={input} rows={3} value={d.bio} onChange={e=>update("bio",e.target.value)} placeholder="A short introduction"/></label></div>{textField("Phone","phone","+63...","tel")}{textField("Email on card","email","name@example.com","email")}{textField("Website","website","https://...")}</Section>
    <Section title="4. Social and contact buttons" description="Only links you fill in will appear on the preview.">{textField("Facebook URL","facebook","https://facebook.com/...")}{textField("Instagram URL","instagram","https://instagram.com/...")}{textField("Messenger link","messenger","https://m.me/...")}{textField("TikTok URL","tiktok","https://tiktok.com/@...")}{textField("LinkedIn URL","linkedin","https://linkedin.com/in/...")}{textField("WhatsApp number or link","whatsapp","+63... or https://wa.me/...")}{textField("Viber number or link","viber","+63... or Viber link")}</Section>
    <Section title="5. Themes and appearance" description="These are the same theme options available in the admin editor."><div className="sm:col-span-2"><span className={label}>Design theme</span><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{DESIGN_THEME_OPTIONS.map(o=><button type="button" key={o.value} onClick={()=>update("designTheme",o.value)} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${d.designTheme===o.value?"border-brand bg-brand-soft text-brand":"border-line hover:bg-mist"}`}>{o.label}</button>)}</div></div><div className="sm:col-span-2"><span className={label}>Accent color</span><div className="flex flex-wrap gap-2">{COLOR_PRESETS.map(c=><button type="button" aria-label={`Set accent ${c}`} key={c} onClick={()=>update("primaryColor",c)} className={`h-9 w-9 rounded-full border-2 ${d.primaryColor===c?"border-ink ring-2 ring-brand/20":"border-white"}`} style={{backgroundColor:c}}/>)}<input aria-label="Custom accent color" type="color" value={d.primaryColor} onChange={e=>update("primaryColor",e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-line"/></div></div><div><span className={label}>Card mode</span><div className="flex flex-wrap gap-2">{THEME_OPTIONS.map(o=><button key={o.value} type="button" onClick={()=>update("theme",o.value)} className={`rounded-lg border px-3 py-2 text-sm ${d.theme===o.value?"border-brand bg-brand-soft":"border-line"}`}>{o.label}</button>)}</div></div><div><span className={label}>Background style</span><div className="flex flex-wrap gap-2">{BACKGROUND_OPTIONS.map(o=><button key={o.value} type="button" onClick={()=>update("background",o.value)} className={`rounded-lg border px-3 py-2 text-sm ${d.background===o.value?"border-brand bg-brand-soft":"border-line"}`}>{o.label}</button>)}</div></div><div className="sm:col-span-2"><span className={label}>Button shape</span><div className="flex flex-wrap gap-2">{BUTTON_OPTIONS.map(o=><button key={o.value} type="button" onClick={()=>update("buttonStyle",o.value)} className={`rounded-lg border px-3 py-2 text-sm ${d.buttonStyle===o.value?"border-brand bg-brand-soft":"border-line"}`}>{o.label}</button>)}</div></div></Section>
    {plan==="business" && <><Section title="6. Business information" description="Optional information shown on a business card.">{textField("Address","address","Business address")}{textField("Map link","mapsUrl","https://maps.google.com/...")}{textField("Google review link","googleReviewUrl","https://...")}<div className="sm:col-span-2"><label className="block"><span className={label}>Business hours</span><textarea className={input} rows={3} value={d.businessHours} onChange={e=>update("businessHours",e.target.value)} placeholder="Mon–Sat, 9 AM–6 PM"/></label></div></Section>
    <Section title="7. Menu / products" description="Add products or services to show in the business preview.">{products.map((p,i)=><div key={i} className="sm:col-span-2 grid gap-3 rounded-xl border border-line p-3 sm:grid-cols-2"><Field title={`Item ${i+1} name`} value={p.name} onChange={v=>setProducts(old=>old.map((x,j)=>i===j?{...x,name:v}:x))} placeholder="Product or service"/><Field title="Price" value={p.price} onChange={v=>setProducts(old=>old.map((x,j)=>i===j?{...x,price:v}:x))} placeholder="₱ price"/><label className="sm:col-span-2 block"><span className={label}>Description</span><textarea className={input} rows={2} value={p.description} onChange={e=>setProducts(old=>old.map((x,j)=>i===j?{...x,description:e.target.value}:x))}/></label><div className="sm:col-span-2"><ImageUpload title="Item photo" image={p.image} onImage={v=>setProducts(old=>old.map((x,j)=>i===j?{...x,image:v}:x))} square/></div><button type="button" className="text-left text-sm font-semibold text-red-600" onClick={()=>setProducts(old=>old.filter((_,j)=>j!==i))}>Remove item</button></div>)}<button type="button" disabled={products.length>=20} onClick={()=>setProducts(old=>[...old,{name:"",description:"",price:"",image:""}])} className="sm:col-span-2 rounded-xl border border-dashed border-line px-4 py-3 text-sm font-bold text-brand disabled:opacity-50">+ Add product or service ({products.length}/20)</button></Section>
    <Section title="8. Frequently asked questions" description="Add up to three questions and answers.">{[1,2,3].map(n=><div key={n} className="sm:col-span-2 grid gap-3 rounded-xl border border-line p-3 sm:grid-cols-2"><Field title={`FAQ ${n} question`} value={d[`faq${n}Question` as keyof Design]} onChange={v=>update(`faq${n}Question` as keyof Design,v)} placeholder="Question"/><Field title="Answer" value={d[`faq${n}Answer` as keyof Design]} onChange={v=>update(`faq${n}Answer` as keyof Design,v)} placeholder="Answer"/></div>)}</Section></>}
    <Section title={`${plan==="business"?"9":"6"}. Payment details`} description={`Amount due: ₱${prices[plan]}. Confirm the recipient name in your bank or e-wallet app before paying.`}><div className="sm:col-span-2 rounded-xl border border-line bg-mist p-4 text-sm text-slate-600">{process.env.NEXT_PUBLIC_QRPH_IMAGE_URL ? <img src={process.env.NEXT_PUBLIC_QRPH_IMAGE_URL} alt="QR payment code" className="mx-auto max-h-64 max-w-full rounded-xl bg-white object-contain"/> : <p>Payment QR is not configured yet. The site administrator must set NEXT_PUBLIC_QRPH_IMAGE_URL in Vercel.</p>}<p className="mt-3 text-center">Scan using your supported bank or e-wallet app. Confirm recipient and amount before paying.</p></div><Field title="Payment reference number *" value={paymentReference} onChange={setPaymentReference} placeholder="Enter your payment reference"/><Field title="Your email for order updates *" value={customerEmail} onChange={setCustomerEmail} placeholder="name@example.com" type="email"/></Section>
    {message && <p role="status" className="rounded-xl border border-line bg-white p-4 text-sm">{message}</p>}
    <button disabled={submitting} type="submit" className="w-full rounded-xl bg-brand px-5 py-4 font-bold text-white hover:bg-brand-dark disabled:opacity-50">{submitting?"Submitting…":`Submit order · ₱${prices[plan]}`}</button>
    <p className="text-xs leading-relaxed text-slate-500">Submitting this form does not automatically confirm payment. Your order remains pending until the administrator verifies the payment reference.</p>
  </form>
  <aside className="space-y-4 lg:sticky lg:top-5"><section className="rounded-2xl border border-line bg-white p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Live preview</h2><span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold capitalize">{plan} ID</span></div><div className="mx-auto max-w-sm"><ProfileCard profile={profile} preview /></div><div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm"><span className="text-slate-500">Card price</span><strong>₱{prices[plan].toFixed(2)}</strong></div><div className="mt-2 flex items-center justify-between text-sm"><span className="text-slate-500">Payment status</span><span className="font-semibold">Pending verification</span></div></section><p className="text-xs leading-relaxed text-slate-500">Images currently preview in this browser only. Secure temporary upload storage, one-hour trial expiry, and admin approval/publishing must be connected before this page is ready for real customer orders.</p></aside></div></div></main>;
}
