"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
// Deliberately NOT "@/lib/mentors" — that module holds the mentors' real
// names and emails, and importing it here would bundle them into the browser.
import { initials, type PublicMentor } from "@/lib/mentorsPublic";

// The mentor cards, plus the enquiry form they open.
//
// Cards carry no name and no email — a request goes to Fledgy, which forwards
// it. Everything the browser receives is already stripped server-side by
// toPublic(), so there is nothing identifying to scrape here.

// Mentors sit in the UAE, so slots are asked for in UAE time (GST, UTC+4).
// Most of the people asking are in India or elsewhere in the Gulf, and "give me
// times" without a timezone is how a session gets booked 90 minutes wrong — so
// we say which zone, and work out what that is where they are.
const UAE_OFFSET_MIN = 4 * 60;

function timezoneHint(): string {
  try {
    // getTimezoneOffset() counts minutes BEHIND UTC, so flip the sign.
    const here = -new Date().getTimezoneOffset();
    const diff = here - UAE_OFFSET_MIN;
    if (diff === 0) return "You're on UAE time.";
    const ahead = diff > 0;
    const mins = Math.abs(diff);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const span = [h > 0 ? `${h}h` : "", m > 0 ? `${m}m` : ""]
      .filter(Boolean)
      .join(" ");
    return `Your clock is ${span} ${ahead ? "ahead of" : "behind"} UAE time.`;
  } catch {
    return "";
  }
}

function Avatar({ m }: { m: PublicMentor }) {
  // A missing photo file would otherwise render the browser's broken-image
  // icon on a page selling 1:1 sessions. If it fails to load we fall back to
  // the plain accent circle, which looks deliberate rather than broken.
  const [failed, setFailed] = useState(false);

  if (m.photo && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={m.photo}
        alt={m.name ? m.name : `Fledgy mentor — ${m.title}`}
        onError={() => setFailed(true)}
        className="h-20 w-20 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
      style={{ backgroundColor: m.accent }}
      aria-hidden="true"
    >
      {m.name ? initials(m.name) : ""}
    </div>
  );
}

function MentorCard({
  m,
  onRequest,
}: {
  m: PublicMentor;
  onRequest: (m: PublicMentor) => void;
}) {
  return (
    <div className="card-lift flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-4">
        <Avatar m={m} />
        <div>
          {m.name && (
            <p className="text-base font-semibold text-ink">{m.name}</p>
          )}
          <p className="text-base font-semibold text-ink">{m.title}</p>
          <p className="mt-0.5 text-xs text-ink-faint">Fledgy mentor</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {m.areas.map((a) => (
          <span
            key={a}
            className="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-ink-muted"
          >
            {a}
          </span>
        ))}
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted">
        {m.blurb}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-cream pt-4">
        <div className="leading-tight">
          <span className="text-lg font-bold text-ink">{m.price}</span>
          <span className="text-sm text-ink-faint"> · {m.sessionLength}</span>
        </div>
        <button
          onClick={() => onRequest(m)}
          className="rounded-lg bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-teal-dark"
        >
          Request a session →
        </button>
      </div>
    </div>
  );
}

function InquiryForm({
  mentor,
  onClose,
}: {
  mentor: PublicMentor;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [tzHint, setTzHint] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("fledgy_email");
    if (saved) setEmail(saved);
    // Read the clock on the client only — the server's zone isn't theirs.
    setTzHint(timezoneHint());
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const valid = emailValid && message.trim().length > 4;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      window.localStorage.setItem("fledgy_email", email);
      const res = await fetch("/api/mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role: "inquiry",
          mentorId: mentor.id,
          name,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone(true);
      track("mentor_inquiry", { mentor: mentor.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Request a session — ${mentor.title}`}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-ink">Request sent</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              We&apos;ve got it. Fledgy reads every request and comes back to you
              by email — usually within a day — with times and an introduction to
              your mentor.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white hover:bg-brand-teal-dark"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar m={mentor} />
              <div>
                <p className="text-base font-semibold text-ink">
                  Request a session
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {mentor.title} · {mentor.price} for {mentor.sessionLength}
                </p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Nothing is charged now — we&apos;ll confirm a time and how to
                  pay by email.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="mentor-inquiry-message"
                className="text-sm font-medium text-ink"
              >
                What would you like help with?
              </label>
              <textarea
                id="mentor-inquiry-message"
                className="mt-1.5 h-28 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
                placeholder="A line or two — and two or three times that suit you, in UAE time."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <p className="mt-1.5 text-xs text-ink-faint">
                Please give your slots in <b className="text-ink-muted">UAE
                time (GST, UTC+4)</b> — that&apos;s where your mentor is.
                {tzHint ? ` ${tzHint}` : ""}
              </p>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={!valid || submitting}
              className="w-full rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-teal-dark disabled:opacity-40"
            >
              {submitting ? "Sending…" : "Send request"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs text-ink-faint hover:text-ink-muted"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function MentorGrid({ mentors }: { mentors: PublicMentor[] }) {
  const [active, setActive] = useState<PublicMentor | null>(null);

  return (
    <>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mentors.map((m) => (
          <MentorCard key={m.id} m={m} onRequest={setActive} />
        ))}
      </div>
      {active && (
        <InquiryForm mentor={active} onClose={() => setActive(null)} />
      )}
    </>
  );
}
