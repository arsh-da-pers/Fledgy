// Turns the plain-text CV the model writes into a properly typeset document
// and hands it to the browser's print engine, where "Save as PDF" produces the
// polished file.
//
// WHY NOT A PDF LIBRARY: every option (pdfkit, puppeteer, react-pdf) is a new
// npm dependency, and this repo's lockfile can't be regenerated without a local
// npm install. The browser's own engine also does line-breaking, hyphenation
// and font hinting better than anything we'd hand-roll, and it works on a phone
// — where "Print" offers Save to Files / share sheet.
//
// The document is deliberately NOT Fledgy-branded: cream and orange belong on
// the site, not on someone's CV. This is a recruiter-facing document, so it's
// black on white and conservative, with one restrained accent rule.

type Block =
  | { kind: "name"; text: string }
  | { kind: "contact"; text: string }
  | { kind: "section"; text: string }
  | { kind: "subhead"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "para"; text: string };

const BULLET = /^\s*[-•*–—]\s+/;

// A heading like "PROFESSIONAL EXPERIENCE" — all caps, short, no sentence
// punctuation. Guards against a shouted sentence inside the body being
// mistaken for a section.
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

    // The line or two straight after the name is usually contact details.
    if (blocks.length <= 2 && looksLikeContact(line)) {
      blocks.push({ kind: "contact", text: line });
      return;
    }

    if (isSectionHeading(line)) {
      blocks.push({ kind: "section", text: line });
      return;
    }

    // A short line that introduces bullets is a role/company/date header.
    const next = (lines[i + 1] ?? "").trim();
    if (line.length <= 90 && (BULLET.test(lines[i + 1] ?? "") || /\b(19|20)\d{2}\b/.test(line)) && next !== "") {
      blocks.push({ kind: "subhead", text: line });
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

export function buildCvHtml(raw: string): string {
  const blocks = parseCv(raw);

  const body = blocks
    .map((b) => {
      switch (b.kind) {
        case "name":
          return `<h1>${escapeHtml(b.text)}</h1>`;
        case "contact":
          return `<p class="contact">${escapeHtml(b.text)}</p>`;
        case "section":
          return `<h2>${escapeHtml(b.text)}</h2>`;
        case "subhead":
          return `<p class="subhead">${escapeHtml(b.text)}</p>`;
        case "bullets":
          return `<ul>${b.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
        default:
          return `<p>${escapeHtml(b.text)}</p>`;
      }
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>CV</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #14110f;
  }

  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.45;
    -webkit-font-smoothing: antialiased;
  }

  .sheet { max-width: 180mm; margin: 0 auto; }

  h1 {
    font-size: 21pt;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 0 0 2mm;
    line-height: 1.1;
  }

  .contact {
    margin: 0 0 5mm;
    font-size: 9.5pt;
    color: #4a4441;
  }

  h2 {
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #1c6b63;
    margin: 7mm 0 2.5mm;
    padding-bottom: 1.2mm;
    border-bottom: 0.6pt solid #c9c3bf;
    /* Never leave a heading stranded at the foot of a page. */
    break-after: avoid;
    page-break-after: avoid;
  }

  h2:first-of-type { margin-top: 5mm; }

  .subhead {
    font-weight: 700;
    margin: 3.5mm 0 1mm;
    font-size: 10.5pt;
    break-after: avoid;
    page-break-after: avoid;
  }

  p { margin: 0 0 2mm; }

  ul {
    margin: 0 0 2.5mm;
    padding-left: 4.5mm;
    list-style: none;
  }

  li {
    position: relative;
    margin: 0 0 1.4mm;
    padding-left: 3.2mm;
    /* Keep a bullet from splitting across a page break. */
    break-inside: avoid;
    page-break-inside: avoid;
  }

  li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 1.7mm;
    width: 1.3mm;
    height: 1.3mm;
    border-radius: 50%;
    background: #1c6b63;
  }

  /* Screen preview only — the print engine drops this. */
  @media screen {
    body { padding: 10mm; }
  }
</style>
</head>
<body>
<div class="sheet">
${body}
</div>
</body>
</html>`;
}

/**
 * Renders the CV in an offscreen iframe and opens the print dialog, where the
 * user picks "Save as PDF". An iframe rather than window.open, because popup
 * blockers eat the latter.
 */
export function printCv(raw: string): void {
  const existing = document.getElementById("fledgy-cv-print");
  if (existing) existing.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "fledgy-cv-print";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  iframe.srcdoc = buildCvHtml(raw);

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
    // Leave it long enough for the dialog to take its snapshot.
    window.setTimeout(() => iframe.remove(), 60_000);
  };

  document.body.appendChild(iframe);
}
