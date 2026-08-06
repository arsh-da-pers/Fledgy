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

export const FREE_LIMIT = 1;

export type UsageCheck =
  | { allowed: true; count: number; remaining: number }
  | { allowed: false; count: number };

function usageKey(email: string) {
  return `fledgy:usage:${email.trim().toLowerCase()}`;
}

// Extra free uses earned through referrals, per email.
function bonusKey(email: string) {
  return `fledgy:bonus:${email.trim().toLowerCase()}`;
}

// Marks who referred a given email, so each referred user only credits once.
function referredByKey(email: string) {
  return `fledgy:referredby:${email.trim().toLowerCase()}`;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Atomically checks the free-use cap for this email and, if there's room,
// records a use. The effective limit is FREE_LIMIT plus any referral bonus.
export async function checkAndRecordUsage(email: string): Promise<UsageCheck> {
  try {
    const key = usageKey(email);
    const current = (await kv.get<number>(key)) ?? 0;
    const bonus = (await kv.get<number>(bonusKey(email))) ?? 0;
    const limit = FREE_LIMIT + (Number.isFinite(bonus) ? bonus : 0);

    if (current >= limit) {
      return { allowed: false, count: current };
    }

    const next = await kv.incr(key);
    return { allowed: true, count: next, remaining: Math.max(0, limit - next) };
  } catch (err) {
    console.error("[fledgy:usage] KV not available yet, failing open:", err);
    return { allowed: true, count: 0, remaining: FREE_LIMIT };
  }
}

// Credits a referrer with one extra free use when they bring in a new user.
// Safe to call on every submit: it no-ops on self-referral, invalid input,
// or if this new user was already credited to someone.
export async function creditReferral(referrer: string, newUser: string) {
  try {
    const r = referrer.trim().toLowerCase();
    const u = newUser.trim().toLowerCase();
    if (!r || !u || r === u || !isValidEmail(r) || !isValidEmail(u)) return;

    const already = await kv.get(referredByKey(u));
    if (already) return;

    await kv.set(referredByKey(u), r);
    await kv.incr(bonusKey(r));
  } catch (err) {
    console.error("[fledgy:referral] could not credit referral:", err);
  }
}
