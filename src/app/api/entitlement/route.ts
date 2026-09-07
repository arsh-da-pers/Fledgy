// What has this email paid for, and what's waiting for them?
//
// The tool pages call this to decide between the paywall and the unlocked
// view, and to reveal a parked career report after payment.

import { NextRequest, NextResponse } from "next/server";
import { getEntitlements, getReport } from "@/lib/entitlements";
import { isValidEmail } from "@/lib/usage";
import { PAYWALLS_ENABLED, PRODUCTS, isProductId, type ProductId } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, product, includeReport } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ entitled: false, iterationsLeft: 0, owned: [] });
    }

    // Paywalls off: report full access so no page renders a paywall.
    if (!PAYWALLS_ENABLED) {
      const target = isProductId(product) ? product : null;
      return NextResponse.json({
        entitled: true,
        owned: Object.keys(PRODUCTS),
        iterationsLeft: target ? PRODUCTS[target].iterations : 0,
        iterationsTotal: target ? PRODUCTS[target].iterations : 0,
        report: includeReport ? await getReport(email) : null,
      });
    }

    const owned = await getEntitlements(email);
    const ownedIds = Object.keys(owned) as ProductId[];

    // Asked about one product in particular?
    const target = isProductId(product) ? product : null;
    const entry = target ? owned[target] : undefined;
    const iterationsLeft =
      target && entry
        ? Math.max(0, PRODUCTS[target].iterations - entry.iterationsUsed)
        : 0;

    // The full report only ever goes to someone who has paid for it.
    const report =
      includeReport && owned.careers ? await getReport(email) : null;

    return NextResponse.json({
      entitled: target ? Boolean(entry) : ownedIds.length > 0,
      owned: ownedIds,
      iterationsLeft,
      iterationsTotal: target ? PRODUCTS[target].iterations : 0,
      report: report
        ? { careers: report.careers, next_steps: report.next_steps }
        : null,
    });
  } catch (err) {
    console.error("[fledgy:entitlement]", err);
    return NextResponse.json({ entitled: false, iterationsLeft: 0, owned: [] });
  }
}
