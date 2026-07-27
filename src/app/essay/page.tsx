"use client";

import { useEffect, useState } from "react";
import Mark from "@/components/Mark";
import PageFaq from "@/components/PageFaq";
import { uploadAndExtractText } from "@/lib/uploadAndExtract";

type Result = {
  score: number;
  tips: string[];
  one_line_verdict: string;
  usesRemaining?: number;
};

export default function EssayPage() {
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("fledgy_email");
    if (saved) setEmail(saved);
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const text = await uploadAndExtractText(file);
      setEssay(text);
      setUploadedName(file.name);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Something went wrong.");
      setUploadedName(null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPaywall(false);
    setResult(null);
    try {
      window.localStorage.setItem("fledgy_email", email);
      const res = await fetch("/api/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university, course, essay, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.paywall) setPaywall(true);
        throw new Error(data.error || "Something went wrong.");
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-2xl px-6 py-12">
        <div className="flex items-start justify-between">
          <span className="inline-block rounded-full bg-[#fbe3d8] px-2.5 py-1 text-xs font-bold tracking-widest text-[#b6431f]">
            FREE · UNIVERSITY ESSAY HUB
          </span>
          <Mark size={40} opacity={0.85} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-[#2a2115]">
          Score my essay
        </h1>
        <p className="mt-2 text-[#6b5c45]">
          Paste your essay below. This free score is deliberately surface
          level: honest, not padded.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            className="w-full rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-[#e2653b] focus:outline-none"
            placeholder="Your email (so we can save your free scores)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-[#e2653b] focus:outline-none"
              placeholder="Target university (e.g. Oxford)"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
            <input
              className="rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-[#e2653b] focus:outline-none"
              placeholder="Course (e.g. PPE)"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#e2a68a] bg-white px-4 py-2 text-sm font-medium text-[#6b5c45] transition hover:border-[#e2653b] hover:text-[#c8532c]">
              {uploading ? "Reading your file…" : "Upload PDF, Word, or photo"}
              <input
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
            <span className="text-xs text-[#b0a186]">
              {uploadedName ? `Loaded: ${uploadedName}` : "or paste your essay text below"}
            </span>
          </div>
          {uploading && (
            <p className="text-xs text-teal-700">
              Fledgy is reading your document and extracting the text — a PDF
              can take up to ~20 seconds. Please keep this tab open.
            </p>
          )}
          {uploadError && (
            <p className="text-xs text-red-600">{uploadError}</p>
          )}
          <p className="text-xs text-[#9c8b6f]">
            🔒 Private by design: Fledgy reads your file to score it, then
            discards it. We don&apos;t store your essay.
          </p>
          <textarea
            className="h-64 w-full rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-[#e2653b] focus:outline-none"
            placeholder="Paste your personal statement or essay here..."
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#e2653b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c8532c] disabled:opacity-50"
          >
            {loading ? "Reading your essay…" : "Get my free score"}
          </button>
        </form>

        {error && paywall && (
          <div className="mt-6 rounded-lg border border-[#f4d9a8] bg-[#fdf0d9] px-5 py-4">
            <p className="text-sm font-semibold text-[#7a5b26]">
              You&apos;re on the waitlist
            </p>
            <p className="mt-1 text-sm text-[#7a5b26]">{error}</p>
          </div>
        )}
        {error && !paywall && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-8 rounded-xl border border-[#f0dfc4] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-semibold text-[#e2653b]">
                  {result.score}
                </span>
                <span className="text-[#b0a186]">/ 100</span>
              </div>
              <Mark size={38} opacity={0.75} />
            </div>
            <p className="mt-2 text-sm italic text-[#3a3629]">
              {result.one_line_verdict}
            </p>
            <ul className="mt-4 space-y-2">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#3a3629]">
                  <span className="text-[#e2653b]">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-[#b0a186]">
              This is the free surface-level score. The full paid report
              (section breakdown, tone analysis, school-specific criteria) is
              coming in a later version.
              {typeof result.usesRemaining === "number" && (
                <>
                  {" "}
                  You have {result.usesRemaining} free score
                  {result.usesRemaining === 1 ? "" : "s"} left.
                </>
              )}
            </p>
          </div>
        )}

        <PageFaq
          title="About Fledgy's essay scorer"
          intro={[
            "Fledgy's free essay scorer gives students and university applicants — including international students — an honest score out of 100 on their personal statement, admissions essay, or statement of purpose (SOP). Instead of vague praise, you get a blunt verdict and specific, actionable tips you can use before you submit.",
            "It's built for the reality of applying abroad: admissions tone, word-count discipline, and the qualities reviewers at competitive universities actually look for. Paste your text or upload a PDF or Word file — Fledgy reads it, scores it, and discards it. Your essay is never stored.",
          ]}
          faqs={[
            {
              q: "Is the essay scorer free?",
              a: "Yes. Fledgy gives you free essay scores so you can improve your personal statement before you apply. The free score is deliberately surface-level and honest — a fuller paid report with section-by-section breakdowns is coming later.",
            },
            {
              q: "What kinds of essays can I score?",
              a: "University personal statements, admissions essays, statements of purpose (SOP), and scholarship essays. It works for both undergraduate and postgraduate applications to universities around the world.",
            },
            {
              q: "Can I upload a PDF or Word document?",
              a: "Yes. You can upload a PDF, Word (.docx), or a photo of your essay, or simply paste the text. Fledgy extracts the text, scores it, and does not store your document.",
            },
            {
              q: "How is the score calculated?",
              a: "Fledgy's AI evaluates your essay against the qualities admissions reviewers value — clarity, structure, specificity, and tone — and returns a score out of 100 with a one-line verdict and concrete tips.",
            },
            {
              q: "Will you keep or share my essay?",
              a: "No. Your essay is read only to generate your score and is then discarded. Fledgy does not store or share your writing.",
            },
          ]}
        />
      </div>
    </main>
  );
}
