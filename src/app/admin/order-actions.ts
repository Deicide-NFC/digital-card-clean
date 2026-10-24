"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const PAYMENT_STATUSES = ["pending", "verified", "rejected"] as const;
const ORDER_STATUSES = ["pending", "in_production", "completed", "cancelled"] as const;

export async function updateCardOrderAction(formData: FormData): Promise<void> {
  if (!(await getAdminUser())) throw new Error("You are not signed in as an administrator.");

  const id = formData.get("id");
  const paymentStatus = formData.get("payment_status");
  const orderStatus = formData.get("order_status");

  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id)) {
    throw new Error("Invalid order ID.");
  }
  if (typeof paymentStatus !== "string" || !PAYMENT_STATUSES.includes(paymentStatus as typeof PAYMENT_STATUSES[number])) {
    throw new Error("Invalid payment status.");
  }
  if (typeof orderStatus !== "string" || !ORDER_STATUSES.includes(orderStatus as typeof ORDER_STATUSES[number])) {
    throw new Error("Invalid order status.");
  }

  const db = createAdminClient();
  const { error } = await db.from("card_orders").update({
    payment_status: paymentStatus,
    order_status: orderStatus,
  }).eq("id", id);

  if (error) throw new Error(`Could not update order: ${error.message}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
