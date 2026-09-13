import { NextRequest, NextResponse } from "next/server";
import { recordReferrer, isValidEmail } from "@/lib/usage";

export const runtime = "nodejs";

// Records that `email` was referred by `referrer`. Nothing is paid out here —
// the referrer earns their discount only when this person actually buys, in
// creditReferrerOnPurchase. Always responds ok: referral is a best-effort side
// effect and must never block or error a user's flow.
export async function POST(req: NextRequest) {
  try {
    const { referrer, email } = await req.json();
    if (isValidEmail(String(email || "")) && isValidEmail(String(referrer || ""))) {
      await recordReferrer(String(referrer), String(email));
    }
  } catch {
    // ignore — best effort
  }
  return NextResponse.json({ ok: true });
}
