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
      audience,
      curriculum,
      subjects,
      otherSubjects,
      currentField,
      yearsExperience,
      switchReason,
      personalityAnswers,
      aptitudeAnswers,
    } = await req.json();

    const isSwitcher = audience === "switcher";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email so we can save your result." },
        { status: 400 }
      );
    }
    if (isSwitcher) {
      if (!currentField || String(currentField).trim().length < 2) {
        return NextResponse.json(
          { error: "Please tell us what field or role you're in now." },
          { status: 400 }
        );
      }
    } else if (!curriculum) {
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

    const contextBlock = isSwitcher
      ? `Current field or role: ${currentField}
Years of work experience: ${yearsExperience || "not specified"}
Reason for considering a switch: ${switchReason || "not specified"}`
      : `Curriculum: ${curriculum}
Subjects studied: ${subjectList}`;

    const audienceNoun = isSwitcher
      ? "working adult considering a career switch"
      : "student exploring what to study or do next";

    // FREE tier: return the validated scores, a warm read, and ONE deliberately
    // NON-top career as a teaser. The strongest matches, reasoning for each, the
    // action plan and the roadmap are held for the paid Full Career Report.
    const prompt = `You are Fledgy's career guidance advisor, speaking to a ${audienceNoun}. This is based on a short validated personality snapshot (Mini-IPIP Big Five) and a quick aptitude quiz — directional guidance, not a formal diagnostic.

${contextBlock}

Big Five personality scores (0-100 scale): ${traitSummary}

Aptitude quiz results (0-100 scale): Overall ${aptitude.overall}, Logical ${aptitude.byCategory.logical}, Numerical ${aptitude.byCategory.numerical}, Verbal ${aptitude.byCategory.verbal}

Do two things:
1) Write a warm, encouraging 2-3 sentence read of what their personality and aptitude pattern says about how they work and where they tend to thrive. Do NOT name specific job titles or careers here.
2) Internally work out their strongest career matches, then return ONLY ONE career as a free teaser — and deliberately NOT their single strongest or most obvious match. Choose a genuine, well-fitting secondary direction worth exploring. Their strongest matches are reserved for the paid full report, so do not reveal them.

Return ONLY valid JSON, no other text, in this exact shape:
{
  "summary": "<2-3 sentence read of their profile, no job titles>",
  "teaser_career": { "title": "<one solid secondary career, NOT their top match>", "why": "<1-2 sentences tying it to their actual traits/aptitude/background>" }
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
      tool: "careers",
      email,
      audience: isSwitcher ? "switcher" : "student",
      curriculum: isSwitcher ? currentField : curriculum,
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
