"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

type Result = {
  score: number;
  tips: string[];
  one_line_verdict: string;
};

export default function CvPage() {
  const [country, setCountry] = useState("");
  const [field, setField] = useState("");
  const [cv, setCv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, field, cv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-2xl px-6 py-16">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
        <span className="mt-6 inline-block rounded-full bg-[#d7f0ec] px-2.5 py-1 text-xs font-bold tracking-widest text-teal-800">
          FREE · CV CONSULTATION
        </span>
        <h1 className="mt-3 text-3xl font-semibold text-[#2a2115]">
          Score my CV
        </h1>
        <p className="mt-2 text-[#6b5c45]">
          Tell us where you&apos;re applying. We score for that country&apos;s
          hiring culture, not just generic ATS keywords.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-teal-600 focus:outline-none"
              placeholder="Target country (e.g. United Kingdom)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
            <input
              className="rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-teal-600 focus:outline-none"
              placeholder="Field (e.g. Finance & Banking)"
              value={field}
              onChange={(e) => setField(e.target.value)}
            />
          </div>
          <textarea
            className="h-64 w-full rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-teal-600 focus:outline-none"
            placeholder="Paste your CV text here..."
            value={cv}
            onChange={(e) => setCv(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
          >
            {loading ? "Reading your CV…" : "Get my free score"}
          </button>
        </form>

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-8 rounded-xl border border-[#f0dfc4] bg-white p-6 shadow-sm">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-semibold text-teal-700">
                {result.score}
              </span>
              <span className="text-[#b0a186]">/ 100</span>
            </div>
            <p className="mt-2 text-sm italic text-[#3a3629]">
              {result.one_line_verdict}
            </p>
            <ul className="mt-4 space-y-2">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#3a3629]">
                  <span className="text-teal-700">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-[#b0a186]">
              This is the free surface-level score. The full paid report
              (section-by-section rewrite, deeper cultural dos/don&apos;ts) is
              coming in a later version.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
