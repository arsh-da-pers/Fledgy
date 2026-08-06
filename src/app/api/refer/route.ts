import { NextRequest, NextResponse } from "next/server";
import { creditReferral, isValidEmail } from "@/lib/usage";

export const runtime = "nodejs";

// Records that `email` was referred by `referrer`, crediting the referrer with
// an extra free use. Always responds ok — referral is a best-effort side
// effect and must never block or error a user's flow.
export async function POST(req: NextRequest) {
  try {
    const { referrer, email } = await req.json();
    if (isValidEmail(String(email || "")) && isValidEmail(String(referrer || ""))) {
      await creditReferral(String(referrer), String(email));
    }
  } catch {
    // ignore — best effort
  }
  return NextResponse.json({ ok: true });
}
