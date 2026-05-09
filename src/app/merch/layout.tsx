import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exclusive Merch | VibeForge 1.0",
  description: "Gear up for the hackathon with exclusive VibeForge 1.0 and GameLiminals merchandise. T-shirts, caps, and more available for participants.",
  openGraph: {
    title: "Exclusive Merch | VibeForge 1.0",
    description: "Official merchandise for the GameLiminals hackathon.",
  },
};

export default function MerchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
