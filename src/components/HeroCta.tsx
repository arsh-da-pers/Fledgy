"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";

export default function HeroCta() {
  return (
    <>
      <Link
        href="/careers"
        onClick={() => track("hero_cta", { tool: "careers" })}
        className="mt-7 block w-full rounded-xl bg-[#e2653b] px-5 py-4 text-center text-lg font-semibold text-white shadow-[0_2px_0_#b6431f] transition hover:bg-[#b6431f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto sm:px-8"
      >
        Take the 2-minute career quiz →
      </Link>

      <p className="mt-2.5 text-center text-sm text-[#6b5c45] sm:text-left">
        Free while in early access. Takes about 2 minutes.
      </p>

      <p className="mt-5 text-sm text-[#6b5c45]">
        Already written something? Score it instead:
      </p>

      <div className="mt-2 grid grid-cols-2 gap-3 sm:max-w-md">
        <Link
          href="/essay"
          onClick={() => track("hero_secondary", { tool: "essay" })}
          className="rounded-xl border-[1.5px] border-teal-700 px-4 py-3.5 text-center font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2653b]"
        >
          Score my essay
        </Link>
        <Link
          href="/cv"
          onClick={() => track("hero_secondary", { tool: "cv" })}
          className="rounded-xl border-[1.5px] border-teal-700 px-4 py-3.5 text-center font-semibold text-teal-700 transition hover:bg-teal-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2653b]"
        >
          Score my CV
        </Link>
      </div>
    </>
  );
}
