import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Score My Essay — AI Essay Feedback out of 100",
  description:
    "Score your essay out of 100 with honest, AI-powered feedback and country-specific tips. Built for students and university applicants, including international students. Free to try.",
  alternates: { canonical: "/essay" },
};

export default function EssayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
