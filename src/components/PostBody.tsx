import Link from "next/link";
import type { ReactNode } from "react";
import type { Block } from "@/lib/blog";

const linkClass =
  "text-brand-orange underline underline-offset-2 hover:text-brand-orange";

// Supports **bold** and [label](url) inline. Internal links (starting with "/")
// use next/link; external links open in a new tab.
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined && match[3] !== undefined) {
      const label = match[2];
      const href = match[3];
      if (href.startsWith("/")) {
        nodes.push(
          <Link key={key++} href={href} className={linkClass}>
            {label}
          </Link>
        );
      } else {
        nodes.push(
          <a
            key={key++}
            href={href}
            className={linkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        );
      }
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

export default function PostBody({ body }: { body: Block[] }) {
  return (
    <div className="mt-8 space-y-5">
      {body.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={i}
                className="mt-10 text-xl font-semibold leading-snug text-ink sm:text-2xl"
              >
                {renderInline(block.text)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                className="mt-8 text-lg font-semibold text-ink sm:text-xl"
              >
                {renderInline(block.text)}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2.5 pl-1">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-2.5 text-base leading-relaxed text-ink-muted"
                  >
                    <span className="mt-px text-brand-orange">•</span>
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-brand-orange-tint pl-4 text-base italic leading-relaxed text-ink-muted"
              >
                {renderInline(block.text)}
              </blockquote>
            );
          case "p":
          default:
            return (
              <p
                key={i}
                className="text-base leading-relaxed text-ink-muted"
              >
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
