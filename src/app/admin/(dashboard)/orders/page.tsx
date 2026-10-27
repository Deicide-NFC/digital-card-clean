import { createAdminClient } from "@/lib/supabase/admin";
import { updateCardOrderAction } from "@/app/admin/order-actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CardOrder = {
  id: string;
  order_number: string;
  plan: "personal" | "business";
  price_php: number;
  customer_email: string;
  payment_reference: string;
  design: Record<string, unknown> | null;
  payment_status: "pending" | "verified" | "rejected";
  order_status: "pending" | "in_production" | "completed" | "cancelled";
  created_at: string;
};

const selectClass = "rounded-lg border border-line bg-white px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

export default async function OrdersPage({ searchParams }: { searchParams?: { view?: string } }) {
  const db = createAdminClient();
  const { data, error } = await db.from("card_orders").select("*").order("created_at", { ascending: false }).limit(200);
  const allOrders = (data ?? []) as CardOrder[];
  const view = searchParams?.view === "completed" ? "completed" : searchParams?.view === "all" ? "all" : "active";
  const orders = allOrders.filter(order => view === "all" ? true : view === "completed" ? order.order_status === "completed" : order.order_status !== "completed");
  const pendingPayments = allOrders.filter(o => o.payment_status === "pending").length;
  const completedCount = allOrders.filter(o => o.order_status === "completed").length;
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Orders</h1>
          <p className="mt-1 text-slate-600">Review customer orders and manually verify payments. Completed orders stay saved in Supabase.</p>
          <nav className="mt-4 flex flex-wrap gap-2 text-sm">
            {([{ key: "active", label: `Active orders (${allOrders.length - completedCount})` }, { key: "completed", label: `Completed (${completedCount})` }, { key: "all", label: `All orders (${allOrders.length})` }]).map(tab => (
              <a key={tab.key} href={tab.key === "active" ? "/admin/orders" : `/admin/orders?view=${tab.key}`} className={`rounded-lg border px-3 py-2 font-semibold ${view === tab.key ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-slate-600 hover:bg-mist"}`}>{tab.label}</a>
            ))}
          </nav>
        </div>
        <div className="rounded-xl border border-line bg-white px-4 py-3 text-sm">
          <span className="text-slate-500">Awaiting payment review</span>
          <strong className="ml-2 text-lg">{pendingPayments}</strong>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Could not load orders: {error.message}. Check that the card_orders table exists and the Supabase service-role key has access.
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-slate-600">{view === "completed" ? "No completed orders yet." : view === "active" ? "No active orders. Completed orders are in the Completed tab." : "No orders have been submitted yet."}</div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map(order => {
            const design = order.design ?? {};
            const fullName = typeof design.fullName === "string" ? design.fullName : "Name not provided";
            const company = typeof design.company === "string" ? design.company : "";
            return (
              <article key={order.id} className="rounded-2xl border border-line bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <p className="font-display text-lg font-bold">{order.order_number}</p>
                    <p className="mt-1 text-sm text-slate-600">{fullName}{company ? ` · ${company}` : ""}</p>
                    <p className="text-sm text-slate-500">{order.customer_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-bold">₱{order.price_php}</p>
                    <p className="text-sm capitalize text-slate-500">{order.plan} ID</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="grid gap-4 py-4 md:grid-cols-3">
                  <div>
                    <p className={labelClass}>Payment reference</p>
                    <p className="break-all text-sm font-semibold">{order.payment_reference}</p>
                  </div>
                  <div>
                    <p className={labelClass}>Contact details on card</p>
                    <p className="break-all text-sm">{typeof design.phone === "string" ? design.phone : "—"}</p>
                    <p className="break-all text-sm">{typeof design.email === "string" ? design.email : "—"}</p>
                  </div>
                  <div>
                    <p className={labelClass}>Order submitted</p>
                    <p className="text-sm">{new Date(order.created_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" })}</p>
                  </div>
                </div>
                <details className="mb-4 rounded-xl border border-line bg-mist/50 p-4">
                  <summary className="cursor-pointer text-sm font-bold text-brand">View full card details and design</summary>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {([
                      ["Job title", design.title], ["Business name", design.businessName], ["Bio", design.bio],
                      ["Phone", design.phone], ["Card email", design.email], ["Website", design.website],
                      ["Facebook", design.facebook], ["Instagram", design.instagram], ["TikTok", design.tiktok],
                      ["LinkedIn", design.linkedin], ["Messenger", design.messenger], ["WhatsApp", design.whatsapp],
                      ["Viber", design.viber], ["Address", design.address], ["Map link", design.mapsUrl],
                      ["Google review link", design.googleReviewUrl], ["Business hours", design.businessHours],
                      ["Design theme", design.designTheme], ["Card mode", design.theme],
                      ["Background style", design.background], ["Button style", design.buttonStyle],
                      ["Accent color", design.primaryColor],
                      ["FAQ 1 question", design.faq1Question], ["FAQ 1 answer", design.faq1Answer],
                      ["FAQ 2 question", design.faq2Question], ["FAQ 2 answer", design.faq2Answer],
                      ["FAQ 3 question", design.faq3Question], ["FAQ 3 answer", design.faq3Answer],
                    ] as [string, unknown][]).map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <p className={labelClass}>{label}</p>
                        <p className="break-words whitespace-pre-wrap text-sm">{typeof value === "string" && value ? value : "—"}</p>
                      </div>
                    ))}
                    {([ ["Profile photo", design.profilePhoto], ["Company logo", design.companyLogo] ] as [string, unknown][]).map(([label, value]) => (
                      <div key={label}>
                        <p className={labelClass}>{label}</p>
                        {typeof value === "string" && value ? <a href={value} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand underline">Open image</a> : <p className="text-sm text-slate-500">No image uploaded</p>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 border-t border-line pt-4">
                    <h3 className="text-sm font-bold">Products / services</h3>
                    {Array.isArray(design.products) && design.products.length ? (
                      <div className="mt-3 space-y-3">{design.products.map((item, index) => {
                        const product = item && typeof item === "object" ? item as Record<string, unknown> : {};
                        return <div key={index} className="rounded-lg border border-line bg-white p-3">
                          <p className="font-semibold">{typeof product.name === "string" ? product.name : `Item ${index + 1}`}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm">{typeof product.description === "string" && product.description ? product.description : "No description"}</p>
                          <p className="mt-1 text-sm">Price: {typeof product.price === "string" || typeof product.price === "number" ? String(product.price) : "—"}</p>
                          {typeof product.imageUrl === "string" && product.imageUrl ? <a href={product.imageUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-semibold text-brand underline">Open product image</a> : null}
                        </div>;
                      })}</div>
                    ) : <p className="mt-2 text-sm text-slate-500">No products or services submitted.</p>}
                  </div>
                </details>
                <form action={updateCardOrderAction} className="flex flex-wrap items-end gap-3 border-t border-line pt-4">
                  <input type="hidden" name="id" value={order.id} />
                  <div>
                    <label className={labelClass}>Payment status</label>
                    <select name="payment_status" defaultValue={order.payment_status} className={selectClass}>
                      <option value="pending">Pending review</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Order status</label>
                    <select name="order_status" defaultValue={order.order_status} className={selectClass}>
                      <option value="pending">Pending</option>
                      <option value="in_production">In production</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <button className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-dark" type="submit">Save status</button>
                </form>
              </article>
            );
          })}
        </div>
      )}
      <p className="mt-4 text-xs text-slate-500">Showing up to 200 most recent orders for this view. Always verify payment in your MariBank account before marking an order as verified.</p>
    </div>
  );
}
