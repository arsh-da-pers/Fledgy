// Turns the plain-text CV the model writes into a typeset document and hands it
// to the browser's print engine, where "Save as PDF" produces the polished file.
//
// WHY NOT A PDF LIBRARY: every option (pdfkit, puppeteer, react-pdf) is a new
// npm dependency, and this repo's lockfile can't be regenerated without a local
// npm install. The browser's engine also does line-breaking and font hinting
// better than anything we'd hand-roll, and it works on a phone, where Print
// offers Save to Files.
//
// The document is deliberately NOT Fledgy-branded — cream and orange belong on
// the site, not on a candidate's CV. Near-black on white, with one restrained
// accent rule.

type Block =
  | { kind: "name"; text: string }
  | { kind: "contact"; text: string }
  | { kind: "section"; text: string }
  | { kind: "subhead"; text: string; meta?: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "para"; text: string };

const BULLET = /^\s*[-•*–—]\s+/;

// "PROFESSIONAL EXPERIENCE" — all caps, short, no sentence punctuation. The
// guards stop a shouted sentence in the body being read as a section.
function isSectionHeading(line: string): boolean {
  const t = line.trim();
  if (t.length === 0 || t.length > 46) return false;
  if (/[.:;?!]$/.test(t)) return false;
  if (!/[A-Z]/.test(t)) return false;
  return t === t.toUpperCase();
}

function looksLikeContact(line: string): boolean {
  return /@|\+\d|\bhttps?:\/\/|linkedin|\|/i.test(line);
}

// "Head of Sales | Acme, Dubai | 2019 - 2022" -> text + meta, so the date can
// be set flush right the way a typeset CV does it.
function splitDate(line: string): { text: string; meta?: string } {
  const parts = line.split(/\s+[|·—–]\s+/);
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (/(19|20)\d{2}|present|current/i.test(last)) {
      return { text: parts.slice(0, -1).join(" · "), meta: last };
    }
  }
  return { text: line };
}

