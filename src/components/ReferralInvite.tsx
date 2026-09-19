"use client";

import { useState } from "react";

// Shown when a user hits the free limit: gives them a personal referral link.
// `email` is the ref code.
//
// The reward is 20% off their next purchase, earned when the friend actually
// BUYS — not when they sign up. The copy has to say that plainly, because
// "invite a friend" implying an instant reward and then paying nothing is how
// you lose the trust you were trying to build.
export default function ReferralInvite({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const link = `https://fledgy.guide/?ref=${encodeURIComponent(
    email.trim().toLowerCase()
  )}`;

  async function share() {
    const text =
      "Get honest AI feedback on your essay, CV & career — free to try on Fledgy:";
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
    <div className="mt-3 rounded-lg border border-cream-deep bg-white/70 p-3">
      <p className="text-sm font-semibold text-ink">
        Invite a friend, get 20% off 🎁
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink">
        Share your link. When a friend buys anything on Fledgy, you get{" "}
        <span className="font-semibold">20% off</span> your next purchase —
        applied automatically at checkout, no code to remember.
      </p>
      <button
        type="button"
        onClick={share}
        className="mt-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange-dark"
      >
        {copied ? "Link copied!" : "Share my invite link"}
      </button>
    </div>
  );
}
