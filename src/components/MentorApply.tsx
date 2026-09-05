"use client";

import { useEffect, useState } from "react";

export default function MentorApply() {
  const [email, setEmail] = useState("");
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
  const valid = emailValid && expertise.trim().length > 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      window.localStorage.setItem("fledgy_email", email);
      const res = await fetch("/api/mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "mentor", name, expertise }),
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

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-semibold text-ink">Thanks for applying!</p>
        <p className="mt-1 text-sm text-ink-muted">
          We&apos;ll be in touch about mentoring on Fledgy.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-sm"
    >
      <div>
        <p className="text-base font-semibold text-ink">
          Are you an expert? Become a mentor
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Recruiters, hiring managers, and specialists — share your experience
          and earn from 1:1 sessions.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
          placeholder="Your field (e.g. Tech recruiting)"
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
        />
      </div>

      <input
        type="email"
        className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!valid || submitting}
        className="w-full rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-teal-dark disabled:opacity-40"
      >
        {submitting ? "Sending…" : "Apply to mentor"}
      </button>
    </form>
  );
}
