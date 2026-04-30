'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center justify-between text-left group"
      >
        <span className={`text-xl md:text-2xl font-bold transition-colors ${isOpen ? 'text-red-500' : 'text-neutral-400 group-hover:text-white'}`}>
          {question}
        </span>
        <div className={`p-2 rounded-lg transition-all ${isOpen ? 'bg-red-600 text-white rotate-180' : 'bg-white/5 text-neutral-500'}`}>
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-neutral-500 leading-relaxed text-lg max-w-4xl">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Faq = () => {
  const faqs = [
    {
      question: "Who can participate in HackMatrix 2026?",
      answer: "HackMatrix is open to all students, professional developers, and creative designers worldwide. Whether you're a first-time hacker or a seasoned pro, the only requirement is a passion for building cool things!"
    },
    {
      question: "What is the team size?",
      answer: "Teams should consist of 2 to 4 members. We believe this size promotes the best collaboration and ensures everyone has a meaningful role in the project."
    },
    {
      question: "Is there any registration fee?",
      answer: "None at all! Registration and participation in HackMatrix 2026 are completely free. We provide the platform, the mentorship, and the prizes—you just provide the code."
    },
    {
      question: "What if I don't have a team or an idea?",
      answer: "No problem! We'll have dedicated networking sessions and 'team-building' channels on our Discord. We also host brainstorming workshops to help spark your creativity before the hacking begins."
    },
    {
      question: "What are the prize categories?",
      answer: "We have multiple tracks including Top 3 Overall Winners, Best Women's Team, Best Beginner Team, and several sponsor-specific categories like 'Best Use of AI' or 'Web3 Innovator'."
    },
    {
      question: "Do I need to bring my own laptop?",
      answer: "Yes, you'll need your own laptop and charger. We'll provide high-speed internet, power strips, and plenty of snacks to keep you going throughout the night."
    },
    {
      question: "Will there be mentorship available?",
      answer: "Absolutely! We have a curated roster of industry experts from leading tech companies who will be available both online and on-site to help you debug and refine your ideas."
    },
    {
      question: "What happens after the hackathon ends?",
      answer: "Beyond the prizes, every participant receives a digital certificate. Top teams may get internship opportunities, and everyone gets access to our exclusive alumni community."
    }
  ];

  return (
    <section id="faq" className="relative py-24 px-6 md:px-24 bg-gradient-to-b from-transparent to-red-950/20">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-16">
          <div className="p-3 bg-red-600 rounded-2xl">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase underline decoration-red-600 decoration-4 underline-offset-8">
            MISSION <span className="text-red-500">DEBRIEF</span> (FAQ)
          </h2>
        </div>

        <div className="bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-8 md:p-16 shadow-2xl">
          {faqs.map((faq, index) => (
            <FaqItem key={index} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
