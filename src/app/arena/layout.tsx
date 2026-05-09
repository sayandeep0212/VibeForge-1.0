import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arena | VibeForge 1.0",
  description: "Entering the VibeForge Arena. Access restricted. Initializing protocols for the ultimate 5-hour intercollege hackathon.",
  openGraph: {
    title: "Arena | VibeForge 1.0",
    description: "The digital battlefield of GameLiminals' premier hackathon.",
  },
};

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
