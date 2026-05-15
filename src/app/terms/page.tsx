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
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 space-y-8 text-neutral-300 leading-relaxed font-sans"
        >
          <section>
            <h2 className="text-2xl font-bold text-red-400 mb-4 uppercase tracking-wider font-sans">1. Acceptance of Terms</h2>
            <p>
              By accessing and registering for VibeForge 1.0 (organized by GameLiminals, Adamas University), you accept and agree to be bound by the terms and provision of this agreement. Any participation in this event will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not participate in this event.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-red-400 mb-4 uppercase tracking-wider font-sans">2. Event Registration and Participation</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registration is mandatory for all participants, whether as individuals or teams.</li>
              <li>Participants must provide accurate and complete information during registration.</li>
              <li>The organizing committee reserves the right to disqualify any team found violating the rules or engaging in unethical practices.</li>
              <li>All participants must adhere to the event schedule. Late submissions or arrivals may lead to point deductions or disqualification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-red-400 mb-4 uppercase tracking-wider font-sans">3. Intellectual Property</h2>
            <p>
              All assets, code, and concepts created during the hackathon/game jam remain the intellectual property of their respective creators. However, by participating, you grant GameLiminals and Adamas University a non-exclusive, royalty-free license to use, showcase, and promote your submissions for educational and promotional purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-red-400 mb-4 uppercase tracking-wider font-sans">4. Code of Conduct</h2>
            <p>
              VibeForge is dedicated to providing a harassment-free experience for everyone. We do not tolerate harassment of participants in any form. Participants violating these rules may be sanctioned or expelled from the event without a refund at the discretion of the organizers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-red-400 mb-4 uppercase tracking-wider font-sans">5. Liability</h2>
            <p>
              The organizers, sponsors, and Adamas University shall not be held responsible for any loss, damage, or injury sustained by participants during the event. Participants are responsible for their own equipment and personal belongings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-red-400 mb-4 uppercase tracking-wider font-sans">6. Modifications</h2>
            <p>
              GameLiminals reserves the right to modify these terms, event rules, schedules, or prize distributions at any time without prior notice. Any significant changes will be communicated to registered participants via their provided contact details.
            </p>
          </section>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
};

export default TermsPage;
