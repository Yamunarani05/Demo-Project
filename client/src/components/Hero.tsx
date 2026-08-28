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
    <section id="home" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-white">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-100/60 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header Info */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
            <span>Introducing Demo 2.0</span>
          </motion.div>

          {/* Large Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6 font-display"
          >
            Manage Your Entire <br />
            <span className="bg-gradient-to-r from-brand-700 via-brand-600 to-purple-800 bg-clip-text text-transparent">
              Photography Business
            </span>{' '}
            <br />
            Smarter with AI.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            The premier creative management ecosystem designed specifically for
            professional photographers and creative agencies.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-nav hover:bg-brand-700 text-white font-semibold text-base shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenContact}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200 shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-brand-600 fill-brand-600/20" />
              <span>Book a Demo</span>
            </button>
          </motion.div>
        </div>

        {/* Hero Visual Studio Showcase with Floating Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-100 group"
        >
          {/* Main Visual Image */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
            <img
              src={IMAGES.heroStudio}
              alt="Professional Photography Studio with Lighting and Camera Tripod"
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
              loading="eager"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20 pointer-events-none" />
          </div>

          {/* Floating UI Badge - Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute bottom-6 left-6 hidden md:flex items-center gap-3.5 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-float border border-white/40"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-brand-700 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Studio Session #428</p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live RAW Tethering Active
              </p>
            </div>
          </motion.div>

          {/* Floating UI Badge - Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="absolute top-6 right-6 hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-float border border-white/40"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900">Color Profile Synced</p>
              <p className="text-[11px] text-slate-500">Capture One & Lightroom Pro</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
