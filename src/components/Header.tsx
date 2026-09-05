"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  // Navigating on a phone should always close the menu behind you.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Don't let the page scroll behind the open menu.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 shadow-sm backdrop-blur-md">
      <div className="flex w-full items-center justify-between px-5 py-3 sm:px-10 sm:py-4">
        <Link
          href="/"
          className="inline-flex items-center"
          aria-label="Fledgy home"
          onClick={() => setOpen(false)}
        >
          <Logo size={26} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-sm font-medium text-ink-muted sm:flex">
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`transition-colors hover:text-ink ${
                  active ? "text-brand-teal" : ""
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Mark size={26} opacity={0.75} />
        </nav>

        {/* Mobile menu toggle — 44px target, animates into a close icon */}
        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="-mr-2 inline-flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-lg sm:hidden"
        >
          <span
            className={`block h-0.5 w-6 rounded bg-ink-muted transition-transform duration-200 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 rounded bg-ink-muted transition-opacity duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 rounded bg-ink-muted transition-transform duration-200 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Sunrise hairline instead of a flat border */}
      <hr className="rule-sunrise" />

      {/* Mobile nav */}
      {open && (
        <nav className="flex flex-col gap-0.5 bg-white px-3 pb-4 pt-2 text-base font-medium text-ink-muted shadow-lg sm:hidden">
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`flex min-h-[48px] items-center rounded-xl px-3 transition-colors ${
                  active
                    ? "bg-brand-teal-tint text-brand-teal"
                    : "hover:bg-cream hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
