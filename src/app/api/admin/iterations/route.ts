import { NextRequest, NextResponse } from "next/server";
import { setIterationsUsed } from "@/lib/entitlements";
import { isProductId } from "@/lib/products";
import { isValidEmail } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Support endpoint: give a buyer their rewrites back.
//
// Needed because a rewrite can be spent on a failure the buyer did not cause.
// The generation path now refunds on any error, but that does not help anyone
// whose quota was already burned before the fix — and "we cannot give you what
// you paid for" is not an acceptable answer.
//
// Guarded by LEADS_ADMIN_KEY, the key that already gates /leads-dashboard, so
// this adds no new secret. Sent as a bearer token rather than a query string
// because a secret in a URL ends up in logs and browser history.
export async function POST(req: NextRequest) {
  const adminKey = process.env.LEADS_ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${adminKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, product, used } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!isProductId(product)) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    const result = await setIterationsUsed(email, product, Number(used) || 0);
    if (!result) {
      return NextResponse.json(
        { error: `${email} does not own "${product}" — nothing to restore.` },
        { status: 404 }
      );
    }

    console.log(
      `[fledgy:admin] iterations for ${email} / ${product} set to used=${result.used}`
    );
    return NextResponse.json({ ok: true, email, product, ...result });
  } catch (err) {
    console.error("[fledgy:admin] iterations", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
