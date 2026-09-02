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
    <section
      id="home"
      className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden bg-slate-950 text-white"
    >
      {/* 1. Full Landing Page 15s Seamless Cinematic Studio Video Background (Darkened & Sharp) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden bg-slate-950">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={IMAGES.heroStudioBg}
          className="w-full h-full object-cover object-center scale-100 opacity-80"
        >
          <source src="/videos/hero-cinematic-bg.mp4" type="video/mp4" />
          <source src="/videos/hero-cinematic-bg.webm" type="video/webm" />
          {/* Fallback image if video is not supported */}
          <img
            src={IMAGES.heroStudioBg}
            alt="Professional Photography Studio"
            className="w-full h-full object-cover object-center"
          />
        </video>

        {/* Dark cinematic gradient overlays without blur for maximum video clarity and high contrast text */}
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/95" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
        {/* Ambient violet aura */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-600/25 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Main Hero Header Content */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-purple-200 text-xs sm:text-sm font-semibold mb-8 shadow-sm tracking-wide"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="uppercase text-[11px] sm:text-xs font-bold tracking-wider text-purple-100">
              Introducing Demo 2.0
            </span>
          </motion.div>

          {/* Large Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.12] mb-6 font-display drop-shadow-md"
          >
            Manage Your Entire <br />
            <span className="relative inline-block font-serif italic font-normal text-purple-300 mx-1">
              <span className="relative z-10 bg-gradient-to-r from-purple-300 via-pink-200 to-indigo-200 bg-clip-text text-transparent">
                Photography Business
              </span>
              <span className="absolute inset-x-0 bottom-1.5 sm:bottom-2.5 h-3 sm:h-4 bg-purple-600/30 -rotate-1 rounded-sm -z-0" />
            </span>{' '}
            <br />
            Smarter with AI.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed font-normal drop-shadow-sm"
          >
            The premier creative management ecosystem designed specifically for
            professional photographers and creative agencies.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-nav hover:bg-brand-600 text-white font-semibold text-base shadow-lg shadow-purple-900/50 hover:shadow-purple-700/60 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer border border-purple-400/30"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenContact}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/30 shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <Play className="w-4 h-4 text-purple-300 fill-purple-300/30" />
              <span>Book a Demo</span>
            </button>
          </motion.div>
        </div>

        {/* Floating Ambient Live Badges */}
        <div className="relative max-w-5xl mx-auto mt-12 pointer-events-none select-none">
          {/* Floating UI Badge - Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="absolute -top-12 left-0 hidden xl:flex items-center gap-3.5 bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-purple-500/30 pointer-events-auto"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Studio Session #428</p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live RAW Tethering Active
              </p>
            </div>
          </motion.div>

          {/* Floating UI Badge - Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="absolute -top-12 right-0 hidden xl:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-purple-500/30 pointer-events-auto"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <p className="text-xs font-bold text-white">Color Profile Synced</p>
              <p className="text-[11px] text-slate-400">Capture One & Lightroom Pro</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
