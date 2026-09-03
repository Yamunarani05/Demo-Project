import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play, Camera, CheckCircle2, Sliders, Layers, Eye } from 'lucide-react';
import { IMAGES } from '../data/images';

interface HeroProps {
  onOpenDemo?: () => void;
  onOpenContact?: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex flex-col items-center justify-center pt-16 pb-24 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-purple-50/50 via-white to-slate-50/40 text-slate-900"
    >
      {/* Soft ambient gradient depth elements */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-purple-200/35 to-indigo-100/40 blur-[130px] rounded-full pointer-events-none -z-0" />
      <div className="absolute top-1/3 left-10 w-[350px] h-[250px] bg-pink-100/30 blur-[100px] rounded-full pointer-events-none -z-0" />
      <div className="absolute top-1/4 right-10 w-[350px] h-[250px] bg-purple-100/35 blur-[100px] rounded-full pointer-events-none -z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* 1. Staggered Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-purple-800 text-xs sm:text-sm font-semibold mb-6 shadow-sm hover:shadow transition-shadow"
        >
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
          <span className="uppercase text-[11px] sm:text-xs font-bold tracking-wider text-purple-900">
            Introducing Demo 2.0 · Photography SaaS
          </span>
        </motion.div>

        {/* 2. Staggered Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6 font-display max-w-5xl mx-auto"
        >
          Manage Your Entire <br />
          <span className="relative inline-block font-serif italic font-normal text-purple-700 mx-1">
            <span className="relative z-10 bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Photography Business
            </span>
            <span className="absolute inset-x-0 bottom-1.5 sm:bottom-2.5 h-3 sm:h-4 bg-purple-200/60 -rotate-1 rounded-sm -z-0" />
          </span>{' '}
          <br />
          Smarter with AI.
        </motion.h1>

        {/* 3. Staggered Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          The premier creative management ecosystem designed specifically for
          professional photography studios, Great Master overseers, and agency workflows.
        </motion.p>

        {/* 4. Staggered Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <button
            onClick={() => (window.location.href = '/signup')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#5E35B1] hover:bg-[#512DA8] text-white font-bold text-base shadow-xl shadow-purple-900/20 hover:shadow-2xl hover:shadow-purple-900/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => (window.location.href = '/login')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200 shadow-sm hover:shadow transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 text-purple-600" />
            <span>View Demo</span>
          </button>
        </motion.div>

        {/* 5. Staggered Cinematic Showcase Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="p-3 sm:p-4 rounded-3xl bg-gradient-to-b from-purple-100/80 via-white/80 to-purple-50/80 border border-purple-200/80 shadow-2xl backdrop-blur-md">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner group">
              {/* Cover Image / Visual Canvas */}
              <img
                src={IMAGES.heroStudioBg}
                alt="Photography Studio Workspace"
                className="w-full h-64 sm:h-96 object-cover object-center opacity-85 group-hover:scale-102 transition-transform duration-700"
              />

              {/* Overlay Studio Stats Glassmorphic Bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-5 sm:p-6 text-white text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                      Live Studio Session Tethering
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-display mt-0.5 text-white">
                    Studio Aurora · Cinematic Royal Pre-Wedding
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-300" />
                    <span>Sony A7R V · 85mm f/1.2</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-purple-600/80 backdrop-blur-md border border-purple-400/40 text-xs font-bold text-white flex items-center gap-1.5 shadow-md">
                    <Layers className="w-3.5 h-3.5 text-purple-200" />
                    <span>Stage: Photoshoot (65%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating UI Badge - Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="absolute -top-6 -left-4 hidden lg:flex items-center gap-3.5 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-purple-100"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200 shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-left">
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
            transition={{ duration: 0.7, delay: 0.7 }}
            className="absolute -top-6 -right-4 hidden lg:flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-purple-100"
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

export default Hero;
