import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import BackgroundMusic from "@/components/BackgroundMusic";
import { AuthProvider } from "@/context/AuthContext";
import Preloader from "@/components/Preloader";
import JsonLd from "@/components/SEO/JsonLd";

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
  title: "VibeForge 1.0 | 5-Hour Intercollege Hackathon by GameLiminals",
  description: "Compete in VibeForge 1.0, the premier 5-hour intercollege vibe coding hackathon presented by GameLiminals. Join Adamas University's leading student-led game development club for an epic coding showdown.",
  keywords: [
    "VibeForge 1.0",
    "GameLiminals",
    "gameliminals",
    "Adamas University hackathon",
    "Adamas University clubs",
    "Adamas game dev club",
    "hackathon events",
    "university clubs",
    "event related inquiries",
    "5hrs inter college hackathon",
    "vibe coding hackathon",
    "game development club Kolkata",
    "game development club West Bengal",
    "student-led game dev club India",
    "intercollege hackathon",
    "game jam",
    "game development workshops",
    "coding seminar"
  ],
  authors: [{ name: "GameLiminals" }],
  openGraph: {
    title: "VibeForge 1.0 | Intercollege Vibe Coding Hackathon",
    description: "Ready to code? Join VibeForge 1.0, a 5-hour intercollege hackathon hosted by GameLiminals, the first student-led game development club at Adamas University.",
    url: "https://vibeforge-1-0.tech",
    siteName: "VibeForge 1.0",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/vibeforge-banner.jpg",
        width: 1200,
        height: 630,
        alt: "VibeForge 1.0 Hackathon Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeForge 1.0 | Intercollege Vibe Coding Hackathon",
    description: "Join VibeForge 1.0, a 5-hour intercollege hackathon by GameLiminals at Adamas University.",
    images: ["/images/vibeforge-banner.jpg"],
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
