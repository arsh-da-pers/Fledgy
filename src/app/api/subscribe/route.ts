import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/logFeedback";
import { isValidEmail } from "@/lib/usage";
import { recordLead } from "@/lib/leads";

export const runtime = "nodejs";

// Homepage email capture. Records the address as a lead with source
// "homepage" so it shows up in /leads-dashboard alongside tool users and the
// mentors waitlist. Deliberately asks for nothing but the email.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email." },
        { status: 400 }
      );
    }

    logFeedback({ tool: "waitlist", hitTool: "homepage", email });

    await recordLead(email, { source: "homepage", role: "seeker" });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
