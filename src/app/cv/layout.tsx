import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Score My CV — AI CV Feedback & Rewrite",
  description:
    "Get an instant AI CV score against your target country's hiring norms, plus a recruiter-ready rewrite you can download. Free for international students and job seekers.",
  alternates: { canonical: "/cv" },
};

export default function CvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
