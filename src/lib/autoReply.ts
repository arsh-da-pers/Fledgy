// The confirmation a PERSON gets when they submit something on /mentors.
//
// Distinct from notify.ts's sendNotification, which emails Fledgy. This emails
// the submitter, from hello@fledgy.guide, so nobody is left wondering whether
// their message landed.
//
// TWO RULES THIS FILE MUST KEEP:
//
//  1. NEVER use mentorLabel() here. It always includes the mentor's real name
//     because it is built for the internal email to Arshkiran. In a message to
//     the student it would leak exactly what the anonymous soft launch exists
//     to withhold. Use the mentor's `title` only — which is what
//     `mentorTitle` below is passed.
//
//  2. Everything the submitter typed is escaped before it reaches the HTML.
//     Their name and message are attacker-controlled strings.
//
// Inline styles only, and a hosted PNG for the mark: Gmail strips <style>
// blocks, SVG and base64 images. Web fonts don't survive either, so the stack
// falls back to the system sans rather than pretending Quicksand will load.

import { kv } from "@vercel/kv";
import { sendEmail } from "@/lib/notify";
import { normaliseEmail } from "@/lib/usage";

const REPLY_TO = "hello@fledgy.guide";
const MARK = "https://fledgy.guide/fledgy-mark.png";

const CREAM = "#F7EBDB";
const TEAL = "#1C6B63";
const ORANGE = "#D9603F";
const INK = "#2B1F1A";
const BODY = "#54473F";
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(heading: string, bodyHtml: string): string {
  return `<div style="margin:0;padding:24px 0;background:${CREAM};font-family:${FONT};">
  <div style="max-width:520px;margin:0 auto;padding:0 20px;">
    <div style="padding-bottom:20px;">
      <img src="${MARK}" width="44" height="44" alt="Fledgy"
           style="display:block;border:0;border-radius:50%;" />
    </div>
    <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:${INK};font-weight:700;">
      ${heading}
    </h1>
    ${bodyHtml}
    <hr style="border:0;border-top:1px solid #E4D5C2;margin:28px 0 14px;" />
    <p style="margin:0;font-size:12px;line-height:1.6;color:${BODY};">
      <strong style="color:${TEAL};">Fledgy</strong> — grow your wings.<br />
      <a href="https://fledgy.guide" style="color:${TEAL};">fledgy.guide</a>
      &nbsp;·&nbsp;
      <a href="mailto:${REPLY_TO}" style="color:${TEAL};">${REPLY_TO}</a>
    </p>
  </div>
</div>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:${BODY};">${text}</p>`;
}

type Reply = { subject: string; text: string; html: string };

function inquiry(name: string | undefined, mentorTitle: string, message: string): Reply {
  const hi = name ? `Hi ${name},` : "Hi,";
  return {
    subject: "We've got your session request",
    text: [
      hi,
      "",
      `Thanks for asking about a session with our ${mentorTitle}.`,
      "",
      "A person reads every one of these. Arshkiran will look at what you've written and come back to you to sort out a time — usually within a day or two.",
      "",
      "What you sent us:",
      message,
      "",
      "If you need to add anything, just reply to this email.",
      "",
      "— Fledgy",
      "fledgy.guide",
    ].join("\n"),
    html: shell(
      "We've got your session request",
      [
        p(esc(hi)),
        p(`Thanks for asking about a session with our <strong style="color:${INK};">${esc(mentorTitle)}</strong>.`),
        p(
          "A person reads every one of these. Arshkiran will look at what you've written and come back to you to sort out a time — usually within a day or two."
        ),
        `<div style="margin:18px 0;padding:14px 16px;background:#ffffff;border-left:3px solid ${ORANGE};border-radius:6px;">
           <p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${BODY};font-weight:700;">What you sent us</p>
           <p style="margin:0;font-size:14px;line-height:1.6;color:${INK};white-space:pre-wrap;">${esc(message)}</p>
         </div>`,
        p("If you need to add anything, just reply to this email."),
      ].join("")
    ),
  };
}

