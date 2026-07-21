"use client";

import { useEffect, useState } from "react";
import Mark from "@/components/Mark";
import { uploadAndExtractText } from "@/lib/uploadAndExtract";

type Result = {
  score: number;
  tips: string[];
  one_line_verdict: string;
  usesRemaining?: number;
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

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("fledgy_email");
    if (saved) setEmail(saved);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPaywall(false);
    setResult(null);
    setGeneratedCv(null);
    setGenerateError(null);
    try {
      window.localStorage.setItem("fledgy_email", email);
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
        throw new Error(data.error || "Something went wrong.");
      }
      setGeneratedCv(data.cv);
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
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Something went wrong.");
      setUploadedName(null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
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
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-2xl px-6 py-12">
        <div className="flex items-start justify-between">
          <span className="inline-block rounded-full bg-[#d7f0ec] px-2.5 py-1 text-xs font-bold tracking-widest text-teal-800">
            FREE · CV CONSULTATION
          </span>
          <Mark size={40} opacity={0.85} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-[#2a2115]">
          Score my CV
        </h1>
        <p className="mt-2 text-[#6b5c45]">
          Tell us where you&apos;re applying. We score for that country&apos;s
          hiring culture, not just generic ATS keywords.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            className="w-full rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-teal-600 focus:outline-none"
            placeholder="Your email (so we can save your free scores)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#c9b98a] bg-white px-4 py-2 text-sm font-medium text-[#6b5c45] transition hover:border-teal-600 hover:text-teal-700">
              {uploading ? "Reading file…" : "Upload PDF, Word, or photo"}
              <input
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
            <span className="text-xs text-[#b0a186]">
              {uploadedName ? `Loaded: ${uploadedName}` : "or paste your CV text below"}
            </span>
          </div>
          {uploadError && (
            <p className="text-xs text-red-600">{uploadError}</p>
          )}
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
                <span className="text-4xl font-semibold text-teal-700">
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
                  <span className="text-teal-700">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-[#b0a186]">
              This is the free surface-level score. The full paid report
              (section-by-section rewrite, deeper cultural dos/don&apos;ts) is
              coming in a later version.
              {typeof result.usesRemaining === "number" && (
                <>
                  {" "}
                  You have {result.usesRemaining} free score
                  {result.usesRemaining === 1 ? "" : "s"} left.
                </>
              )}
            </p>

            <div className="mt-6 border-t border-[#f0dfc4] pt-6">
              <h2 className="text-sm font-semibold text-[#2a2115]">
                Want an actual improved draft, not just a score?
              </h2>
              <p className="mt-1 text-sm text-[#6b5c45]">
                We&apos;ll rewrite your CV into the structure and format{" "}
                {country || "your target country"}&apos;s recruiters expect.
                Free, plain text.
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="mt-4 w-full rounded-lg border border-teal-700 px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:opacity-50"
              >
                {generating ? "Rewriting your CV…" : "Generate my improved CV, free"}
              </button>

              {generateError && generatePaywall && (
                <div className="mt-4 rounded-lg border border-[#f4d9a8] bg-[#fdf0d9] px-5 py-4">
                  <p className="text-sm font-semibold text-[#7a5b26]">
                    You&apos;re on the waitlist
                  </p>
                  <p className="mt-1 text-sm text-[#7a5b26]">{generateError}</p>
                </div>
              )}
              {generateError && !generatePaywall && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {generateError}
                </p>
              )}

              {generatedCv && (
                <div className="mt-4">
                  <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[#f0dfc4] bg-[#fdf9f0] p-4 text-xs leading-relaxed text-[#2a2115]">
                    {generatedCv}
                  </pre>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                    >
                      Download as .txt, free
                    </button>
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-lg border border-dashed border-[#c9b98a] px-4 py-3 text-sm font-semibold text-[#9c8b6f]"
                    >
                      Polished PDF/Word, coming soon
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
