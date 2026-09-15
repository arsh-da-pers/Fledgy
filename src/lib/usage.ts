// Free-tier usage cap, keyed by email.
//
// Requires a Vercel KV (Redis) store connected to this project — Vercel
// dashboard -> Storage -> Create Database -> KV -> Connect to Project. Once
// connected, Vercel auto-injects the KV_* environment variables and this
// just works, no code changes needed.
//
// Fails OPEN if KV isn't set up yet (usage isn't capped, but the app keeps
// working normally) so this never blocks testing before KV is connected.

import { kv } from "@vercel/kv";

// Free runs PER TOOL, per email.
//
// Two, not one: the second run is usually where someone decides the tool is
// consistent rather than a fluke, and a wall after a single score on a domain
// nobody recognises reads as bait. Two also stops the free tier being used as
// a coaching loop — re-scoring a revised CV over and over to watch the number
// climb — which is what three allowed and what the token bill was paying for.
//
// Not one, also, because an email address costs nothing to invent: a hard
// limit of one is defeated by typing a second address, so it would inconvenience
// honest users far more than anyone determined.
//
// Referrals no longer raise this — they earn a discount instead, which costs
// margin rather than tokens. See the referral section below.
export const FREE_LIMIT = 2;

/** The tools that meter free usage separately. */
export type MeteredTool =
  | "essay"
  | "cv"
  | "careers"
  | "cv_generate"
  | "essay_rewrite";

export type UsageCheck =
  | { allowed: true; count: number; remaining: number }
  | { allowed: false; count: number };

function usageKey(email: string, tool: MeteredTool) {
  return `fledgy:usage:${tool}:${normaliseEmail(email)}`;
}

// Unused referral discounts, per email. (Key name kept as-is so credits
// already earned aren't orphaned.)
function bonusKey(email: string) {
  return `fledgy:bonus:${normaliseEmail(email)}`;
}

// Marks who referred a given email, so each referred user only credits once.
function referredByKey(email: string) {
  return `fledgy:referredby:${normaliseEmail(email)}`;
}

/**
 * Collapses the aliases of one mailbox into a single identity, so the free
 * limit is per PERSON rather than per string.
 *
 * Gmail ignores dots entirely and everything after a "+", so
 * arsh.kiran+2@gmail.com, arshkiran@gmail.com and ArshKiran@gmail.com are one
 * inbox — but were three separate allowances here, which is the easiest way
 * to farm free runs and what the leads dashboard was showing.
 *
 * Deliberately conservative about which trick applies where:
 *  • "+tag" is stripped for every provider — it is a near-universal alias
 *    convention and the base address always still reaches the person.
 *  • dots are stripped ONLY for Gmail, where they provably don't matter.
 *    Elsewhere they do: john.smith@acme.com and johnsmith@acme.com can be two
 *    different colleagues, and merging them would deny a real person their
 *    free runs.
 *
 * The result is always a deliverable address, so leads stay contactable.
 */
export function normaliseEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 1) return trimmed;

  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);

  const plus = local.indexOf("+");
  if (plus > 0) local = local.slice(0, plus);

  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.split(".").join("");
  }

  return local ? `${local}@${domain}` : trimmed;
}

// Throwaway inbox providers. Someone using one is not a lead — the address
// stops working within the hour, so they can never be emailed their report,
// and it is the other half of how a free limit gets farmed.
//
// Deliberately a short list of the big ones rather than an exhaustive one:
// blocklists of this kind go stale, and every entry is a chance to reject a
// real person. Anything not listed is allowed through — normaliseEmail plus
// the free limit handles the rest.
const THROWAWAY_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
  "throwawaymail.com",
  "mohmal.com",
  "emailondeck.com",
]);

export function isThrowawayEmail(email: string): boolean {
  const domain = normaliseEmail(email).split("@")[1];
  return domain ? THROWAWAY_DOMAINS.has(domain) : false;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Atomically checks this email's free-use cap FOR ONE TOOL and, if there's
// room, records a use. The effective limit is FREE_LIMIT plus any referral
// bonus. Each tool has its own allowance.
export async function checkAndRecordUsage(
  email: string,
  tool: MeteredTool
): Promise<UsageCheck> {
  try {
    const key = usageKey(email, tool);
    const current = (await kv.get<number>(key)) ?? 0;

    if (current >= FREE_LIMIT) {
      return { allowed: false, count: current };
    }

    const next = await kv.incr(key);
    return { allowed: true, count: next, remaining: Math.max(0, FREE_LIMIT - next) };
  } catch (err) {
    console.error("[fledgy:usage] KV not available yet, failing open:", err);
    return { allowed: true, count: 0, remaining: FREE_LIMIT };
  }
}

// --- Referrals -------------------------------------------------------------
//
// Two steps, deliberately separated:
//
//   1. recordReferrer() runs when a referred visitor first uses a tool. It
//      only stores WHO referred them. Nothing is paid out here.
//   2. creditReferrerOnPurchase() runs when that person actually BUYS, and
//      that is when the referrer earns their discount.
//
// The split is the whole point. Paying out on signup is farmable — invent
// addresses, collect discounts — so we would be giving away margin for fake
// traffic. Paying out on purchase means a reward is only ever funded by
// revenue it brought in.
//
// This replaced an earlier version that granted an extra FREE USE per
// referral, which handed out exactly the thing the free limit exists to
// ration.

/** Notes who referred a visitor. Idempotent: the first referrer wins, so a
 *  later link can't steal the credit. */
export async function recordReferrer(referrer: string, newUser: string) {
  try {
    const r = normaliseEmail(referrer);
    const u = normaliseEmail(newUser);
    // Compared after normalising, so someone can't refer themselves with a
    // dotted or +tagged variant of their own address.
    if (!r || !u || r === u || !isValidEmail(r) || !isValidEmail(u)) return;

    const already = await kv.get(referredByKey(u));
    if (already) return;

    await kv.set(referredByKey(u), r);
  } catch (err) {
    console.error("[fledgy:referral] could not record referrer:", err);
  }
}

/** Called after a confirmed purchase. Pays the buyer's referrer one
 *  percentage-off credit, once — the flag stops a repeat purchase by the same
 *  person paying out again. */
export async function creditReferrerOnPurchase(buyerEmail: string) {
  try {
    const u = normaliseEmail(buyerEmail);
    if (!u || !isValidEmail(u)) return;

    const referrer = await kv.get<string>(referredByKey(u));
    if (!referrer || referrer === u) return;

    // Has this buyer already paid out for their referrer?
    const paidKey = `fledgy:referralpaid:${u}`;
    if (await kv.get(paidKey)) return;

    await kv.set(paidKey, referrer);
    await kv.incr(bonusKey(referrer));
    console.log("[fledgy:referral] credited", referrer, "for purchase by", u);
  } catch (err) {
    console.error("[fledgy:referral] could not credit referrer:", err);
  }
}

/** How many unused referral discounts this email has earned. */
export async function referralCredits(email: string): Promise<number> {
  try {
    const n = (await kv.get<number>(bonusKey(email))) ?? 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Spends one referral discount. Called only once a discounted purchase has
 *  actually completed, so an abandoned checkout never burns a credit. */
export async function spendReferralCredit(email: string) {
  try {
    const key = bonusKey(email);
    const n = (await kv.get<number>(key)) ?? 0;
    if (n > 0) await kv.set(key, n - 1);
  } catch (err) {
    console.error("[fledgy:referral] could not spend credit:", err);
  }
}
