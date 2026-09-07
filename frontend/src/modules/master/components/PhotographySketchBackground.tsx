import React from 'react';
import { motion } from 'framer-motion';

export default function PhotographySketchBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none text-[#5B42F3]"
    >
      {/* ─── 1. Top-Right: DSLR Camera on Tripod (Darker, Prominent, Continuous Vertical Float) ─── */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [-22, 6, -22] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden md:block absolute -top-4 right-6 lg:right-12 w-80 h-96 opacity-[0.32]"
      >
        <svg
          viewBox="0 0 320 380"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-[#5B42F3]"
        >
          {/* Viewfinder & Prism */}
          <path d="M120 70 L140 45 L180 45 L200 70 Z" strokeWidth="2.4" />
          <rect x="150" y="38" width="20" height="7" rx="2" strokeDasharray="3 3" />
          <circle cx="160" cy="55" r="6" strokeWidth="2" />

          {/* Camera Body */}
          <rect x="85" y="70" width="150" height="90" rx="14" strokeWidth="2.4" />
          <rect x="95" y="80" width="40" height="25" rx="4" strokeDasharray="4 4" />
          {/* Shutter Button & Dials */}
          <rect x="100" y="60" width="16" height="10" rx="2" />
          <rect x="205" y="62" width="18" height="8" rx="2" />
          {/* Grip Texture */}
          <line x1="220" y1="85" x2="220" y2="145" strokeDasharray="2 4" strokeWidth="2" />
          <line x1="225" y1="85" x2="225" y2="145" strokeDasharray="2 4" strokeWidth="2" />

          {/* Large Lens Barrel */}
          <circle cx="160" cy="115" r="38" strokeWidth="2.6" />
          <circle cx="160" cy="115" r="30" strokeDasharray="6 3" strokeWidth="2" />
          <circle cx="160" cy="115" r="20" strokeWidth="2" />
          <circle cx="160" cy="115" r="10" strokeWidth="2" />
          {/* Aperture blades indication */}
          <line x1="150" y1="110" x2="168" y2="105" strokeWidth="2" />
          <line x1="168" y1="105" x2="170" y2="122" strokeWidth="2" />
          <line x1="170" y1="122" x2="155" y2="126" strokeWidth="2" />
          <line x1="155" y1="126" x2="150" y2="110" strokeWidth="2" />

          {/* Tripod Mount / Plate */}
          <rect x="145" y="160" width="30" height="12" rx="3" strokeWidth="2" />
          <circle cx="160" cy="180" r="8" strokeWidth="2" />
          <line x1="160" y1="188" x2="160" y2="205" strokeWidth="3" />

          {/* Tripod Collar & Legs */}
          <path d="M148 205 L172 205" strokeWidth="2.5" />
          {/* Center Column */}
          <line x1="160" y1="205" x2="160" y2="340" strokeWidth="2.4" strokeDasharray="8 4" />
          {/* Left Leg */}
          <line x1="152" y1="205" x2="90" y2="370" strokeWidth="2.5" />
          <circle cx="120" cy="290" r="3.5" fill="currentColor" />
          <line x1="115" y1="290" x2="125" y2="290" strokeWidth="2" />
          {/* Right Leg */}
          <line x1="168" y1="205" x2="230" y2="370" strokeWidth="2.5" />
          <circle cx="200" cy="290" r="3.5" fill="currentColor" />
          <line x1="195" y1="290" x2="205" y2="290" strokeWidth="2" />
        </svg>
      </motion.div>

      {/* ─── 2. Bottom-Left: Rotating Camera Lens (Darker, Prominent, 360deg Rotation - 28s) ─── */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-16 -left-16 w-96 h-96 opacity-[0.35]"
      >
        <svg
          viewBox="0 0 300 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className="w-full h-full text-[#6C47FF]"
        >
          {/* Concentric Lens Circles */}
          <circle cx="150" cy="150" r="140" strokeWidth="2.6" />
          <circle cx="150" cy="150" r="130" strokeDasharray="5 6" strokeWidth="2" />
          <circle cx="150" cy="150" r="115" strokeWidth="2.2" />
          <circle cx="150" cy="150" r="100" strokeDasharray="8 4" strokeWidth="2" />
          <circle cx="150" cy="150" r="80" strokeWidth="2.4" />
          <circle cx="150" cy="150" r="60" strokeWidth="2" />
          <circle cx="150" cy="150" r="40" strokeDasharray="3 3" strokeWidth="2" />
          <circle cx="150" cy="150" r="22" strokeWidth="2.5" />

          {/* Aperture Iris Blades */}
          <path d="M150 110 L180 128 L170 165 L130 170 L120 135 Z" strokeWidth="1.8" />
          <line x1="150" y1="110" x2="190" y2="150" strokeWidth="1.5" />
          <line x1="180" y1="128" x2="160" y2="190" strokeWidth="1.5" />
          <line x1="170" y1="165" x2="110" y2="160" strokeWidth="1.5" />
          <line x1="130" y1="170" x2="110" y2="120" strokeWidth="1.5" />
          <line x1="120" y1="135" x2="150" y2="110" strokeWidth="1.5" />

          {/* Lens Millimeter & F-stop Tick Marks */}
          <line x1="150" y1="10" x2="150" y2="20" strokeWidth="3" />
          <line x1="150" y1="280" x2="150" y2="290" strokeWidth="3" />
          <line x1="10" y1="150" x2="20" y2="150" strokeWidth="3" />
          <line x1="280" y1="150" x2="290" y2="150" strokeWidth="3" />

          <line x1="55" y1="55" x2="63" y2="63" strokeWidth="2" />
          <line x1="245" y1="245" x2="237" y2="237" strokeWidth="2" />
          <line x1="245" y1="55" x2="237" y2="63" strokeWidth="2" />
          <line x1="55" y1="245" x2="63" y2="237" strokeWidth="2" />
        </svg>
      </motion.div>

      {/* ─── 3. Right-Center: Film Strip (Horizontal Drift - 15s) ─── */}
      <motion.div
        initial={{ x: -25 }}
        animate={{ x: [25, -25, 25] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden lg:block absolute top-1/4 -right-4 w-36 h-96 opacity-[0.30]"
      >
        <svg
          viewBox="0 0 120 360"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className="w-full h-full text-[#5B42F3]"
        >
          {/* Film Borders */}
          <rect x="15" y="10" width="90" height="340" rx="8" strokeWidth="2.4" />
          <line x1="30" y1="10" x2="30" y2="350" strokeDasharray="3 3" strokeWidth="1.8" />
          <line x1="90" y1="10" x2="90" y2="350" strokeDasharray="3 3" strokeWidth="1.8" />

          {/* Left Sprocket Holes */}
          {[30, 65, 100, 135, 170, 205, 240, 275, 310].map((y) => (
            <rect key={`sl-${y}`} x="19" y={y} width="7" height="12" rx="2" strokeWidth="1.8" />
          ))}

          {/* Right Sprocket Holes */}
          {[30, 65, 100, 135, 170, 205, 240, 275, 310].map((y) => (
            <rect key={`sr-${y}`} x="94" y={y} width="7" height="12" rx="2" strokeWidth="1.8" />
          ))}

          {/* Film Frames */}
          <rect x="35" y="25" width="50" height="42" rx="4" strokeWidth="2" />
          <rect x="35" y="80" width="50" height="42" rx="4" strokeWidth="2" />
          <rect x="35" y="135" width="50" height="42" rx="4" strokeWidth="2" />
          <rect x="35" y="190" width="50" height="42" rx="4" strokeWidth="2" />
          <rect x="35" y="245" width="50" height="42" rx="4" strokeWidth="2" />
          <rect x="35" y="300" width="50" height="42" rx="4" strokeWidth="2" />

          {/* Landscape doodle inside frame */}
          <circle cx="70" cy="95" r="4" strokeWidth="1.5" />
          <path d="M42 115 L52 103 L65 115 Z" strokeWidth="1.8" />
          <path d="M58 115 L68 107 L78 115 Z" strokeWidth="1.8" />
        </svg>
      </motion.div>

      {/* ─── 4. Top-Left: Polaroid / Photo Frame (Floating & Rotation Wobble - 11s) ─── */}
      <motion.div
        initial={{ y: 0, rotate: -5 }}
        animate={{ y: [-16, 10, -16], rotate: [-5, 2, -5] }}
        transition={{ duration: 11, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden xl:block absolute top-6 left-8 w-72 h-64 opacity-[0.28]"
      >
        <svg
          viewBox="0 0 240 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-[#6C47FF]"
        >
          {/* Polaroid / Photo Card */}
          <rect x="15" y="15" width="130" height="160" rx="6" strokeWidth="2.6" />
          <rect x="25" y="25" width="110" height="115" rx="3" strokeWidth="2" />
          <line x1="25" y1="160" x2="70" y2="160" strokeDasharray="3 3" strokeWidth="1.8" />

          {/* Camera icon doodle inside photo */}
          <rect x="55" y="65" width="50" height="35" rx="6" strokeWidth="2" />
          <circle cx="80" cy="82" r="11" strokeWidth="2" />
          <circle cx="80" cy="82" r="4" strokeWidth="2" />
          <rect x="62" y="58" width="12" height="7" rx="2" strokeWidth="1.5" />
          <circle cx="95" cy="72" r="2.5" fill="currentColor" />

          {/* Paperclip on photo */}
          <path d="M60 8 C60 2, 75 2, 75 8 L75 32 C75 38, 64 38, 64 32 L64 12" strokeWidth="2.4" />
        </svg>
      </motion.div>

      {/* ─── 5. Ambient Focus Brackets (Pulsing Scale & Opacity) ─── */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0.2 }}
        animate={{ scale: [0.95, 1.08, 0.95], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 7, delay: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/3 w-36 h-36 opacity-[0.28]"
      >
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-[#5B42F3]">
          <path d="M10 25 L10 10 L25 10" />
          <path d="M75 10 L90 10 L90 25" />
          <path d="M10 75 L10 90 L25 90" />
          <path d="M75 90 L90 90 L90 75" />
          <circle cx="50" cy="50" r="10" strokeDasharray="2 2" />
          <line x1="45" y1="50" x2="55" y2="50" />
          <line x1="50" y1="45" x2="50" y2="55" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0.2 }}
        animate={{ scale: [1, 0.92, 1], opacity: [0.22, 0.38, 0.22] }}
        transition={{ duration: 8, delay: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden lg:block absolute bottom-24 right-1/4 w-32 h-32 opacity-[0.30]"
      >
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-[#6C47FF]">
          <path d="M15 30 L15 15 L30 15" />
          <path d="M70 15 L85 15 L85 30" />
          <path d="M15 70 L15 85 L30 85" />
          <path d="M70 85 L85 85 L85 70" />
          <line x1="50" y1="40" x2="50" y2="60" strokeDasharray="3 3" />
          <line x1="40" y1="50" x2="60" y2="50" strokeDasharray="3 3" />
        </svg>
      </motion.div>

      {/* ─── 6. Ambient Bokeh Dots & Doodles with Staggered Delays ─── */}
      {[
        { top: '12%', left: '22%', size: 10, duration: 6, delay: 0 },
        { top: '28%', left: '78%', size: 12, duration: 8, delay: 1 },
        { top: '45%', left: '15%', size: 8, duration: 7, delay: 2 },
        { top: '65%', left: '88%', size: 11, duration: 9, delay: 3 },
        { top: '78%', left: '38%', size: 9, duration: 6.5, delay: 1.5 },
        { top: '18%', left: '55%', size: 10, duration: 7.5, delay: 4 },
        { top: '88%', left: '65%', size: 14, duration: 8.5, delay: 5 },
      ].map((dot, idx) => (
        <motion.div
          key={`dot-${idx}`}
          initial={{ opacity: 0.25, y: 0 }}
          animate={{
            opacity: [0.25, 0.45, 0.25],
            y: [-10, 10, -10],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
          }}
          className="absolute rounded-full bg-[#5B42F3]/40 border border-[#6C47FF]/50 shadow-sm"
        />
      ))}
    </div>
  );
}
