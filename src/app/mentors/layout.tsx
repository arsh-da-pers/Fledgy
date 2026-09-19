import type { Metadata } from "next";
import { MENTOR_PRICE } from "@/lib/products";

export const metadata: Metadata = {
  title: "Fledgy Mentors — 1:1 Sessions with Recruiters & Experts",
  // The price is read from the ladder, not typed here. A meta description is
  // the easiest place in the site for a stale price to hide — Google shows it
  // long after anyone has thought to reread this file.
  description:
    "Book a 1:1 session with a recruiter, a commercial pilot, or a career psychologist. Honest, personal advice on your CV, interviews, university plans and career — " +
    `${MENTOR_PRICE} for 30 minutes.`,
  alternates: { canonical: "/mentors" },
};

export default function MentorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
