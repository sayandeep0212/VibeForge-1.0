import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import BackgroundMusic from "@/components/BackgroundMusic";
import { AuthProvider } from "@/context/AuthContext";

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
  title: "VibeForge 1.0 | The Ninja Awakening",
  description: "Join the ultimate 48-hour game development challenge. Awaken your inner ninja, master the blade of creativity, and build the next generation of games. Hosted by GameLiminals Adamas University.",
  keywords: ["VibeForge", "GameJam", "Adamas University", "Game Development", "Coding Competition", "Ninja", "Gaming Club"],
  openGraph: {
    title: "VibeForge 1.0 | The Ninja Awakening",
    description: "The ultimate 48-hour game development arena.",
    images: ["/assets/logo.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${casualPassion.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
        {/* Background Music Player */}
        <BackgroundMusic audioUrl="/media/music.mp3" />
      </body>
    </html>
  );
}
