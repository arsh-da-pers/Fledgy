"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import Mark from "./Mark";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/careers", label: "Career Quiz" },
  { href: "/essay", label: "Score my essay" },
  { href: "/cv", label: "Score my CV" },
  { href: "/mentors", label: "Mentors" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 w-full border-b border-[#f0dfc4] bg-white/90 shadow-sm backdrop-blur">
      <div className="flex w-full items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="inline-flex" onClick={() => setOpen(false)}>
          <Logo size={26} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-sm font-medium text-[#6b5c45] sm:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[#2a2115]">
              {l.label}
            </Link>
          ))}
          <Mark size={26} opacity={0.75} />
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex flex-col gap-[5px] p-2 sm:hidden"
        >
          <span className="block h-0.5 w-6 rounded bg-[#6b5c45]" />
          <span className="block h-0.5 w-6 rounded bg-[#6b5c45]" />
          <span className="block h-0.5 w-6 rounded bg-[#6b5c45]" />
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="flex flex-col border-t border-[#f0dfc4] px-4 pb-3 pt-1 text-sm font-medium text-[#6b5c45] sm:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 hover:bg-[#fbe3d8] hover:text-[#2a2115]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
