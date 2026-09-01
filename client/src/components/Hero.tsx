import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play, Camera, CheckCircle2 } from 'lucide-react';
import { IMAGES } from '../data/images';

interface HeroProps {
  onOpenDemo: () => void;
  onOpenContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDemo, onOpenContact }) => {
  return (
    <section id="home" className="relative min-h-[85vh] flex items-center pt-20 pb-16 overflow-hidden bg-transparent text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full relative z-10">
        <div className="text-left max-w-2xl">
          {/* Category Pill Line matching reference photo */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-6 inline-block"
          >
            <span className="text-[11px] sm:text-xs font-mono tracking-[0.25em] uppercase text-slate-400 font-semibold border-b border-slate-700 pb-1">
              SELECTED WORK 2018 — 2026
            </span>
          </motion.div>

          {/* Headline matching reference photo styling */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[0.95] mb-6 font-display"
          >
            Every frame. <br />
            <span className="font-serif italic font-normal text-slate-200">
              every story.
            </span>
          </motion.h1>

          {/* Subtext matching reference photo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-base sm:text-lg text-slate-300 max-w-lg mb-10 leading-relaxed font-normal"
          >
            Manage your entire photography business smarter with AI. Twelve years of editorial, fashion, and brand photography — one infinite reel. Hover to feel it, click to see it full.
          </motion.p>

          {/* Action CTAs matching reference photo buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="flex items-center gap-6"
          >
            <button
              onClick={onOpenDemo}
              className="px-7 py-3.5 rounded-sm bg-white hover:bg-slate-200 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>BOOK A SESSION</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenContact}
              className="text-xs font-mono font-semibold tracking-wider text-slate-400 hover:text-white uppercase border-b border-transparent hover:border-white transition-all py-1"
            >
              VIEW ARCHIVE
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

