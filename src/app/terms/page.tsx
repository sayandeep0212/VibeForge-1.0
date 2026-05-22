'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsPage = () => {
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
            <div className="h-10 w-2 bg-gradient-to-b from-red-600 to-orange-500 rounded-full" />
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter italic text-yellow-300 uppercase font-sans">
              Terms & <span className="text-white font-sans">Conditions</span>
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
              "VibeForge 1.0 is a 12-hour AI + Game Development Hackathon organized by GameLiminals at Adamas University.",
              "All participants must complete the official registration process to enter the event.",
              "Participants must carry a valid college ID card or government-issued ID for verification during check-in.",
              "Team sizes and participation rules must follow the official event guidelines announced by the organizers.",
              "Participants are expected to maintain professional and respectful behavior toward fellow participants, mentors, judges, sponsors, volunteers, and organizers throughout the event.",
              "Any form of harassment, discrimination, abusive language, cheating, plagiarism, or misconduct may lead to immediate disqualification and removal from the event premises.",
              "Projects must be developed primarily during the hackathon duration. Pre-built templates, assets, or frameworks may be used only if properly disclosed.",
              "Use of illegal, harmful, offensive, or unethical content in projects is strictly prohibited.",
              "Participants are responsible for the safety and security of their own devices, equipment, accounts, and personal belongings.",
              "The organizing team will not be responsible for any loss, theft, damage, or technical failure during the event.",
              "Internet access, power supply, and workspace facilities will be provided subject to venue limitations and availability.",
              "Judges’ decisions regarding evaluation, rankings, prizes, and disqualifications will be final and binding.",
              "Organizers reserve the right to modify schedules, rules, judging criteria, prizes, or event formats if required due to operational or unforeseen circumstances.",
              "By participating, attendees grant the organizers permission to capture photographs, videos, and recordings for promotional, marketing, and social media purposes.",
              "Sponsor branding, live announcements, digital promotions, and on-ground promotional activities may take place during the event.",
              "Certificates will be provided only to eligible registered participants who successfully attend and comply with event requirements.",
              "Winners and shortlisted teams may be required to provide additional verification before receiving prizes or rewards.",
              "Any violation of these terms may result in warnings, disqualification, restricted access, or permanent removal from the event.",
              "Participation in VibeForge 1.0 implies full acceptance of all rules, guidelines, and decisions made by the organizing committee."
            ].map((term, index) => (
              <div key={index} className="flex gap-4 items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-400 font-bold border border-red-500/20 text-sm">
                  {index + 1}
                </span>
                <p className="pt-1 text-neutral-300 font-sans text-base md:text-lg">
                  {term}
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

export default TermsPage;
