"use client";

import { useState } from "react";
import Mark from "@/components/Mark";
import { PRODUCTS, PRICE_CONFIRMED, type ProductId } from "@/lib/products";

type Props = {
  /** Which product this card sells. */
  product: ProductId;
  email: string;
  /** Optional second product offered as an upsell, e.g. the CV+Careers bundle. */
  bundle?: ProductId;
  /** Overrides the product's own tagline when the page needs more context. */
  heading?: string;
  subheading?: string;
  /** e.g. "5 more careers matched to you" — states what is being held back. */
  teaser?: string;
};

export default function Paywall({
  product,
  email,
  bundle,
  heading,
  subheading,
  teaser,
}: Props) {
  const [busy, setBusy] = useState<ProductId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const p = PRODUCTS[product];
  const b = bundle ? PRODUCTS[bundle] : null;

  async function handleBuy(which: ProductId) {
    setBusy(which);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product: which }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "We couldn't open checkout. Please try again.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-cream-deep bg-cream shadow-sm">
      <div className="relative p-5 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-orange-tint"
        />

        <div className="relative flex items-center gap-2">
          <Mark size={28} opacity={0.95} />
          <span className="text-xs font-bold tracking-widest text-brand-orange">
            THE FULL PICTURE
          </span>
        </div>

        <h2 className="relative mt-3 text-xl font-semibold leading-snug text-ink sm:text-2xl">
          {heading ?? p.tagline}
        </h2>
        {subheading && (
          <p className="relative mt-2 text-sm leading-relaxed text-ink-muted">
            {subheading}
          </p>
        )}

        {teaser && (
          <p className="relative mt-3 inline-block rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-teal">
            {teaser}
          </p>
        )}

        <ul className="relative mt-5 space-y-2.5">
          {p.includes.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink">
              <span aria-hidden className="mt-0.5 shrink-0 font-bold text-brand-teal">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {PRICE_CONFIRMED ? (
          <>
            <div className="relative mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-3xl font-semibold text-ink">{p.priceDisplay}</span>
              <span className="text-sm text-ink-faint">
                one-off · about {p.priceDisplayInr}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleBuy(p.id)}
              disabled={busy !== null || !email}
              className="relative mt-4 flex w-full items-center justify-center rounded-xl bg-brand-orange px-4 py-3.5 text-base font-semibold text-white transition hover:bg-brand-orange-dark disabled:opacity-50 sm:text-sm"
            >
              {busy === p.id
                ? "Opening secure checkout…"
                : `Unlock — ${p.priceDisplay}`}
            </button>

            {b && (
              <button
                type="button"
                onClick={() => handleBuy(b.id)}
                disabled={busy !== null || !email}
                className="relative mt-2.5 flex w-full flex-col items-center justify-center rounded-xl border border-brand-teal px-4 py-3 text-sm font-semibold text-brand-teal transition hover:bg-brand-teal-tint disabled:opacity-50"
              >
                <span>
                  {busy === b.id
                    ? "Opening secure checkout…"
                    : `Or get both — ${b.priceDisplay}`}
                </span>
                <span className="mt-0.5 text-xs font-normal text-ink-faint">
                  {b.tagline}
                </span>
              </button>
            )}

            {!email && (
              <p className="relative mt-2 text-xs text-ink-faint">
                Enter your email above first so we know where to keep your work.
              </p>
            )}
          </>
        ) : (
          <div className="relative mt-6 rounded-xl border border-dashed border-cream-deep bg-white px-4 py-4">
            <p className="text-sm font-semibold text-ink">Pricing announced shortly</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              We&apos;re finalising the price. Your work is saved to your email — come
              back and unlock it whenever you&apos;re ready.
            </p>
          </div>
        )}

        {error && (
          <p className="relative mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <p className="relative mt-3 text-xs leading-relaxed text-ink-faint">
          Secure payment through Stripe · pay once, no subscription
          {p.iterations > 0 ? ` · ${p.iterations} rewrites included` : ""}
        </p>
      </div>
    </div>
  );
}
