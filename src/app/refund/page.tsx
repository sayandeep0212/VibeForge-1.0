'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const RefundPage = () => {
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
            <div className="h-10 w-2 bg-gradient-to-b from-yellow-300 to-orange-500 rounded-full" />
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter italic text-yellow-300 uppercase font-sans">
              Refund & <span className="text-white font-sans">Cancellation</span>
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
              "Registration fees, once paid, are generally non-refundable except in special cases approved by the organizing committee of GameLiminals.",
              "Participants who wish to cancel their registration must contact the organizing team through the official communication channels before the specified deadline, if applicable.",
              "Refund requests submitted after the official deadline may not be considered.",
              "Processing fees, platform charges, or transaction charges imposed by payment gateways may be non-refundable.",
              "In case of duplicate payments or technical payment errors, participants may request verification and refund support from the organizers.",
              "If the event is postponed, rescheduled, shifted to another format, or modified due to operational, technical, safety, or unforeseen circumstances, registrations may remain valid for the updated event schedule.",
              "If VibeForge 1.0 is canceled entirely by the organizers, refund decisions will be communicated officially to all registered participants.",
              "Participants removed or disqualified due to misconduct, policy violations, cheating, harassment, or rule violations will not be eligible for refunds.",
              "The organizers reserve the right to deny refund requests that violate event policies or involve fraudulent activity.",
              "Refund timelines, if approved, may vary depending on payment platforms, banking processes, and operational procedures.",
              "Participation in VibeForge 1.0 implies acceptance of this Refund & Cancellation Policy."
            ].map((policy, index) => (
              <div key={index} className="flex gap-4 items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 font-bold border border-yellow-500/20 text-sm">
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

export default RefundPage;
