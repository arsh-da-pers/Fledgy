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
  const subject = `Session request: ${m.name} (${m.title})`;
  const body = `Hi Fledgy team,

I'd like to book a 1:1 session with ${m.name}.

My name:
What I'd like help with:
My availability (a few options):

Thanks!`;
  return `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

function MentorCard({ m }: { m: Mentor }) {
  const external = !!(m.bookingUrl && m.bookingUrl.trim().length > 0);
  const href = bookingHref(m);
  return (
    <div className="flex flex-col rounded-2xl border border-[#f0dfc4] bg-white p-6 shadow-sm">
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
          <p className="text-base font-semibold text-[#2a2115]">{m.name}</p>
          <p className="text-sm text-[#6b5c45]">{m.title}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {m.areas.map((a) => (
          <span
            key={a}
            className="rounded-full bg-[#f3ece0] px-2.5 py-1 text-xs font-medium text-[#7a6647]"
          >
            {a}
          </span>
        ))}
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-[#6b5c45]">
        {m.blurb}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-[#f2e6d3] pt-4">
        <div className="leading-tight">
          <span className="text-lg font-bold text-[#2a2115]">{m.price}</span>
          <span className="text-sm text-[#9c8b6f]"> · {m.sessionLength}</span>
        </div>
        <a
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          {external ? "Book a session →" : "Request a session →"}
        </a>
      </div>
    </div>
  );
}

export default function MentorsPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between">
          <span className="inline-block rounded-full bg-[#d7ece7] px-2.5 py-1 text-xs font-bold tracking-widest text-teal-800">
            FLEDGY MENTORS
          </span>
          <Mark size={40} opacity={0.85} />
        </div>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold text-[#2a2115] sm:text-4xl">
          Book 1:1 with people who&apos;ve been there
        </h1>
        <p className="mt-2 max-w-2xl text-[#6b5c45]">
          Real, honest advice from people who&apos;ve actually done it — a
          recruiter, a pilot, a career psychologist. Book a focused 30-minute
          chat about your career, uni plans, CV, or whatever&apos;s on your mind.
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
              className="rounded-xl border border-[#f0dfc4] bg-white p-4"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                {s.n}
              </span>
              <p className="mt-3 text-sm font-semibold text-[#2a2115]">{s.t}</p>
              <p className="mt-1 text-sm text-[#6b5c45]">{s.d}</p>
            </div>
          ))}
        </div>

        {/* Mentor grid */}
        <h2 className="mt-12 text-xl font-semibold text-[#2a2115]">
          Meet the mentors
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MENTORS.map((m) => (
            <MentorCard key={m.id} m={m} />
          ))}
        </div>

        {/* Become a mentor */}
        <div className="mt-12">
          <MentorApply />
        </div>

        {/* Cross-links */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <a
            href="/careers"
            className="rounded-lg border border-[#c9b98a] px-4 py-3 text-center text-sm font-semibold text-[#8a6d2f] hover:bg-[#faf3e3]"
          >
            Try the career quiz →
          </a>
          <a
            href="/cv"
            className="rounded-lg border border-teal-600 px-4 py-3 text-center text-sm font-semibold text-teal-700 hover:bg-teal-50"
          >
            Score my CV →
          </a>
        </div>
      </div>
    </main>
  );
}
