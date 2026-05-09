import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Team | VibeForge 1.0",
  description: "Meet the masterminds behind VibeForge 1.0. A fusion of technical prowess and creative vision from GameLiminals, Adamas University.",
  openGraph: {
    title: "The Team | VibeForge 1.0",
    description: "The crew behind the 5-hour intercollege vibe coding hackathon.",
  },
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
