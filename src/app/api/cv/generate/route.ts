import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/logFeedback";
import { checkAndRecordUsage, isValidEmail, FREE_LIMIT } from "@/lib/usage";
import { consumeIteration, refundIteration } from "@/lib/entitlements";
import { CV_ITERATIONS, PAYWALLS_ENABLED } from "@/lib/products";

export const runtime = "nodejs";

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

    // The written CV is the paid product. Scoring a CV stays free — that lives
    // in /api/cv — but having one written for you needs the bundle, and each
    // rewrite spends one of the buyer's iterations.
    // While paywalls are off nobody has bought a quota, so consumeIteration
    // always allows — meter these against the free cap instead, or this
    // endpoint is an uncapped model-spend hole.
    if (!PAYWALLS_ENABLED) {
      const free = await checkAndRecordUsage(email, "cv_generate");
      if (!free.allowed) {
        return NextResponse.json(
          {
            paywall: true,
            error: `You've used your ${FREE_LIMIT} free CV rewrites. More coming soon.`,
          },
          { status: 402 }
        );
      }
    }

    const iteration = await consumeIteration(email, "cv");

    if (!iteration.allowed) {
      if (iteration.reason === "exhausted") {
        logFeedback({ tool: "cv_generate_exhausted", email });
        return NextResponse.json(
          {
            exhausted: true,
            error: `You've used all ${CV_ITERATIONS} of your CV rewrites. Your last version is still yours to download.`,
          },
          { status: 403 }
        );
      }

      logFeedback({ tool: "waitlist", email, hitTool: "cv_generate" });
      return NextResponse.json(
        {
          paywall: true,
          error: "Unlock the bundle to have your CV written for you.",
        },
        { status: 402 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error:
            "This deployment doesn't have an ANTHROPIC_API_KEY set yet. Add one in the project's environment variables to enable live generation.",
        },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are Fledgy, a CV writer specialised in CROSS-CULTURAL hiring norms. Take the person's existing CV content below and REWRITE it into a clean, well-structured CV formatted the way recruiters in the target country actually expect — correct section order, length, level of detail, tone, and any country-specific conventions (e.g. whether to include a photo/age/nationality, date formats, how achievements are phrased). Keep all of the person's real facts, experience, and education — do not invent new jobs, degrees, or achievements. Improve the wording, structure, and formatting; do not fabricate content.

Make every experience bullet ACTION- AND RESULTS-BASED:
- Start each bullet with a strong action verb (Led, Built, Grew, Negotiated, Delivered, Streamlined…), not "Responsible for" or passive phrasing.
- Surface measurable impact wherever the original content supports it (numbers, %, scale, outcomes). Never invent figures — only quantify where the person's own content gives you something real to work with.
- Cut duty-listing and filler; keep it tight.

LENGTH — TREAT THIS AS A HARD CONSTRAINT, NOT A PREFERENCE:
First work out the correct page count for ${country} from that country's actual hiring convention, and from how much real experience this person has. A US or Canadian resume for someone under ten years in is ONE page. The UK, the Gulf, India and most of Europe run to TWO. Very few countries ever want three, and a CV that runs long reads as someone who cannot prioritise — which costs interviews.
The layout this is typeset into fits roughly 500 words per page. So decide the page count, multiply by 500, and keep the entire CV under that word count. Do not go over it.
To hit the budget, cut rather than compress: drop the oldest and least relevant roles to a single line each, remove generic skills anyone would claim, delete filler sections, and keep only the bullets that carry real evidence. Never shrink every bullet into vagueness to fit — a shorter CV of specific claims beats a longer one of weak ones.
Say nothing about length, page count, or what you cut.

Target country: ${country}
Target field: ${field || "not specified"}

Original CV text:
"""
${cv}
"""

Output ONLY the rewritten CV as clean plain text, ready to copy or download — use clear section headings (e.g. PROFILE, EXPERIENCE, EDUCATION, SKILLS) in upper case, and simple line breaks between entries. Do not include any commentary, explanation, or markdown formatting — just the CV text itself.`;

    const msg = await anthropic.messages
      .create({
        model: "claude-sonnet-4-5",
        max_tokens: 1600,
        messages: [{ role: "user", content: prompt }],
      })
      .catch(async (err) => {
        // Generation failed after we'd already spent one of their three —
        // give it straight back before surfacing the error.
        await refundIteration(email, "cv");
        throw err;
      });

    const textBlock = msg.content.find((b) => b.type === "text");
    const generatedCv = textBlock && "text" in textBlock ? textBlock.text.trim() : "";

    if (!generatedCv) {
      await refundIteration(email, "cv");
      throw new Error("No content generated");
    }

    logFeedback({
      tool: "cv_generate",
      email,
      country,
      field: field || null,
    });

    return NextResponse.json({
      cv: generatedCv,
      iterationsUsed: iteration.used,
      iterationsLeft: iteration.remaining,
      iterationsTotal: CV_ITERATIONS,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong generating your CV. Please try again." },
      { status: 500 }
    );
  }
}
