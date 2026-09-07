// The paid essay rewrite. Mirrors /api/cv/generate: entitlement required, one
// of the buyer's rewrites spent per run, refunded if generation fails.

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/logFeedback";
import { checkAndRecordUsage, isValidEmail, FREE_LIMIT } from "@/lib/usage";
import { consumeIteration, refundIteration } from "@/lib/entitlements";
import { ESSAY_ITERATIONS, PAYWALLS_ENABLED } from "@/lib/products";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { university, course, essay, email } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email." },
        { status: 400 }
      );
    }

    if (!essay || essay.trim().length < 50) {
      return NextResponse.json(
        { error: "Please paste a bit more of your essay (at least 50 characters)." },
        { status: 400 }
      );
    }

    // While paywalls are off nobody has bought a quota, so consumeIteration
    // always allows — meter these against the free cap instead, or this
    // endpoint is an uncapped model-spend hole.
    if (!PAYWALLS_ENABLED) {
      const free = await checkAndRecordUsage(email, "essay_rewrite");
      if (!free.allowed) {
        return NextResponse.json(
          {
            paywall: true,
            error: `You've used your ${FREE_LIMIT} free essay rewrites. More coming soon.`,
          },
          { status: 402 }
        );
      }
    }

    const iteration = await consumeIteration(email, "essay");

    if (!iteration.allowed) {
      if (iteration.reason === "exhausted") {
        logFeedback({ tool: "essay_rewrite_exhausted", email });
        return NextResponse.json(
          {
            exhausted: true,
            error: `You've used all ${ESSAY_ITERATIONS} of your rewrites. Your last version is still yours to keep.`,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { paywall: true, error: "Unlock the full report to have your essay rewritten." },
        { status: 402 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      await refundIteration(email, "essay");
      return NextResponse.json(
        {
          error:
            "This deployment doesn't have an ANTHROPIC_API_KEY set yet. Add one in the project's environment variables to enable rewrites.",
        },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are Fledgy, rewriting a university application essay. The single most important rule: this must still sound like THE APPLICANT, not like you. Keep their voice, their register, their specific memories and details. You are editing, not replacing.

Target university: ${university || "not specified"}
Target course: ${course || "not specified"}

What to do:
- Keep every real fact, memory, and example. Never invent an experience, an achievement, a quotation, or a statistic.
- Fix structure first: a genuine hook, a clear through-line, and an ending that lands rather than summarises.
- Cut cliché openings, throat-clearing, and generic ambition statements ("I have always been passionate about…").
- Show rather than tell — push their own concrete detail forward instead of adding adjectives.
- Keep roughly the same length unless the essay is clearly padded, in which case tighten it.
- Write for a reader who may not be American. Do not assume US admissions conventions unless the target says so.

Essay:
"""
${essay}
"""

Output ONLY the rewritten essay as clean plain text — no commentary, no headings, no markdown, no notes about what you changed.`;

    const msg = await anthropic.messages
      .create({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      })
      .catch(async (err) => {
        // Don't let them lose a rewrite to our failure.
        await refundIteration(email, "essay");
        throw err;
      });

    const textBlock = msg.content.find((b) => b.type === "text");
    const rewritten = textBlock && "text" in textBlock ? textBlock.text.trim() : "";

    if (!rewritten) {
      await refundIteration(email, "essay");
      throw new Error("No content generated");
    }

    logFeedback({ tool: "essay_rewrite", email, university: university || null });

    return NextResponse.json({
      essay: rewritten,
      iterationsUsed: iteration.used,
      iterationsLeft: iteration.remaining,
      iterationsTotal: ESSAY_ITERATIONS,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong rewriting your essay. Please try again." },
      { status: 500 }
    );
  }
}
