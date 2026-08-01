import type { Metadata } from "next";
import ToolLanding from "@/components/ToolLanding";
import PageFaq from "@/components/PageFaq";

export const metadata: Metadata = {
  title: "Free CV Checker — AI Review & Recruiter-Ready Rewrite",
  description:
    "Check your CV free against your target country's hiring norms. Get an instant score, honest fixes, and a recruiter-ready rewrite you can download.",
  alternates: { canonical: "/cv-checker" },
};

export default function CvChecker() {
  return (
    <main className="flex flex-1 flex-col items-center bg-[#fdf3e7]">
      <div className="w-full max-w-3xl px-6 py-12">
        <ToolLanding
          pill="FREE · CV CHECKER"
          h1="Free CV Checker & Reviewer"
          intro="Upload your CV and get an instant score against your target country's hiring norms — plus a recruiter-ready rewrite you can download. Catch the formatting and phrasing mistakes that quietly cost interviews."
          primaryHref="/cv"
          primaryCta="Check my CV →"
          appName="Fledgy CV Checker"
          appDescription="Free AI CV checker that scores your CV against your target country's hiring norms and generates a recruiter-ready rewrite."
          benefits={[
            {
              title: "Scored on real norms",
              body: "Rated against how recruiters in your target country actually read CVs — length, phrasing, and format.",
            },
            {
              title: "Recruiter-ready rewrite",
              body: "Get a cleaner, stronger version of your CV you can download and send.",
            },
            {
              title: "Honest & free",
              body: "Specific fixes, not vague praise — and free to try.",
            },
          ]}
          steps={[
            {
              title: "Upload or paste",
              body: "Add your CV as a PDF, Word file, or pasted text.",
            },
            {
              title: "Get scored",
              body: "Fledgy scores it and flags exactly what's holding it back.",
            },
            {
              title: "Download the rewrite",
              body: "Get a recruiter-ready version aligned to your target country.",
            },
          ]}
        />

        <PageFaq
          title="CV checker FAQ"
          intro={[
            "A CV checker reviews your resume and tells you how well it will perform before you send it to employers. Fledgy's checker scores your CV against your target country's hiring norms and can rewrite it recruiter-ready — so you fix the gaps that cost interviews.",
          ]}
          faqs={[
            {
              q: "Is the CV checker free?",
              a: "Yes. You can check your CV and get an honest score with specific feedback for free.",
            },
            {
              q: "Does it consider my target country?",
              a: "Yes. CV conventions differ by country — length, whether to include a photo, how to phrase achievements. Fledgy scores your CV against the norms of the country you're targeting.",
            },
            {
              q: "Can it rewrite my CV?",
              a: "Yes. Fledgy can generate a rewritten, recruiter-ready version of your CV that you can download and format.",
            },
            {
              q: "What file types can I use?",
              a: "PDF, Word (.docx), or a photo — or you can paste your CV text directly.",
            },
            {
              q: "Is my CV stored?",
              a: "No. Fledgy reads your CV to score and rewrite it, then discards it. Your document is not stored.",
            },
          ]}
        />
      </div>
    </main>
  );
}
