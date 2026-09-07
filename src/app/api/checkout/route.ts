// Starts a Stripe Checkout for one product and hands the browser a redirect URL.

import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, stripeConfigured } from "@/lib/stripe";
import { isValidEmail } from "@/lib/usage";
import { getProduct, PRICE_CONFIRMED, CURRENCY } from "@/lib/products";

export const runtime = "nodejs";

function siteOrigin(req: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.headers.get("origin") ||
    "https://fledgy.guide"
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email, product: productId } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email so we can send you your work." },
        { status: 400 }
      );
    }

    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json({ error: "Unknown product." }, { status: 400 });
    }

    // Safety catch: refuse to charge anyone while pricing is mid-change.
    if (!PRICE_CONFIRMED) {
      return NextResponse.json(
        {
          error: "Checkout is closed while we finalise pricing.",
          priceNotSet: true,
        },
        { status: 503 }
      );
    }

    if (!stripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Payments aren't switched on yet. Add STRIPE_SECRET_KEY in the Vercel project's environment variables to enable checkout.",
        },
        { status: 503 }
      );
    }

    const origin = siteOrigin(req);

    const session = await createCheckoutSession({
      email,
      productId: product.id,
      productName: product.name,
      productDescription: product.description,
      amountCents: product.priceCents,
      currency: CURRENCY,
      // Stripe substitutes {CHECKOUT_SESSION_ID} when it builds the redirect.
      successUrl: `${origin}/unlock?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}${product.returnTo}?checkout=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe didn't return a checkout link. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("[fledgy:checkout]", err);
    return NextResponse.json(
      { error: "We couldn't start checkout just then. Please try again." },
      { status: 500 }
    );
  }
}
