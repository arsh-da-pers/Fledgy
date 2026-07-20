import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/logFeedback";
import { checkAndRecordUsage, isValidEmail, FREE_LIMIT } from "@/lib/usage";

export const runtime = "nodejs";

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in model response");
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  try {
    const { country, field, cv, email } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email so we can save your free scores." },
        { status: 400 }
      );
    }

    if (!cv || cv.trim().length < 50) {
      return NextResponse.json(
        { error: "Please paste a bit more of your CV (at least 50 characters)." },
        { status: 400 }
      );
    }
    if (!country) {
      return NextResponse.json(
        { error: "Please tell us the target country you're applying in." },
        { status: 400 }
      );
    }

    const usage = await checkAndRecordUsage(email);
    if (!usage.allowed) {
      logFeedback({ tool: "waitlist", email, hitTool: "cv" });
      return NextResponse.json(
        {
          paywall: true,
          error: `You've used your ${FREE_LIMIT} free scores. Paid access is coming soon — we've added you to the list and will email you when it's ready.`,
        },
        { status: 402 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error:
            "This deployment doesn't have an ANTHROPIC_API_KEY set yet. Add one in the project's environment variables to enable live scoring.",
        },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are Fledgy, a CV reviewer specialised in CROSS-CULTURAL hiring norms — not generic ATS keyword matching. Your core value is telling people from one country's CV conventions what actually needs to change for a completely different country's recruiters and hiring culture (e.g. a photo/age/marital status that's normal in one country but a red flag or illegal in another, different expected CV length, different date/education formatting, different tone).

Target country the person is applying in: ${country}
Target field: ${field || "not specified"}

CV text:
"""
${cv}
"""

Give a free, surface-level review only (the full paid report goes deeper). Return ONLY valid JSON, no other text, in this exact shape:
{
  "score": <integer 0-100, honest, not inflated>,
  "tips": ["<short tip, at least one must be a country-specific cultural norm point, not generic advice>", "<tip 2>", "<tip 3>"],
  "one_line_verdict": "<one blunt sentence on how ready this CV is for that country's recruiters>"
}`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "";
    const parsed = extractJson(raw);

    logFeedback({
      tool: "cv",
      email,
      country,
      field: field || null,
      score: parsed.score,
      verdict: parsed.one_line_verdict,
    });

    return NextResponse.json({ ...parsed, usesRemaining: usage.remaining });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong scoring this CV. Please try again." },
      { status: 500 }
    );
  }
}
