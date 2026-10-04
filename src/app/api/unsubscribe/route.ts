import { NextRequest } from "next/server";
import { applyUnsubscribe } from "@/lib/unsubscribe";

export const runtime = "nodejs";

// One-click opt-out from the link in a Fledgy email. A GET, because that is
// what an email client follows — and it only ever stops mail, so there is
// nothing destructive for a link-prefetcher to trigger.
function page(title: string, body: string) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${title} · Fledgy</title></head>
<body style="margin:0;padding:48px 20px;background:#F7EBDB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:460px;margin:0 auto;">
    <img src="https://fledgy.guide/fledgy-mark.png" width="44" height="44" alt="Fledgy" style="display:block;border:0;border-radius:50%;" />
    <h1 style="margin:20px 0 10px;font-size:22px;color:#2B1F1A;">${title}</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#54473F;">${body}</p>
    <a href="https://fledgy.guide" style="font-size:15px;color:#1C6B63;font-weight:600;">Back to Fledgy →</a>
  </div>
</body></html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("e") || "";
  const token = req.nextUrl.searchParams.get("t") || "";

  if (!email || !token || !(await applyUnsubscribe(email, token))) {
    return page(
      "That link didn't work",
      "It may have expired, or been copied incompletely. Email hello@fledgy.guide and a person will take you off the list."
    );
  }

  return page(
    "You're unsubscribed",
    "You won't get any more tips or updates from Fledgy. You'll still get a reply if you ask us something directly — that isn't a mailing list, it's a person answering you."
  );
}
