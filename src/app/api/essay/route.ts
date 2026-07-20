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
    const { university, course, essay, email } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email so we can save your free scores." },
        { status: 400 }
      );
    }

    if (!essay || essay.trim().length < 50) {
      return NextResponse.json(
        { error: "Please paste a bit more of your essay (at least 50 characters)." },
        { status: 400 }
      );
    }

    const usage = await checkAndRecordUsage(email);
    if (!usage.allowed) {
      logFeedback({ tool: "waitlist", email, hitTool: "essay" });
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

    const prompt = `You are Fledgy, an honest, unflattering admissions essay reviewer for international students applying to universities outside their home country. You never give empty praise. You are direct about weaknesses.

Target university: ${university || "not specified"}
Target course: ${course || "not specified"}

Essay:
"""
${essay}
"""

Give a free, surface-level review only (the full paid report goes deeper). Return ONLY valid JSON, no other text, in this exact shape:
{
  "score": <integer 0-100, honest, not inflated>,
  "tips": ["<short, specific, surface-level tip>", "<tip 2>", "<tip 3>"],
  "one_line_verdict": "<one blunt sentence on where this essay stands>"
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
      tool: "essay",
      email,
      university: university || null,
      course: course || null,
      score: parsed.score,
      verdict: parsed.one_line_verdict,
    });

    return NextResponse.json({ ...parsed, usesRemaining: usage.remaining });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong scoring this essay. Please try again." },
      { status: 500 }
    );
  }
}
