'use client';

import EventPass from '@/components/EventPass';

export default function PassDemoPage() {
  const demoData = {
    passId: "PASS-X7B9K2",
    bookingId: "BOOK-VIBE99",
    teamName: "CODE WARRIORS",
    type: "team" as const,
    members: [
      { firebaseId: "1", uid: "UID-001", name: "Sayandeep", email: "s@test.com" },
      { firebaseId: "2", uid: "UID-002", name: "Alex Ninja", email: "a@test.com" },
      { firebaseId: "3", uid: "UID-003", name: "Sarah Dev", email: "sarah@test.com" },
    ],
    leaderName: "Sayandeep"
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h2 className="text-white text-center mb-8 font-black italic tracking-tighter text-3xl">
          PASS <span className="text-yellow-300">DEMO</span>
        </h2>
        <EventPass {...demoData} />
      </div>
      <p className="mt-8 text-neutral-500 text-sm max-w-xs text-center">
        This is a live demo of the VibeForge 1.0 Event Pass with dynamic QR code and data mapping.
      </p>
    </div>
  );
}
