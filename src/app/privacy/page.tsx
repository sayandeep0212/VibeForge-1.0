'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPage = () => {
  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-yellow-300 selection:text-black overflow-x-hidden">
      <Navbar />

      <div className="relative z-20 pt-32 pb-20 px-6 md:px-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-2 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full" />
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter italic text-cyan-400 uppercase font-sans">
              Privacy <span className="text-white font-sans">Policy</span>
            </h1>
          </div>
          <p className="text-neutral-400 uppercase tracking-widest text-sm pl-6 font-sans">Last Updated: May 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-neutral-300 leading-relaxed font-sans"
        >
          <div className="space-y-6">
            {[
              "GameLiminals may collect participant information including name, email address, phone number, college name, team details, and registration data for event management purposes.",
              "Personal information collected during registration will be used for participant verification, communication, event coordination, certificate generation, and hackathon-related updates.",
              "Participant data will not be sold to unauthorized third parties. However, limited information may be shared with official event partners, sponsors, or service providers strictly for operational and event-related activities.",
              "By registering for VibeForge 1.0, participants consent to receive event announcements, schedules, sponsor communications, and important updates via email, phone, or social media platforms.",
              "Photographs, videos, livestreams, and recordings captured during the event may be used by the organizers for promotional, marketing, documentation, and social media purposes.",
              "Participants are responsible for ensuring that any project submissions, presentations, or uploaded materials do not violate copyright, intellectual property, or privacy laws.",
              "Organizers will take reasonable measures to protect participant information but cannot guarantee absolute security of digital systems, platforms, or online communications.",
              "The event may use third-party platforms or tools for registrations, submissions, communication, judging, or certifications. Use of such platforms may also be subject to their individual privacy policies and terms.",
              "Participants may request corrections or updates to their registration information by contacting the organizing team before the event date.",
              "Any misuse, unauthorized access attempt, fraudulent activity, or violation of platform security may result in disqualification and restriction from the event.",
              "Organizers reserve the right to update or modify this Privacy Policy if required for operational, legal, or event-related reasons.",
              "Participation in VibeForge 1.0 implies acceptance of this Privacy Policy and consent to the collection and use of information as described above."
            ].map((policy, index) => (
              <div key={index} className="flex gap-4 items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20 text-sm">
                  {index + 1}
                </span>
                <p className="pt-1 text-neutral-300 font-sans text-base md:text-lg">
                  {policy}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
};

export default PrivacyPage;
