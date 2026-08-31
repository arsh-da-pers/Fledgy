"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }

      track("homepage_subscribe");
      setStatus("done");
    } catch {
      setError("Could not reach the server. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="mt-10 rounded-xl border border-[#cfe7e2] bg-[#eaf6f4] p-5">
        <p className="font-semibold text-teal-800">You&apos;re on the list.</p>
        <p className="mt-1 text-sm text-[#4a6b66]">
          We&apos;ll email you once when the Refined CV opens. Nothing else.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-xl border border-[#f0dfc4] bg-white p-5">
      <h2 className="text-lg font-semibold text-[#2a2115]">
        Be first when the Refined CV lands
      </h2>
      <p className="mt-1 text-sm text-[#6b5c45]">
        One email when the paid tier opens, plus the occasional genuinely useful
        application tip. No spam, and you can leave any time.
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="subscribe-email" className="sr-only">
          Your email
        </label>
        <input
          id="subscribe-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full flex-1 rounded-lg border border-[#e4d6bd] bg-[#fffdf9] px-4 py-3 text-[#2a2115] placeholder:text-[#a89880] focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2653b] disabled:opacity-60"
        >
          {status === "sending" ? "Adding…" : "Notify me"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-2 text-sm text-[#b6431f]">
          {error}
        </p>
      )}
    </div>
  );
}
