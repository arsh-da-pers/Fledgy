type Faq = { q: string; a: string };

export default function PageFaq({
  title,
  intro,
  faqs,
}: {
  title: string;
  intro: string[];
  faqs: Faq[];
}) {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="mt-14 border-t border-line pt-10">
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-muted">
        {intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <h3 className="mt-10 text-lg font-semibold text-ink">
        Frequently asked questions
      </h3>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {faqs.map((f, i) => (
          <details key={i} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink">
              {f.q}
              <span className="text-xl leading-none text-brand-orange transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              {f.a}
            </p>
          </details>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </section>
  );
}
