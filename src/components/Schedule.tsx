'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, MapPin, Zap } from 'lucide-react';

const Schedule = () => {
  const days = [
    {
      date: "THE ARENA - SINGLE DAY SPRINT",
      events: [
        { time: "08:00 AM - 10:00 AM", title: "REPORTING & BREAKFAST", desc: "Arrival, ID distribution, signature, and morning fuel.", icon: <MapPin className="w-4 h-4" /> },
        { time: "10:00 AM - 11:00 AM", title: "OPENING CEREMONY", desc: "Felicitation ceremony & problem statement declaration.", icon: <Zap className="w-4 h-4 text-yellow-500" /> },
        { time: "11:00 AM - 04:00 PM", title: "BUILD & CODE", desc: "5 Hours of non-stop development and deployment.", icon: <Clock className="w-4 h-4 text-cyan-400" /> },
        { time: "01:30 PM - 02:00 PM", title: "LUNCH BREAK", desc: "Mid-day energy refill for all participants.", icon: <Zap className="w-4 h-4 text-orange-400" /> },
        { time: "04:00 PM - 05:15 PM", title: "JUDGES WATCHING", desc: "Project review and evaluation by the jury.", icon: <Zap className="w-4 h-4 text-red-400" /> },
        { time: "05:15 PM - 05:30 PM", title: "JUDGES DECISION", desc: "Final deliberation and result compilation.", icon: <Zap className="w-4 h-4 text-yellow-400" /> },
        { time: "05:30 PM - 06:00 PM", title: "PRIZE DISTRIBUTION", desc: "Crowning the champions of VibeForge 1.0.", icon: <TrophyIcon /> },
        { time: "06:30 PM", title: "HALL VACATING", desc: "Wrapping up and vacating the event hall.", icon: <Zap className="w-4 h-4" /> },
        { time: "07:30 PM", title: "MISSION COMPLETE", desc: "Official end of VibeForge 1.0 operations.", icon: <Zap className="w-4 h-4 text-green-400" /> }
      ]
    }
  ];

  return (
    <section id="schedule" className="py-24 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-6 relative z-10">


        <div className="max-w-4xl mx-auto">
          {days.map((day, dIdx) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: dIdx * 0.1 }}
              className="relative group w-full"
            >
              <div className="absolute -inset-2 bg-gradient-to-b from-white/5 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-neutral-900 border border-white/5 rounded-3xl p-8 h-full overflow-hidden">
                {/* Day Header */}
                <div className="flex items-center gap-3 mb-10 pb-4 border-b border-white/10">
                   <Calendar className="w-5 h-5 text-red-400" />
                  <h3 className="text-xl font-black italic text-white uppercase tracking-wider">
                    {day.date.split(/(\d+)/).map((part, i) => 
                      /\d+/.test(part) ? <span key={i} className="font-sans">{part}</span> : part
                    )}
                  </h3>
                </div>

                {/* Timeline */}
                <div className="space-y-8 relative">
                  {/* Vertical Line */}
                   <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-red-400 via-neutral-700 to-transparent" />

                  {day.events.map((event, eIdx) => (
                    <div key={eIdx} className="relative pl-12">
                      {/* Node */}
                       <div className="absolute left-0 top-1.5 w-[31px] h-[31px] rounded-full bg-neutral-900 border-2 border-red-400 flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                        {event.icon}
                      </div>

                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-sans font-black tracking-[0.2em] text-yellow-400 uppercase">{event.time}</span>
                        <h4 className="text-lg font-black text-white uppercase italic font-orbitron">{event.title}</h4>
                        <p className="text-sm text-neutral-400 font-medium leading-relaxed">{event.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Decorative Background Text */}
                <div className="absolute -bottom-10 -right-10 text-9xl font-black font-sans text-white/5 pointer-events-none select-none">
                  {dIdx + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TrophyIcon = () => (
  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

export default Schedule;
