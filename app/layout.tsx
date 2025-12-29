import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AceInterview AI - Master Consulting Interviews",
  description: "Practice case interviews with AI-powered coaching. Get real-time feedback, personalized tips, and land your dream consulting job at McKinsey, BCG, Bain, and more.",
  metadataBase: new URL("https://aceinterview.ai"),
  openGraph: {
    title: "AceInterview AI - Master Consulting Interviews",
    description: "Practice case interviews with AI-powered coaching. Get real-time feedback, personalized tips, and land your dream consulting job.",
    url: "https://aceinterview.ai",
    siteName: "AceInterview AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AceInterview AI - AI-Powered Interview Coach",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AceInterview AI - Master Consulting Interviews",
    description: "Practice case interviews with AI-powered coaching. Get real-time feedback and land your dream consulting job.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#0f172a]">{children}</body>
    </html>
  );
}
