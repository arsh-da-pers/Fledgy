// Lightweight, privacy-conscious usage logging.
//
// This intentionally NEVER logs the raw essay/CV text a tester pastes in —
// only aggregate metadata (which tool, what they targeted, the score they
// got). That's enough to see usage volume and score patterns while testing,
// without taking on the responsibility of storing people's personal
// documents.
//
// It always shows up in Vercel's function logs (Project -> Logs) with zero
// setup. If you want it to also land somewhere persistent like a Google
// Sheet, set FEEDBACK_WEBHOOK_URL in your Vercel project's environment
// variables to any endpoint that accepts a POST of JSON (a Google Apps
// Script "Web App" URL works well and is free — ask me if you want the
// script for that). Nothing else needs to change.

type FeedbackEvent = {
  tool: "essay" | "cv" | "cv_generate" | "careers" | "waitlist";
  score?: number;
  verdict?: string;
  [key: string]: unknown;
};

export function logFeedback(event: FeedbackEvent) {
  const payload = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  // Always visible in Vercel's runtime logs, no setup required.
  console.log("[fledgy:feedback]", JSON.stringify(payload));

  // Optional: also forward to a webhook (e.g. a Google Sheet) if configured.
  const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error("[fledgy:feedback] webhook failed", err);
    });
  }
}
