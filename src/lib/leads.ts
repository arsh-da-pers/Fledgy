// Lead collection, backed by the same Vercel KV store used for usage limits.
//
// - Tool users (essay/CV/careers) are already tracked as `fledgy:usage:<email>`
//   keys by the usage cap, so we can recover their emails from those.
// - Waitlist signups (e.g. Mentors) are added to a `fledgy:leads` set via
//   recordLead(), since they don't hit the usage cap.
//
// Fails open (returns what it can) so it never breaks a request.

import { kv } from "@vercel/kv";

const LEADS_SET = "fledgy:leads";
const USAGE_PREFIX = "fledgy:usage:";

export async function recordLead(email: string) {
  try {
    await kv.sadd(LEADS_SET, email.trim().toLowerCase());
  } catch (err) {
    console.error("[fledgy:leads] could not record lead:", err);
  }
}

export async function getAllLeads(): Promise<string[]> {
  const emails = new Set<string>();
  try {
    const waitlist = await kv.smembers<string[]>(LEADS_SET);
    (waitlist || []).forEach((e) => emails.add(String(e).trim().toLowerCase()));
  } catch (err) {
    console.error("[fledgy:leads] smembers failed:", err);
  }
  try {
    const keys = await kv.keys(`${USAGE_PREFIX}*`);
    (keys || []).forEach((k) =>
      emails.add(k.slice(USAGE_PREFIX.length).trim().toLowerCase())
    );
  } catch (err) {
    console.error("[fledgy:leads] keys scan failed:", err);
  }
  return Array.from(emails).sort();
}
