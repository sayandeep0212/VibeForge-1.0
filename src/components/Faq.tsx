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
        <span className={`text-base sm:text-xl md:text-2xl font-bold tracking-tight transition-colors ${isOpen ? 'text-red-400' : 'text-neutral-400 group-hover:text-white'}`}>
          {question}
        </span>
        <div className={`p-2 rounded-lg transition-all ${isOpen ? 'bg-red-400 text-white rotate-180' : 'bg-white/5 text-neutral-500'}`}>
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
            <div className="pb-8 text-neutral-500 leading-relaxed text-sm sm:text-lg max-w-4xl font-sans">
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
      question: "Who can participate in VIBEFORGE 1.0?",
      answer: "VIBEFORGE 1.0 is open to all students passionate about tech, design, development, AI, gaming, or innovation. Both beginners and experienced participants from any college or university are welcome to join."
    },
    {
      question: "What is the team size?",
      answer: "Participants can join individually or as a team of up to 3 members. Solo participation is also allowed!"
    },
    {
      question: "Is there any registration fee?",
      answer: "Registration is completely FREE for Adamas University teams — no payment or payment receipt is required. For External Teams, the registration fee is a flat ₹250 per team. The leader pays this amount for the entire team."
    },
    {
      question: "What are the prize categories?",
      answer: "1st, 2nd, and 3rd place winners receive official Trophies & Certificates. Additionally, the project with the 'Best UI/UX Design' will receive a special Certificate of Excellence."
    },
    {
      question: "Do I need to bring my own laptop?",
      answer: "Yes. Participants are requested to bring their own laptops and any necessary accessories (chargers, mice, etc.) for development."
    },
    {
      question: "Will there be mentorship available?",
      answer: "Yes, experienced mentors will be available throughout the 5-hour build phase to guide you, help with technical hurdles, and refine your project."
    },
    {
      question: "What happens after the hackathon ends?",
      answer: "Beyond the prizes, top projects may get special recognition, showcase opportunities in our community, and future support from the GameLiminals network."
    }
  ];

  return (
    <section id="faq" className="relative py-16 sm:py-24 px-4 sm:px-6 md:px-24 bg-transparent">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-16">
          <div className="p-3 bg-yellow-300 rounded-2xl">
            <HelpCircle className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black italic tracking-wider uppercase underline decoration-red-400 decoration-4 underline-offset-8 text-yellow-300">
            MISSION <span className="text-white">DEBRIEF</span> <span className="font-sans">(FAQ)</span>
          </h2>
        </div>

        <div className="bg-neutral-900 border border-white/5 p-4 sm:p-8 md:p-16 shadow-2xl rounded-2xl sm:rounded-[2.5rem]">
          {faqs.map((faq, index) => (
            <FaqItem key={index} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
