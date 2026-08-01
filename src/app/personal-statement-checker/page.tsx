import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";
import PageFaq from "@/components/PageFaq";

export const metadata: Metadata = {
  title: "Free Personal Statement Checker — Instant Honest Feedback",
  description:
    "Check your university personal statement free. Get an instant score out of 100 with honest, country-specific feedback and specific fixes before you apply.",
  alternates: { canonical: "/personal-statement-checker" },
};

export default function PersonalStatementChecker() {
  return (
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-3xl px-6 py-12">
        <ToolLanding
          pill="FREE · PERSONAL STATEMENT CHECKER"
          h1="Free Personal Statement Checker"
          intro="Paste your personal statement and get an honest score out of 100 in seconds — with specific, no-fluff feedback on what's working and what's holding it back. Built for university applicants who want the truth before they hit submit."
          primaryHref="/essay"
          primaryCta="Check my personal statement →"
          appName="Fledgy Personal Statement Checker"
          appDescription="Free AI personal statement checker that scores your university personal statement out of 100 with honest, country-specific feedback."
          benefits={[
            {
              title: "Honest, not flattering",
              body: "No empty 'looks great!' — you get a blunt verdict and the real weaknesses an admissions reviewer would notice.",
            },
            {
              title: "Country-aware",
              body: "Feedback that reflects what admissions tutors in your target country actually look for.",
            },
            {
              title: "Instant & free",
              body: "A full score and actionable tips in seconds, at no cost to try.",
            },
          ]}
          steps={[
            {
              title: "Paste or upload",
              body: "Drop in your personal statement text, or upload a PDF or Word file.",
            },
            {
              title: "Get scored",
              body: "Fledgy scores it out of 100 and explains the reasoning behind the score.",
            },
            {
              title: "Fix and re-check",
              body: "Act on the specific tips, then re-check before you submit your application.",
            },
          ]}
        />

        <PageFaq
          title="Personal statement checker FAQ"
          intro={[
            "A personal statement checker reviews your university application essay and tells you how strong it is — before an admissions officer ever sees it. Fledgy's checker scores your statement out of 100 and gives concrete, honest feedback so you can fix the weak spots yourself.",
          ]}
          faqs={[
            {
              q: "Is the personal statement checker free?",
              a: "Yes. You can check your personal statement and get an honest score with specific feedback for free.",
            },
            {
              q: "Does it work for UCAS and other applications?",
              a: "Yes. It works for UCAS personal statements, US admissions essays, and applications to universities around the world — you can tell it your target university and course for sharper feedback.",
            },
            {
              q: "How is my statement scored?",
              a: "Fledgy's AI evaluates clarity, structure, specificity, and tone — the qualities admissions reviewers value — and returns a score out of 100 with a one-line verdict and concrete tips.",
            },
            {
              q: "Is my personal statement stored?",
              a: "No. Your statement is read only to generate your score and is then discarded. Fledgy does not store or share your writing.",
            },
          ]}
        />
      </div>
    </main>
  );
}
