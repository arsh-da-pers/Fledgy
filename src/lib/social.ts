// Where Fledgy exists off fledgy.guide, and the three tools, in one place so
// emails and pages can't drift from each other.

export const INSTAGRAM_URL = "https://instagram.com/fledgy.guide";

// Verified 2026-09-30: resolves to Fledgy's page (website fledgy.guide).
// Consumers still treat "" as "don't render it", so this can be emptied
// without breaking anything.
export const LINKEDIN_URL: string = "https://www.linkedin.com/company/fledgy";

export type ToolKey = "essay" | "cv" | "careers";

export const TOOLS: Record<
  ToolKey,
  { name: string; href: string; blurb: string }
> = {
  cv: {
    name: "Score my CV",
    href: "https://fledgy.guide/cv",
    blurb: "A score against your target country's norms, not generic ATS advice.",
  },
  essay: {
    name: "Score my essay",
    href: "https://fledgy.guide/essay",
    blurb: "An honest score out of 100 on a personal statement or SOP.",
  },
  careers: {
    name: "Find my direction",
    href: "https://fledgy.guide/careers",
    blurb: "A quick personality and aptitude quiz that names your career type.",
  },
};

/** The referral link a user shares. Their own email is the code — the same
 *  scheme ReferralInvite.tsx uses, so a link from an email and a link copied
 *  from the site are identical. */
export function referralLink(email: string): string {
  return `https://fledgy.guide/?ref=${encodeURIComponent(
    email.trim().toLowerCase()
  )}`;
}
