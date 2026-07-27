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
    <section className="mt-14 border-t border-[#f0dfc4] pt-10">
      <h2 className="text-2xl font-semibold text-[#2a2115]">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#6b5c45]">
        {intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <h3 className="mt-10 text-lg font-semibold text-[#2a2115]">
        Frequently asked questions
      </h3>
      <div className="mt-4 divide-y divide-[#f0dfc4] border-y border-[#f0dfc4]">
        {faqs.map((f, i) => (
          <details key={i} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-[#2a2115]">
              {f.q}
              <span className="text-xl leading-none text-[#e2653b] transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-[#6b5c45]">
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
