"use client";

import { useCallback, useEffect, useState } from "react";
import Mark from "@/components/Mark";
import PageFaq from "@/components/PageFaq";
import Paywall from "@/components/Paywall";
import { ESSAY_ITERATIONS } from "@/lib/products";
import ReferralInvite from "@/components/ReferralInvite";
import AnalysisLoader from "@/components/AnalysisLoader";
import NeedHelp from "@/components/NeedHelp";
import { fireReferral } from "@/lib/referClient";
import { uploadAndExtractText } from "@/lib/uploadAndExtract";
import { track } from "@vercel/analytics";

type Result = {
  score: number;
  tips: string[];
  one_line_verdict: string;
  locked?: boolean;
  lockedTipCount?: number;
  entitled?: boolean;
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

  const [entitled, setEntitled] = useState(false);
  const [iterationsLeft, setIterationsLeft] = useState(0);
  const [exhausted, setExhausted] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [rewritten, setRewritten] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  const checkEntitlement = useCallback(async (forEmail: string) => {
    if (!forEmail || !forEmail.includes("@")) return;
    try {
      const res = await fetch("/api/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forEmail, product: "essay" }),
      });
      const data = await res.json();
      setEntitled(Boolean(data.entitled));
      setIterationsLeft(data.iterationsLeft ?? 0);
    } catch {
      // Leave the paywall up if we can't tell.
    }
  }, []);

  async function handleRewrite() {
    setRewriting(true);
    setRewriteError(null);
    try {
      const res = await fetch("/api/essay/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university, course, essay, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.exhausted) {
          setExhausted(true);
          setIterationsLeft(0);
        }
        throw new Error(data.error || "Something went wrong.");
      }
      setRewritten(data.essay);
      track("refined_output", { tool: "essay" });
      if (typeof data.iterationsLeft === "number") setIterationsLeft(data.iterationsLeft);
    } catch (err) {
      setRewriteError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRewriting(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => checkEntitlement(email), 400);
    return () => clearTimeout(t);
  }, [email, checkEntitlement]);

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
      track("upload_used", { tool: "essay" });
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
    track("tool_submit", { tool: "essay" });
    try {
      window.localStorage.setItem("fledgy_email", email);
      fireReferral(email);
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
      track("score_shown", { tool: "essay", score: data.score ?? 0 });
      if (data.locked) checkEntitlement(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-page">
      <div className="w-full max-w-2xl px-5 py-10 sm:px-6 sm:py-12">
        <div className="flex items-start justify-between">
          <span className="inline-block rounded-full bg-brand-orange-tint px-2.5 py-1 text-xs font-bold tracking-widest text-brand-orange-dark">
            {entitled ? "UNLOCKED · FULL REPORT" : "FREE · UNIVERSITY ESSAY HUB"}
          </span>
          <Mark size={40} opacity={0.85} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-ink">
          Score my essay
        </h1>
        <p className="mt-2 text-ink-muted">
          {entitled
            ? "Paste your essay below. You'll get the full report — every fix worth making, ranked strongest first."
            : "Paste your essay below. Your score, an honest verdict and three real fixes are free — blunt, not padded."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-orange focus:outline-none"
            placeholder={
              entitled
                ? "The email you bought with"
                : "Your email (so we can save your free scores)"
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-orange focus:outline-none"
              placeholder="Target university (e.g. Oxford)"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
            <input
              className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-orange focus:outline-none"
              placeholder="Course (e.g. PPE)"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-brand-orange-tint bg-white px-4 py-2 text-sm font-medium text-ink-muted transition hover:border-brand-orange hover:text-brand-orange">
              {uploading ? "Reading your file…" : "Upload PDF, Word, or photo"}
              <input
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
            <span className="text-xs text-ink-faint">
              {uploadedName ? `Loaded: ${uploadedName}` : "or paste your essay text below"}
            </span>
          </div>
          {uploading && (
            <p className="text-xs text-brand-teal">
              Fledgy is reading your document and extracting the text — a PDF
              can take up to ~20 seconds. Please keep this tab open.
            </p>
          )}
          {uploadError && (
            <p className="text-xs text-red-600">{uploadError}</p>
          )}
          <p className="text-xs text-ink-faint">
            🔒 Private by design: Fledgy reads your file to score it, then
            discards it. We don&apos;t store your essay.
          </p>
          <textarea
            className="h-64 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-orange focus:outline-none"
            placeholder="Paste your personal statement or essay here..."
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-orange px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-orange disabled:opacity-50"
          >
            {loading
              ? "Reading your essay…"
              : entitled
                ? "Score my essay"
                : "Get my free score"}
          </button>
        </form>

        {loading && <AnalysisLoader tool="essay" />}

        {error && paywall && (
          <div className="mt-6 rounded-lg border border-cream-deep bg-cream px-5 py-4">
            <p className="text-sm font-semibold text-ink">
              You&apos;re on the waitlist
            </p>
            <p className="mt-1 text-sm text-ink">{error}</p>
            <ReferralInvite email={email} />
          </div>
        )}
        {error && !paywall && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-8 card-lift rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
            {!result.locked && (
              <span className="mb-3 inline-block rounded-full bg-brand-orange-tint px-2.5 py-1 text-xs font-bold tracking-widest text-brand-orange-dark">
                YOUR FULL ESSAY REPORT
              </span>
            )}
            <div className="flex items-start justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-semibold text-brand-orange">
                  {result.score}
                </span>
                <span className="text-ink-faint">/ 100</span>
              </div>
              <Mark size={38} opacity={0.75} />
            </div>
            <p className="mt-2 text-sm italic text-ink">
              {result.one_line_verdict}
            </p>
            <ul className="mt-4 space-y-2">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink">
                  <span className="text-brand-orange">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-ink-faint">
              {result.locked ? (
                <>
                  That&apos;s your free score, verdict and three fixes.
                  {typeof result.usesRemaining === "number" && (
                    <>
                      {" "}
                      You have {result.usesRemaining} free score
                      {result.usesRemaining === 1 ? "" : "s"} left on this tool.
                    </>
                  )}
                </>
              ) : (
                <>
                  Every fix worth making, ranked by impact — strongest first.
                  Yours to keep.
                </>
              )}
            </p>

            <div className="mt-6 border-t border-line pt-6">
              {entitled ? (
                <>
                  <h2 className="text-base font-semibold text-ink sm:text-sm">
                    Have your essay rewritten
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    In your own voice — we edit your structure and cut the filler, we
                    don&apos;t replace you with generic prose.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-brand-teal">
                    {iterationsLeft} of {ESSAY_ITERATIONS} rewrites left
                  </p>
                  <button
                    type="button"
                    onClick={handleRewrite}
                    disabled={rewriting || iterationsLeft < 1}
                    className="mt-4 flex w-full items-center justify-center rounded-xl bg-brand-teal px-4 py-3.5 text-base font-semibold text-white transition hover:bg-brand-teal-dark disabled:opacity-50 sm:text-sm"
                  >
                    {rewriting
                      ? "Rewriting your essay…"
                      : rewritten
                      ? "Rewrite it again"
                      : "Rewrite my essay"}
                  </button>

                  {exhausted && (
                    <p className="mt-3 rounded-lg border border-cream-deep bg-cream px-4 py-3 text-sm leading-relaxed text-ink">
                      You&apos;ve used all {ESSAY_ITERATIONS} rewrites. Your latest
                      version is still below.
                    </p>
                  )}

                  {rewriteError && (
                    <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {rewriteError}
                    </p>
                  )}

                  {rewritten && (
                    <pre className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-line bg-page p-4 text-xs leading-relaxed text-ink">
                      {rewritten}
                    </pre>
                  )}
                </>
              ) : (
                <Paywall
                  product="essay"
                  email={email}
                  heading="Want the rest of the report, and your essay rewritten?"
                  subheading="Your score, verdict and three real fixes are free and always will be. Unlocking adds the highest-impact fixes — the ones that actually move the needle — plus your essay rewritten in your own voice."
                  teaser={
                    result.lockedTipCount
                      ? `${result.lockedTipCount} more fixes found in your essay`
                      : undefined
                  }
                />
              )}
            </div>
          </div>
        )}

        {(result || error) && <NeedHelp className="mt-5" />}

        <PageFaq
          title="About Fledgy's essay scorer"
          intro={[
            "Fledgy's free essay scorer gives students and university applicants — including international students — an honest score out of 100 on their personal statement, admissions essay, or statement of purpose (SOP). Instead of vague praise, you get a blunt verdict and specific, actionable tips you can use before you submit.",
            "It's built for the reality of applying abroad: admissions tone, word-count discipline, and the qualities reviewers at competitive universities actually look for. Paste your text or upload a PDF or Word file — Fledgy reads it, scores it, and discards it. Your essay is never stored.",
          ]}
          faqs={[
            {
              q: "Is the essay scorer free?",
              a: "Yes. Your score out of 100, a blunt verdict and three real fixes are free, and always will be. The full report — every fix worth making, ranked strongest first, plus your essay rewritten in your own voice — is a paid upgrade.",
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
