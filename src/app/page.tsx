import Link from "next/link";
import HeroArt from "@/components/HeroArt";
import Mark from "@/components/Mark";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center overflow-hidden bg-page">
      <div className="w-full">
        <HeroArt />
      </div>

      <div
        aria-hidden
        className="glow-warm pointer-events-none absolute inset-x-0 top-0 h-[32rem]"
      />

      <div className="relative w-full max-w-3xl px-5 pb-20 pt-8 sm:px-6 sm:pb-28">
        {/* Clarity, 30 days to 2026-09-30: 800 sessions entered on this page
            and 795 exited from it, at 21s active time and 36.76% scroll depth,
            with 89% arriving inside the Instagram/Facebook in-app browser.
            So the h1 now leads with what Fledgy DOES rather than the brand
            promise ("Grow your wings." is demoted to an eyebrow, keeping the
            brand visible without spending the first screen on it), and all
            three tools get a CTA above the fold — previously only careers and
            CV did, and none of them appeared until well past the average
            scroll depth. The CV tool leads because it is the one tool that
            serves students and working professionals equally; Fledgy is not a
            student-only product and the old copy ("applicants") implied it
            was. The old "Start wherever you are" paragraph and its rule sat
            between the hero and the cards, pushing the cards out of reach on
            mobile; both are gone so the tools sit directly under the fold. */}
        <p className="rise-in text-xs font-bold tracking-[0.2em] text-brand-orange">
          FLEDGY · GROW YOUR WINGS.
        </p>

        <h1 className="rise-in mt-3 block text-[2rem] font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          Honest feedback on your CV, your application, and{" "}
          <span className="sunrise-text">your next move</span>.
        </h1>

        <p className="rise-in-2 mt-4 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
          University applications, career switches, job hunts — specific
          feedback in 60 seconds. Not flattery, and not US/UK-only advice.
        </p>

        <div className="rise-in-2 mt-7 flex flex-col gap-3">
          <Link
            href="/cv"
            className="flex items-center justify-center rounded-xl bg-brand-teal px-6 py-4 text-base font-semibold text-white transition hover:bg-brand-teal-dark"
          >
            Score my CV →
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/careers"
              className="flex flex-1 items-center justify-center rounded-xl bg-brand-orange px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-orange-dark sm:text-sm"
            >
              Find my direction →
            </Link>
            <Link
              href="/essay"
              className="flex flex-1 items-center justify-center rounded-xl border border-brand-teal px-6 py-3.5 text-base font-semibold text-brand-teal transition hover:bg-brand-teal-tint sm:text-sm"
            >
              Score my essay →
            </Link>
          </div>
        </div>

        <p className="mt-4 text-sm text-ink-faint">
          Free to start. No card. Paste your text or upload a PDF.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Link
            href="/careers"
            className="card-lift rise-in group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-sm hover:border-brand-teal"
          >
            <Mark
              size={54}
              opacity={0.3}
              className="pointer-events-none absolute -right-3 -top-4"
            />
            <span className="inline-block w-fit rounded-full bg-cream px-2.5 py-1 text-xs font-bold tracking-widest text-brand-teal">
              CAREER DIRECTION · FREE
            </span>
            <h2 className="mt-3 text-xl font-semibold text-ink">
              Find your direction
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Choosing what to study, or weighing a career switch? A quick
              personality and aptitude quiz reveals your career type and the
              paths that fit you. Your career type is free; the full report unlocks the
              matched careers and your plan.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-brand-teal group-hover:underline">
              Take the quiz →
            </span>
          </Link>

          <Link
            href="/cv"
            className="card-lift rise-in-2 group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-sm hover:border-brand-teal"
          >
            <Mark
              size={54}
              opacity={0.3}
              className="pointer-events-none absolute -right-3 -top-4"
            />
            <span className="inline-block w-fit rounded-full bg-brand-teal-tint px-2.5 py-1 text-xs font-bold tracking-widest text-brand-teal-dark">
              YOUR CV · FREE
            </span>
            <h2 className="mt-3 text-xl font-semibold text-ink">
              Score my CV
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Pick your target country. Get a score plus the cultural norms
              recruiters there actually expect, not generic ATS advice.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-brand-teal group-hover:underline">
              Try it free →
            </span>
          </Link>

          <Link
            href="/essay"
            className="card-lift rise-in-3 group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-sm hover:border-brand-orange"
          >
            <Mark
              size={54}
              opacity={0.3}
              className="pointer-events-none absolute -right-3 -top-4"
            />
            <span className="inline-block w-fit rounded-full bg-brand-orange-tint px-2.5 py-1 text-xs font-bold tracking-widest text-brand-orange-dark">
              ESSAY & SOP · FREE
            </span>
            <h2 className="mt-3 text-xl font-semibold text-ink">
              Score my essay
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Paste your personal statement or application essay. Get an honest
              score out of 100 and real, specific feedback, not flattery.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-brand-orange group-hover:underline">
              Try it free →
            </span>
          </Link>
        </div>

        <div className="mt-16 flex items-center gap-4">
          <Mark size={36} opacity={0.8} className="scale-x-[-1]" />
          <hr className="rule-sunrise flex-1" />
          <Mark size={36} opacity={0.8} />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-ink">
            Free to start. Pay only for the deep work.
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            Every email gets your career type, an essay score and a CV score, no
            card required. One bundle unlocks the rest: your full career report
            and a CV written for you.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-white p-6">
              <span className="inline-block rounded-full bg-brand-teal-tint px-2.5 py-1 text-xs font-bold tracking-widest text-brand-teal-dark">
                FREE TO START
              </span>
              <ul className="mt-4 space-y-2.5 text-sm text-ink">
                <li className="flex gap-2">
                  <span className="text-brand-teal">✓</span>
                  <span>Career direction quiz (personality + aptitude)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-teal">✓</span>
                  <span>Essay score out of 100, with honest tips</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-teal">✓</span>
                  <span>CV score against your target country&apos;s norms</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-teal">✓</span>
                  <span>Your career type and profile read, free to share</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand-teal">✓</span>
                  <span>Upload a PDF or Word file, or paste text directly</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-dashed border-cream-deep bg-page p-6">
              <span className="inline-block rounded-full bg-cream px-2.5 py-1 text-xs font-bold tracking-widest text-brand-teal">
                THE BUNDLE
              </span>
              <p className="mt-3 text-sm font-medium text-ink">
                Your full report, and a CV written for you
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
                <li className="flex gap-2">
                  <span className="text-ink-faint">○</span>
                  <span>Polished, recruiter-ready CV design, as a typeset PDF</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-ink-faint">○</span>
                  <span>Reformatted to your target country&apos;s norms</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-ink-faint">○</span>
                  <span>Section-by-section essay breakdown and tone analysis</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-ink-faint">○</span>
                  <span>Deeper, school and country-specific dos and don&apos;ts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-start gap-3 rounded-xl border border-cream-deep bg-cream px-5 py-4">
          <Mark size={32} opacity={0.9} className="mt-0.5 shrink-0" />
          <p className="text-sm italic text-ink">
            &ldquo;Talent is everywhere. Opportunity isn&apos;t. Fledgy closes
            that gap.&rdquo;
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-line bg-white p-6">
          <h2 className="text-xl font-semibold text-ink">Got questions?</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            Not sure which tool you need, stuck on a score you disagree with, or
            wondering whether any of this is right for where you&apos;re
            applying? Ask us. A person reads every message.
          </p>
          <a
            href="mailto:hello@fledgy.guide"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-brand-teal px-4 py-2.5 text-sm font-semibold text-brand-teal transition hover:bg-brand-teal-tint"
          >
            hello@fledgy.guide
          </a>
        </div>

        <div className="mt-12 flex justify-center">
          <Mark size={44} opacity={0.9} />
        </div>
      </div>
    </main>
  );
}