export function parseCv(raw: string): Block[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let pendingBullets: string[] = [];
  let seenName = false;

  const flushBullets = () => {
    if (pendingBullets.length) {
      blocks.push({ kind: "bullets", items: pendingBullets });
      pendingBullets = [];
    }
  };

  lines.forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (!line) {
      flushBullets();
      return;
    }

    if (BULLET.test(rawLine)) {
      pendingBullets.push(line.replace(BULLET, ""));
      return;
    }

    flushBullets();

    if (!seenName) {
      seenName = true;
      blocks.push({ kind: "name", text: line });
      return;
    }

    if (blocks.length <= 2 && looksLikeContact(line)) {
      blocks.push({ kind: "contact", text: line });
      return;
    }

    if (isSectionHeading(line)) {
      blocks.push({ kind: "section", text: line });
      return;
    }

    // A short line that introduces bullets, or carries a year, is a role header.
    const next = (lines[i + 1] ?? "").trim();
    if (
      line.length <= 90 &&
      (BULLET.test(lines[i + 1] ?? "") || /\b(19|20)\d{2}\b/.test(line)) &&
      next !== ""
    ) {
      blocks.push({ kind: "subhead", ...splitDate(line) });
      return;
    }

    blocks.push({ kind: "para", text: line });
  });

  flushBullets();
  return blocks;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBlock(b: Block): string {
  switch (b.kind) {
    case "name":
      return `<h1>${escapeHtml(b.text)}</h1>`;
    case "contact":
      return `<p class="contact">${escapeHtml(b.text)}</p>`;
    case "section":
      return `<h2>${escapeHtml(b.text)}</h2>`;
    case "subhead":
      return b.meta
        ? `<p class="subhead"><span>${escapeHtml(b.text)}</span><span class="meta">${escapeHtml(
            b.meta
          )}</span></p>`
        : `<p class="subhead">${escapeHtml(b.text)}</p>`;
    case "bullets":
      return `<ul>${b.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
    default:
      return `<p>${escapeHtml(b.text)}</p>`;
  }
}

/**
 * @param photo optional data: URL. Kept in the browser — it is embedded straight
 *              into the print document and never sent to our servers.
 */
/** Roughly how many A4 pages this CV will print to in the layout above.
 *  Word count is a good enough proxy at this size; headings and bullet
 *  spacing are folded into the words-per-page figure. Approximate by design —
 *  it's there to catch a three-page CV, not to be exact. */
export function estimatePages(raw: string): number {
  const words = raw.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 500));
}

export function buildCvHtml(raw: string, photo?: string): string {
  const blocks = parseCv(raw);

  // Everything before the first section heading is the header block.
  const firstSection = blocks.findIndex((b) => b.kind === "section");
  const headBlocks = firstSection === -1 ? blocks : blocks.slice(0, firstSection);
  const restBlocks = firstSection === -1 ? [] : blocks.slice(firstSection);

  const headHtml = headBlocks
    .map((b) =>
      b.kind === "name"
        ? `<h1>${escapeHtml(b.text)}</h1>`
        : `<p class="contact">${escapeHtml((b as { text: string }).text)}</p>`
    )
    .join("\n");

  const photoHtml = photo
    ? `<div class="photo"><img src="${photo}" alt=""></div>`
    : "";

  const bodyHtml = restBlocks.map(renderBlock).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>CV</title>
<style>
  /* margin:0 is deliberate. Browsers draw their own header and footer — the
     page URL, the date, "1/1" — into the @page margin box, and no CSS can turn
     those off. With no margin there is nowhere to draw them, so the document
     comes out clean. The sheet's own padding replaces the margin. */
  @page { size: A4; margin: 0; }

  * { box-sizing: border-box; }

  html, body { margin: 0; padding: 0; background: #fff; color: #14110f; }

  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.45;
    -webkit-font-smoothing: antialiased;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .sheet { padding: 15mm 15mm 14mm; }

  .head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8mm;
  }

  .head-text { flex: 1; min-width: 0; }

  h1 {
    font-size: 23pt;
    font-weight: 700;
    letter-spacing: -0.015em;
    margin: 0 0 1.5mm;
    line-height: 1.05;
  }

  .contact {
    margin: 0 0 0.8mm;
    font-size: 9pt;
    letter-spacing: 0.02em;
    color: #5b5450;
  }

  .photo {
    width: 28mm;
    height: 34mm;
    flex: 0 0 auto;
    overflow: hidden;
    border-radius: 1.5mm;
    background: #ece7e2;
  }

  .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* The one piece of real ornament: a two-tone rule under the header. */
  .accent {
    height: 1.4mm;
    margin: 4mm 0 6mm;
    background: linear-gradient(90deg,
      #1c6b63 0%, #1c6b63 26%,
      #d9603f 26%, #d9603f 36%,
      #ded8d3 36%);
  }

  h2 {
    font-size: 8.5pt;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #1c6b63;
    margin: 6.5mm 0 2.5mm;
    padding-bottom: 1.2mm;
    border-bottom: 0.5pt solid #d5cfca;
    break-after: avoid;
    page-break-after: avoid;
  }

  h2:first-of-type { margin-top: 0; }

  .subhead {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 6mm;
    font-weight: 700;
    margin: 3.5mm 0 1.2mm;
    font-size: 10.5pt;
    break-after: avoid;
    page-break-after: avoid;
  }

  .subhead .meta {
    font-weight: 500;
    font-size: 9pt;
    color: #6b625d;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  p { margin: 0 0 2mm; }

  ul { margin: 0 0 2.5mm; padding-left: 4mm; list-style: none; }

  li {
    position: relative;
    margin: 0 0 1.5mm;
    padding-left: 3.4mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 1.7mm;
    width: 1.4mm;
    height: 1.4mm;
    border-radius: 50%;
    background: #1c6b63;
  }

  @media screen {
    body { background: #f4f1ed; }
    .sheet {
      max-width: 210mm;
      margin: 8mm auto;
      background: #fff;
      box-shadow: 0 2mm 8mm rgba(0,0,0,.14);
    }
  }
</style>
</head>
<body>
<div class="sheet">
  <header class="head">
    <div class="head-text">
${headHtml}
    </div>
${photoHtml}
  </header>
  <div class="accent"></div>
${bodyHtml}
</div>
</body>
</html>`;
}

/**
 * Renders the CV in an offscreen iframe and opens the print dialog, where the
 * user picks "Save as PDF". An iframe rather than window.open, because popup
 * blockers eat the latter.
 */
export function printCv(raw: string, photo?: string): void {
  document.getElementById("fledgy-cv-print")?.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "fledgy-cv-print";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  iframe.srcdoc = buildCvHtml(raw, photo);

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
    window.setTimeout(() => iframe.remove(), 60_000);
  };

  document.body.appendChild(iframe);
}
