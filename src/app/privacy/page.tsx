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
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 space-y-8 text-neutral-300 leading-relaxed font-sans"
        >
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 uppercase tracking-wider font-sans">1. Information We Collect</h2>
            <p>
              When you register for VibeForge 1.0, we collect personal information that you voluntarily provide to us. This includes your name, email address, phone number, university/college name, course details, and any project-related information submitted during the event. For payments, we securely process transactions via Razorpay, but we do not store your sensitive financial details (like full credit card numbers) on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 uppercase tracking-wider font-sans">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Facilitate your registration and participation in VibeForge 1.0.</li>
              <li>Communicate with you regarding event updates, schedules, and announcements.</li>
              <li>Issue digital or physical passes and certificates.</li>
              <li>Provide customer support and respond to your inquiries.</li>
              <li>Analyze registration data to improve future events organized by GameLiminals.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 uppercase tracking-wider font-sans">3. Information Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our university partners, sponsors, and affiliates for the purposes outlined above. We may also disclose information when legally required to do so to comply with applicable laws or valid legal processes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 uppercase tracking-wider font-sans">4. Data Security</h2>
            <p>
              We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information, username, password, transaction information, and data stored on our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 uppercase tracking-wider font-sans">5. Third-Party Services</h2>
            <p>
              Our website may use third-party services like Firebase for database management and Resend for email communications. These services have their own privacy policies governing the use of the data they collect. We encourage you to review their policies if you have concerns about third-party data processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4 uppercase tracking-wider font-sans">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at <strong>adamasgamingclub@gmail.com</strong>.
            </p>
          </section>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
};

export default PrivacyPage;
