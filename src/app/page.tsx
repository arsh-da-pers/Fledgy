import Link from "next/link";
import Logo from "@/components/Logo";
import HeroArt from "@/components/HeroArt";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-3xl">
        <HeroArt />
      </div>

      <div className="w-full max-w-3xl px-6 pb-20 pt-6 sm:pb-28">
        <Logo size={28} />
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#2a2115] sm:text-5xl">
          Grow your wings.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[#6b5c45]">
          Honest, AI-powered feedback on your university essay and CV — built
          for students and talent applying from anywhere in the world, not
          just the US or UK.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/essay"
            className="group rounded-xl border border-[#f0dfc4] bg-white p-6 shadow-sm transition hover:border-[#e2653b] hover:shadow-md"
          >
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
            className="group rounded-xl border border-[#f0dfc4] bg-white p-6 shadow-sm transition hover:border-teal-600 hover:shadow-md"
          >
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

        <div className="mt-12 flex items-start gap-3 rounded-xl border border-[#f4d9a8] bg-[#fdf0d9] px-5 py-4">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#f2a541]" />
          <p className="text-sm italic text-[#7a5b26]">
            &ldquo;Talent is everywhere. Opportunity isn&apos;t. Fledgy closes
            that gap.&rdquo;
          </p>
        </div>
      </div>
    </main>
  );
}
