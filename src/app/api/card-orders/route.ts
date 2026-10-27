import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 500;
const ASSET_BUCKET = "profile-assets";
const MAX_IMAGE_BYTES = 1_500_000;

function text(value: unknown, max = MAX_TEXT): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function color(value: unknown, fallback: string): string {
  const valueText = text(value, 7);
  return /^#[0-9a-fA-F]{6}$/.test(valueText) ? valueText : fallback;
}

async function saveImage(
  db: ReturnType<typeof createAdminClient>,
  value: unknown,
  path: string,
): Promise<{ url?: string; error?: string }> {
  if (typeof value !== "string" || !value) return {};
  const match = value.match(/^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return { error: "One of the uploaded images is invalid. Please upload the image again." };
  const mime = match[1];
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
    return { error: "An image is too large after optimization. Please choose a smaller image." };
  }
  const extension = mime === "image/webp" ? "webp" : mime === "image/png" ? "png" : "jpg";
  const objectPath = `${path}.${extension}`;
  const { error } = await db.storage.from(ASSET_BUCKET).upload(objectPath, bytes, {
    contentType: mime,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) return { error: `Could not save an uploaded image: ${error.message}` };
  return { url: db.storage.from(ASSET_BUCKET).getPublicUrl(objectPath).data.publicUrl };
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

  const orderNumber = `NFC-${Date.now().toString(36).toUpperCase()}`;
  try {
    const supabase = createAdminClient();
    const profilePhoto = await saveImage(supabase, design?.profilePhoto, `order-assets/${orderNumber}/profile-photo`);
    if (profilePhoto.error) return NextResponse.json({ error: profilePhoto.error }, { status: 400 });
    const companyLogo = await saveImage(supabase, design?.companyLogo, `order-assets/${orderNumber}/company-logo`);
    if (companyLogo.error) return NextResponse.json({ error: companyLogo.error }, { status: 400 });

    const rawProducts = Array.isArray(design?.products) ? design.products.slice(0, 20) : [];
    const products: Array<Record<string, unknown>> = [];
    for (let i = 0; i < rawProducts.length; i++) {
      const item = rawProducts[i];
      if (!item || typeof item !== "object") continue;
      const product = item as Record<string, unknown>;
      const name = text(product.name, 100);
      if (!name) continue;
      const image = await saveImage(supabase, product.image, `order-assets/${orderNumber}/product-${i + 1}`);
      if (image.error) return NextResponse.json({ error: image.error }, { status: 400 });
      products.push({
        name,
        description: text(product.description, 500),
        price: text(product.price, 40),
        imageUrl: image.url ?? "",
      });
    }

    const cleanDesign = {
      plan,
      fullName,
      title: text(design?.title, 100),
      company,
      businessName: text(design?.businessName, 120),
      bio: text(design?.bio, 1000),
      phone: text(design?.phone, 40),
      email: text(design?.email, 254),
      website: text(design?.website, 500),
      facebook: text(design?.facebook, 500),
      instagram: text(design?.instagram, 500),
      tiktok: text(design?.tiktok, 500),
      linkedin: text(design?.linkedin, 500),
      messenger: text(design?.messenger, 500),
      whatsapp: text(design?.whatsapp, 500),
      viber: text(design?.viber, 100),
      address: text(design?.address, 500),
      mapsUrl: text(design?.mapsUrl, 500),
      googleReviewUrl: text(design?.googleReviewUrl, 500),
      businessHours: text(design?.businessHours, 1000),
      faq1Question: text(design?.faq1Question, 300),
      faq1Answer: text(design?.faq1Answer, 1000),
      faq2Question: text(design?.faq2Question, 300),
      faq2Answer: text(design?.faq2Answer, 1000),
      faq3Question: text(design?.faq3Question, 300),
      faq3Answer: text(design?.faq3Answer, 1000),
      designTheme: text(design?.designTheme, 60),
      theme: text(design?.theme, 40),
      buttonStyle: text(design?.buttonStyle, 40),
      background: text(design?.background, 40),
      primaryColor: color(design?.primaryColor, "#b99a56"),
      profilePhoto: profilePhoto.url ?? "",
      companyLogo: companyLogo.url ?? "",
      products,
    };

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
