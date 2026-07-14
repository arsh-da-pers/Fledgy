import Mark from "./Mark";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#f0dfc4] bg-[#fdf3e7]">
      <div className="mx-auto flex w-full max-w-3xl items-start gap-4 px-6 py-6">
        <Mark size={28} opacity={0.75} className="mt-0.5 hidden shrink-0 sm:block" />
        <p className="text-xs leading-relaxed text-[#9c8b6f]">
          Fledgy&apos;s scores, tips, and generated drafts are AI-produced
          guidance to help you improve — they are not a guarantee of
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
