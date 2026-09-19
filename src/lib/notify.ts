// Emails Fledgy when something needs a human — right now, a mentor enquiry.
//
// Written against Resend's REST API with plain fetch, because this project has
// no local Node and can't add an npm dependency (see the repo notes). It is
// INERT until RESEND_API_KEY is set in Vercel; without it the enquiry is still
// recorded in KV and visible on /leads-dashboard, it just doesn't ping an
// inbox. Never throws: a failed notification must not fail the request that a
// student is waiting on.
//
// To turn it on:
//   1. Create a Resend account and verify fledgy.guide as a sending domain.
//   2. Add RESEND_API_KEY to the Vercel project (Production + Preview).
//   3. Optionally set NOTIFY_FROM (default "Fledgy <hello@fledgy.guide>") and
//      NOTIFY_TO (default arshkiran@fledgy.guide).

const DEFAULT_FROM = "Fledgy <hello@fledgy.guide>";
const DEFAULT_TO = "arshkiran@fledgy.guide";

export async function sendNotification(subject: string, body: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No mailer configured — the log line is the notification.
    console.log("[fledgy:notify] (no RESEND_API_KEY)", subject, body);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || DEFAULT_FROM,
        to: [process.env.NOTIFY_TO || DEFAULT_TO],
        subject,
        text: body,
      }),
    });
    if (!res.ok) {
      console.error("[fledgy:notify] send failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("[fledgy:notify] send threw", err);
  }
}
