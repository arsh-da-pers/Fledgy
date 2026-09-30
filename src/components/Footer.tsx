import Link from "next/link";
import Mark from "./Mark";
import { INSTAGRAM_URL, LINKEDIN_URL } from "@/lib/social";

const footerLinks = [
  { href: "/essay", label: "Score my essay" },
  { href: "/cv", label: "Score my CV" },
  { href: "/careers", label: "Career quiz" },
  { href: "/mentors", label: "Book a mentor" },
  { href: "/blog", label: "Blog" },
  { href: "/personal-statement-checker", label: "Personal statement checker" },
  { href: "/cv-checker", label: "CV checker" },
  { href: "/sop-checker", label: "SOP checker" },
];

// Inline SVG rather than an icon package: this repo cannot add a dependency,
// and two glyphs are not worth a font. currentColor so they inherit the
// footer's hover states like every other link here.
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.25" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="7.3" cy="7.5" r="1.25" fill="currentColor" />
      <rect x="6.3" y="10.2" width="2" height="7.4" fill="currentColor" />
      <path d="M11.2 17.6v-7.4h1.95v.95a2.75 2.75 0 0 1 4.75 1.95v4.5h-2v-4.05a1.35 1.35 0 0 0-2.7 0v4.05z" fill="currentColor" />
    </svg>
  );
}

// "" means the page doesn't exist yet — social.ts is the single source, and
// every consumer must skip a blank rather than link nowhere.
const socials = [
  { href: INSTAGRAM_URL, label: "Fledgy on Instagram", Icon: InstagramIcon },
  { href: LINKEDIN_URL, label: "Fledgy on LinkedIn", Icon: LinkedInIcon },
].filter((s) => s.href);

export default function Footer() {
  return (
    <footer className="w-full border-t border-line bg-page">
      <nav className="flex w-full flex-wrap gap-x-5 gap-y-2 px-6 pt-6 text-xs font-medium text-ink-muted sm:px-10">
        {footerLinks.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-ink">
            {l.label}
          </Link>
        ))}
      </nav>

      {socials.length > 0 && (
        <div className="flex w-full items-center gap-3 px-6 pt-5 sm:px-10">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-cream hover:text-brand-teal"
            >
              <Icon />
            </a>
          ))}
        </div>
      )}

      <div className="flex w-full items-start gap-4 px-6 pb-6 pt-5 sm:px-10">
        <Mark size={28} opacity={0.75} className="mt-0.5 hidden shrink-0 sm:block" />
        <p className="text-xs leading-relaxed text-ink-faint">
          Fledgy&apos;s scores, tips, and generated drafts are AI-produced
          guidance to help you improve. They are not a guarantee of
          admission, a job offer, or any specific outcome, and they are not a
          substitute for advice from your target university, employer, or a
          qualified professional. Requirements vary by institution and
          country and can change; always confirm details with the official
          source before relying on them.
        </p>
      </div>
    </footer>
  );
}
