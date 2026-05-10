'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Zap, Ghost, Mail, Globe, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Quick Links",
      links: [
        { name: "Home", href: "/" },
        { name: "Schedule", href: "/schedule" },
        { name: "Team", href: "/team" },
        { name: "Sponsors", href: "/sponsors" },
        { name: "Contact us", href: "/contact" },
      ]
    },
    {
      title: "Explore",
      links: [
        { name: "Rules", href: "/rules" },
        { name: "Judges", href: "/#judges" },
        { name: "FAQs", href: "/#faq" },
      ]
    },
    {
      title: "Connect",
      links: [
        { name: "Facebook", href: "https://www.facebook.com/gameliminals" },
        { name: "Instagram", href: "https://www.instagram.com/gameliminals" },
        { name: "Discord", href: "https://discord.gg/wsXeMZcfC" },
        { name: "YouTube", href: "https://www.youtube.com/@GameLiminals" },
      ]
    }
  ];

  return (
    <footer className="relative w-full py-20 overflow-hidden">
      {/* Glassy Background Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      {/* 3D Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-yellow-300 to-transparent shadow-[0_0_20px_#fde047]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-red-600/10 blur-[120px] rounded-full" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <motion.div whileHover={{ scale: 1.1 }} className="w-12 h-12 relative flex items-center justify-center overflow-hidden rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <a href="https://gameliminals.vercel.app" target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center">
                  <img src="/Logos/logo.png" alt="Logo 1" className="w-full h-full object-contain p-1" />
                </a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} className="w-12 h-12 relative flex items-center justify-center overflow-hidden rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <a href="https://adamasuniversity.ac.in/" target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center">
                  <img src="/Logos/au_logo.jpg" alt="Logo 2" className="w-full h-full object-cover" />
                </a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} className="w-12 h-12 relative flex items-center justify-center overflow-hidden rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <a href="https://cycoders.in/" target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center">
                  <img src="/Logos/cycoders.png" alt="Logo 3" className="w-full h-full object-cover" />
                </a>
              </motion.div>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-wider text-white mb-4 italic leading-tight">
              GAMELIMINALS<br/><span className="text-red-400">VIBEFORGE <span className="font-sans">1.0</span></span>
            </h2>
            <p className="text-neutral-400 max-w-xs leading-relaxed text-sm">
              Pushing the boundaries of game development at Adamas University. Join the ultimate quest of creativity and innovation.
            </p>
          </div>

          {/* Links Sections (Quick Links & Explore) */}
          <div className="col-span-1">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_5px_#dc2626]" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footerSections[0].links.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-neutral-400 hover:text-white transition-all hover:translate-x-1 inline-block text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_5px_#dc2626]" />
              Explore
            </h3>
            <ul className="space-y-3">
              {footerSections[1].links.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-neutral-400 hover:text-white transition-all hover:translate-x-1 inline-block text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Map Section (User Request) */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_5px_#dc2626]" />
              Contact Us
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-1">Email</p>
                  <a href="mailto:adamasgamingclub@gmail.com" className="text-neutral-300 hover:text-white transition-colors text-sm break-all">
                    adamasgamingclub@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-1">Location</p>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    Adamas University,<br />
                    Barasat, West Bengal
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map Embed */}
            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.9359525456207!2d88.4552401753054!3d22.739426179373307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f89900466cfd75%3A0xc9e9894a5280a53!2sGameLiminals%20-%20Adamas%20University%20Game%20Development%20Club!5e1!3m2!1sen!2sin!4v1777534293773!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(1) invert(1) contrast(1.2)' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                className="opacity-60 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Divider with Neon Accent */}
        <div className="relative h-[1px] w-full bg-white/10 mb-10">
          <div className="absolute top-0 left-0 w-20 h-full bg-yellow-300 shadow-[0_0_15px_#fde047]" />
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:row justify-between items-center gap-6">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <p className="text-neutral-500 text-[10px] uppercase tracking-[0.2em]">
              &copy; {currentYear} GameLiminals • Established 2026
            </p>
            <p className="text-neutral-500 text-[10px] uppercase tracking-[0.2em]">
              Website developed by <a href="https://www.linkedin.com/in/sayandeep0212/" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 font-bold transition-colors">Sayandeep Pradhan</a>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <a href="https://www.youtube.com/@GameLiminals" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-red-600 transition-all hover:scale-110" title="YouTube">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/gameliminals/" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-cyan-400 transition-all hover:scale-110" title="LinkedIn">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/gameliminals" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-blue-600 transition-all hover:scale-110" title="Facebook">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/gameliminals" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-magenta-500 transition-all hover:scale-110" title="Instagram">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.558.217.957.477 1.377.896.419.42.679.819.896 1.377.164.422.358 1.057.412 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.217.558-.477.957-.896 1.377-.42.419-.819.679-1.377.896-.422.164-1.057.358-2.227.412-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.558-.217-.957-.477-1.377-.896-.419-.42-.679-.819-.896-1.377-.164-.422-.358-1.057-.412-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.217-.558.477-.957.896-1.377.42-.419.819-.679 1.377-.896.422-.164 1.057-.358 2.227-.412 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.28.058-2.152.26-2.917.557-.79.307-1.459.718-2.126 1.384-.666.667-1.077 1.335-1.384 2.126-.297.765-.499 1.637-.557 2.917-.058 1.28-.071 1.688-.071 4.947s.013 3.667.072 4.947c.058 1.28.26 2.152.557 2.917.307.79.718 1.459 1.384 2.126.667.666 1.335-1.077 2.126-1.384.765-.297 1.637-.499 2.917-.557 1.28-.058 1.688-.071 4.947-.071s3.667.013 4.947.072c1.28.058 2.152.26 2.917.557.79.307 1.459.718 2.126 1.384.666.667 1.077 1.335 1.384 2.126.297.765.499 1.637.557 2.917.058 1.28.071 1.688.071 4.947s-.013-3.667-.072-4.947c-.058-1.28-.26-2.152-.557-2.917-.307-.79-.718-1.459-1.384-2.126-.667-.666-1.335-1.077-2.126-1.384-.765-.297-1.637-.499-2.917-.557-1.28-.058-1.688-.071-4.947-.071zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://github.com/gameliminals" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-all hover:scale-110" title="GitHub">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="https://discord.gg/wsXeMZcfC" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#5865F2] transition-all hover:scale-110" title="Discord">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="mailto:adamasgamingclub@gmail.com" className="text-neutral-400 hover:text-white transition-all hover:scale-110" title="Contact Email">
              <Mail className="w-5 h-5" />
            </a>
            <a href="https://gameliminals.vercel.app" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-cyan-400 transition-all hover:scale-110" title="Main Website">
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Side Decorative Glows */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none" />
    </footer>
  );
};

export default Footer;
