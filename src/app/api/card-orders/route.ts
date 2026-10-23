import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 500;

function text(value: unknown, max = MAX_TEXT): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit a valid order form." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid order details." }, { status: 400 });
  }
  const data = body as Record<string, unknown>;
  const plan = data.plan === "business" ? "business" : data.plan === "personal" ? "personal" : null;
  const expectedPrice = plan === "personal" ? 99 : plan === "business" ? 149 : null;
  const customerEmail = text(data.customerEmail, 254);
  const paymentReference = text(data.paymentReference, 120);
  const design = data.design && typeof data.design === "object" ? data.design as Record<string, unknown> : null;
  const fullName = text(design?.fullName, 100);
  const company = text(design?.company, 120);

  if (!plan || !expectedPrice || !customerEmail.includes("@") || !paymentReference || !fullName) {
    return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
  }
  if (plan === "business" && !company) {
    return NextResponse.json({ error: "Business / company name is required for a Business ID." }, { status: 400 });
  }

  // Never trust the price sent by the browser; the server determines the plan price.
  const cleanDesign = {
    plan,
    fullName,
    title: text(design?.title, 100),
    company,
    phone: text(design?.phone, 40),
    email: text(design?.email, 254),
    website: text(design?.website, 500),
    facebook: text(design?.facebook, 500),
    instagram: text(design?.instagram, 500),
    primaryColor: /^#[0-9a-fA-F]{6}$/.test(text(design?.primaryColor, 7)) ? text(design?.primaryColor, 7) : "#b99a56",
    backgroundColor: /^#[0-9a-fA-F]{6}$/.test(text(design?.backgroundColor, 7)) ? text(design?.backgroundColor, 7) : "#111111",
  };

  try {
    const supabase = createAdminClient();
    const orderNumber = `NFC-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from("card_orders").insert({
      order_number: orderNumber,
      plan,
      price_php: expectedPrice,
      customer_email: customerEmail,
      payment_reference: paymentReference,
      design: cleanDesign,
      payment_status: "pending",
      order_status: "pending",
    });
    if (error) {
      console.error("Card order insert failed:", error.message);
      return NextResponse.json({ error: "Order storage is not configured yet. Please contact the administrator." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, orderNumber }, { status: 201 });
  } catch (error) {
    console.error("Card order API error:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Order storage is not configured yet. Please contact the administrator." }, { status: 503 });
  }
}
