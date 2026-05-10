import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import BackgroundMusic from "@/components/BackgroundMusic";
import { AuthProvider } from "@/context/AuthContext";
import Preloader from "@/components/Preloader";
import JsonLd from "@/components/SEO/JsonLd";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const casualPassion = localFont({
  src: "../../public/fonts/CasualPassionDemo.ttf",
  variable: "--font-casual-passion",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vibeforge-1-0.tech"),
  title: "VibeForge 1.0 | 12-Hour Intercollege Hackathon by GameLiminals",
  description: "Join VibeForge 1.0, an epic 12-hour intercollege hackathon experience featuring a 5-hour intense vibe coding phase. Presented by GameLiminals at Adamas University.",
  keywords: [
    "VibeForge 1.0",
    "GameLiminals",
    "Adamas University",
    "coding competition",
    "game development",
    "VibeForge hackathon",
    "student coding event",
    "Kolkata hackathon",
    "West Bengal hackathon",
    "hackathon events",
    "university clubs",
    "event related inquiries",
    "12hrs inter college hackathon",
    "5-hour coding phase",
    "vibe coding hackathon",
    "game development club Kolkata",
    "game development club West Bengal",
    "student game developers",
  ],
  authors: [{ name: "GameLiminals" }],
  openGraph: {
    title: "VibeForge 1.0 | 12-Hour Intercollege Hackathon Experience",
    description: "12 hours of networking, learning, and 5 hours of intense coding. Join VibeForge 1.0 by GameLiminals at Adamas University.",
    url: "https://vibeforge-1-0.tech",
    siteName: "VibeForge 1.0",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/vibeforge-banner.png",
        width: 1200,
        height: 630,
        alt: "VibeForge 1.0 Hackathon Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeForge 1.0 | 12-Hour Intercollege Hackathon Experience",
    description: "Join VibeForge 1.0, a 12-hour intercollege event featuring a 5-hour coding phase by GameLiminals.",
    images: ["/images/vibeforge-banner.png"],
    creator: "@GameLiminals",
  },
  icons: {
    icon: "/Logos/logo.ico",
    apple: "/Logos/logo.ico",
  },
  alternates: {
    canonical: "https://vibeforge-1-0.tech",
  },
  verification: {
    google: "ZHdaaW7OhYt1PTxtLHZyHxwRVZXCTRygz62Z8wgHHZo",
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${casualPassion.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ""} />
        <Preloader />
        <AuthProvider>
          <JsonLd />
          {children}
        </AuthProvider>
        {/* Background Music Player */}
        <BackgroundMusic audioUrl="/media/music.mp3" />
      </body>
    </html>
  );
}
