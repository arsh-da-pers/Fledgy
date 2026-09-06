import Script from "next/script";

// Microsoft Clarity — free session recordings + heatmaps.
// Only loads when NEXT_PUBLIC_CLARITY_ID is set (add it in Vercel env vars).
// Get the ID from clarity.microsoft.com → your project → Settings → the
// 10-char project id in the tracking snippet.
export default function Clarity() {
  const id = process.env.NEXT_PUBLIC_CLARITY_ID;
  if (!id) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");`}
    </Script>
  );
}
