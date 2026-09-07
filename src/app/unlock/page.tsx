// Where Stripe sends people after paying.
//
// This verifies the session with Stripe directly and grants access here, so a
// buyer is unlocked the moment they land even if the webhook hasn't been
// configured yet. grantPurchase is idempotent, so the webhook doing the same job
// a second later is harmless.

import Link from "next/link";
import Mark from "@/components/Mark";
import { retrieveCheckoutSession, stripeConfigured } from "@/lib/stripe";
import { grantPurchase } from "@/lib/entitlements";
import { getProduct, isProductId } from "@/lib/products";
import RememberEmail from "./RememberEmail";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your report is unlocked",
  robots: { index: false, follow: false },
};

type Outcome =
  | { ok: true; email: string; next: string; productName: string; iterations: number }
  | { ok: false; message: string; next: string };

async function unlock(sessionId: string | undefined, next: string): Promise<Outcome> {
  if (!sessionId) {
    return { ok: false, message: "We couldn't find a checkout session in that link.", next };
  }
  if (!stripeConfigured()) {
    return { ok: false, message: "Payments aren't switched on for this deployment yet.", next };
  }

  try {
    const session = await retrieveCheckoutSession(sessionId);

    if (session.payment_status !== "paid") {
      return {
        ok: false,
        message:
          "Stripe hasn't confirmed that payment yet. If you've just paid, give it a moment and refresh this page.",
        next,
      };
    }

    const email =
      session.metadata?.email ||
      session.customer_email ||
      session.customer_details?.email ||
      "";

    if (!email) {
      return { ok: false, message: "That payment came through without an email address.", next };
    }

    const purchased = session.metadata?.product;
    if (!isProductId(purchased)) {
      return { ok: false, message: "That payment didn't name a known product.", next };
    }

    await grantPurchase(email, purchased, session.id);

    const product = getProduct(purchased);
    return {
      ok: true,
      email,
      next: product?.returnTo ?? next,
      productName: product?.name ?? "your purchase",
      iterations: product?.iterations ?? 0,
    };
  } catch (err) {
    console.error("[fledgy:unlock]", err);
    return {
      ok: false,
      message:
        "We couldn't confirm that payment just then. Refresh in a moment — if it keeps failing, email hello@fledgy.guide and we'll sort it out.",
      next,
    };
  }
}

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: { session_id?: string; next?: string };
}) {
  const next =
    searchParams.next && /^\/[a-z0-9\-/]*$/i.test(searchParams.next)
      ? searchParams.next
      : "/careers";

  const outcome = await unlock(searchParams.session_id, next);

  return (
    <main className="flex flex-1 flex-col items-center bg-page">
      <div className="w-full max-w-lg px-5 py-12 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2">
            <Mark size={32} opacity={0.95} />
            <span className="text-lg font-semibold text-brand-teal">Fledgy</span>
          </div>

          {outcome.ok ? (
            <>
              <RememberEmail email={outcome.email} />
              <h1 className="mt-5 text-2xl font-semibold text-ink sm:text-3xl">
                You&apos;re unlocked
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Thank you — payment confirmed for{" "}
                <span className="font-semibold text-ink">{outcome.email}</span>.{" "}
                {outcome.productName} is unlocked
                {outcome.iterations > 0
                  ? `, with ${outcome.iterations} rewrites to use whenever you're ready.`
                  : "."}
              </p>

              <div className="mt-6 grid gap-3">
                <Link
                  href={outcome.next}
                  className="flex w-full items-center justify-center rounded-xl bg-brand-teal px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-teal-dark"
                >
                  Open it now
                </Link>

              </div>

              <p className="mt-5 text-xs leading-relaxed text-ink-faint">
                Use the same email address ({outcome.email}) on both pages and your access
                will be recognised automatically.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-5 text-2xl font-semibold text-ink sm:text-3xl">
                Hold on a moment
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{outcome.message}</p>
              <div className="mt-6 grid gap-3">
                <Link
                  href={outcome.next}
                  className="flex w-full items-center justify-center rounded-xl border border-line px-4 py-3.5 text-sm font-semibold text-ink-muted transition hover:border-cream-deep"
                >
                  Go back
                </Link>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-ink-faint">
                Nothing is lost — if you were charged, your access is tied to your email and
                we can restore it. Email hello@fledgy.guide.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
