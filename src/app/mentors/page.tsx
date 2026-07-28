"use client";

import { useEffect, useState } from "react";
import Mark from "@/components/Mark";

type Role = "seeker" | "mentor";

export default function MentorsPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("seeker");
  const [name, setName] = useState("");
  const [expertise, setExpertise] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("fledgy_email");
    if (saved) setEmail(saved);
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const valid =
    emailValid && (role === "seeker" || expertise.trim().length > 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      window.localStorage.setItem("fledgy_email", email);
      const res = await fetch("/api/mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, name, expertise }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-2xl px-6 py-12">
        <div className="flex items-start justify-between">
          <span className="inline-block rounded-full bg-[#d7ece7] px-2.5 py-1 text-xs font-bold tracking-widest text-teal-800">
            FLEDGY MENTORS · COMING SOON
          </span>
          <Mark size={40} opacity={0.85} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-[#2a2115]">
          Get tips from recruiters &amp; industry experts
        </h1>
        <p className="mt-2 text-[#6b5c45]">
          Book 1:1 sessions with people who actually make hiring and admissions
          decisions. Real, personalized advice on your essays, CV, interviews,
          and career — booked around their availability. Paid sessions,
          launching soon.
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

        {/* Waitlist card */}
        <div className="mt-8 rounded-2xl border border-[#e7d3bc] bg-white p-6 shadow-sm">
          {done ? (
            <div className="text-center">
              <Mark size={44} opacity={0.9} className="mx-auto" />
              <p className="mt-4 text-lg font-semibold text-[#2a2115]">
                {role === "mentor"
                  ? "Thanks for applying!"
                  : "You're on the list!"}
              </p>
              <p className="mt-1 text-sm text-[#6b5c45]">
                {role === "mentor"
                  ? "We'll be in touch about mentoring on Fledgy."
                  : "We'll email you the moment mentors go live."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm font-semibold text-[#2a2115]">
                Be the first to know
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { value: "seeker", label: "I want mentoring" },
                  { value: "mentor", label: "I want to mentor" },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value as Role)}
                    className={`rounded-lg border px-4 py-3 text-center text-sm transition ${
                      role === r.value
                        ? "border-teal-700 bg-[#d7ece7] font-medium text-teal-900"
                        : "border-[#f0dfc4] bg-white text-[#3a3629] hover:border-[#bcd8d1]"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {role === "mentor" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className="rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-teal-700 focus:outline-none"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    className="rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-teal-700 focus:outline-none"
                    placeholder="Your field (e.g. Tech recruiting)"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                  />
                </div>
              )}

              <input
                type="email"
                className="w-full rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-teal-700 focus:outline-none"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={!valid || submitting}
                className="w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-40"
              >
                {submitting
                  ? "Adding you…"
                  : role === "mentor"
                  ? "Apply to mentor"
                  : "Notify me at launch"}
              </button>
              <p className="text-xs text-[#9c8b6f]">
                Sessions will be paid. We&apos;ll only email you about Fledgy
                Mentors.
              </p>
            </form>
          )}
        </div>

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
