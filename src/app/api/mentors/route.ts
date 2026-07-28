import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/logFeedback";
import { isValidEmail } from "@/lib/usage";
import { recordLead } from "@/lib/leads";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, role, name, expertise } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email." },
        { status: 400 }
      );
    }
    if (role !== "seeker" && role !== "mentor") {
      return NextResponse.json(
        { error: "Please choose whether you want mentoring or want to mentor." },
        { status: 400 }
      );
    }
    if (role === "mentor" && (!expertise || String(expertise).trim().length < 2)) {
      return NextResponse.json(
        { error: "Please tell us your field or area of expertise." },
        { status: 400 }
      );
    }

    logFeedback({
      tool: "waitlist",
      hitTool: "mentors",
      role,
      name: name ? String(name).trim() : undefined,
      expertise: expertise ? String(expertise).trim() : undefined,
      email,
    });

    await recordLead(email, {
      source: "mentors",
      role,
      name: name ? String(name).trim() : undefined,
      expertise: expertise ? String(expertise).trim() : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
