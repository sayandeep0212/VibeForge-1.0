import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | VibeForge 1.0",
  description: "Have questions about VibeForge 1.0? Get in touch with the GameLiminals team for inquiries regarding the hackathon, registration, or sponsorships.",
  openGraph: {
    title: "Contact Us | VibeForge 1.0",
    description: "Reach out to the GameLiminals team for any event-related queries.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
