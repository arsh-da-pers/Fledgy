// Stripe webhook — the authoritative way access is granted.
//
// SETUP (once, in the Stripe dashboard):
//   Developers → Webhooks → Add endpoint
//   URL:    https://fledgy.guide/api/stripe/webhook
//   Events: checkout.session.completed
//   Then copy the signing secret (whsec_…) into STRIPE_WEBHOOK_SECRET in Vercel.
//
// The /unlock page also verifies the session directly with Stripe, so a buyer
// still gets access immediately even before this endpoint is configured.
// Both paths call the same idempotent grant.

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/stripe";
import { grantPurchase } from "@/lib/entitlements";
import { isProductId } from "@/lib/products";

export const runtime = "nodejs";
// The signature is computed over the exact bytes Stripe sent, so this route
// must never sit behind any body parsing or caching.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[fledgy:webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  // Read the body as raw text — re-serialising JSON would break the signature.
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    console.error("[fledgy:webhook] bad signature — rejecting");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    type: string;
    data: { object: Record<string, unknown> };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    // Acknowledge anything else so Stripe stops retrying it.
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as {
    id?: string;
    payment_status?: string;
    metadata?: Record<string, string>;
    customer_email?: string;
    customer_details?: { email?: string };
  };

  const email =
    session.metadata?.email ||
    session.customer_email ||
    session.customer_details?.email ||
    "";

  if (!email || !session.id) {
    console.error("[fledgy:webhook] completed session with no email", session.id);
    return NextResponse.json({ received: true });
  }

  // A completed session can still be unpaid for async methods; only grant on
  // an actual payment.
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const purchased = session.metadata?.product;
  if (!isProductId(purchased)) {
    console.error("[fledgy:webhook] session has no known product", session.id);
    return NextResponse.json({ received: true });
  }

  try {
    await grantPurchase(email, purchased, session.id);
    console.log("[fledgy:webhook] granted", purchased, "to", email);
  } catch (err) {
    // Returning 500 makes Stripe retry, which is what we want if KV was down.
    console.error("[fledgy:webhook] grant failed:", err);
    return NextResponse.json({ error: "Could not record purchase" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
