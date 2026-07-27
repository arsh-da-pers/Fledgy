import Link from "next/link";
import type { ReactNode } from "react";
import type { Block } from "@/lib/blog";

const linkClass =
  "text-[#c8532c] underline underline-offset-2 hover:text-[#e2653b]";

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
                className="mt-10 text-2xl font-semibold text-[#2a2115]"
              >
                {renderInline(block.text)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                className="mt-8 text-xl font-semibold text-[#2a2115]"
              >
                {renderInline(block.text)}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2 pl-1">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-[15px] leading-relaxed text-[#4a3f2d]"
                  >
                    <span className="text-[#e2653b]">•</span>
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-[#e2a68a] pl-4 text-[15px] italic leading-relaxed text-[#6b5c45]"
              >
                {renderInline(block.text)}
              </blockquote>
            );
          case "p":
          default:
            return (
              <p
                key={i}
                className="text-[15px] leading-relaxed text-[#4a3f2d]"
              >
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
