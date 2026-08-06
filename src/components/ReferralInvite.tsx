"use client";

import { useState } from "react";

// Shown when a user hits the free limit: gives them a personal referral link so
// inviting a friend unlocks another free score. `email` is used as the ref code.
export default function ReferralInvite({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const link = `https://fledgy.guide/?ref=${encodeURIComponent(
    email.trim().toLowerCase()
  )}`;

  async function share() {
    const text =
      "Get honest AI feedback on your essay, CV & career — free on Fledgy:";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Fledgy", text, url: link });
      } else if (navigator?.clipboard) {
        await navigator.clipboard.writeText(`${text} ${link}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // share cancelled — ignore
    }
  }

  if (!valid) return null;

  return (
    <div className="mt-3 rounded-lg border border-[#f4d9a8] bg-white/70 p-3">
      <p className="text-sm font-semibold text-[#7a5b26]">
        Want another free score? Invite a friend 🎁
      </p>
      <p className="mt-1 text-xs text-[#7a5b26]">
        When a friend tries Fledgy with your link, you unlock one more free
        score.
      </p>
      <button
        type="button"
        onClick={share}
        className="mt-2 rounded-lg bg-[#e2653b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c8532c]"
      >
        {copied ? "Link copied!" : "Share my invite link"}
      </button>
    </div>
  );
}
