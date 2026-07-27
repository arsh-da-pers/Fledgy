import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Direction Quiz — Personality + Aptitude Test",
  description:
    "Find your ideal career path with Fledgy's free career direction quiz. Get a personality and aptitude profile with country-specific guidance for international students.",
  alternates: { canonical: "/careers" },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
