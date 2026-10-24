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

export default async function OrdersPage() {
  const db = createAdminClient();
  const { data, error } = await db.from("card_orders").select("*").order("created_at", { ascending: false }).limit(200);
  const orders = (data ?? []) as CardOrder[];

  const pendingPayments = orders.filter(o => o.payment_status === "pending").length;
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Orders</h1>
          <p className="mt-1 text-slate-600">Review customer orders and manually verify payments.</p>
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
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-slate-600">No orders have been submitted yet.</div>
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
      <p className="mt-4 text-xs text-slate-500">Showing up to 200 most recent orders. Always verify payment in your MariBank account before marking an order as verified.</p>
    </div>
  );
}
