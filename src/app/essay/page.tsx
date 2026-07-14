"use client";

import { useState } from "react";
import Mark from "@/components/Mark";

type Result = {
  score: number;
  tips: string[];
  one_line_verdict: string;
};

export default function EssayPage() {
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setEssay(data.text);
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
    setResult(null);
    try {
      const res = await fetch("/api/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university, course, essay }),
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
      <div className="w-full max-w-2xl px-6 py-12">
        <div className="flex items-start justify-between">
          <span className="inline-block rounded-full bg-[#fbe3d8] px-2.5 py-1 text-xs font-bold tracking-widest text-[#b6431f]">
            FREE · UNIVERSITY ESSAY HUB
          </span>
          <Mark size={26} opacity={0.35} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-[#2a2115]">
          Score my essay
        </h1>
        <p className="mt-2 text-[#6b5c45]">
          Paste your essay below. This free score is deliberately surface
          level — honest, not padded.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              {uploading ? "Reading file…" : "Upload PDF or Word (.docx)"}
              <input
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
            <span className="text-xs text-[#b0a186]">
              {uploadedName ? `Loaded: ${uploadedName}` : "or paste your essay text below"}
            </span>
          </div>
          {uploadError && (
            <p className="text-xs text-red-600">{uploadError}</p>
          )}
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

        {error && (
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
              <Mark size={28} opacity={0.4} />
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
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
