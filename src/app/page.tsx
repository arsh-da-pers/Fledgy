import Link from "next/link";
import HeroArt from "@/components/HeroArt";
import Mark from "@/components/Mark";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-3xl">
        <HeroArt />
      </div>

      <div className="w-full max-w-3xl px-6 pb-20 pt-8 sm:pb-28">
        <h1 className="text-4xl font-semibold tracking-tight text-[#2a2115] sm:text-5xl">
          Grow your wings.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[#6b5c45]">
          Honest, AI-powered feedback on your university essay and CV — built
          for students and talent applying from anywhere in the world, not
          just the US or UK.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Mark size={40} opacity={0.9} />
          <div className="h-px flex-1 bg-[#f0dfc4]" />
          <Mark size={40} opacity={0.9} className="scale-x-[-1]" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/essay"
            className="group relative overflow-hidden rounded-xl border border-[#f0dfc4] bg-white p-6 shadow-sm transition hover:border-[#e2653b] hover:shadow-md"
          >
            <Mark
              size={54}
              opacity={0.3}
              className="pointer-events-none absolute -right-3 -top-4"
            />
            <span className="inline-block rounded-full bg-[#fbe3d8] px-2.5 py-1 text-xs font-bold tracking-widest text-[#b6431f]">
              FREE
            </span>
            <h2 className="mt-3 text-xl font-semibold text-[#2a2115]">
              Score my essay
            </h2>
            <p className="mt-2 text-sm text-[#6b5c45]">
              Paste your personal statement or application essay. Get an
              honest score out of 100 and real, specific feedback — not
              flattery.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-[#e2653b] group-hover:underline">
              Try it free →
            </span>
          </Link>

          <Link
            href="/cv"
            className="group relative overflow-hidden rounded-xl border border-[#f0dfc4] bg-white p-6 shadow-sm transition hover:border-teal-600 hover:shadow-md"
          >
            <Mark
              size={54}
              opacity={0.3}
              className="pointer-events-none absolute -right-3 -top-4"
            />
            <span className="inline-block rounded-full bg-[#d7f0ec] px-2.5 py-1 text-xs font-bold tracking-widest text-teal-800">
              FREE
            </span>
            <h2 className="mt-3 text-xl font-semibold text-[#2a2115]">
              Score my CV
            </h2>
            <p className="mt-2 text-sm text-[#6b5c45]">
              Pick your target country. Get a score plus the cultural norms
              recruiters there actually expect — not generic ATS advice.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-teal-700 group-hover:underline">
              Try it free →
            </span>
          </Link>
        </div>

        <div className="mt-16 flex items-center gap-4">
          <Mark size={36} opacity={0.8} className="scale-x-[-1]" />
          <div className="h-px flex-1 bg-[#f0dfc4]" />
          <Mark size={36} opacity={0.8} />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#2a2115]">
            Free today, more depth coming.
          </h2>
          <p className="mt-1 text-sm text-[#6b5c45]">
            No payment collected anywhere on Fledgy yet — everything below
            marked &ldquo;coming soon&rdquo; is a preview of what&apos;s next,
            not something you can buy right now.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#f0dfc4] bg-white p-6">
              <span className="inline-block rounded-full bg-[#d7f0ec] px-2.5 py-1 text-xs font-bold tracking-widest text-teal-800">
                FREE — AVAILABLE NOW
              </span>
              <ul className="mt-4 space-y-2.5 text-sm text-[#3a3629]">
                <li className="flex gap-2">
                  <span className="text-teal-700">✓</span>
                  <span>Essay score out of 100, with honest tips</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-700">✓</span>
                  <span>CV score against your target country&apos;s norms</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-700">✓</span>
                  <span>Generated, rewritten CV as a plain-text download</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-700">✓</span>
                  <span>Upload a PDF or Word file, or paste text directly</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-dashed border-[#c9b98a] bg-[#fdf9f0] p-6">
              <span className="inline-block rounded-full bg-[#f4e8cf] px-2.5 py-1 text-xs font-bold tracking-widest text-[#8a6d2f]">
                PAID — COMING SOON
              </span>
              <ul className="mt-4 space-y-2.5 text-sm text-[#6b5c45]">
                <li className="flex gap-2">
                  <span className="text-[#b0a186]">○</span>
                  <span>Polished, designed CV download (PDF and Word)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#b0a186]">○</span>
                  <span>Section-by-section essay breakdown and tone analysis</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#b0a186]">○</span>
                  <span>Deeper, school and country-specific dos and don&apos;ts</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#b0a186]">○</span>
                  <span>Unlimited rewrites and version history</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-start gap-3 rounded-xl border border-[#f4d9a8] bg-[#fdf0d9] px-5 py-4">
          <Mark size={32} opacity={0.9} className="mt-0.5 shrink-0" />
          <p className="text-sm italic text-[#7a5b26]">
            &ldquo;Talent is everywhere. Opportunity isn&apos;t. Fledgy closes
            that gap.&rdquo;
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <Mark size={44} opacity={0.9} />
        </div>
      </div>
    </main>
  );
}
