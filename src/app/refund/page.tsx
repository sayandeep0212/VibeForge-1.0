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
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 space-y-8 text-neutral-300 leading-relaxed font-sans"
        >
          <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-2xl mb-8">
            <h3 className="text-xl font-bold text-red-400 mb-2 uppercase tracking-wide font-sans">Important Notice Regarding Processing Fees</h3>
            <p className="text-sm">
              Please note that all registration payments include a small, non-refundable Razorpay processing fee (approx. 2.36%). <strong>In the event of a cancellation and approved refund, only the actual base registration price will be refunded. The extra processing charges levied by the payment gateway will not be returned.</strong>
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-yellow-300 mb-4 uppercase tracking-wider font-sans">1. Cancellation by Participant</h2>
            <p>
              If you or your team are unable to attend VibeForge 1.0 after successfully registering, you may request a cancellation by emailing us at <strong>adamasgamingclub@gmail.com</strong>.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Cancellations requested <strong>at least 7 days</strong> prior to the event start date will be eligible for a refund of the base registration fee.</li>
              <li>Cancellations made <strong>less than 7 days</strong> before the event are strictly non-refundable due to logistics and pre-arranged event accommodations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-yellow-300 mb-4 uppercase tracking-wider font-sans">2. Refund Process</h2>
            <p>
              To initiate a refund, the team leader must send an email from the registered email address with the Booking ID and transaction details.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Approved refunds will be processed within <strong>5-7 business days</strong>.</li>
              <li>The refund amount will be credited back to the original source of payment used during registration.</li>
              <li>As stated above, only the base ticket price will be refunded. The Razorpay gateway convenience/processing fees are strictly non-refundable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-yellow-300 mb-4 uppercase tracking-wider font-sans">3. Event Cancellation or Postponement</h2>
            <p>
              In the unlikely event that GameLiminals or Adamas University cancels VibeForge 1.0, all registered participants will receive a full refund of their base registration fee. If the event is postponed, your registration will automatically be transferred to the new dates. If you cannot attend on the new dates, you may request a refund within the stipulated timeframe provided during the postponement announcement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-yellow-300 mb-4 uppercase tracking-wider font-sans">4. Disqualification</h2>
            <p>
              Teams or individuals disqualified from the event due to violations of the Code of Conduct, cheating, or failing to adhere to the rules <strong>will not</strong> be eligible for any form of refund.
            </p>
          </section>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
};

export default RefundPage;
