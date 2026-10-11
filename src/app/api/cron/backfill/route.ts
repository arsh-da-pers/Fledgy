import { NextRequest, NextResponse } from "next/server";
import { runBackfill, DAILY_BATCH } from "@/lib/backfill";

export const runtime = "nodejs";
// Sending is sequential and network-bound; the default 10s is not enough for
// a batch of 25.
export const maxDuration = 300;

// Daily drip of the one-off re-engagement mail. Scheduled by vercel.json.
//
// GUARDED, because an open endpoint that sends email is an open endpoint that
// sends email on someone else's behalf. Vercel Cron attaches
// `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set on the project;
// without that env var this route refuses to run at all rather than sitting
// there unauthenticated.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[fledgy:backfill] CRON_SECRET is not set — refusing to run");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runBackfill(DAILY_BATCH);
    console.log("[fledgy:backfill]", JSON.stringify(result));
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[fledgy:backfill] run failed", err);
    return NextResponse.json({ error: "Run failed" }, { status: 500 });
  }
}
