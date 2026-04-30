import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GAMEJAM 2K26 | The Ninja Awakening",
  description: "Join the ultimate 48-hour game development challenge. Awaken your inner ninja, master the blade of creativity, and build the next generation of games. Hosted by GameLiminals Adamas University.",
  keywords: ["GameJam", "Adamas University", "Game Development", "Coding Competition", "Ninja", "Gaming Club"],
  openGraph: {
    title: "GAMEJAM 2K26 | The Ninja Awakening",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
