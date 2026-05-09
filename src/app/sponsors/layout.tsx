import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Sponsors | VibeForge 1.0",
  description: "Meet the legendary guilds and visionaries powering VibeForge 1.0. Join the ranks of those who forge the future of gaming with GameLiminals.",
  openGraph: {
    title: "Our Sponsors | VibeForge 1.0",
    description: "Meet the partners and sponsors of Adamas University's premier hackathon.",
  },
};

export default function SponsorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
