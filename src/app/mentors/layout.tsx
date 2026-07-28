import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fledgy Mentors — 1:1 Sessions with Recruiters & Experts",
  description:
    "Book paid 1:1 sessions with recruiters and industry experts for honest tips on your essays, CV, interviews, and career. Join the Fledgy Mentors waitlist.",
  alternates: { canonical: "/mentors" },
};

export default function MentorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
