import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseCoach AI - Master Consulting Interviews",
  description: "AI-powered interview coach for management consulting case interviews",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
