// Who has paid for what, and how many rewrites they have left.
//
// Backed by the same Vercel KV store as src/lib/usage.ts.
//
// IMPORTANT — this module fails CLOSED, unlike usage.ts. If KV is unreachable
// we report "not entitled" rather than handing out paid work for free. The one
// exception is granting: a grant that can't be written is surfaced as an error
// so the buyer is told to retry rather than silently losing what they paid for.
// Every grant is keyed by its Stripe session id and is idempotent, so a
// retry — or the webhook and the return page racing each other — is safe.

import { kv } from "@vercel/kv";
import { PRODUCTS, grantedBy, type ProductId } from "@/lib/products";

export type Owned = {
  purchasedAt: string;
  stripeSessionId: string;
  /** Rewrites spent. Meaningless for products with iterations: 0. */
  iterationsUsed: number;
};

/** Everything one email owns, keyed by product. */
export type Entitlements = Partial<Record<ProductId, Owned>>;

function entKey(email: string) {
  return `fledgy:ent:${email.trim().toLowerCase()}`;
}

// Marks a Stripe session as applied, so the webhook and the return page can
// both call grantPurchase without double-crediting.
function sessionKey(sessionId: string) {
  return `fledgy:stripe:session:${sessionId}`;
}

// The generated career report, parked so it can be revealed the moment the
// buyer pays — nobody has to retake the quiz after paying.
function reportKey(email: string) {
  return `fledgy:report:${email.trim().toLowerCase()}`;
}

const REPORT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function getEntitlements(email: string): Promise<Entitlements> {
  if (!email) return {};
  try {
    return (await kv.get<Entitlements>(entKey(email))) ?? {};
  } catch (err) {
    // Fail closed: no KV, no paid access.
    console.error("[fledgy:ent] KV unavailable, denying entitlements:", err);
    return {};
  }
}

export async function hasProduct(email: string, product: ProductId): Promise<boolean> {
  const owned = await getEntitlements(email);
  return Boolean(owned[product]);
}

/**
 * Grants access after a confirmed Stripe payment. A bundle fans out into the
 * products it grants. Idempotent per Stripe session id.
 *
 * Throws if KV can't be written, so the caller can tell the buyer to retry.
 */
export async function grantPurchase(
  email: string,
  purchased: ProductId,
  stripeSessionId: string
): Promise<Entitlements> {
  const alreadyApplied = await kv.get(sessionKey(stripeSessionId));
  const current = (await kv.get<Entitlements>(entKey(email))) ?? {};

  if (alreadyApplied) return current;

  const next: Entitlements = { ...current };

  for (const id of grantedBy(purchased)) {
    next[id] = {
      purchasedAt: new Date().toISOString(),
      stripeSessionId,
      // A repeat purchase of the same product tops the rewrites back up.
      iterationsUsed: 0,
    };
  }

  await kv.set(entKey(email), next);
  await kv.set(sessionKey(stripeSessionId), email);
  return next;
}

export type IterationCheck =
  | { allowed: true; used: number; remaining: number }
  | { allowed: false; reason: "not_entitled" | "exhausted"; remaining: number };

/**
 * Spends one rewrite. Call only when about to actually generate — it records
 * the use immediately, and refundIteration puts it back if generation fails.
 */
export async function consumeIteration(
  email: string,
  product: ProductId
): Promise<IterationCheck> {
  const owned = await getEntitlements(email);
  const entry = owned[product];

  if (!entry) return { allowed: false, reason: "not_entitled", remaining: 0 };

  const limit = PRODUCTS[product].iterations;
  if (entry.iterationsUsed >= limit) {
    return { allowed: false, reason: "exhausted", remaining: 0 };
  }

  const used = entry.iterationsUsed + 1;
  try {
    await kv.set(entKey(email), {
      ...owned,
      [product]: { ...entry, iterationsUsed: used },
    });
  } catch (err) {
    console.error("[fledgy:ent] could not record iteration:", err);
    return { allowed: false, reason: "not_entitled", remaining: 0 };
  }

  return { allowed: true, used, remaining: Math.max(0, limit - used) };
}

/**
 * Hands a spent rewrite back when generation failed after it was recorded — a
 * buyer should never lose one to our error.
 */
export async function refundIteration(email: string, product: ProductId): Promise<void> {
  try {
    const owned = await getEntitlements(email);
    const entry = owned[product];
    if (!entry || entry.iterationsUsed <= 0) return;
    await kv.set(entKey(email), {
      ...owned,
      [product]: { ...entry, iterationsUsed: entry.iterationsUsed - 1 },
    });
  } catch (err) {
    console.error("[fledgy:ent] could not refund iteration:", err);
  }
}

/** Rewrites left, for display. */
export async function iterationsRemaining(
  email: string,
  product: ProductId
): Promise<number> {
  const owned = await getEntitlements(email);
  const entry = owned[product];
  if (!entry) return 0;
  return Math.max(0, PRODUCTS[product].iterations - entry.iterationsUsed);
}

// --- The parked career report -------------------------------------------

export type StoredReport = {
  careers: { title: string; why: string }[];
  next_steps: string[];
  createdAt: string;
};

export async function saveReport(
  email: string,
  report: Omit<StoredReport, "createdAt">
): Promise<void> {
  try {
    await kv.set(
      reportKey(email),
      { ...report, createdAt: new Date().toISOString() },
      { ex: REPORT_TTL_SECONDS }
    );
  } catch (err) {
    // Non-fatal: they can always retake the quiz.
    console.error("[fledgy:report] could not park report:", err);
  }
}

export async function getReport(email: string): Promise<StoredReport | null> {
  try {
    return (await kv.get<StoredReport>(reportKey(email))) ?? null;
  } catch (err) {
    console.error("[fledgy:report] could not read parked report:", err);
    return null;
  }
}
