import type { Metadata } from "next";
import { Dancing_Script, Quicksand } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RefCapture from "@/components/RefCapture";
import Clarity from "@/components/Clarity";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-dancing",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fledgy.guide"),
  title: {
    default: "Fledgy · Honest Feedback on Your Essay, CV & Career",
    template: "%s · Fledgy",
  },
  description:
    "Honest feedback on your essay, CV, and career direction — for students, applicants and professionals applying anywhere in the world, not just the US or UK. Country-specific advice, free to start.",
  alternates: { canonical: "/" },
  // Without these, every share of fledgy.guide — a directory listing, a tweet,
  // a LinkedIn post, a WhatsApp forward — renders as a bare URL with no title
  // or blurb. No `images` key yet: pointing at a file that doesn't exist is
  // worse than omitting it, so add one here once /og.jpg is deployed.
  openGraph: {
    type: "website",
    siteName: "Fledgy",
    url: "https://fledgy.guide",
    title: "Fledgy · Honest Feedback on Your Essay, CV & Career",
    description:
      "Score your CV, your application essay and your career direction in 60 seconds. Free to start, no card. Built for people applying and job-hunting anywhere in the world, not just the US and UK.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fledgy · Honest Feedback on Your Essay, CV & Career",
    description:
      "Score your CV, your application essay and your career direction in 60 seconds. Free to start, no card.",
  },
  verification: {
    google: "EMa9Nxzi4MesmPEZV3OjqD1mlghN3K6Oc2XvNmoPsZc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${dancingScript.variable} ${quicksand.variable}`}
    >
      <body className="min-h-full flex flex-col bg-page text-ink">
        <RefCapture />
        <Header />
        {children}
        <Footer />
        <Analytics />
        <Clarity />
      </body>
    </html>
  );
}
