import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/logFeedback";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { country, field, cv } = await req.json();

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

Target country: ${country}
Target field: ${field || "not specified"}

Original CV text:
"""
${cv}
"""

Output ONLY the rewritten CV as clean plain text, ready to copy or download — use clear section headings (e.g. PROFILE, EXPERIENCE, EDUCATION, SKILLS) in upper case, and simple line breaks between entries. Do not include any commentary, explanation, or markdown formatting — just the CV text itself.`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1600,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    const generatedCv = textBlock && "text" in textBlock ? textBlock.text.trim() : "";

    if (!generatedCv) {
      throw new Error("No content generated");
    }

    logFeedback({
      tool: "cv_generate",
      country,
      field: field || null,
    });

    return NextResponse.json({ cv: generatedCv });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong generating your CV. Please try again." },
      { status: 500 }
    );
  }
}
