import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, Battery, Wifi, Aperture, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { IMAGES } from '../data/images';

interface CameraViewportProps {
  onEnterSite: () => void;
}

export const CameraViewport: React.FC<CameraViewportProps> = ({ onEnterSite }) => {
  const [isShutterClicked, setIsShutterClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isShutterClicked) return;
    setIsShutterClicked(true);
    // Play visual shutter animation then trigger enter callback
    setTimeout(() => {
      onEnterSite();
    }, 750);
  };

  const reelPhotos = IMAGES.filmReelPhotos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#030304] font-sans selection:bg-purple-500 selection:text-white">
      {/* Background ambient lighting in camera studio */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/20 via-slate-950 to-black opacity-95 pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Shutter Flash Effect overlay when clicked */}
      <AnimatePresence>
        {isShutterClicked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.2, 0] }}
            transition={{ duration: 0.6, times: [0, 0.15, 0.5, 1] }}
            className="fixed inset-0 z-50 bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Main Camera Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={
          isShutterClicked
            ? { scale: 3.8, opacity: 0.05, transition: { duration: 0.75, ease: [0.7, 0, 0.84, 0] } }
            : { scale: 1, opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
        }
        className="relative w-full max-w-4xl px-4 flex flex-col items-center justify-center"
      >
        {/* Top Hint Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-xl backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Interactive Live Camera Viewfinder</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </motion.div>

        {/* Realistic Matte Black Camera Body Structure */}
        <div
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative cursor-pointer transition-transform duration-500 transform ${isHovered ? 'scale-[1.015]' : 'scale-100'
            }`}
          title="Click to shoot & enter website"
        >
          {/* Outer Camera Body Housing */}
          <div className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 sm:p-8 rounded-[40px] border border-slate-800 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden">
            {/* Top Metallic Camera Dial & Controls Ridge */}
            <div className="absolute -top-3 left-12 right-12 h-6 bg-slate-900 rounded-t-xl border-t border-slate-700 flex items-center justify-between px-8">
              {/* Left Dial */}
              <div className="w-8 h-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-t border border-slate-600 shadow-inner" />
              {/* Hot shoe mount */}
              <div className="w-16 h-3 bg-slate-950 border border-slate-700 rounded-t flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-800" />
              </div>
              {/* Shutter Button with Pulsing Ring */}
              <div className="relative group">
                <div className="w-7 h-4 bg-gradient-to-b from-slate-300 to-slate-500 rounded-t-full border border-slate-400 shadow-md group-hover:bg-purple-400 transition-colors" />
                <div className="absolute -top-1 -left-1 -right-1 bottom-0 rounded-t-full border border-purple-500/50 animate-ping pointer-events-none" />
              </div>
            </div>

            {/* Left Camera Grip Texture Panel */}
            <div className="absolute top-0 bottom-0 left-0 w-10 bg-slate-950 border-r border-slate-800/80 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:6px_6px] opacity-70" />

            {/* Red Dot Badge Logo on Camera */}
            <div className="absolute top-4 left-14 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600 border border-red-400 shadow-sm flex items-center justify-center">
                <span className="text-[7px] font-extrabold text-white">AI</span>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                EOS PRO 24-105mm f/4 L
              </span>
            </div>

            {/* Right Status LED Indicator */}
            <div className="absolute top-5 right-6 flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">TETHER</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            </div>

            {/* CAMERA LCD VIEWPORT SCREEN FRAME */}
            <div className="relative mt-4 rounded-2xl overflow-hidden border-4 border-slate-900 bg-slate-950 shadow-inner group/screen">
              {/* Screen Bezel Branding */}
              <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono z-20 relative">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-red-400 font-bold tracking-wider">● LIVE REC</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-300">4K 60FPS</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-purple-300">
                    <Wifi className="w-3 h-3 text-purple-400" />
                    AI SYNC
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Battery className="w-3.5 h-3.5" />
                    98%
                  </span>
                </div>
              </div>

              {/* CAMERA LCD SCREEN CONTENT CONTAINER WITH 3D PERSPECTIVE BACKGROUND MATCHING REFERENCE PHOTO */}
              <div className="relative p-6 sm:p-10 md:p-12 bg-[#050508] min-h-[350px] sm:min-h-[400px] flex flex-col items-center justify-center text-center overflow-hidden border border-purple-900/40">
                {/* Perspective 3D Grid Floor Inside Camera Screen */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
                  <div
                    className="w-[180%] h-[150%] origin-center"
                    style={{
                      transform: 'perspective(600px) rotateX(72deg) translateY(60px)',
                      backgroundImage: `
                        linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
                      `,
                      backgroundSize: '40px 40px',
                    }}
                  />
                </div>

                {/* Micro 3D Photo Reel Arc Inside Camera LCD Screen */}
                <div className="absolute top-12 left-0 right-0 h-28 pointer-events-none opacity-80 overflow-hidden">
                  <motion.div
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    className="flex items-center gap-4 whitespace-nowrap"
                  >
                    {[...reelPhotos, ...reelPhotos].map((img, i) => (
                      <div
                        key={`lcd-reel-${i}`}
                        className="w-14 h-11 bg-white p-1 rounded-sm shadow-md border-2 border-white transform rotate-[-6deg]"
                        style={{
                          transform: `translateY(${Math.sin((i % 8) * 0.8) * 12}px) rotate(${((i % 5) - 2) * 4}deg)`,
                        }}
                      >
                        <img src={img} alt="Reel frame" className="w-full h-full object-cover rounded-[1px]" />
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Animated Autofocus Box overlay framing the heading */}
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                    borderColor: ['rgba(168, 85, 247, 0.6)', 'rgba(52, 211, 153, 0.9)', 'rgba(168, 85, 247, 0.6)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-6 sm:inset-8 border-2 border-dashed rounded-xl pointer-events-none flex flex-col justify-between p-2 z-10"
                >
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </motion.div>

                {/* AF Status Badge */}
                <div className="absolute top-3 left-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1 z-20">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>AF-S LOCK [3D MESH REEL]</span>
                </div>

                {/* MAIN WEBPAGE CONTENT DISPLAYED INSIDE CAMERA SCREEN */}
                <div className="relative z-20 max-w-2xl mx-auto px-2 py-4 mt-6">
                  {/* Top Pill inside LCD */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-400/40 text-purple-200 text-xs font-semibold mb-3 backdrop-blur-md">
                    <Aperture className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '10s' }} />
                    <span>SELECTED WORK 2018 — 2026</span>
                  </div>

                  {/* Headline matching request */}
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 font-display">
                    Manage Your Entire <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-purple-300 via-purple-200 to-indigo-200 bg-clip-text text-transparent italic font-serif">
                      Photography Business
                    </span>{' '}
                    <br />
                    Smarter with AI.
                  </h1>

                  {/* Subtitle matching request */}
                  <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed font-normal">
                    The premier creative management ecosystem designed specifically for professional photographers and creative agencies.
                  </p>

                  {/* Interactive Shutter Trigger Button Prompt */}
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-900/60 group-hover/screen:scale-105 transition-all">
                    <Camera className="w-4 h-4 text-purple-100" />
                    <span>CLICK CAMERA TO ENTER SITE</span>
                    <ArrowRight className="w-4 h-4 text-purple-100 group-hover/screen:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Bottom Camera LCD HUD Info Bar */}
                <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-purple-300/80 border-t border-purple-800/40 pt-1.5 pointer-events-none z-20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="bg-purple-900/80 px-1.5 py-0.5 rounded text-white font-bold">1/8000s</span>
                    <span className="bg-purple-900/80 px-1.5 py-0.5 rounded text-purple-200 font-bold">f/1.4</span>
                    <span className="bg-purple-900/80 px-1.5 py-0.5 rounded text-emerald-300 font-bold">ISO 100</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <span>RAW + FINE</span>
                    <span>WB: 5600K</span>
                    <span className="text-emerald-400">EV +0.3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Camera Grip Detail */}
            <div className="mt-3 flex items-center justify-between px-2 text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <span>MODEL: DEMO-AI-X1</span>
              </div>
              <div className="text-purple-400/90 font-sans font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-400" />
                Click anywhere on camera body or screen to enter
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
