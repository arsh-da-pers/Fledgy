import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";
import PageFaq from "@/components/PageFaq";

export const metadata: Metadata = {
  title: "Free SOP Checker — Statement of Purpose Review & Score",
  description:
    "Check your statement of purpose (SOP) free. Get an instant score out of 100 with honest feedback for Master's, PhD, and grad-school applications.",
  alternates: { canonical: "/sop-checker" },
};

export default function SopChecker() {
  return (
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-3xl px-6 py-12">
        <ToolLanding
          pill="FREE · SOP CHECKER"
          h1="Free SOP Checker (Statement of Purpose)"
          intro="Get your statement of purpose scored out of 100 with honest, specific feedback — for Master's, PhD, and grad-school applications. Know exactly what to fix before you submit, not after you're rejected."
          primaryHref="/essay"
          primaryCta="Check my SOP →"
          appName="Fledgy SOP Checker"
          appDescription="Free AI SOP checker that scores your statement of purpose out of 100 with honest feedback for graduate applications."
          benefits={[
            {
              title: "Built for grad apps",
              body: "Tuned for the SOP — the research fit, motivation, and focus that Master's and PhD committees look for.",
            },
            {
              title: "Brutally honest",
              body: "A blunt score and the real weaknesses, not the reassurance friends give you.",
            },
            {
              title: "Instant & free",
              body: "A full score and fixes in seconds, free to try.",
            },
          ]}
          steps={[
            {
              title: "Paste or upload",
              body: "Add your SOP as text, or upload a PDF or Word file.",
            },
            {
              title: "Get scored",
              body: "Fledgy scores it out of 100 and explains why.",
            },
            {
              title: "Fix and re-check",
              body: "Apply the tips, then re-check before you submit to programs.",
            },
          ]}
        />

        <PageFaq
          title="SOP checker FAQ"
          intro={[
            "An SOP checker reviews your statement of purpose and tells you how strong it is before an admissions committee reads it. Fledgy scores your SOP out of 100 and gives honest, specific feedback so you can strengthen it for Master's, PhD, and other graduate applications.",
          ]}
          faqs={[
            {
              q: "What is an SOP checker?",
              a: "It's a tool that reviews your statement of purpose and scores how well it makes your case for admission, with concrete feedback on what to improve.",
            },
            {
              q: "Is the SOP checker free?",
              a: "Yes. You can check your statement of purpose and get an honest score with specific feedback for free.",
            },
            {
              q: "Does it work for Master's and PhD applications?",
              a: "Yes. It's built for graduate applications — you can tell it your target program and field for sharper, more relevant feedback.",
            },
            {
              q: "Is my SOP stored?",
              a: "No. Your statement is read only to generate your score and is then discarded. Fledgy does not store or share your writing.",
            },
          ]}
        />
      </div>
    </main>
  );
}
