"use client";

import { useEffect, useMemo, useState } from "react";
import Mark from "@/components/Mark";
import PageFaq from "@/components/PageFaq";
import ReferralInvite from "@/components/ReferralInvite";
import Paywall from "@/components/Paywall";
import { fireReferral } from "@/lib/referClient";
import { track } from "@vercel/analytics";
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
  locked?: boolean;
  lockedCareerCount?: number;
  totalCareerCount?: number;
  entitled?: boolean;
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
  const [audience, setAudience] = useState<
    "student" | "switcher" | "advancer" | ""
  >("");
  const [curriculum, setCurriculum] = useState<Curriculum | "">("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [otherSubjects, setOtherSubjects] = useState("");
  const [currentField, setCurrentField] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [switchReason, setSwitchReason] = useState("");
  const [growthGoal, setGrowthGoal] = useState("");

  const [personalityAnswers, setPersonalityAnswers] = useState<Record<number, number>>({});
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<number, number>>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // Someone who paid and came back (or bought on another device) should see
  // their report, not the paywall. Ask the server what this email owns and
  // splice the paid half back in.
  async function revealIfPaid(forEmail: string) {
    try {
      const res = await fetch("/api/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forEmail, product: "careers", includeReport: true }),
      });
      const data = await res.json();
      if (!data.entitled || !data.report) return;
      setResult((prev) =>
        prev
          ? {
              ...prev,
              careers: data.report.careers ?? prev.careers,
              next_steps: data.report.next_steps ?? prev.next_steps,
              locked: false,
              entitled: true,
            }
          : prev
      );
    } catch {
      // Offline or KV down — the paywall simply stays up.
    }
  }
  const [shareCopied, setShareCopied] = useState(false);

  async function handleShare() {
    const a = result?.archetype;
    const text = a
      ? `My Fledgy career type is "${a.name}" — ${a.tagline} Find yours, free to try:`
      : "I just found my career direction with Fledgy. Find yours, free to try:";
    const url = "https://fledgy.guide/careers";
    track("share_clicked", { tool: "careers" });
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
      : audience === "switcher" || audience === "advancer"
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
    track("tool_submit", { tool: "careers" });
    try {
      window.localStorage.setItem("fledgy_email", email);
      fireReferral(email);
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
          growthGoal,
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
      track("score_shown", { tool: "careers" });
      if (data.locked) revealIfPaid(email);
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
    <main className="flex flex-1 flex-col items-center bg-page">
      <div className="w-full max-w-2xl px-5 py-10 sm:px-6 sm:py-12">
        <div className="flex items-start justify-between">
          <span className="inline-block rounded-full bg-cream px-2.5 py-1 text-xs font-bold tracking-widest text-brand-teal">
            FREE · CAREER QUIZ
          </span>
          <Mark size={40} opacity={0.85} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-ink">
          Find your career direction
        </h1>
        <p className="mt-2 text-ink-muted">
          A 5 to 7 minute quiz: a quick, validated personality snapshot plus a
          short aptitude check. Whether you&apos;re a student choosing a path,
          weighing a career switch, or looking to grow in your current field,
          it&apos;s a solid starting point, not a clinical assessment.
        </p>

        {step < 3 && (
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-brand-teal transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {loadingQuestions && step === 0 && (
          <p className="mt-8 text-sm text-ink-muted">Loading…</p>
        )}

        {/* Step 0: profile */}
        {step === 0 && !loadingQuestions && (
          <div className="mt-8 space-y-4">
            <input
              type="email"
              className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
              placeholder="Your email (so we can save your result)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <p className="mb-2 text-sm font-medium text-ink">
                Where are you right now?
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { value: "student", label: "Student choosing a path" },
                  { value: "switcher", label: "Considering a career switch" },
                  { value: "advancer", label: "Growing in my current field" },
                ].map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() =>
                      setAudience(a.value as "student" | "switcher" | "advancer")
                    }
                    className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                      audience === a.value
                        ? "border-brand-teal bg-cream text-ink font-medium"
                        : "border-line bg-white text-ink hover:border-cream-deep"
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
                  <p className="mb-2 text-sm font-medium text-ink">Your curriculum</p>
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
                            ? "border-brand-teal bg-cream text-ink font-medium"
                            : "border-line bg-white text-ink hover:border-cream-deep"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {curriculum && curriculum !== "Other" && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink">
                      Subjects you&apos;re studying (pick all that apply)
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {subjectOptions.map((s) => (
                        <label
                          key={s}
                          className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
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
                  className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
                  placeholder="Any other subjects not listed? (optional)"
                  value={otherSubjects}
                  onChange={(e) => setOtherSubjects(e.target.value)}
                />
              </>
            )}

            {(audience === "switcher" || audience === "advancer") && (
              <>
                <div>
                  <p className="mb-2 text-sm font-medium text-ink">
                    What do you do now?
                  </p>
                  <input
                    className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
                    placeholder="Your current field or role (e.g. Marketing, Teaching)"
                    value={currentField}
                    onChange={(e) => setCurrentField(e.target.value)}
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-ink">
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
                            ? "border-brand-teal bg-cream text-ink font-medium"
                            : "border-line bg-white text-ink hover:border-cream-deep"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                {audience === "switcher" && (
                  <input
                    className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
                    placeholder="What's pulling you to switch? (optional)"
                    value={switchReason}
                    onChange={(e) => setSwitchReason(e.target.value)}
                  />
                )}
                {audience === "advancer" && (
                  <input
                    className="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder-ink-faint focus:border-brand-teal focus:outline-none"
                    placeholder="Where would you like to grow? (e.g. into management, a specialism) (optional)"
                    value={growthGoal}
                    onChange={(e) => setGrowthGoal(e.target.value)}
                  />
                )}
              </>
            )}

            <button
              type="button"
              disabled={!step0Valid}
              onClick={() => setStep(1)}
              className="w-full rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-teal-dark disabled:opacity-40"
            >
              Continue to personality questions →
            </button>
          </div>
        )}

        {/* Step 1: personality */}
        {step === 1 && (
          <div className="mt-8 space-y-6">
            <p className="text-sm text-ink-muted">
              Describe yourself as you generally are now, not as you wish to
              be. There are no right or wrong answers.
            </p>
            {personalityItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-line bg-white p-4">
                <p className="text-sm font-medium text-ink">{item.text}</p>
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
                          ? "border-brand-teal bg-cream text-ink font-semibold"
                          : "border-line text-ink-faint hover:border-cream-deep"
                      }`}
                    >
                      {opt.value}
                    </button>
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-ink-faint">
                  <span>Very inaccurate</span>
                  <span>Very accurate</span>
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="rounded-lg border border-line px-4 py-3 text-sm font-medium text-ink-muted hover:border-cream-deep"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className="flex-1 rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-teal-dark disabled:opacity-40"
              >
                Continue to aptitude questions →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: aptitude */}
        {step === 2 && (
          <div className="mt-8 space-y-6">
            <p className="text-sm text-ink-muted">
              Quick logical, numerical, and verbal questions. Go with your
              first instinct.
            </p>
            {aptitudeQuestions.map((q, i) => (
              <div key={q.id} className="rounded-lg border border-line bg-white p-4">
                <p className="text-sm font-medium text-ink">
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
                          ? "border-brand-teal bg-cream text-ink font-medium"
                          : "border-line text-ink hover:border-cream-deep"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {error && paywall && (
              <div className="rounded-lg border border-cream-deep bg-cream px-5 py-4">
                <p className="text-sm font-semibold text-ink">You&apos;re on the waitlist</p>
                <p className="mt-1 text-sm text-ink">{error}</p>
                <ReferralInvite email={email} />
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
                className="rounded-lg border border-line px-4 py-3 text-sm font-medium text-ink-muted hover:border-cream-deep"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={!step2Valid || submitting}
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-brand-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-teal-dark disabled:opacity-40"
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
              <div className="relative overflow-hidden rounded-2xl border border-line bg-page p-6 shadow-sm">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-orange-tint"
                />
                <div className="relative flex items-center gap-2">
                  <Mark size={30} opacity={0.95} />
                  <span className="text-lg font-semibold text-brand-teal-dark">Fledgy</span>
                  <span className="ml-auto rounded-full bg-cream px-2.5 py-1 text-[10px] font-bold tracking-widest text-brand-teal">
                    FREE
                  </span>
                </div>
                <p className="relative mt-4 text-xs font-bold tracking-widest text-brand-orange">
                  YOUR CAREER TYPE
                </p>
                <h2 className="relative mt-1 text-3xl font-semibold text-ink">
                  {result.archetype.name}
                </h2>
                <p className="relative mt-2 text-sm text-ink-muted">
                  {result.archetype.tagline}
                </p>
                <div className="relative mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-teal-dark"
                  >
                    Share my type
                  </button>
                  <span className="text-xs text-ink-faint">
                    {shareCopied ? "Link copied!" : "or screenshot to share"}
                  </span>
                </div>
              </div>
            )}

            <div className="card-lift rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between">
                <p className="text-sm italic text-ink">{result.summary}</p>
                <Mark size={38} opacity={0.75} className="ml-3 shrink-0" />
              </div>

              <div className="mt-5 space-y-2">
                {(Object.keys(result.traits) as Trait[]).map((trait) => (
                  <div key={trait}>
                    <div className="flex justify-between text-xs text-ink-muted">
                      <span>{TRAIT_LABELS[trait]}</span>
                      <span>{result.traits[trait]}/100</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-brand-teal"
                        style={{ width: `${result.traits[trait]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-4 text-xs text-ink-muted">
                <span>Aptitude overall: {result.aptitude.overall}%</span>
                <span>Logical: {result.aptitude.byCategory.logical}%</span>
                <span>Numerical: {result.aptitude.byCategory.numerical}%</span>
                <span>Verbal: {result.aptitude.byCategory.verbal}%</span>
              </div>
            </div>

            {result.locked && (
              <Paywall
                product="careers"
                bundle="cv_careers"
                email={email}
                heading={
                  audience === "advancer"
                    ? "Your other growth directions are ready"
                    : "Your other matched careers are ready"
                }
                subheading="That's one of your matches — not your strongest. The full report ranks every career matched to your scores, starting with your best fit, explains why each one suits you specifically, and gives you the action plan to get there."
                teaser={
                  result.lockedCareerCount
                    ? result.lockedCareerCount > 1
                      ? `Your top match plus ${result.lockedCareerCount - 1} more`
                      : "Your top match is still locked"
                    : undefined
                }
              />
            )}

            {result.careers?.length > 0 && (
              <div>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold text-ink">
                    {result.locked
                      ? audience === "advancer"
                        ? "One of your directions"
                        : "One of your matches"
                      : audience === "advancer"
                      ? "Directions to grow into"
                      : "Careers that fit you"}
                  </h2>
                  <span className="rounded-full bg-brand-teal-tint px-2.5 py-1 text-[10px] font-bold tracking-widest text-brand-teal">
                    {result.locked ? "FREE" : "UNLOCKED"}
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {result.careers.map((c, i) => (
                    <div key={i} className="rounded-lg border border-line bg-white p-4">
                      <p className="text-sm font-semibold text-ink">
                        {result.locked ? c.title : `${i + 1}. ${c.title}`}
                      </p>
                      <p className="mt-1 text-sm text-ink-muted">{c.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.next_steps?.length > 0 && (
              <div className="rounded-lg border border-line bg-page p-4">
                <p className="text-sm font-semibold text-ink">
                  {audience === "advancer"
                    ? "Courses & skills to build"
                    : "Your next steps"}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {result.next_steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink">
                      <span className="text-brand-teal">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-ink-faint">
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
                className="rounded-lg border border-brand-orange-tint px-4 py-3 text-center text-sm font-semibold text-brand-orange hover:bg-brand-orange-tint"
              >
                Now score my essay →
              </a>
              <a
                href="/cv"
                className="rounded-lg border border-brand-teal px-4 py-3 text-center text-sm font-semibold text-brand-teal hover:bg-brand-teal-tint"
              >
                Now score my CV →
              </a>
            </div>
          </div>
        )}

        <PageFaq
          title="About the career quiz"
          intro={[
            "Whether you're a student choosing what to study, someone weighing a career switch, or a professional looking to grow in your current field, Fledgy's career quiz points you toward paths that match how you actually think and work. It combines a validated personality profile with a quick aptitude check.",
            "You'll answer a short set of questions and get a shareable career type, a read on your strengths, matched directions to explore, and concrete next steps — including specific courses and skills to build if you're aiming to advance.",
          ]}
          faqs={[
            {
              q: "Is the career quiz free?",
              a: "Taking the quiz and getting your career type and profile read is free. The full report — the specific careers matched to you, why each one fits, and your action plan — is part of the paid bundle, which also includes a CV written for you.",
            },
            {
              q: "Who is the career quiz for?",
              a: "Anyone deciding a direction — students choosing what to study, people considering a career switch, and working professionals who want to grow in their current field. You don't need to be a student.",
            },
            {
              q: "How long does the quiz take?",
              a: "Just a few minutes. You answer a short set of questions and get an instant summary of your traits, matched directions, and suggested next steps.",
            },
            {
              q: "What do I get at the end?",
              a: "A shareable career type, your personality and aptitude scores, matched directions, and concrete next steps. If you're looking to advance, that includes specific courses and certifications to help you develop.",
            },
          ]}
        />
      </div>
    </main>
  );
}
