import type { Metadata } from "next";
import Mark from "@/components/Mark";
import MentorApply from "@/components/MentorApply";
import { MENTORS, BOOKING_EMAIL, initials, type Mentor } from "@/lib/mentors";

export const metadata: Metadata = {
  title: "Fledgy Mentors — book 1:1 with recruiters & industry experts",
  description:
    "Book affordable 1:1 sessions with people who make hiring and admissions decisions. Real, personalized advice on your career, university applications, CV, and more.",
};

function bookingHref(m: Mentor): string {
  if (m.bookingUrl && m.bookingUrl.trim().length > 0) return m.bookingUrl;
  const to = m.email && m.email.trim().length > 0 ? m.email : BOOKING_EMAIL;
  const subject = `Session request: ${m.name} (${m.title})`;
  const body = `Hi ${m.name},

I'd like to book a 1:1 session with you.

My name:
What I'd like help with:
My availability (a few options):

Thanks!`;
  return `mailto:${to}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

function MentorCard({ m }: { m: Mentor }) {
  const external = !!(m.bookingUrl && m.bookingUrl.trim().length > 0);
  const href = bookingHref(m);
  return (
    <div className="card-lift flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-4">
        {m.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.photo}
            alt={m.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ backgroundColor: m.accent }}
          >
            {initials(m.name)}
          </div>
        )}
        <div>
          <p className="text-base font-semibold text-ink">{m.name}</p>
          <p className="text-sm text-ink-muted">{m.title}</p>
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
        <a
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="rounded-lg bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-teal-dark"
        >
          {external ? "Book a session →" : "Request a session →"}
        </a>
      </div>
    </div>
  );
}

export default function MentorsPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-page">
      <div className="w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="flex items-start justify-between">
          <span className="inline-block rounded-full bg-brand-teal-tint px-2.5 py-1 text-xs font-bold tracking-widest text-brand-teal-dark">
            FLEDGY MENTORS
          </span>
          <Mark size={40} opacity={0.85} />
        </div>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">
          Book 1:1 with people who&apos;ve been there
        </h1>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Real, honest advice from people who&apos;ve actually done it — a
          recruiter, a pilot, a career psychologist. A focused 30-minute chat
          about your career, uni plans, CV, or whatever&apos;s on your mind.
        </p>

        {/* How it works */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Browse mentors",
              d: "Recruiters, hiring managers, and specialists across fields.",
            },
            {
              n: "2",
              t: "Pick a time",
              d: "Book a slot that fits both your schedules.",
            },
            {
              n: "3",
              t: "Get real tips",
              d: "Honest, personalized guidance in a focused session.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-line bg-white p-4"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-teal text-sm font-bold text-white">
                {s.n}
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">{s.t}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.d}</p>
            </div>
          ))}
        </div>

        {/* Mentor grid — empty until each mentor has agreed to appear. */}
        {MENTORS.length > 0 ? (
          <>
            <h2 className="mt-12 text-xl font-semibold text-ink">
              Meet the mentors
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {MENTORS.map((m) => (
                <MentorCard key={m.id} m={m} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-12 rounded-2xl border border-cream-deep bg-cream p-6">
            <h2 className="text-xl font-semibold text-ink">
              Our first mentors are joining shortly
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
              We&apos;re opening bookings with a small group — a recruiter, a
              commercial pilot, and a career psychologist — at $29 for 30 minutes.
              Want first pick of the slots? Tell us what you need help with below and
              we&apos;ll come to you when it opens.
            </p>
          </div>
        )}

        {/* Become a mentor */}
        <div className="mt-12">
          <MentorApply />
        </div>

        {/* Cross-links */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <a
            href="/careers"
            className="rounded-lg border border-cream-deep px-4 py-3 text-center text-sm font-semibold text-brand-teal hover:bg-cream"
          >
            Try the career quiz →
          </a>
          <a
            href="/cv"
            className="rounded-lg border border-brand-teal px-4 py-3 text-center text-sm font-semibold text-brand-teal hover:bg-brand-teal-tint"
          >
            Score my CV →
          </a>
        </div>
      </div>
    </main>
  );
}
