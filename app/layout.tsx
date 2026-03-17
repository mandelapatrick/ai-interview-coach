import type { Metadata } from "next";
import Script from "next/script";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import "./globals.css";

const META_PIXEL_ID = "1156299886483320";

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
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-white">
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
