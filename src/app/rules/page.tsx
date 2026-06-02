'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { ShieldCheck, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RulesPage() {
  const rules = [
    "Every participant must complete registration before entering the event.",
    "Registration is completely FREE for Adamas University teams — no payment or payment receipt is required. External teams must pay the applicable registration fee.",
    "Teams can consist of a maximum of 3 members. Solo participation is also allowed.",
    "Participants must build and deploy their web development project within the allocated 5-hour timeframe.",
    "Pre-built or previously completed projects are strictly prohibited. Basic templates, libraries, and open-source resources are allowed.",
    "All participants are required to bring their own laptops, chargers, and necessary accessories.",
    "Internet usage is permitted strictly for development purposes, documentation, APIs, and deployment.",
    "Any form of plagiarism, code theft, or unfair practices will lead to immediate disqualification.",
    "Teams must maintain proper conduct and professionalism throughout the event.",
    "Final project submission must include a working deployed link and a short project presentation/demo.",
    "The decision of the organizers and judges will be final and binding for all participants.",
    "Participants are expected to follow venue discipline and avoid any activity that disrupts the event environment.",
    "During the hackathon, participants are strictly NOT allowed to leave the campus premises under any circumstances. Once checked in, you must remain on campus until the event officially concludes.",
    "By participating in VIBEFORGE 1.0, teams agree that their project showcases and photographs may be used for event highlights and promotions."
  ];

  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      <Navbar />

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-yellow-300/10 border border-yellow-300/20 rounded-2xl">
                <ShieldCheck className="w-12 h-12 text-yellow-300" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-heading italic tracking-wider text-white uppercase mb-4">
              Rules <span className="font-sans">&</span> <span className="text-yellow-300">Regulations</span>
            </h1>
            <p className="text-red-500 font-black italic tracking-widest text-base sm:text-xl uppercase">VIBEFORGE 1.0</p>
            <div className="h-1 w-24 bg-red-400 mx-auto mt-8 rounded-full" />
          </motion.div>

          {/* Rules List Section */}
          <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 md:p-16 shadow-2xl relative overflow-hidden">
            {/* Top Bar Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

            <div className="grid grid-cols-1 gap-6">
              {rules.map((rule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 sm:gap-6 group p-3 sm:p-4 rounded-2xl hover:bg-white/[0.02] transition-all"
                >
                  <div className="flex-none mt-1">
                    <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-red-500 font-bold font-sans text-xs group-hover:border-red-400/50 transition-colors">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-300 text-sm sm:text-lg md:text-xl leading-relaxed font-sans group-hover:text-white transition-colors">
                      {rule}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Warning Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mt-10 sm:mt-16 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-red-600/5 border border-red-600/20 flex flex-col md:row items-center gap-4 sm:gap-6"
            >
              <AlertTriangle className="w-12 h-12 text-red-500 shrink-0" />
              <div>
                <h4 className="text-white font-black italic uppercase tracking-widest mb-2">Notice to All Ninjas</h4>
                <p className="text-neutral-400 text-sm font-sans">
                  Strict adherence to these rules is mandatory. Failure to comply with any regulation may result in immediate expulsion from the arena without appeal. Play fair, code hard.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Quick Support Link */}
          <div className="mt-12 text-center">
            <p className="text-neutral-500 text-sm font-sans mb-4">Have questions regarding the regulations?</p>
            <a
              href="mailto:adamasgamingclub@gmail.com"
              className="inline-flex items-center gap-2 text-yellow-300 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs border-b border-yellow-300/30 pb-1"
            >
              Contact Event Coordinators
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
