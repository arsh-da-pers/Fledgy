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

export const FREE_LIMIT = 2;

export type UsageCheck =
  | { allowed: true; count: number; remaining: number }
  | { allowed: false; count: number };

function usageKey(email: string) {
  return `fledgy:usage:${email.trim().toLowerCase()}`;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Atomically checks the free-use cap for this email and, if there's room,
// records a use. Call this right before doing the (costly) AI call.
export async function checkAndRecordUsage(email: string): Promise<UsageCheck> {
  try {
    const key = usageKey(email);
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
