"use client";

import { useCallback, useEffect, useState } from "react";
import Mark from "@/components/Mark";
import PageFaq from "@/components/PageFaq";
import ReferralInvite from "@/components/ReferralInvite";
import AnalysisLoader from "@/components/AnalysisLoader";
import NeedHelp from "@/components/NeedHelp";
import Paywall from "@/components/Paywall";
import { CV_ITERATIONS } from "@/lib/products";
import { printCv, estimatePages } from "@/lib/cvPdf";
import { fireReferral } from "@/lib/referClient";
import { uploadAndExtractText } from "@/lib/uploadAndExtract";
import { track } from "@vercel/analytics";

type Result = {
  score: number;
  tips: string[];
  one_line_verdict: string;
  usesRemaining?: number;
  locked?: boolean;
  lockedTipCount?: number;
  entitled?: boolean;
};

export default function CvPage() {
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [field, setField] = useState("");
  const [cv, setCv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatePaywall, setGeneratePaywall] = useState(false);
  const [generatedCv, setGeneratedCv] = useState<string | null>(null);
  const [entitled, setEntitled] = useState(false);
  const [iterationsLeft, setIterationsLeft] = useState(0);
  const [exhausted, setExhausted] = useState(false);

  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("fledgy_email");
    if (saved) setEmail(saved);
  }, []);

  // Ask what this email owns, so a buyer returning from Stripe (or on another
  // device) gets the writer rather than the paywall.
  const checkEntitlement = useCallback(async (forEmail: string) => {
    if (!forEmail || !forEmail.includes("@")) return;
    try {
      const res = await fetch("/api/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forEmail, product: "cv" }),
      });
      const data = await res.json();
      setEntitled(Boolean(data.entitled));
      setIterationsLeft(data.iterationsLeft ?? 0);
    } catch {
      // Leave the paywall up if we can't tell.
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => checkEntitlement(email), 400);
    return () => clearTimeout(t);
  }, [email, checkEntitlement]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPaywall(false);
    setResult(null);
    setGeneratedCv(null);
    setGenerateError(null);
    track("tool_submit", { tool: "cv" });
    try {
      window.localStorage.setItem("fledgy_email", email);
      fireReferral(email);
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, field, cv, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.paywall) setPaywall(true);
        throw new Error(data.error || "Something went wrong.");
      }
      setResult(data);
      track("score_shown", { tool: "cv", score: data.score ?? 0 });
      if (data.locked) checkEntitlement(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenerateError(null);
    setGeneratePaywall(false);
    try {
      const res = await fetch("/api/cv/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, field, cv, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.paywall) setGeneratePaywall(true);
        if (data.exhausted) {
          setExhausted(true);
          setIterationsLeft(0);
        }
        throw new Error(data.error || "Something went wrong.");
      }
      setGeneratedCv(data.cv);
      track("refined_output", { tool: "cv" });
      if (typeof data.iterationsLeft === "number") {
        setIterationsLeft(data.iterationsLeft);
      }
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const text = await uploadAndExtractText(file);
      setCv(text);
      setUploadedName(file.name);
      track("upload_used", { tool: "cv" });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Something went wrong.");
      setUploadedName(null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // The photo never leaves the browser: it's read to a data URL and embedded
  // directly into the print document. Nothing is uploaded.
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4_000_000) {
      setPhotoError("That image is over 4MB — please pick a smaller one.");
      e.target.value = "";
      return;
    }
    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => setPhotoError("We couldn't read that image.");
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleDownload() {
    if (!generatedCv) return;
    const blob = new Blob([generatedCv], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fledgy-cv.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-page">
      <div className="w-full max-w-2xl px-5 py-10 sm:px-6 sm:py-12">
        <div className="flex items-start justify-between">
          <span className="inline-block rounded-full bg-brand-teal-tint px-2.5 py-1 text-xs font-bold tracking-widest text-brand-teal-dark">
            FREE · CV CONSULTATION
          </span>
          <Mark size={40} opacity={0.85} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-ink">
          Score my CV
        </h1>
        <p className="mt-2 text-ink-muted">
          Tell us where you&apos;re applying. We score for that country&apos;s
          hiring culture, not just generic ATS keywords.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
            placeholder="Your email (so we can save your free scores)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
              placeholder="Target country (e.g. United Kingdom)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
            <input
              className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
              placeholder="Field (e.g. Finance & Banking)"
              value={field}
              onChange={(e) => setField(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-cream-deep bg-white px-4 py-2 text-sm font-medium text-ink-muted transition hover:border-brand-teal hover:text-brand-teal">
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
              {uploadedName ? `Loaded: ${uploadedName}` : "or paste your CV text below"}
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
            discards it. We don&apos;t store your CV.
          </p>
          <textarea
            className="h-64 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
            placeholder="Paste your CV text here..."
            value={cv}
            onChange={(e) => setCv(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-teal-dark disabled:opacity-50"
          >
            {loading ? "Reading your CV…" : "Get my free score"}
          </button>
        </form>

        {loading && <AnalysisLoader tool="cv" context={country} />}

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
              <span className="mb-3 inline-block rounded-full bg-brand-teal-tint px-2.5 py-1 text-xs font-bold tracking-widest text-brand-teal-dark">
                YOUR FULL CV REPORT
              </span>
            )}
            <div className="flex items-start justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-semibold text-brand-teal">
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
                  <span className="text-brand-teal">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-ink-faint">
              {result.locked ? (
                <>
                  That&apos;s your free score, verdict and two fixes.
                  {typeof result.usesRemaining === "number" && (
                    <>
                      {" "}
                      You have {result.usesRemaining} free score
                      {result.usesRemaining === 1 ? "" : "s"} left.
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
                    Have your CV written for you
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    We&apos;ll rewrite it into the structure and format{" "}
                    {country || "your target country"}&apos;s recruiters expect —
                    action-led bullets, the right length, no filler.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-brand-teal">
                    {iterationsLeft} of {CV_ITERATIONS} rewrites left
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating || iterationsLeft < 1}
                    className="mt-4 flex w-full items-center justify-center rounded-xl bg-brand-teal px-4 py-3.5 text-base font-semibold text-white transition hover:bg-brand-teal-dark disabled:opacity-50 sm:text-sm"
                  >
                    {generating
                      ? "Writing your CV…"
                      : generatedCv
                      ? "Rewrite it again"
                      : "Write my CV"}
                  </button>

                  {exhausted && (
                    <p className="mt-3 rounded-lg border border-cream-deep bg-cream px-4 py-3 text-sm leading-relaxed text-ink">
                      You&apos;ve used all {CV_ITERATIONS} rewrites. Your latest version is
                      still below and yours to download.
                    </p>
                  )}
                </>
              ) : (
                <Paywall
                  product="cv"
                  bundle="cv_careers"
                  email={email}
                  heading="Want the rest of the report, and the CV written for you?"
                  subheading={`Your score, verdict and two fixes are free and always will be. Unlocking adds the highest-impact fixes — the ones that actually move the needle — plus a complete CV written and formatted for ${country || "your target country"}.`}
                  teaser={
                    result.lockedTipCount
                      ? `Your ${result.lockedTipCount} biggest fixes are still locked`
                      : undefined
                  }
                />
              )}
              {generateError && !generatePaywall && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {generateError}
                </p>
              )}

              {generatedCv && (
                <div className="mt-4">
                  <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-line bg-page p-4 text-xs leading-relaxed text-ink">
                    {generatedCv}
                  </pre>
                  <div className="mt-4 rounded-xl border border-line bg-page p-4">
                    <p className="text-sm font-semibold text-ink">
                      Add a photo to your PDF?
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                      Normal on a CV across the Gulf and much of Asia — and a red flag
                      in the UK, US and Canada, where it invites discrimination claims.
                      Optional, and it never leaves your device.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border border-dashed border-cream-deep bg-white px-4 py-2 text-sm font-medium text-ink-muted transition hover:border-brand-teal hover:text-brand-teal">
                        {photo ? "Change photo" : "Add a photo"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handlePhoto}
                        />
                      </label>
                      {photo && (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo}
                            alt="Your CV photo"
                            className="h-12 w-10 rounded object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setPhoto(null)}
                            className="text-sm font-medium text-ink-faint underline hover:text-ink"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                    {photoError && (
                      <p className="mt-2 text-xs text-red-600">{photoError}</p>
                    )}
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => printCv(generatedCv, photo ?? undefined)}
                      className="flex w-full items-center justify-center rounded-xl bg-brand-teal px-4 py-3.5 text-base font-semibold text-white transition hover:bg-brand-teal-dark sm:text-sm"
                    >
                      Download polished PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex w-full items-center justify-center rounded-xl border border-brand-teal px-4 py-3.5 text-base font-semibold text-brand-teal transition hover:bg-brand-teal-tint sm:text-sm"
                    >
                      Plain text (.txt)
                    </button>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-ink-faint">
                    About {estimatePages(generatedCv)} page
                    {estimatePages(generatedCv) === 1 ? "" : "s"}. The PDF opens your
                    print dialog — choose{" "}
                    <span className="font-semibold text-ink-muted">Save as PDF</span> as
                    the destination. On a phone, tap Share then Save to Files.
                  </p>
                  {estimatePages(generatedCv) > 2 && (
                    <p className="mt-2 rounded-lg border border-cream-deep bg-cream px-3.5 py-2.5 text-xs leading-relaxed text-ink">
                      That&apos;s longer than most recruiters read. Hit{" "}
                      <span className="font-semibold">Rewrite it again</span> and it will
                      cut to the length {country || "your target country"} actually
                      expects.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {(result || error) && <NeedHelp className="mt-5" />}

        <PageFaq
          title="About Fledgy's CV scorer"
          intro={[
            "Fledgy's free CV scorer rates your résumé against the hiring norms of your target country and gives you a recruiter-ready rewrite you can download. Students, graduates, and professionals — international candidates especially — often lose interviews to formatting and phrasing that don't match local expectations. Fledgy catches those gaps.",
            "Upload a PDF or Word file, or paste your CV text. Fledgy scores it, highlights what's holding it back, and can generate a cleaner, plainer version aligned to the country you're applying in. Your file is read to score it, then discarded.",
          ]}
          faqs={[
            {
              q: "Is the CV scorer free?",
              a: "Yes, scoring your CV is free. You get an honest score and specific feedback on what to fix before you apply for jobs or internships.",
            },
            {
              q: "Does it consider my target country?",
              a: "Yes. CV conventions differ by country — length, whether to include a photo, how to phrase achievements. Fledgy scores your CV against the norms of the country you're targeting.",
            },
            {
              q: "Can Fledgy rewrite my CV?",
              a: "Yes. Fledgy can generate a rewritten, recruiter-ready version of your CV as a plain-text download that you can format and send.",
            },
            {
              q: "What file types can I upload?",
              a: "PDF, Word (.docx), or a photo — or you can paste your CV text directly.",
            },
            {
              q: "Is my CV stored?",
              a: "No. Fledgy reads your CV to score and rewrite it, then discards it. Your document is not stored.",
            },
          ]}
        />
      </div>
    </main>
  );
}
