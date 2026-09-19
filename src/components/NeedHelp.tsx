/**
 * A quiet way out when the product isn't enough.
 *
 * Deliberately plain text rather than a form: someone who has just been told
 * their essay scores 48 doesn't want another field to fill in, and a real
 * mailbox they can reply to reads as more accountable than a widget. Rendered
 * after results and paywalls — the two places people actually get stuck.
 */
export default function NeedHelp({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-ink-faint ${className}`}>
      Stuck, or think we&apos;ve got something wrong? Email{" "}
      <a
        href="mailto:hello@fledgy.guide"
        className="font-medium text-ink-muted underline underline-offset-2 hover:text-ink"
      >
        hello@fledgy.guide
      </a>{" "}
      and a person will read it.
    </p>
  );
}
