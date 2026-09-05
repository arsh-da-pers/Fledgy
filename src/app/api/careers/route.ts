import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { logFeedback } from "@/lib/logFeedback";
import { checkAndRecordUsage, isValidEmail, FREE_LIMIT } from "@/lib/usage";
import { recordToolUse } from "@/lib/leads";
import { scorePersonality, TRAIT_LABELS, type Trait } from "@/lib/personalityItems";
import { scoreAptitude } from "@/lib/aptitudeQuestions";
import { hasProduct, saveReport } from "@/lib/entitlements";

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

    // Buyers are never rate-limited by the free cap.
    const entitled = await hasProduct(email, "careers");

    const usage: { allowed: boolean; remaining?: number } = entitled
      ? { allowed: true, remaining: undefined }
      : await checkAndRecordUsage(email, "careers");

    if (!usage.allowed) {
      logFeedback({ tool: "waitlist", email, hitTool: "careers" });
      return NextResponse.json(
        {
          paywall: true,
          error: `You've used your ${FREE_LIMIT} free runs of the career quiz. Unlock the full report to go deeper.`,
        },
        { status: 402 }
      );
    }

    await recordToolUse(email, "careers");

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

    // The model always produces the whole report. What differs is how much of
    // it leaves the server: free gets the archetype and the profile read, the
    // paid bundle gets the matched careers and the action plan. The full text
    // is parked in KV either way so it can be revealed the instant they buy —
    // nobody has to retake the quiz after paying.
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

    const careers = Array.isArray(parsed?.careers) ? parsed.careers : [];
    const nextSteps = Array.isArray(parsed?.next_steps) ? parsed.next_steps : [];

    await saveReport(email, { careers, next_steps: nextSteps });

    // The free tier is a genuine taste, never the whole thing: the scores, the
    // career type, the profile read, and the FIRST matched career with its
    // reasoning. The remaining careers and the action plan are always paid.
    // Anything withheld is withheld server-side — trimming it in the UI alone
    // would still leave it readable in the network tab.
    const freeCareers = careers.slice(0, 1);

    return NextResponse.json({
      traits,
      aptitude,
      archetype: parsed?.archetype,
      summary: parsed?.summary,
      careers: entitled ? careers : freeCareers,
      next_steps: entitled ? nextSteps : [],
      locked: !entitled,
      // How many are being held back, so the paywall can say so honestly.
      lockedCareerCount: entitled ? 0 : Math.max(0, careers.length - freeCareers.length),
      totalCareerCount: careers.length,
      entitled,
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
