"use client";

import { useEffect, useMemo, useState } from "react";
import Mark from "@/components/Mark";
import PageFaq from "@/components/PageFaq";
import { CURRICULA, SUBJECTS_BY_CURRICULUM, type Curriculum } from "@/lib/curricula";
import { TRAIT_LABELS, type Trait } from "@/lib/personalityItems";

type PersonalityItem = { id: number; text: string; trait: Trait; keyed: "+" | "-" };
type AptitudeQuestion = { id: number; category: string; text: string; options: string[] };

type Result = {
  archetype?: { name: string; tagline: string };
  summary: string;
  careers: { title: string; why: string }[];
  next_steps: string[];
  traits: Record<Trait, number>;
  aptitude: { overall: number; byCategory: Record<string, number> };
  usesRemaining?: number;
};

const LIKERT = [
  { value: 1, label: "Very inaccurate" },
  { value: 2, label: "Moderately inaccurate" },
  { value: 3, label: "Neither" },
  { value: 4, label: "Moderately accurate" },
  { value: 5, label: "Very accurate" },
];

export default function CareersPage() {
  const [step, setStep] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [personalityItems, setPersonalityItems] = useState<PersonalityItem[]>([]);
  const [aptitudeQuestions, setAptitudeQuestions] = useState<AptitudeQuestion[]>([]);

  const [email, setEmail] = useState("");
  const [audience, setAudience] = useState<"student" | "switcher" | "">("");
  const [curriculum, setCurriculum] = useState<Curriculum | "">("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [otherSubjects, setOtherSubjects] = useState("");
  const [currentField, setCurrentField] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [switchReason, setSwitchReason] = useState("");

  const [personalityAnswers, setPersonalityAnswers] = useState<Record<number, number>>({});
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<number, number>>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  async function handleShare() {
    const a = result?.archetype;
    const text = a
      ? `My Fledgy career type is "${a.name}" — ${a.tagline} Find your direction free:`
      : "I just found my career direction with Fledgy. Find yours free:";
    const url = "https://fledgy.guide/careers";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "My Fledgy career type", text, url });
      } else if (navigator?.clipboard) {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch {
      // share cancelled — ignore
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem("fledgy_email");
    if (saved) setEmail(saved);
    fetch("/api/careers/questions")
      .then((r) => r.json())
      .then((data) => {
        setPersonalityItems(data.personalityItems);
        setAptitudeQuestions(data.aptitudeQuestions);
      })
      .finally(() => setLoadingQuestions(false));
  }, []);

  const subjectOptions = curriculum && curriculum !== "Other" ? SUBJECTS_BY_CURRICULUM[curriculum] : [];

  const step0Valid =
    email.trim().length > 3 &&
    (audience === "student"
      ? curriculum !== ""
      : audience === "switcher"
      ? currentField.trim().length > 1
      : false);
  const step1Valid = personalityItems.length > 0 && personalityItems.every((i) => personalityAnswers[i.id]);
  const step2Valid = aptitudeQuestions.length > 0 && aptitudeQuestions.every((q) => aptitudeAnswers[q.id] !== undefined);

  function toggleSubject(subject: string) {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setPaywall(false);
    try {
      window.localStorage.setItem("fledgy_email", email);
      const res = await fetch("/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.paywall) setPaywall(true);
        throw new Error(data.error || "Something went wrong.");
      }
      setResult(data);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = useMemo(() => {
    if (step === 0) return 0;
    if (step === 1) {
      const answered = personalityItems.filter((i) => personalityAnswers[i.id]).length;
      return personalityItems.length ? (answered / personalityItems.length) * 33 + 10 : 10;
    }
    if (step === 2) {
      const answered = aptitudeQuestions.filter((q) => aptitudeAnswers[q.id] !== undefined).length;
      return aptitudeQuestions.length ? (answered / aptitudeQuestions.length) * 33 + 43 : 43;
    }
    return 100;
  }, [step, personalityItems, personalityAnswers, aptitudeQuestions, aptitudeAnswers]);

  return (
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-2xl px-6 py-12">
        <div className="flex items-start justify-between">
          <span className="inline-block rounded-full bg-[#f4e8cf] px-2.5 py-1 text-xs font-bold tracking-widest text-[#8a6d2f]">
            FREE · CAREER DIRECTION QUIZ
          </span>
          <Mark size={40} opacity={0.85} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-[#2a2115]">
          Find your career direction
        </h1>
        <p className="mt-2 text-[#6b5c45]">
          A 5 to 7 minute quiz: a quick, validated personality snapshot plus a
          short aptitude check. Whether you&apos;re a student choosing a path
          or weighing a career switch, it&apos;s a solid starting point, not a
          clinical assessment.
        </p>

        {step < 3 && (
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[#f0dfc4]">
            <div
              className="h-full rounded-full bg-[#8a6d2f] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {loadingQuestions && step === 0 && (
          <p className="mt-8 text-sm text-[#6b5c45]">Loading…</p>
        )}

        {/* Step 0: profile */}
        {step === 0 && !loadingQuestions && (
          <div className="mt-8 space-y-4">
            <input
              type="email"
              className="w-full rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-[#8a6d2f] focus:outline-none"
              placeholder="Your email (so we can save your result)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <p className="mb-2 text-sm font-medium text-[#3a3629]">
                Where are you right now?
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { value: "student", label: "Student choosing a path" },
                  { value: "switcher", label: "Considering a career switch" },
                ].map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setAudience(a.value as "student" | "switcher")}
                    className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                      audience === a.value
                        ? "border-[#8a6d2f] bg-[#f4e8cf] text-[#5a4720] font-medium"
                        : "border-[#f0dfc4] bg-white text-[#3a3629] hover:border-[#c9b98a]"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {audience === "student" && (
              <>
                <div>
                  <p className="mb-2 text-sm font-medium text-[#3a3629]">Your curriculum</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CURRICULA.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          setCurriculum(c.value);
                          setSubjects([]);
                        }}
                        className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                          curriculum === c.value
                            ? "border-[#8a6d2f] bg-[#f4e8cf] text-[#5a4720] font-medium"
                            : "border-[#f0dfc4] bg-white text-[#3a3629] hover:border-[#c9b98a]"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {curriculum && curriculum !== "Other" && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-[#3a3629]">
                      Subjects you&apos;re studying (pick all that apply)
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {subjectOptions.map((s) => (
                        <label
                          key={s}
                          className="flex items-center gap-2 rounded-lg border border-[#f0dfc4] bg-white px-3 py-2 text-sm text-[#3a3629]"
                        >
                          <input
                            type="checkbox"
                            checked={subjects.includes(s)}
                            onChange={() => toggleSubject(s)}
                          />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  className="w-full rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-[#8a6d2f] focus:outline-none"
                  placeholder="Any other subjects not listed? (optional)"
                  value={otherSubjects}
                  onChange={(e) => setOtherSubjects(e.target.value)}
                />
              </>
            )}

            {audience === "switcher" && (
              <>
                <div>
                  <p className="mb-2 text-sm font-medium text-[#3a3629]">
                    What do you do now?
                  </p>
                  <input
                    className="w-full rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-[#8a6d2f] focus:outline-none"
                    placeholder="Your current field or role (e.g. Marketing, Teaching)"
                    value={currentField}
                    onChange={(e) => setCurrentField(e.target.value)}
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-[#3a3629]">
                    Years of work experience
                  </p>
                  <div className="grid gap-2 sm:grid-cols-4">
                    {["0-2", "3-5", "6-10", "10+"].map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setYearsExperience(y)}
                        className={`rounded-lg border px-3 py-3 text-center text-sm transition ${
                          yearsExperience === y
                            ? "border-[#8a6d2f] bg-[#f4e8cf] text-[#5a4720] font-medium"
                            : "border-[#f0dfc4] bg-white text-[#3a3629] hover:border-[#c9b98a]"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  className="w-full rounded-lg border border-[#f0dfc4] bg-white px-4 py-3 text-sm text-[#2a2115] placeholder-[#b0a186] focus:border-[#8a6d2f] focus:outline-none"
                  placeholder="What's pulling you to switch? (optional)"
                  value={switchReason}
                  onChange={(e) => setSwitchReason(e.target.value)}
                />
              </>
            )}

            <button
              type="button"
              disabled={!step0Valid}
              onClick={() => setStep(1)}
              className="w-full rounded-lg bg-[#8a6d2f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6f5825] disabled:opacity-40"
            >
              Continue to personality questions →
            </button>
          </div>
        )}

        {/* Step 1: personality */}
        {step === 1 && (
          <div className="mt-8 space-y-6">
            <p className="text-sm text-[#6b5c45]">
              Describe yourself as you generally are now, not as you wish to
              be. There are no right or wrong answers.
            </p>
            {personalityItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-[#f0dfc4] bg-white p-4">
                <p className="text-sm font-medium text-[#2a2115]">{item.text}</p>
                <div className="mt-3 grid grid-cols-5 gap-1">
                  {LIKERT.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setPersonalityAnswers((prev) => ({ ...prev, [item.id]: opt.value }))
                      }
                      title={opt.label}
                      className={`rounded-md border px-2 py-2 text-xs transition ${
                        personalityAnswers[item.id] === opt.value
                          ? "border-[#8a6d2f] bg-[#f4e8cf] text-[#5a4720] font-semibold"
                          : "border-[#f0dfc4] text-[#9c8b6f] hover:border-[#c9b98a]"
                      }`}
                    >
                      {opt.value}
                    </button>
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-[#b0a186]">
                  <span>Very inaccurate</span>
                  <span>Very accurate</span>
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="rounded-lg border border-[#f0dfc4] px-4 py-3 text-sm font-medium text-[#6b5c45] hover:border-[#c9b98a]"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className="flex-1 rounded-lg bg-[#8a6d2f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6f5825] disabled:opacity-40"
              >
                Continue to aptitude questions →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: aptitude */}
        {step === 2 && (
          <div className="mt-8 space-y-6">
            <p className="text-sm text-[#6b5c45]">
              Quick logical, numerical, and verbal questions. Go with your
              first instinct.
            </p>
            {aptitudeQuestions.map((q, i) => (
              <div key={q.id} className="rounded-lg border border-[#f0dfc4] bg-white p-4">
                <p className="text-sm font-medium text-[#2a2115]">
                  {i + 1}. {q.text}
                </p>
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setAptitudeAnswers((prev) => ({ ...prev, [q.id]: idx }))
                      }
                      className={`block w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                        aptitudeAnswers[q.id] === idx
                          ? "border-[#8a6d2f] bg-[#f4e8cf] text-[#5a4720] font-medium"
                          : "border-[#f0dfc4] text-[#3a3629] hover:border-[#c9b98a]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {error && paywall && (
              <div className="rounded-lg border border-[#f4d9a8] bg-[#fdf0d9] px-5 py-4">
                <p className="text-sm font-semibold text-[#7a5b26]">You&apos;re on the waitlist</p>
                <p className="mt-1 text-sm text-[#7a5b26]">{error}</p>
              </div>
            )}
            {error && !paywall && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-[#f0dfc4] px-4 py-3 text-sm font-medium text-[#6b5c45] hover:border-[#c9b98a]"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!step2Valid || submitting}
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-[#8a6d2f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6f5825] disabled:opacity-40"
              >
                {submitting ? "Working out your results…" : "See my results"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: results */}
        {step === 3 && result && (
          <div className="mt-8 space-y-6">
            {result.archetype && (
              <div className="relative overflow-hidden rounded-2xl border border-[#e7d3bc] bg-[#fdf3e7] p-6 shadow-sm">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#f3d9c9]"
                />
                <div className="relative flex items-center gap-2">
                  <Mark size={30} opacity={0.95} />
                  <span className="text-lg font-semibold text-teal-800">Fledgy</span>
                  <span className="ml-auto rounded-full bg-[#f4e8cf] px-2.5 py-1 text-[10px] font-bold tracking-widest text-[#8a6d2f]">
                    EARLY ACCESS
                  </span>
                </div>
                <p className="relative mt-4 text-xs font-bold tracking-widest text-[#c8532c]">
                  YOUR CAREER TYPE
                </p>
                <h2 className="relative mt-1 text-3xl font-semibold text-[#2a2115]">
                  {result.archetype.name}
                </h2>
                <p className="relative mt-2 text-sm text-[#6b5c45]">
                  {result.archetype.tagline}
                </p>
                <div className="relative mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
                  >
                    Share my type
                  </button>
                  <span className="text-xs text-[#b0a186]">
                    {shareCopied ? "Link copied!" : "or screenshot to share"}
                  </span>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-[#f0dfc4] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-sm italic text-[#3a3629]">{result.summary}</p>
                <Mark size={38} opacity={0.75} className="ml-3 shrink-0" />
              </div>

              <div className="mt-5 space-y-2">
                {(Object.keys(result.traits) as Trait[]).map((trait) => (
                  <div key={trait}>
                    <div className="flex justify-between text-xs text-[#6b5c45]">
                      <span>{TRAIT_LABELS[trait]}</span>
                      <span>{result.traits[trait]}/100</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#f0dfc4]">
                      <div
                        className="h-full rounded-full bg-teal-600"
                        style={{ width: `${result.traits[trait]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-4 text-xs text-[#6b5c45]">
                <span>Aptitude overall: {result.aptitude.overall}%</span>
                <span>Logical: {result.aptitude.byCategory.logical}%</span>
                <span>Numerical: {result.aptitude.byCategory.numerical}%</span>
                <span>Verbal: {result.aptitude.byCategory.verbal}%</span>
              </div>
            </div>

            {result.careers?.length > 0 && (
              <div>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold text-[#2a2115]">
                    Careers that fit you
                  </h2>
                  <span className="rounded-full bg-[#f4e8cf] px-2.5 py-1 text-[10px] font-bold tracking-widest text-[#8a6d2f]">
                    FREE · EARLY ACCESS
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {result.careers.map((c, i) => (
                    <div key={i} className="rounded-lg border border-[#f0dfc4] bg-white p-4">
                      <p className="text-sm font-semibold text-[#2a2115]">
                        {i + 1}. {c.title}
                      </p>
                      <p className="mt-1 text-sm text-[#6b5c45]">{c.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.next_steps?.length > 0 && (
              <div className="rounded-lg border border-[#f0dfc4] bg-[#fdf9f0] p-4">
                <p className="text-sm font-semibold text-[#2a2115]">Your next steps</p>
                <ul className="mt-2 space-y-1.5">
                  {result.next_steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#3a3629]">
                      <span className="text-[#8a6d2f]">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-[#b0a186]">
              This is guidance, not a verdict. Personality items adapted
              from the public-domain IPIP Mini-IPIP scales (Donnellan et
              al., 2006).
              {typeof result.usesRemaining === "number" && (
                <> You have {result.usesRemaining} free score{result.usesRemaining === 1 ? "" : "s"} left.</>
              )}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="/essay"
                className="rounded-lg border border-[#e2a68a] px-4 py-3 text-center text-sm font-semibold text-[#c8532c] hover:bg-[#fdf0e8]"
              >
                Now score my essay →
              </a>
              <a
                href="/cv"
                className="rounded-lg border border-teal-600 px-4 py-3 text-center text-sm font-semibold text-teal-700 hover:bg-teal-50"
              >
                Now score my CV →
              </a>
            </div>
          </div>
        )}

        <PageFaq
          title="About the career direction quiz"
          intro={[
            "Not sure which career or degree fits you? Fledgy's free career direction quiz combines a personality profile and an aptitude check to point you toward paths that match how you actually think and work. It's designed for students and early-career talent deciding what to study or do next.",
            "You'll answer a short set of questions and get a summary of your strengths, trait-by-trait scores, and career directions to explore — with guidance that accounts for studying and working internationally.",
          ]}
          faqs={[
            {
              q: "Is the career quiz free?",
              a: "Yes. The career direction quiz is free and gives you a personality and aptitude profile with career directions to explore.",
            },
            {
              q: "How long does the quiz take?",
              a: "Just a few minutes. You answer a short set of questions and get an instant summary of your traits and suggested career directions.",
            },
            {
              q: "What do I get at the end?",
              a: "A summary of your strengths, trait-by-trait scores, and career directions that fit your profile — a starting point for choosing a degree or career path.",
            },
            {
              q: "Is this useful for international students?",
              a: "Yes. Fledgy is built for people studying and working across borders, so the guidance factors in applying and building a career internationally.",
            },
          ]}
        />
      </div>
    </main>
  );
}
