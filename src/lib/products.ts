// Fledgy's paid catalogue.
//
// THE PRINCIPLE: every tool gives a real, useful, free result — a score out of
// 100, an honest verdict, and the specific fixes. Nobody leaves empty-handed
// and nothing useful is hidden behind an email wall. Payment is for the deep
// work: the full report and the document written for you.
//
// THE LADDER, and why it's shaped this way:
//
//   Essay report + rewrite     $15   2 rewrites
//   Careers full report        $18   no document to rewrite
//   CV report + written CV     $19   3 rewrites
//   CV + Careers bundle        $25   the two most-bought together
//   1:1 mentor session         $29   a real person, 30 minutes (see lib/mentors)
//
// The mentor session must stay the most expensive thing on the site — it's the
// only one that costs a human being their time. Everything digital sits below
// it, AND the bundle exists so that buying two products ($19 + $18 = $37)
// can't cost more than booking a person. Keep it that way.
//
// TO CHANGE A PRICE: edit priceCents AND both display strings together, or the
// page will advertise one number and charge another. Every page, the checkout
// and the Stripe line item all read from here.

export type ProductId = "essay" | "cv" | "careers" | "cv_careers";

export type Product = {
  id: ProductId;
  /** Shown on the Stripe line item and the buyer's receipt. */
  name: string;
  /** One line on the paywall card. */
  tagline: string;
  description: string;
  /** Smallest currency unit — 1900 = $19.00. */
  priceCents: number;
  priceDisplay: string;
  /** Indicative rupee price for the India audience. DISPLAY ONLY — every
   *  payment is taken in USD through Stripe until a rupee rail exists. */
  priceDisplayInr: string;
  /** What the buyer gets, in their words. */
  includes: string[];
  /** How many times they can regenerate their document. 0 = nothing to rewrite. */
  iterations: number;
  /** Where to send them after paying. Must be a path on this site. */
  returnTo: string;
  /** What this tool gives away free, stated plainly and kept honest. */
  freeTier: string;
  /** For a bundle: the products it grants. Empty for a single product. */
  grants: ProductId[];
};

/**
 * THE KILL SWITCH. While false, nothing on the site is gated — every tool
 * behaves as though the visitor owns everything, paywalls never render, and no
 * checkout is offered. Use it whenever the paid experience can't be honoured:
 * before the live Stripe key exists, during an outage, or to pull selling
 * without reverting code.
 *
 * The rule it protects: never show someone a paywall we can't take money
 * through. A visitor who is offered less for free AND cannot buy the rest is
 * strictly worse off than before we shipped any of this.
 *
 * TO TURN PAYMENTS ON: add STRIPE_SECRET_KEY for Production in Vercel, then
 * set this to true and deploy. That is the whole change.
 */
export const PAYWALLS_ENABLED = false;

/**
 * Master switch for pricing. While false, /api/checkout refuses to create a Stripe session
 * and every paywall shows a "pricing soon" state, so nobody can be charged
 * mid-change. Flip to false to pull all selling at once without redeploying
 * page by page.
 */
export const PRICE_CONFIRMED = true;

export const CURRENCY = "usd";

export const PRODUCTS: Record<ProductId, Product> = {
  essay: {
    id: "essay",
    name: "Fledgy Essay Report + Rewrite",
    tagline: "The full report, and your essay rewritten in your own voice",
    description:
      "A full report on your essay against what admissions readers actually look for, plus your essay rewritten — keeping your voice, not replacing it. Rewrite it up to 2 times.",
    priceCents: 1500,
    priceDisplay: "$15",
    priceDisplayInr: "₹1,249",
    includes: [
      "The full report — structure, opening, evidence and ending, each with the specific fix",
      "Your essay rewritten in your own voice, not replaced with generic prose",
      "2 rewrites, so you can push it further after reading the report",
      "Written for readers outside the US and UK, not just American admissions",
    ],
    iterations: 2,
    returnTo: "/essay",
    freeTier:
      "Your score out of 100, an honest verdict, and your first fix — always free.",
    grants: [],
  },

  careers: {
    id: "careers",
    name: "Fledgy Full Career Report",
    tagline: "Every career matched to you, and the plan to get there",
    description:
      "Your complete career report: every career matched to your personality and aptitude scores, why each one fits you specifically, and a concrete action plan.",
    priceCents: 1800,
    priceDisplay: "$18",
    // $18 at the same ~₹83/$ rate used across the other rows.
    priceDisplayInr: "₹1,499",
    includes: [
      "Every matched career, not just the first one",
      "Why each fits your actual personality and aptitude scores",
      "Your action plan — the concrete next steps to get there",
      "Saved to your email, so you can come back to it any time",
    ],
    iterations: 0,
    returnTo: "/careers",
    freeTier:
      "Your personality and aptitude scores, your career type, your profile read, and one of your matched careers — always free.",
    grants: [],
  },

  cv: {
    id: "cv",
    name: "Fledgy CV Report + Written CV",
    tagline: "The full report, and a CV written for you",
    description:
      "A section-by-section report on your CV for your target country, plus a complete CV rewritten and formatted the way that country's recruiters expect, downloadable as a polished PDF. Rewrite it up to 3 times.",
    priceCents: 1900,
    priceDisplay: "$19",
    priceDisplayInr: "₹1,599",
    includes: [
      "A complete CV written for you, formatted for your target country",
      "Cross-cultural checks — photo, age, dates, length and tone, by country",
      "Action-led bullets rewritten to show real impact, never invented",
      "Download it as a polished, typeset PDF ready to send",
      "3 rewrites, so you can refine it as you apply",
    ],
    iterations: 3,
    returnTo: "/cv",
    freeTier:
      "Your score out of 100, an honest verdict, and two real fixes — always free.",
    grants: [],
  },

  cv_careers: {
    id: "cv_careers",
    name: "Fledgy CV + Career Report Bundle",
    tagline: "Work out the direction, then build the CV for it",
    description:
      "Your full career report and your CV written for you — the direction and the document together, for less than either plus the other.",
    priceCents: 2500,
    priceDisplay: "$25",
    priceDisplayInr: "₹2,099",
    includes: [
      "Everything in the full career report — every matched career and your action plan",
      "Everything in the CV product — your CV written for your target country, as a polished PDF",
      "3 CV rewrites included",
      "Saves $12 against buying the two separately",
    ],
    iterations: 3,
    returnTo: "/careers",
    freeTier: "",
    grants: ["cv", "careers"],
  },
};

/** Products a buyer actually receives from a purchase (a bundle fans out). */
export function grantedBy(id: ProductId): ProductId[] {
  const p = PRODUCTS[id];
  return p.grants.length > 0 ? p.grants : [id];
}

export function getProduct(id: unknown): Product | null {
  if (typeof id !== "string") return null;
  return PRODUCTS[id as ProductId] ?? null;
}

export function isProductId(id: unknown): id is ProductId {
  return typeof id === "string" && id in PRODUCTS;
}

/** Read directly by the CV page and its API route. */
export const CV_ITERATIONS = PRODUCTS.cv.iterations;
export const ESSAY_ITERATIONS = PRODUCTS.essay.iterations;
