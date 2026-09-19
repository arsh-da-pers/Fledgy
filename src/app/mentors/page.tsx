import type { Metadata } from "next";
import Mark from "@/components/Mark";
import MentorApply from "@/components/MentorApply";
import MentorGrid from "@/components/MentorGrid";
import { MENTORS, toPublic } from "@/lib/mentors";

export const metadata: Metadata = {
  title: "Fledgy Mentors — book 1:1 with recruiters & industry experts",
  description:
    "Book affordable 1:1 sessions with people who make hiring and admissions decisions. Real, personalized advice on your career, university applications, CV, and more.",
};

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
              t: "Pick a mentor",
              d: "Recruiters, hiring managers, and specialists across fields.",
            },
            {
              n: "2",
              t: "Send a request",
              d: "Tell us what you need and when you're free, in UAE time. It comes to Fledgy.",
            },
            {
              n: "3",
              t: "Get introduced",
              d: "We come back with times and introduce you to your mentor.",
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

        {/* Mentor grid. Names are held back during the soft launch — the note
            below is why people are told that up front rather than left to
            wonder what's being hidden. */}
        {MENTORS.length > 0 ? (
          <>
            <div className="mt-12 flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-xl font-semibold text-ink">
                Meet the mentors
              </h2>
              <p className="text-xs text-ink-faint">
                Introductions happen when you book
              </p>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
              We introduce our mentors by what they&apos;ve actually done, not by
              their name — so you choose on experience. Send a request and
              we&apos;ll come back with times and a proper introduction.
            </p>
            <MentorGrid mentors={MENTORS.map(toPublic)} />
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
