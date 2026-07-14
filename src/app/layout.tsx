import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fledgy — Grow Your Wings",
  description:
    "AI-powered essay and CV feedback built for international students and talent. Honest scores, country-specific advice, free to try.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Quicksand:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#fdf3e7] text-[#2a2115]">
        {children}
      </body>
    </html>
  );
}
