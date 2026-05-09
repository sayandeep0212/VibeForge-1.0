import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hackathon Rules | VibeForge 1.0",
  description: "Read the guidelines and rules for VibeForge 1.0. Ensure a fair and competitive environment for all vibe coding participants.",
  openGraph: {
    title: "Hackathon Rules | VibeForge 1.0",
    description: "Official rules and code of conduct for VibeForge 1.0.",
  },
};

export default function RulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
