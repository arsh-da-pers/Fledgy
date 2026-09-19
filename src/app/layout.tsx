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
