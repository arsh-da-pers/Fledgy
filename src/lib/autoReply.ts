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
import { INSTAGRAM_URL, LINKEDIN_URL, TOOLS, referralLink } from "@/lib/social";
import type { ToolKey } from "@/lib/social";
import { isUnsubscribed, unsubscribeUrl } from "@/lib/unsubscribe";
import { MENTOR_PRICE } from "@/lib/products";

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

function shell(heading: string, bodyHtml: string, footerHtml = ""): string {
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
    ${footerHtml}
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

// Once per address per TOOL, for three months. A person who tries all three
// tools hears from us three times in total, not once per run — and the free
// limit already caps runs per tool, so this cannot be pumped.
const TOOL_COOLDOWN_SECONDS = 90 * 24 * 3600;

// ttlSeconds of 0 means "claim forever" — used by the one-off campaign, where
// re-running the backfill must never re-mail anyone. Passing ex: 0 to Redis is
// an error, so the option is omitted entirely in that case.
async function claimOnce(key: string, ttlSeconds: number): Promise<boolean> {
  try {
    const ok = await kv.set(
      key,
      "1",
      ttlSeconds > 0 ? { nx: true, ex: ttlSeconds } : { nx: true }
    );
    return ok === "OK";
  } catch (err) {
    // Fails OPEN, like the usage limits: a KV blip should cost us a duplicate
    // email at worst, not swallow a real person's confirmation.
    console.error("[fledgy:autoreply] cooldown check failed", err);
    return true;
  }
}

function claimSend(email: string): Promise<boolean> {
  return claimOnce(`fledgy:autoreply:${normaliseEmail(email)}`, COOLDOWN_SECONDS);
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

// ---------------------------------------------------------------------------
// The thank-you a person gets after using a tool.
//
// This one is PROMOTIONAL — it cross-sells the other tools and asks for a
// share — so unlike the mentor confirmations it honours the unsubscribe list
// and carries an opt-out link. Sending it without one to people in the EU,
// the UAE and India would not be defensible.
// ---------------------------------------------------------------------------

function toolThankYou(
  tool: ToolKey,
  email: string,
  unsubUrl: string | null
): Reply {
  const used = TOOLS[tool];
  const others = (Object.keys(TOOLS) as ToolKey[]).filter((k) => k !== tool);
  const link = referralLink(email);

  const otherLinksHtml = others
    .map(
      (k) => `<p style="margin:0 0 10px;font-size:15px;line-height:1.5;">
        <a href="${TOOLS[k].href}" style="color:${TEAL};font-weight:600;text-decoration:none;">${esc(TOOLS[k].name)} →</a><br />
        <span style="font-size:14px;color:${BODY};">${esc(TOOLS[k].blurb)}</span>
      </p>`
    )
    .join("");

  const socials = [
    `<a href="${INSTAGRAM_URL}" style="color:${TEAL};font-weight:600;">Instagram</a>`,
    LINKEDIN_URL
      ? `<a href="${LINKEDIN_URL}" style="color:${TEAL};font-weight:600;">LinkedIn</a>`
      : "",
  ]
    .filter(Boolean)
    .join(" &nbsp;·&nbsp; ");

  const socialsText = [INSTAGRAM_URL, LINKEDIN_URL].filter(Boolean).join("\n  ");

  return {
    subject: "Thanks for using Fledgy 🧡",
    text: [
      "Thanks for using Fledgy.",
      "",
      `You just used ${used.name}. There are two more, both free to start:`,
      ...others.map((k) => `  ${TOOLS[k].name} — ${TOOLS[k].href}\n    ${TOOLS[k].blurb}`),
      "",
      "If it helped, share it with a friend:",
      `  ${link}`,
      "",
      "That link is your referral code. When a friend buys anything on Fledgy, you get 20% off your next purchase — they get the tools free either way.",
      "",
      "Follow along:",
      `  ${socialsText}`,
      "",
      "Thanks for supporting Fledgy, and for helping other people grow.",
      "",
      "— Fledgy",
      "fledgy.guide",
      ...(unsubUrl ? ["", `Don't want these? Unsubscribe: ${unsubUrl}`] : []),
    ].join("\n"),
    html: shell(
      "Thanks for using Fledgy",
      [
        p(`You just used <strong style="color:${INK};">${esc(used.name)}</strong>. There are two more, both free to start:`),
        `<div style="margin:16px 0 20px;padding:16px;background:#ffffff;border-radius:8px;">${otherLinksHtml}</div>`,
        `<div style="margin:0 0 20px;padding:16px;background:#ffffff;border-left:3px solid ${ORANGE};border-radius:6px;">
           <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:${INK};">Liked it? Share it 🎁</p>
           <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:${BODY};">
             This link is your referral code. When a friend buys anything on Fledgy,
             <strong style="color:${INK};">you get 20% off</strong> your next purchase — and they get the tools free either way.
           </p>
           <a href="${link}" style="font-size:14px;color:${TEAL};font-weight:600;word-break:break-all;">${esc(link)}</a>
         </div>`,
        p(`Follow along: ${socials}`),
        p("Thanks for supporting Fledgy — and for helping other people grow."),
      ].join(""),
      unsubUrl
        ? `<p style="margin:10px 0 0;font-size:11px;line-height:1.6;color:#8A7A6E;">
             Don't want these? <a href="${unsubUrl}" style="color:#8A7A6E;">Unsubscribe</a>.
           </p>`
        : ""
    ),
  };
}
/** Fire-and-forget thank-you after a tool run. Never throws, never blocks. */
export async function sendToolThankYou(email: string, tool: ToolKey): Promise<boolean> {
  try {
    if (await isUnsubscribed(email)) return false;
    const key = `fledgy:autoreply:tool:${tool}:${normaliseEmail(email)}`;
    if (!(await claimOnce(key, TOOL_COOLDOWN_SECONDS))) return false;

    const unsubUrl = await unsubscribeUrl(email);
    const reply = toolThankYou(tool, email, unsubUrl);
    return await sendEmail({
      to: email,
      subject: reply.subject,
      text: reply.text,
      html: reply.html,
      replyTo: REPLY_TO,
      ...(unsubUrl ? { listUnsubscribe: unsubUrl } : {}),
    });
  } catch (err) {
    console.error("[fledgy:autoreply] tool thank-you failed", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// The one-off re-engagement mail for people who used Fledgy BEFORE the mentors
// launch and the homepage rebuild.
//
// Deliberately NOT the tool thank-you: that one opens "You just used Score my
// CV", which is false for someone whose last visit was weeks ago. Also
// promotional, so same rules — unsubscribe honoured, opt-out link, and the
// List-Unsubscribe header.
// ---------------------------------------------------------------------------

function whatsNew(email: string, name: string | undefined, unsubUrl: string | null): Reply {
  const hi = name ? `Hi ${name},` : "Hi,";
  const link = referralLink(email);
  const socials = [
    `<a href="${INSTAGRAM_URL}" style="color:${TEAL};font-weight:600;">Instagram</a>`,
    LINKEDIN_URL
      ? `<a href="${LINKEDIN_URL}" style="color:${TEAL};font-weight:600;">LinkedIn</a>`
      : "",
  ]
    .filter(Boolean)
    .join(" &nbsp;·&nbsp; ");

  return {
    subject: "You can now book a real person on Fledgy",
    text: [
      hi,
      "",
      "You used Fledgy a while back — thank you. Two things have changed since then.",
      "",
      `1. You can book a 1:1 session with a real person (${MENTOR_PRICE}). A recruiter who has read thousands of CVs, a commercial pilot who came up through flight school, a marketing manager with a deliberately non-linear career, and a business psychologist who has mentored 600+ people.`,
      "   https://fledgy.guide/mentors",
      "",
      "2. The three tools are still free to start, and they have had a lot of work since you last used them:",
      `   ${TOOLS.cv.name} — ${TOOLS.cv.href}`,
      `   ${TOOLS.essay.name} — ${TOOLS.essay.href}`,
      `   ${TOOLS.careers.name} — ${TOOLS.careers.href}`,
      "",
      "If Fledgy was useful, sharing it is the thing that helps most:",
      `   ${link}`,
      "When a friend buys anything, you get 20% off your next purchase — they get the tools free either way.",
      "",
      [INSTAGRAM_URL, LINKEDIN_URL].filter(Boolean).join("   "),
      "",
      "Thanks for being early.",
      "",
      "— Arshkiran, Fledgy",
      "fledgy.guide",
      ...(unsubUrl ? ["", `Don't want these? Unsubscribe: ${unsubUrl}`] : []),
    ].join("\n"),
    html: shell(
      "You can now book a real person",
      [
        p(esc(hi)),
        p("You used Fledgy a while back — thank you. Two things have changed since then."),
        `<div style="margin:16px 0 20px;padding:16px;background:#ffffff;border-left:3px solid ${ORANGE};border-radius:6px;">
           <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:${INK};">1 · Book a mentor — ${esc(MENTOR_PRICE)}</p>
           <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:${BODY};">
             A recruiter who has read thousands of CVs. A commercial pilot who came up
             through flight school. A marketing manager with a deliberately non-linear
             career. A business psychologist who has mentored 600+ people.
           </p>
           <a href="https://fledgy.guide/mentors" style="font-size:14px;color:${TEAL};font-weight:600;">Meet the mentors →</a>
         </div>`,
        p("<strong style=\"color:" + INK + "\">2 · The tools are still free to start</strong> — and they have had a lot of work since you last used them:"),
        `<div style="margin:12px 0 20px;padding:16px;background:#ffffff;border-radius:8px;font-size:15px;line-height:2;">
           <a href="${TOOLS.cv.href}" style="color:${TEAL};font-weight:600;text-decoration:none;">${esc(TOOLS.cv.name)} →</a><br />
           <a href="${TOOLS.essay.href}" style="color:${TEAL};font-weight:600;text-decoration:none;">${esc(TOOLS.essay.name)} →</a><br />
           <a href="${TOOLS.careers.href}" style="color:${TEAL};font-weight:600;text-decoration:none;">${esc(TOOLS.careers.name)} →</a>
         </div>`,
        p(`If Fledgy was useful, sharing it helps most. This link is your referral code — when a friend buys anything, <strong style="color:${INK};">you get 20% off</strong> your next purchase, and they get the tools free either way.`),
        `<p style="margin:0 0 12px;font-size:14px;"><a href="${link}" style="color:${TEAL};font-weight:600;word-break:break-all;">${esc(link)}</a></p>`,
        p(`Follow along: ${socials}`),
        p("Thanks for being early. — Arshkiran"),
      ].join(""),
      unsubUrl
        ? `<p style="margin:10px 0 0;font-size:11px;line-height:1.6;color:#8A7A6E;">
             You're getting this because you used Fledgy.
             <a href="${unsubUrl}" style="color:#8A7A6E;">Unsubscribe</a>.
           </p>`
        : ""
    ),
  };
}

/** One re-engagement mail per address, ever. Returns false if skipped. */
export async function sendWhatsNew(email: string, name?: string): Promise<boolean> {
  try {
    if (await isUnsubscribed(email)) return false;
    // No TTL: this campaign must never go to the same person twice, even if
    // the backfill is re-run months later.
    const key = `fledgy:backfill:whatsnew:${normaliseEmail(email)}`;
    if (!(await claimOnce(key, 0))) return false;

    const unsubUrl = await unsubscribeUrl(email);
    const reply = whatsNew(email, name, unsubUrl);
    return await sendEmail({
      to: email,
      subject: reply.subject,
      text: reply.text,
      html: reply.html,
      replyTo: REPLY_TO,
      ...(unsubUrl ? { listUnsubscribe: unsubUrl } : {}),
    });
  } catch (err) {
    console.error("[fledgy:backfill] send failed", err);
    return false;
  }
}
