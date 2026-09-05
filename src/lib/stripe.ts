// Minimal Stripe client, written against Stripe's REST API with fetch.
//
// WHY NO `stripe` NPM PACKAGE: this repo ships a package-lock.json and Vercel
// installs with `npm ci`, which fails the build if package.json and the lock
// disagree. Adding the SDK means regenerating the lock, which needs a local
// npm install. Stripe's REST API is plain form-encoded HTTP and webhook
// signatures are a documented HMAC, so both are short to do directly and this
// keeps the dependency tree (and the build) exactly as it is.
//
// ENVIRONMENT VARIABLES (set these in Vercel → Settings → Environment
// Variables — never commit them):
//   STRIPE_SECRET_KEY     sk_live_… (or sk_test_… while testing)
//   STRIPE_WEBHOOK_SECRET whsec_…  (from the webhook endpoint you create)

import crypto from "crypto";

const STRIPE_API = "https://api.stripe.com/v1";

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function secretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return key;
}

/**
 * Flattens a nested object into Stripe's bracketed form-encoding, e.g.
 * { line_items: [{ quantity: 1 }] } -> "line_items[0][quantity]=1"
 */
function toFormBody(obj: Record<string, unknown>, prefix = ""): string[] {
  const parts: string[] = [];

  for (const [rawKey, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const key = prefix ? `${prefix}[${rawKey}]` : rawKey;

    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (item !== null && typeof item === "object") {
          parts.push(...toFormBody(item as Record<string, unknown>, `${key}[${i}]`));
        } else {
          parts.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof value === "object") {
      parts.push(...toFormBody(value as Record<string, unknown>, key));
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  return parts;
}

async function stripeRequest<T>(
  path: string,
  method: "GET" | "POST",
  params?: Record<string, unknown>
): Promise<T> {
  const isGet = method === "GET";
  const body = params ? toFormBody(params).join("&") : undefined;

  const res = await fetch(`${STRIPE_API}${path}${isGet && body ? `?${body}` : ""}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      // Pin the API version so a future Stripe release can't change the shapes
      // this code reads.
      "Stripe-Version": "2024-06-20",
    },
    body: isGet ? undefined : body,
    cache: "no-store",
  });

  const json = await res.json();

  if (!res.ok) {
    const message = json?.error?.message || `Stripe request failed (${res.status})`;
    throw new Error(message);
  }

  return json as T;
}

export type CheckoutSession = {
  id: string;
  url: string | null;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  status: "open" | "complete" | "expired";
  customer_email: string | null;
  customer_details: { email: string | null } | null;
  metadata: Record<string, string> | null;
  amount_total: number | null;
};

export async function createCheckoutSession(opts: {
  email: string;
  productId: string;
  productName: string;
  productDescription: string;
  amountCents: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>("/checkout/sessions", "POST", {
    mode: "payment",
    customer_email: opts.email,
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    // Lets you run a founding-cohort discount code without a code change.
    allow_promotion_codes: true,
    client_reference_id: opts.email.trim().toLowerCase(),
    metadata: {
      email: opts.email.trim().toLowerCase(),
      product: opts.productId,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: opts.currency,
          unit_amount: opts.amountCents,
          product_data: {
            name: opts.productName,
            description: opts.productDescription,
          },
        },
      },
    ],
  });
}

export async function retrieveCheckoutSession(id: string): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>(
    `/checkout/sessions/${encodeURIComponent(id)}`,
    "GET"
  );
}

/**
 * Verifies a Stripe webhook signature.
 *
 * The header looks like `t=1699999999,v1=abc123,v1=def456`. Stripe signs
 * `${timestamp}.${rawBody}` with HMAC-SHA256 using the endpoint secret, so the
 * raw request body must be passed through untouched — never re-serialised JSON.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = 300
): boolean {
  if (!signatureHeader || !secret) return false;

  let timestamp = "";
  const signatures: string[] = [];

  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key?.trim() === "t") timestamp = value?.trim() ?? "";
    if (key?.trim() === "v1" && value) signatures.push(value.trim());
  }

  if (!timestamp || signatures.length === 0) return false;

  // Reject replays of an old, previously-valid payload.
  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (!Number.isFinite(age) || Math.abs(age) > toleranceSeconds) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");

  return signatures.some((sig) => {
    const sigBuf = Buffer.from(sig, "utf8");
    // timingSafeEqual throws on a length mismatch, so guard first.
    if (sigBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  });
}
