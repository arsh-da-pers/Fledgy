import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Quiz — Find Your Direction, Switch, or Grow",
  description:
    "Fledgy's career quiz (early access, free to try) gives you a personality and aptitude profile with matched directions and courses — for students, career changers, and professionals growing in their field.",
  alternates: { canonical: "/careers" },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
