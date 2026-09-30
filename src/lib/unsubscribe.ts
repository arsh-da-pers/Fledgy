// Opt-out for Fledgy's non-essential email.
//
// The tool thank-you is promotional — it cross-sells the other tools and asks
// for a share — and it goes to people in the EU, the UAE and India who gave
// their address to get a score, not to hear from us again. So it carries a
// working unsubscribe, and this is what makes it work.
//
// The token is a random value stored in KV rather than a signature, so no new
// secret has to exist for this to be safe: knowing someone's address is not
// enough to unsubscribe them, and the link in their own email always works.

import { kv } from "@vercel/kv";
import { normaliseEmail } from "@/lib/usage";

const tokenKey = (e: string) => `fledgy:unsub-token:${normaliseEmail(e)}`;
const flagKey = (e: string) => `fledgy:unsub:${normaliseEmail(e)}`;

/** Stable per address: reissuing would break the link in mail already sent. */
export async function unsubscribeToken(email: string): Promise<string | null> {
  try {
    const key = tokenKey(email);
    const existing = await kv.get<string>(key);
    if (existing) return existing;
    const token = crypto.randomUUID().replace(/-/g, "");
    await kv.set(key, token);
    return token;
  } catch (err) {
    console.error("[fledgy:unsub] could not issue token", err);
    return null;
  }
}

export async function isUnsubscribed(email: string): Promise<boolean> {
  try {
    return (await kv.get<string>(flagKey(email))) === "1";
  } catch (err) {
    // Fail CLOSED: if we cannot tell, do not send. Mailing someone who opted
    // out is worse than missing one promotional email.
    console.error("[fledgy:unsub] could not read flag, suppressing send", err);
    return true;
  }
}

export async function applyUnsubscribe(
  email: string,
  token: string
): Promise<boolean> {
  try {
    const expected = await kv.get<string>(tokenKey(email));
    if (!expected || expected !== token) return false;
    await kv.set(flagKey(email), "1");
    return true;
  } catch (err) {
    console.error("[fledgy:unsub] could not apply", err);
    return false;
  }
}

export async function unsubscribeUrl(email: string): Promise<string | null> {
  const token = await unsubscribeToken(email);
  if (!token) return null;
  return `https://fledgy.guide/api/unsubscribe?e=${encodeURIComponent(
    normaliseEmail(email)
  )}&t=${token}`;
}
