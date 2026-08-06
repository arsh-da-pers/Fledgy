import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads Dashboard",
  robots: { index: false, follow: false },
};

export default function LeadsDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
