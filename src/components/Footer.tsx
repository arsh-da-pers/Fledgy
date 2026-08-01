import Link from "next/link";
import Mark from "./Mark";

const footerLinks = [
  { href: "/essay", label: "Score my essay" },
  { href: "/cv", label: "Score my CV" },
  { href: "/careers", label: "Career quiz" },
  { href: "/mentors", label: "Mentors" },
  { href: "/blog", label: "Blog" },
  { href: "/personal-statement-checker", label: "Personal statement checker" },
  { href: "/cv-checker", label: "CV checker" },
  { href: "/sop-checker", label: "SOP checker" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#f0dfc4] bg-[#fdf3e7]">
      <nav className="flex w-full flex-wrap gap-x-5 gap-y-2 px-6 pt-6 text-xs font-medium text-[#6b5c45] sm:px-10">
        {footerLinks.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-[#2a2115]">
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex w-full items-start gap-4 px-6 py-6 sm:px-10">
        <Mark size={28} opacity={0.75} className="mt-0.5 hidden shrink-0 sm:block" />
        <p className="text-xs leading-relaxed text-[#9c8b6f]">
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