function seeker(name: string | undefined): Reply {
  const hi = name ? `Hi ${name},` : "Hi,";
  return {
    subject: "You're on the Fledgy mentor list",
    text: [
      hi,
      "",
      "You're on the list — we'll email you as soon as a mentor opens up in your area.",
      "",
      "In the meantime, all three Fledgy tools are free to start, no card:",
      "  Score your CV      https://fledgy.guide/cv",
      "  Score your essay   https://fledgy.guide/essay",
      "  Find your direction https://fledgy.guide/careers",
      "",
      "— Fledgy",
      "fledgy.guide",
    ].join("\n"),
    html: shell(
      "You're on the list",
      [
        p(esc(hi)),
        p("We'll email you as soon as a mentor opens up in your area."),
        p("In the meantime, all three Fledgy tools are free to start — no card:"),
        `<p style="margin:0 0 12px;font-size:15px;line-height:2;color:${BODY};">
           <a href="https://fledgy.guide/cv" style="color:${TEAL};font-weight:600;">Score your CV</a><br />
           <a href="https://fledgy.guide/essay" style="color:${TEAL};font-weight:600;">Score your essay</a><br />
           <a href="https://fledgy.guide/careers" style="color:${TEAL};font-weight:600;">Find your direction</a>
         </p>`,
      ].join("")
    ),
  };
}

function mentorApplication(name: string | undefined, expertise: string | undefined): Reply {
  const hi = name ? `Hi ${name},` : "Hi,";
  const field = expertise ? ` in ${expertise}` : "";
  return {
    subject: "Thanks for offering to mentor with Fledgy",
    text: [
      hi,
      "",
      `Thanks for offering to mentor${field}. Arshkiran reads every application personally and will be in touch about next steps.`,
      "",
      "If there's anything you'd like to add, just reply to this email.",
      "",
      "— Fledgy",
      "fledgy.guide",
    ].join("\n"),
    html: shell(
      "Thanks for offering to mentor",
      [
        p(esc(hi)),
        p(
          `Thanks for offering to mentor${esc(field)}. Arshkiran reads every application personally and will be in touch about next steps.`
        ),
        p("If there's anything you'd like to add, just reply to this email."),
      ].join("")
    ),
  };
}

export type AutoReplyInput =
  | { role: "inquiry"; to: string; name?: string; mentorTitle: string; message: string }
  | { role: "seeker"; to: string; name?: string }
  | { role: "mentor"; to: string; name?: string; expertise?: string };

// /api/mentors is public and unauthenticated, so without a cap anyone could
// post someone else's address in a loop and have Fledgy email-bomb them — from
// our own domain, which is how a sending reputation gets destroyed. One
// confirmation per address per hour is plenty for a real person submitting
// twice, and takes the bombing value away.
const COOLDOWN_SECONDS = 3600;

async function claimSend(email: string): Promise<boolean> {
  try {
    const key = `fledgy:autoreply:${normaliseEmail(email)}`;
    const ok = await kv.set(key, "1", { nx: true, ex: COOLDOWN_SECONDS });
    return ok === "OK";
  } catch (err) {
    // Fails OPEN, like the usage limits: a KV blip should cost us a duplicate
    // email at worst, not swallow a real person's confirmation.
    console.error("[fledgy:autoreply] cooldown check failed", err);
    return true;
  }
}

// Best-effort by design: the submission is already saved before this runs, so
// a mail outage costs a confirmation email, never the lead.
export async function sendAutoReply(input: AutoReplyInput): Promise<boolean> {
  if (!(await claimSend(input.to))) {
    console.log("[fledgy:autoreply] within cooldown, skipping", input.role);
    return false;
  }

  let reply: Reply;
  if (input.role === "inquiry") {
    reply = inquiry(input.name, input.mentorTitle, input.message);
  } else if (input.role === "mentor") {
    reply = mentorApplication(input.name, input.expertise);
  } else {
    reply = seeker(input.name);
  }

  return sendEmail({
    to: input.to,
    subject: reply.subject,
    text: reply.text,
    html: reply.html,
    replyTo: REPLY_TO,
  });
}
