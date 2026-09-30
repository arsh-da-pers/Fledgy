// Paced one-off re-engagement send to people who used Fledgy before the
// mentors launch and the homepage rebuild.
//
// WHY IT DRIPS. fledgy.guide only started sending on 2026-09-30. A brand-new
// sending domain that suddenly pushes a hundred messages in one go is the
// textbook spam signature — Gmail and Outlook throttle or junk it, and that
// reputation is shared with hello@ and arshkiran@, so a bad blast would damage
// the real business mailboxes and the placement-cell outreach with them.
// A small daily batch, ramping slowly, is the whole game.

import { getAllLeads } from "@/lib/leads";
import { sendWhatsNew } from "@/lib/autoReply";

export const DAILY_BATCH = 25;

export type BackfillResult = {
  considered: number;
  sent: number;
  skipped: number;
  remaining: number;
};

/**
 * Sends to at most `limit` people who have not had this mail yet.
 *
 * Idempotent by construction: sendWhatsNew() takes a permanent KV claim per
 * address, so re-running this — or running it twice in a day — cannot mail
 * anyone twice. Unsubscribes are honoured there too, and that check fails
 * closed.
 */
export async function runBackfill(limit = DAILY_BATCH): Promise<BackfillResult> {
  const leads = await getAllLeads();

  // Most-engaged first: people who used more than one tool are likeliest to
  // open, and early engagement is exactly what builds sending reputation.
  const ordered = [...leads].sort(
    (a, b) => (b.tools?.length ?? 0) - (a.tools?.length ?? 0)
  );

  let sent = 0;
  let skipped = 0;
  let considered = 0;

  for (const lead of ordered) {
    if (sent >= limit) break;
    considered++;
    const ok = await sendWhatsNew(lead.email, lead.name);
    if (ok) sent++;
    else skipped++;
  }

  return {
    considered,
    sent,
    skipped,
    remaining: Math.max(0, ordered.length - considered),
  };
}
