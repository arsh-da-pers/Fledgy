import Link from "next/link";
import Logo from "./Logo";
import Mark from "./Mark";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-[#f0dfc4] bg-white/90 shadow-sm backdrop-blur">
      <div className="flex w-full items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="inline-flex">
          <Logo size={26} />
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-[#6b5c45]">
          <Link href="/" className="hover:text-[#2a2115]">
            Home
          </Link>
          <Link href="/careers" className="hover:text-[#8a6d2f]">
            Career Quiz
          </Link>
          <Link href="/essay" className="hover:text-[#c8532c]">
            Score my essay
          </Link>
          <Link href="/cv" className="hover:text-teal-700">
            Score my CV
          </Link>
          <Mark size={26} opacity={0.75} className="hidden sm:block" />
        </nav>
      </div>
    </header>
  );
}
