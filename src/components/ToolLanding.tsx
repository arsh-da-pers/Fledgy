import Link from "next/link";
import Mark from "@/components/Mark";

type Item = { title: string; body: string };

export default function ToolLanding({
  pill,
  h1,
  intro,
  primaryHref,
  primaryCta,
  benefits,
  steps,
  appName,
  appDescription,
}: {
  pill: string;
  h1: string;
  intro: string;
  primaryHref: string;
  primaryCta: string;
  benefits: Item[];
  steps: Item[];
  appName: string;
  appDescription: string;
}) {
  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: appName,
    applicationCategory: "EducationApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: appDescription,
  };

  return (
    <section>
      <div className="flex items-start justify-between">
        <span className="inline-block rounded-full bg-[#fbe3d8] px-2.5 py-1 text-xs font-bold tracking-widest text-[#b6431f]">
          {pill}
        </span>
        <Mark size={40} opacity={0.85} />
      </div>

      <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#2a2115] sm:text-4xl">
        {h1}
      </h1>
      <p className="mt-3 text-[17px] leading-relaxed text-[#6b5c45]">{intro}</p>

      <Link
        href={primaryHref}
        className="mt-6 inline-block rounded-lg bg-[#e2653b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c8532c]"
      >
        {primaryCta}
      </Link>

      <h2 className="mt-14 text-2xl font-semibold text-[#2a2115]">
        Why use it
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {benefits.map((b, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#f0dfc4] bg-white p-4"
          >
            <p className="text-sm font-semibold text-[#2a2115]">{b.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-[#6b5c45]">
              {b.body}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-semibold text-[#2a2115]">
        How it works
      </h2>
      <ol className="mt-4 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e2653b] text-sm font-bold text-white">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#2a2115]">{s.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-[#6b5c45]">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <Link
          href={primaryHref}
          className="inline-block rounded-lg bg-[#e2653b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c8532c]"
        >
          {primaryCta}
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }}
      />
    </section>
  );
}
