'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Clock, Calendar, MapPin, Zap, Coffee, Terminal, Code2, Trophy, Rocket, Search } from 'lucide-react';

const Schedule = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const days = [
    {
      date: "THE ARENA - SINGLE DAY SPRINT",
      events: [
        {
          time: "08:00 AM - 10:00 AM",
          title: "REPORTING & BREAKFAST",
          desc: "Arrival, Pass Scanning, ID distribution, signature, and morning fuel.",
          icon: <Coffee className="w-5 h-5" />,
          color: "blue"
        },
        {
          time: "10:00 AM - 11:00 AM",
          title: "OPENING CEREMONY",
          desc: "Felicitation ceremony & problem statement declaration.",
          icon: <Rocket className="w-5 h-5" />,
          color: "purple"
        },
        {
          time: "11:00 AM - 04:00 PM",
          title: "BUILD & CODE",
          desc: "5 Hours of non-stop development and deployment.",
          icon: <Code2 className="w-5 h-5" />,
          color: "cyan"
        },
        {
          time: "01:30 PM - 02:00 PM",
          title: "LUNCH BREAK",
          desc: "Mid-day energy refill for all participants.",
          icon: <Zap className="w-5 h-5" />,
          color: "orange"
        },
        {
          time: "04:00 PM - 05:15 PM",
          title: "JUDGES WATCHING",
          desc: "Project review and evaluation by the jury.",
          icon: <Search className="w-5 h-5" />,
          color: "red"
        },
        {
          time: "05:15 PM - 05:30 PM",
          title: "JUDGES DECISION",
          desc: "Final deliberation and result compilation.",
          icon: <Terminal className="w-5 h-5" />,
          color: "yellow"
        },
        {
          time: "05:30 PM - 06:00 PM",
          title: "PRIZE DISTRIBUTION",
          desc: "Crowning the champions of VibeForge 1.0.",
          icon: <Trophy className="w-5 h-5" />,
          color: "green"
        },
        {
          time: "06:30 PM",
          title: "HALL VACATING",
          desc: "Wrapping up and vacating the event hall.",
          icon: <MapPin className="w-5 h-5" />,
          color: "slate"
        },
        {
          time: "07:30 PM",
          title: "MISSION COMPLETE",
          desc: "Official end of VibeForge 1.0 operations.",
          icon: <Zap className="w-5 h-5" />,
          color: "emerald"
        }
      ]
    }
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: "text-blue-400 border-blue-400/50 shadow-blue-500/20",
      purple: "text-purple-400 border-purple-400/50 shadow-purple-500/20",
      cyan: "text-cyan-400 border-cyan-400/50 shadow-cyan-500/20",
      orange: "text-orange-400 border-orange-400/50 shadow-orange-500/20",
      red: "text-red-400 border-red-400/50 shadow-red-500/20",
      yellow: "text-yellow-400 border-yellow-400/50 shadow-yellow-500/20",
      green: "text-green-400 border-green-400/50 shadow-green-500/20",
      emerald: "text-emerald-400 border-emerald-400/50 shadow-emerald-500/20",
      slate: "text-slate-400 border-slate-400/50 shadow-slate-500/20",
    };
    return colors[color] || colors.blue;
  };

  return (
    <section id="schedule" className="py-32 relative overflow-hidden bg-transparent" ref={containerRef}>
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Calendar className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold tracking-widest text-red-500 uppercase">Event Roadmap</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-6"
          >
            Timeline <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Chronicles</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 max-w-2xl mx-auto text-lg"
          >
            The path to glory is mapped out. Follow the milestones of VibeForge 1.0 and make every second count.
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Central Progress Line (Desktop) */}
          <div className="absolute left-[31px] md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 hidden md:block" />
          <motion.div
            style={{ scaleY }}
            className="absolute left-[31px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-red-500 via-orange-500 to-cyan-500 origin-top -translate-x-1/2 hidden md:block"
          />

          {/* Vertical Line (Mobile) */}
          <div className="absolute left-[31px] top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 md:hidden" />
          <motion.div
            style={{ scaleY }}
            className="absolute left-[31px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-red-500 via-orange-500 to-cyan-500 origin-top -translate-x-1/2 md:hidden"
          />

          <div className="space-y-12 md:space-y-0">
            {days[0].events.map((event, idx) => (
              <div key={idx} className={`relative flex flex-col md:flex-row items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''} mb-12 md:mb-24 last:mb-0`}>

                {/* Node */}
                <div className="absolute left-[31px] md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 -translate-y-0 md:-translate-y-1/2 z-20">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                    className={`w-16 h-16 rounded-full bg-black border-4 ${getColorClass(event.color)} flex items-center justify-center shadow-lg backdrop-blur-xl relative overflow-hidden group`}
                  >
                    <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                    <div className="relative z-10 transition-transform group-hover:scale-110 duration-300">
                      {event.icon}
                    </div>
                    {/* Animated glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  </motion.div>
                </div>

                {/* Content Card */}
                <div className={`w-full md:w-[45%] pl-20 md:pl-0 ${idx % 2 === 0 ? 'md:pr-20 md:text-right' : 'md:pl-20 md:text-left'}`}>
                  <motion.div
                    initial={{ opacity: 0, x: idx % 2 === 0 ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="group relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-white/5 to-white/0 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                    <div className="relative p-6 md:p-8 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md hover:border-white/20 transition-all duration-300 hover:translate-y-[-4px]">
                      {/* Time Badge */}
                      <span className={`inline-block px-3 py-1 rounded-full bg-white/5 text-[10px] font-black tracking-widest uppercase mb-4 ${getColorClass(event.color).split(' ')[0]}`}>
                        {event.time}
                      </span>

                      <h3 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tight mb-3 group-hover:text-red-500 transition-colors">
                        {event.title}
                      </h3>

                      <p className="text-neutral-400 font-medium leading-relaxed md:text-lg">
                        {event.desc}
                      </p>

                      {/* Side Indicator (Desktop Only) */}
                      <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white/10 rotate-45 border border-white/20 z-0
                        ${idx % 2 === 0 ? '-right-2 border-l-0 border-b-0' : '-left-2 border-r-0 border-t-0'}
                      `} />
                    </div>
                  </motion.div>
                </div>

                {/* Empty space for alternating layout */}
                <div className="hidden md:block w-[45%]" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default Schedule;


