// Lead collection, backed by the same Vercel KV store used for usage limits.
//
// - Tool users (essay/CV/careers) are tracked by two key families we can scan:
//   `fledgy:tools:<email>` (written by recordToolUse) and the usage-cap keys.
//   The usage key changed shape in the Sept 2026 relaunch, from
//   `fledgy:usage:<email>` to `fledgy:usage:<tool>:<email>`, so we take the
//   email as the part after the LAST colon — that reads both shapes.
// - Waitlist signups (e.g. Mentors) are added to the `fledgy:leads` set and get
//   a detail hash at `fledgy:lead:<email>` (source, role, name, expertise).
//
// Fails open (returns what it can) so it never breaks a request.

import { kv } from "@vercel/kv";

const LEADS_SET = "fledgy:leads";
const USAGE_PREFIX = "fledgy:usage:";
const TOOLS_PREFIX = "fledgy:tools:";
const leadHash = (email: string) => `fledgy:lead:${email.trim().toLowerCase()}`;
const toolsKey = (email: string) => `fledgy:tools:${email.trim().toLowerCase()}`;
const seenKey = (email: string) => `fledgy:leadseen:${email.trim().toLowerCase()}`;

export type LeadDetails = {
  source?: string; // e.g. "mentors"
  role?: string; // "seeker" | "mentor"
  name?: string;
  expertise?: string;
};

export type Lead = {
  email: string;
  tools?: string[];
  firstSeen?: string; // ISO timestamp of first contact (recorded from Aug 2026 on)
} & LeadDetails;

// Stamps the first time we ever see an email. `nx: true` means it only writes
// once, so the value stays the earliest contact date. Best-effort.
async function stampFirstSeen(email: string) {
  try {
    await kv.set(seenKey(email), new Date().toISOString(), { nx: true });
  } catch (err) {
    console.error("[fledgy:leads] could not stamp first-seen:", err);
  }
}

// Records which tool an email used (essay | cv | careers). Best-effort.
export async function recordToolUse(email: string, tool: string) {
  try {
    await kv.sadd(toolsKey(email), tool);
    await stampFirstSeen(email);
  } catch (err) {
    console.error("[fledgy:leads] could not record tool use:", err);
  }
}

export async function recordLead(email: string, details: LeadDetails = {}) {
  const e = email.trim().toLowerCase();
  try {
    await kv.sadd(LEADS_SET, e);
    await stampFirstSeen(e);
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
  // Emails live at the end of both key families. Anything without an "@" is a
  // key shape we don't recognise, so it's skipped rather than shown as a lead.
  const addFromKey = (k: string) => {
    const email = String(k).split(":").pop()?.trim().toLowerCase();
    if (email && email.includes("@")) emails.add(email);
  };

  try {
    const keys = await kv.keys(`${TOOLS_PREFIX}*`);
    (keys || []).forEach(addFromKey);
  } catch (err) {
    console.error("[fledgy:leads] tools scan failed:", err);
  }
  try {
    const keys = await kv.keys(`${USAGE_PREFIX}*`);
    (keys || []).forEach(addFromKey);
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
    let firstSeen: string | undefined;
    try {
      firstSeen = (await kv.get<string>(seenKey(email))) || undefined;
    } catch {
      /* no first-seen stamp for this email yet */
    }
    leads.push({
      email,
      source: details.source || "tool",
      ...details,
      tools: tools.sort(),
      firstSeen,
    });
  }
  return leads;
}
