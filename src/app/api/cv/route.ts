import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/logFeedback";
import { hasProduct } from "@/lib/entitlements";
import { checkAndRecordUsage, isValidEmail, FREE_LIMIT } from "@/lib/usage";
import { recordToolUse } from "@/lib/leads";

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

    // Buyers are never rate-limited by the free cap.
    const entitled = await hasProduct(email, "cv");

    const usage: { allowed: boolean; remaining?: number } = entitled
      ? { allowed: true, remaining: undefined }
      : await checkAndRecordUsage(email, "cv");

    if (!usage.allowed) {
      logFeedback({ tool: "waitlist", email, hitTool: "cv" });
      return NextResponse.json(
        {
          paywall: true,
          error: `You've used your ${FREE_LIMIT} free scores on this tool. The other Fledgy tools are still free to use.`,
        },
        { status: 402 }
      );
    }

    await recordToolUse(email, "cv");

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

Judge the CV on these, in priority order, and score honestly:
1. CROSS-CULTURAL FIT for ${country}'s recruiters (your core lens — always include at least one country-specific norm point).
2. ACTION- AND RESULTS-BASED WRITING. Strong CVs lead each bullet with a punchy action verb and show measurable IMPACT (numbers, %, scale, outcomes) — not a passive list of duties/"responsible for". Penalise duty-listing, vague, passive phrasing, and reward quantified achievements.
3. LENGTH & FOCUS. Most CVs should be 1-2 pages (1 for students/early-career). If the CV is clearly too long, padded, or dense, flag it — a 3+ page CV is usually a red flag, not a strength. Reward tight, relevant, well-prioritised content.

Give a free, surface-level review only (the full paid report goes deeper). Return ONLY valid JSON, no other text, in this exact shape:
{
  "score": <integer 0-100, honest, not inflated>,
  "tips": ["<at least one country-specific cultural norm point>", "<at least one on making bullets more action-led and quantified, IF the CV needs it>", "<a tip on length/focus or another top issue>"],
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

    // Free is a genuine glimpse — the honest score, the verdict, and the first
    // concrete fix. The rest of the report is paid. Withheld server-side, so
    // it can't be read out of the network tab.
    const allTips = Array.isArray(parsed?.tips) ? parsed.tips : [];
    const tips = entitled ? allTips : allTips.slice(0, 1);

    return NextResponse.json({
      ...parsed,
      tips,
      locked: !entitled,
      lockedTipCount: entitled ? 0 : Math.max(0, allTips.length - tips.length),
      entitled,
      usesRemaining: usage.remaining,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong scoring this CV. Please try again." },
      { status: 500 }
    );
  }
}
