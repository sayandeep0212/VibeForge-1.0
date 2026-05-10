import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Schedule | VibeForge 1.0",
  description: "Check the mission timeline for VibeForge 1.0. A high-octane 12-hour sprint of creativity and code at Adamas University.",
  openGraph: {
    title: "Event Schedule | VibeForge 1.0",
    description: "Plan your hackathon experience with our detailed event timeline.",
  },
};

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
