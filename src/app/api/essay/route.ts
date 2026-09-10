import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/logFeedback";
import { hasProduct } from "@/lib/entitlements";
import { PAYWALLS_ENABLED } from "@/lib/products";
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

    // Buyers are never rate-limited by the free cap.
    const entitled = await hasProduct(email, "essay");

    // Only a real purchase lifts the free cap. When PAYWALLS_ENABLED is false
    // everyone reads as entitled, so without this guard nothing would be
    // metered at all and the model spend would be unbounded.
    const usage: { allowed: boolean; remaining?: number } =
      PAYWALLS_ENABLED && entitled
        ? { allowed: true, remaining: undefined }
        : await checkAndRecordUsage(email, "essay");

    if (!usage.allowed) {
      logFeedback({ tool: "waitlist", email, hitTool: "essay" });
      return NextResponse.json(
        {
          paywall: true,
          error: `You've used your ${FREE_LIMIT} free scores on this tool. The other Fledgy tools are still free to use.`,
        },
        { status: 402 }
      );
    }

    await recordToolUse(email, "essay");

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

    const prompt = `You are Fledgy, an honest, unflattering admissions essay reviewer for university applicants, including international students applying abroad. You never give empty praise. You are direct about weaknesses.

Target university: ${university || "not specified"}
Target course: ${course || "not specified"}

Essay:
"""
${essay}
"""

Judge the essay on these, and score honestly:
1. OPENING. Does the first line earn the second? Generic throat-clearing, a dictionary definition, or a quote that isn't theirs is a weakness, not a style choice.
2. SPECIFICITY AND EVIDENCE. Concrete, particular detail only this person could have written beats any amount of eloquent generality. Penalise claims about themselves with nothing behind them.
3. STRUCTURE. Does it go somewhere, or circle? Reward a shape the reader can follow; flag paragraphs that could be reordered without anyone noticing.
4. VOICE. It should sound like a person, not an applicant performing. Flag borrowed admissions-essay cadence and inflated vocabulary.
5. ENDING. Does it land, or trail off into a restatement of the opening?
6. READERS OUTSIDE THE US AND UK. Where the essay assumes an American frame that its actual target reader won't share, say so.

Give the FULL review — every fix worth making. The server decides how much of it the reader has paid to see, so never hold back here and never mention free, paid, or unlocking.

ORDER THE TIPS BY IMPACT, STRONGEST FIRST. tips[0] must be the single change that would most improve this essay's chances; the last entry is the least significant. This ordering is load-bearing, so weigh it properly rather than listing them in the order you happened to notice them.

Return ONLY valid JSON, no other text, in this exact shape:
{
  "score": <integer 0-100, honest, not inflated>,
  "tips": ["<the single highest-impact fix>", "<the next highest>", "<...>", "<...>", "<...>", "<the least significant fix>"],
  "one_line_verdict": "<one blunt sentence on where this essay stands>"
}
Give 7 or 8 tips, each short and specific enough to act on.`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1400,
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

    // Free is a genuine glimpse: the honest score, the verdict, and three real
    // fixes — but the LEAST significant three. The model ranks tips strongest
    // first, so the free tier serves from the end of that list and the fixes
    // that would move the needle most are what unlocking buys. This matches
    // /api/cv and /api/careers; essay used to take slice(0, 1), which handed
    // out the single BEST fix and left the weak ones behind the paywall.
    // Sliced server-side, so the withheld ones can't be read out of the
    // network tab.
    const allTips: string[] = Array.isArray(parsed?.tips) ? parsed.tips : [];
    const FREE_TIPS = 3;
    const tips = entitled ? allTips : allTips.slice(-FREE_TIPS);

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
      { error: "Something went wrong scoring this essay. Please try again." },
      { status: 500 }
    );
  }
}
