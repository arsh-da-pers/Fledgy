// Lead collection, backed by the same Vercel KV store used for usage limits.
//
// - Tool users (essay/CV/careers) are already tracked as `fledgy:usage:<email>`
//   keys by the usage cap, so we recover their emails from those.
// - Waitlist signups (e.g. Mentors) are added to the `fledgy:leads` set and get
//   a detail hash at `fledgy:lead:<email>` (source, role, name, expertise).
//
// Fails open (returns what it can) so it never breaks a request.

import { kv } from "@vercel/kv";

const LEADS_SET = "fledgy:leads";
const USAGE_PREFIX = "fledgy:usage:";
const leadHash = (email: string) => `fledgy:lead:${email.trim().toLowerCase()}`;
const toolsKey = (email: string) => `fledgy:tools:${email.trim().toLowerCase()}`;

export type LeadDetails = {
  source?: string; // e.g. "mentors"
  role?: string; // "seeker" | "mentor"
  name?: string;
  expertise?: string;
};

export type Lead = { email: string; tools?: string[] } & LeadDetails;

// Records which tool an email used (essay | cv | careers). Best-effort.
export async function recordToolUse(email: string, tool: string) {
  try {
    await kv.sadd(toolsKey(email), tool);
  } catch (err) {
    console.error("[fledgy:leads] could not record tool use:", err);
  }
}

export async function recordLead(email: string, details: LeadDetails = {}) {
  const e = email.trim().toLowerCase();
  try {
    await kv.sadd(LEADS_SET, e);
    const record: Record<string, string> = {};
    if (details.source) record.source = details.source;
    if (details.role) record.role = details.role;
    if (details.name) record.name = details.name;
    if (details.expertise) record.expertise = details.expertise;
    if (Object.keys(record).length > 0) {
      await kv.hset(leadHash(e), record);
    }
  } catch (err) {
    console.error("[fledgy:leads] could not record lead:", err);
  }
}

export async function getAllLeads(): Promise<Lead[]> {
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

  const sorted = Array.from(emails).sort();
  const leads: Lead[] = [];
  for (const email of sorted) {
    let details: LeadDetails = {};
    try {
      const h = await kv.hgetall<Record<string, string>>(leadHash(email));
      if (h) details = h;
    } catch {
      /* no detail hash for this email — likely a tool-only user */
    }
    let tools: string[] = [];
    try {
      tools = (await kv.smembers<string[]>(toolsKey(email))) || [];
    } catch {
      /* no tool record yet */
    }
    leads.push({
      email,
      source: details.source || "tool",
      ...details,
      tools: tools.sort(),
    });
  }
  return leads;
}
