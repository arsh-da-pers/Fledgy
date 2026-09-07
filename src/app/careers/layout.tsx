import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Quiz — Find Your Direction, Switch, or Grow",
  description:
    "Fledgy's free career quiz gives you a personality and aptitude profile and your career type — for students, career changers, and professionals growing in their field. Unlock the full report for your matched careers and action plan.",
  alternates: { canonical: "/careers" },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
