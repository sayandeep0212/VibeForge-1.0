'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, MapPin, Zap } from 'lucide-react';

const Schedule = () => {
  const days = [
    {
      date: "DAY 1 - KICKOFF",
      events: [
        { time: "10:00 AM", title: "CHECK-IN", desc: "Arrival and badge pickup at the arena.", icon: <MapPin className="w-4 h-4" /> },
        { time: "11:30 AM", title: "OPENING CEREMONY", desc: "Introduction and rules overview.", icon: <Zap className="w-4 h-4 text-yellow-500" /> },
        { time: "12:00 PM", title: "THEME REVEAL", desc: "The secret theme is announced!", icon: <Zap className="w-4 h-4 text-yellow-400" /> },
        { time: "01:00 PM", title: "JAM STARTS", desc: "Start building your masterpiece.", icon: <Clock className="w-4 h-4 text-cyan-400" /> }
      ]
    },
    {
      date: "DAY 2 - INTENSITY",
      events: [
        { time: "10:00 AM", title: "PROGRESS CHECK", desc: "Mentors review project status.", icon: <Zap className="w-4 h-4" /> },
        { time: "01:00 PM", title: "LUNCH BREAK", desc: "Fuel up for the second half.", icon: <Zap className="w-4 h-4" /> },
        { time: "08:00 PM", title: "MIDNIGHT SPRINT", desc: "Late night development session.", icon: <Zap className="w-4 h-4 text-purple-500" /> }
      ]
    },
    {
      date: "DAY 3 - ASCENSION",
      events: [
        { time: "10:00 AM", title: "FINAL POLISH", desc: "Bug fixing and optimization.", icon: <Zap className="w-4 h-4" /> },
        { time: "01:00 PM", title: "SUBMISSION", desc: "Upload projects to the platform.", icon: <Clock className="w-4 h-4 text-yellow-400" /> },
        { time: "03:00 PM", title: "SHOWCASE", desc: "Teams present their games.", icon: <Zap className="w-4 h-4" /> },
        { time: "05:00 PM", title: "AWARDS", desc: "Winners announcement and closing.", icon: <TrophyIcon /> }
      ]
    }
  ];

  return (
    <section id="schedule" className="py-24 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-6 relative z-10">


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {days.map((day, dIdx) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: dIdx * 0.1 }}
              className="relative group"
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
                        <h4 className="text-lg font-black text-white uppercase italic">{event.title}</h4>
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
