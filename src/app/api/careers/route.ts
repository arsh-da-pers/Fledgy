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
      growthGoal,
      personalityAnswers,
      aptitudeAnswers,
    } = await req.json();

    const isSwitcher = audience === "switcher";
    const isAdvancer = audience === "advancer";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email so we can save your result." },
        { status: 400 }
      );
    }
    if (isSwitcher || isAdvancer) {
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

    const contextBlock = isAdvancer
      ? `Current field or role: ${currentField}
Years of work experience: ${yearsExperience || "not specified"}
Where they want to grow: ${growthGoal || "not specified"}`
      : isSwitcher
      ? `Current field or role: ${currentField}
Years of work experience: ${yearsExperience || "not specified"}
Reason for considering a switch: ${switchReason || "not specified"}`
      : `Curriculum: ${curriculum}
Subjects studied: ${subjectList}`;

    const audienceNoun = isAdvancer
      ? "working professional looking to grow and advance in their current field"
      : isSwitcher
      ? "working adult considering a career switch"
      : "student exploring what to study or do next";

    // EARLY ACCESS: the full report is open for free (badged "early access" in
    // the UI) — archetype, a warm read, 5-6 matched careers with reasoning, and
    // a short action plan. Will move behind the paywall later.
    const backgroundWord = isSwitcher || isAdvancer ? "background" : "subjects";
    const prompt = `You are Fledgy's career guidance advisor, speaking to a ${audienceNoun}. This is based on a short validated personality snapshot (Mini-IPIP Big Five) and a quick aptitude quiz — directional guidance, not a formal diagnostic.

${contextBlock}

Big Five personality scores (0-100 scale): ${traitSummary}

Aptitude quiz results (0-100 scale): Overall ${aptitude.overall}, Logical ${aptitude.byCategory.logical}, Numerical ${aptitude.byCategory.numerical}, Verbal ${aptitude.byCategory.verbal}

Produce a full career report:
1) A career ARCHETYPE: a short, memorable, positive "type" label (2-4 words, e.g. "The Strategist", "The Builder", "The Connector", "The Analyst") that captures their personality + aptitude pattern, plus a one-line tagline. Make it feel personal and shareable, grounded in their actual scores.
2) A warm, encouraging 2-3 sentence read of their overall profile.
3) The 5-6 ${isAdvancer ? "growth directions that make sense for them — specific roles, specialisations, or senior moves to aim for within or adjacent to their current field" : "career paths that fit them best"}. Be specific (e.g. "Actuarial Science", not "maths jobs"), vary across a couple of directions where the evidence supports it, and for each explain WHY it fits their actual traits/aptitude/${backgroundWord}.${isSwitcher ? " Favour realistic moves that build on their existing experience." : ""}${isAdvancer ? " Favour realistic upward or specialising moves that build on their existing experience." : ""}
4) A short, concrete action plan of 3 next steps${isAdvancer ? " — focus on specific courses, certifications, or credentials they should take to develop themselves toward those directions, naming real, well-known ones where possible" : isSwitcher ? " (e.g. a skill to build, a certification, or a way to test a field)" : " (e.g. a subject, exam, or extracurricular to explore)"}.

Return ONLY valid JSON, no other text, in this exact shape:
{
  "archetype": { "name": "<2-4 word type>", "tagline": "<one short line>" },
  "summary": "<2-3 sentence read of their profile>",
  "careers": [
    { "title": "<career name>", "why": "<1-2 sentences tying it to their specific traits/aptitude/${backgroundWord}>" }
  ],
  "next_steps": ["<step 1>", "<step 2>", "<step 3>"]
}
The careers array must have 5 or 6 items.`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text : "";
    const parsed = extractJson(raw);

    logFeedback({
      tool: "careers",
      email,
      audience: isAdvancer ? "advancer" : isSwitcher ? "switcher" : "student",
      curriculum: isSwitcher || isAdvancer ? currentField : curriculum,
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
