"use client";

import { useEffect, useState } from "react";
import Mark from "@/components/Mark";

/**
 * What the reader looks at while a scoring call is in flight.
 *
 * The model call takes long enough (roughly 10-25s on a full CV) that a button
 * reading "Reading your CV…" leaves people staring at nothing, and a plain
 * spinner says nothing about why the wait is worth it. So this names the checks
 * actually being run — they mirror the judging criteria in the prompts, which
 * is also the most honest advert for what the paid report contains.
 *
 * The bar deliberately eases towards ~92% and stops. We don't know when the
 * model will return, and a bar that sits at 100% while nothing happens reads as
 * broken. Better to be visibly still working than to fake completion.
 */

type Tool = "essay" | "cv";

const STEPS: Record<Tool, string[]> = {
  essay: [
    "Reading your essay end to end",
    "Testing whether the opening earns the second line",
    "Looking for detail only you could have written",
    "Following the structure to see if it goes somewhere",
    "Listening for your voice under the admissions cadence",
    "Ranking every fix by what would move the needle",
  ],
  cv: [
    "Reading your CV end to end",
    "Checking it against local hiring norms",
    "Testing every bullet for impact, not duties",
    "Weighing length and focus for your stage",
    "Ranking every fix by what would move the needle",
  ],
};

const ACCENT: Record<Tool, { text: string; bg: string; tint: string }> = {
  essay: {
    text: "text-brand-orange",
    bg: "bg-brand-orange",
    tint: "bg-brand-orange-tint",
  },
  cv: {
    text: "text-brand-teal",
    bg: "bg-brand-teal",
    tint: "bg-brand-teal-tint",
  },
};

const STEP_MS = 2600;

export default function AnalysisLoader({
  tool,
  context,
}: {
  tool: Tool;
  /** e.g. the target country for a CV — folded into the second step when given. */
  context?: string;
}) {
  const steps = STEPS[tool];
  const accent = ACCENT[tool];
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Hold on the last step rather than looping: looping suggests it restarted.
    if (step >= steps.length - 1) return;
    const id = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [step, steps.length]);

  // Eases towards 92% and holds — see the note above.
  const pct = 8 + (92 - 8) * (1 - Math.pow(1 - step / (steps.length - 1), 2));

  const label = (i: number) =>
    tool === "cv" && i === 1 && context
      ? `Checking it against ${context} hiring norms`
      : steps[i];

  return (
    <div
      className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">
          Reading your {tool === "cv" ? "CV" : "essay"}…
        </p>
        <Mark size={30} opacity={0.75} />
      </div>

      <div className={`mt-4 h-1.5 w-full overflow-hidden rounded-full ${accent.tint}`}>
        <div
          className={`h-full rounded-full ${accent.bg} transition-all duration-[2600ms] ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-5 space-y-2.5">
        {steps.map((_, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li
              key={i}
              className={`flex items-start gap-2.5 text-sm transition-opacity duration-500 ${
                done || active ? "opacity-100" : "opacity-35"
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full text-[10px] font-bold ${
                  done
                    ? `${accent.bg} text-white`
                    : active
                      ? `${accent.tint} ${accent.text}`
                      : "bg-page text-ink-faint"
                }`}
                aria-hidden
              >
                {done ? "✓" : "•"}
              </span>
              <span className={done || active ? "text-ink" : "text-ink-faint"}>
                {label(i)}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-xs text-ink-faint">
        This takes a few seconds — we&apos;d rather read it properly than guess.
      </p>
    </div>
  );
}
