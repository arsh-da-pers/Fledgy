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

export type Mail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

// The one place that talks to Resend. Returns true only on a confirmed send,
// so callers can log honestly, but NEVER throws: an email must not fail the
// request a person is waiting on.
export async function sendEmail(mail: Mail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[fledgy:mail] (no RESEND_API_KEY)", mail.to, mail.subject);
    return false;
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
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        ...(mail.html ? { html: mail.html } : {}),
        // Replies go to a human, not into the void.
        ...(mail.replyTo ? { reply_to: [mail.replyTo] } : {}),
      }),
    });
    if (!res.ok) {
      console.error("[fledgy:mail] send failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[fledgy:mail] send threw", err);
    return false;
  }
}

export async function sendNotification(subject: string, body: string) {
  await sendEmail({
    to: process.env.NOTIFY_TO || DEFAULT_TO,
    subject,
    text: body,
  });
}
