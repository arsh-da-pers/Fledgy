import Script from "next/script";

// Microsoft Clarity — free session recordings + heatmaps.
//
// Set NEXT_PUBLIC_CLARITY_ID in Vercel to the PROJECT ID ONLY — the ~10-char
// code like "ye8ttfryvo", not the whole <script> snippet Clarity shows you.
// Find it at clarity.microsoft.com → your project → Settings → Overview.
//
// NEXT_PUBLIC_* values are inlined at BUILD time, so changing it needs a
// redeploy before it takes effect.
//
// WHY THE SANITISING BELOW: the variable was once set to Clarity's entire
// tracking snippet. Pasted into the string below, its own quotes closed the
// string early and the page threw "SyntaxError: missing ) after argument
// list" — so Clarity never loaded and recorded nothing, silently, for as long
// as it was wrong. Anything that isn't a plausible id is now ignored, and a
// full snippet has its id extracted, so a bad paste can never put broken
// JavaScript on every page again.

const ID_SHAPE = /^[A-Za-z0-9]{6,20}$/;

export function resolveClarityId(raw: string | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();

  if (ID_SHAPE.test(value)) return value;

  // Someone pasted the whole snippet — pull the id out of the call:
  //   })(window, document, "clarity", "script", "ye8ttfryvo");
  const fromSnippet = value.match(
    /["']clarity["']\s*,\s*["']script["']\s*,\s*["']([A-Za-z0-9]{6,20})["']/
  );
  if (fromSnippet) return fromSnippet[1];

  // Or a bare tag url: https://www.clarity.ms/tag/ye8ttfryvo
  const fromUrl = value.match(/clarity\.ms\/tag\/([A-Za-z0-9]{6,20})/);
  if (fromUrl) return fromUrl[1];

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[fledgy:clarity] NEXT_PUBLIC_CLARITY_ID is not a usable project id — Clarity is disabled."
    );
  }
  return null;
}

export default function Clarity() {
  const id = resolveClarityId(process.env.NEXT_PUBLIC_CLARITY_ID);
  if (!id) return null;

  // JSON.stringify, not a bare template hole, so the value is always a valid
  // JS string literal whatever it contains.
  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(
        id
      )});`}
    </Script>
  );
}
