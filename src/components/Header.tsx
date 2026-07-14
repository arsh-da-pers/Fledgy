import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-[#f0dfc4] bg-[#fdf3e7]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center px-6 py-4">
        <Link href="/" className="inline-flex">
          <Logo size={26} />
        </Link>
      </div>
    </header>
  );
}
