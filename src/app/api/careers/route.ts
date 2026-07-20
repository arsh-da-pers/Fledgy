import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/logFeedback";
import { checkAndRecordUsage, isValidEmail, FREE_LIMIT } from "@/lib/usage";
import { scorePersonality, TRAIT_LABELS, type Trait } from "@/lib/personalityItems";
import { scoreAptitude } from "@/lib/aptitudeQuestions";

export const runtime = "nodejs";

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in model response");
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      curriculum,
      subjects,
      otherSubjects,
      personalityAnswers,
      aptitudeAnswers,
    } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email so we can save your result." },
        { status: 400 }
      );
    }
    if (!curriculum) {
      return NextResponse.json(
        { error: "Please tell us which curriculum you're studying." },
        { status: 400 }
      );
    }
    if (
      !personalityAnswers ||
      typeof personalityAnswers !== "object" ||
      Object.keys(personalityAnswers).length < 20
    ) {
      return NextResponse.json(
        { error: "Please answer all of the personality questions." },
        { status: 400 }
      );
    }
    if (
      !aptitudeAnswers ||
      typeof aptitudeAnswers !== "object" ||
      Object.keys(aptitudeAnswers).length < 12
    ) {
      return NextResponse.json(
        { error: "Please answer all of the aptitude questions." },
        { status: 400 }
      );
    }

    const usage = await checkAndRecordUsage(email);
    if (!usage.allowed) {
      logFeedback({ tool: "waitlist", email, hitTool: "careers" });
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
            "This deployment doesn't have an ANTHROPIC_API_KEY set yet. Add one in the project's environment variables to enable live results.",
        },
        { status: 500 }
      );
    }

    const traits = scorePersonality(personalityAnswers);
    const aptitude = scoreAptitude(aptitudeAnswers);

    const traitSummary = (Object.keys(traits) as Trait[])
      .map((t) => `${TRAIT_LABELS[t]}: ${traits[t]}/100`)
      .join(", ");

    const subjectList = [
      ...(Array.isArray(subjects) ? subjects : []),
      ...(otherSubjects ? [otherSubjects] : []),
    ].join(", ") || "not specified";

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are Fledgy's career guidance advisor, speaking to a high-school-aged student who is exploring what to study or do next. You've just given them a short, validated personality snapshot (Mini-IPIP Big Five) and a quick aptitude quiz — this is directional guidance, not a formal diagnostic or a guarantee.

Curriculum: ${curriculum}
Subjects studied: ${subjectList}

Big Five personality scores (0-100 scale): ${traitSummary}

Aptitude quiz results (0-100 scale): Overall ${aptitude.overall}, Logical reasoning ${aptitude.byCategory.logical}, Numerical reasoning ${aptitude.byCategory.numerical}, Verbal reasoning ${aptitude.byCategory.verbal}

Based on all of this together (personality + aptitude strengths + subjects), recommend the 5 career paths that fit this student best. Be specific (e.g. "Actuarial Science" not just "Maths-related jobs") and vary the 5 across a couple of different fields where the evidence supports it — don't just list 5 versions of the same career. For each, briefly explain WHY it fits, referencing their actual scores/subjects, not generic praise.

Return ONLY valid JSON, no other text, in this exact shape:
{
  "summary": "<one warm, 2-sentence overview of this student's overall profile>",
  "careers": [
    { "title": "<career name>", "why": "<1-2 sentences tying it to their specific traits/aptitude/subjects>" },
    { "title": "<career name>", "why": "<...>" },
    { "title": "<career name>", "why": "<...>" },
    { "title": "<career name>", "why": "<...>" },
    { "title": "<career name>", "why": "<...>" }
  ],
  "next_steps": ["<short, concrete suggestion, e.g. a subject/exam/extracurricular to explore>", "<suggestion 2>", "<suggestion 3>"]
}`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "";
    const parsed = extractJson(raw);

    logFeedback({
      tool: "careers",
      email,
      curriculum,
      aptitudeScore: aptitude.overall,
    });

    return NextResponse.json({
      traits,
      aptitude,
      ...parsed,
      usesRemaining: usage.remaining,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong generating your results. Please try again." },
      { status: 500 }
    );
  }
}
