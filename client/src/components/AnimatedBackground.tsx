import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Curated high-res photo assets matching exact reference screenshot (Daisy, Yosemite, Studio, Portrait, Architecture, Fashion)
const REEL_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=85",
    title: "White Daisy Blossom"
  },
  {
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=85",
    title: "Yosemite Granite Peaks"
  },
  {
    url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=85",
    title: "Studio Camera Setup"
  },
  {
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85",
    title: "Editorial Studio Portrait"
  },
  {
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=85",
    title: "Avant-Garde Fashion"
  },
  {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=85",
    title: "Alpine Lake Reflection"
  },
  {
    url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=85",
    title: "Architectural Curves"
  },
  {
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=85",
    title: "Urban Commercial Motion"
  },
  {
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=85",
    title: "Eternal Vows Wedding"
  },
  {
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=85",
    title: "Misty Pine Forest"
  },
];

export const AnimatedBackground: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Duplicate list to achieve a seamless 100% infinite continuous loop
  const displayPhotos = [...REEL_PHOTOS, ...REEL_PHOTOS, ...REEL_PHOTOS];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#040405] font-sans">
      {/* Dark Ambient Vignette Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_45%,_var(--tw-gradient-stops))] from-slate-900/30 via-[#050507] to-black" />

      {/* 3D PERSPECTIVE WIREFRAME GRID FLOOR (Matching reference screenshot mesh3d) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div 
          className="w-[220vw] h-[160vh] origin-bottom opacity-30"
          style={{
            transform: 'perspective(750px) rotateX(76deg) translateY(140px) translateZ(-60px)',
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.18) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.18) 1px, transparent 1px)
            `,
            backgroundSize: '65px 65px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 90%)',
          }}
        />
      </div>

      {/* CONTINUOUS 3D CURVED PHOTO FILM STRIP (Arcing across space out of camera lens) */}
      <div className="absolute inset-0 pointer-events-auto overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div
            animate={{
              x: ['0%', '-33.333%'],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="flex items-center gap-5 sm:gap-8 whitespace-nowrap pt-8 sm:pt-12"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {displayPhotos.map((item, idx) => {
              const normalizedPos = (idx % 10) / 10;
              // Curved arc math trajectory coming from lens on right, arching up left
              const translateY = Math.sin(normalizedPos * Math.PI * 2) * 65 - 35;
              const rotateZ = Math.sin(normalizedPos * Math.PI * 2) * 14 + (idx % 2 === 0 ? -7 : 7);
              const rotateY = Math.cos(normalizedPos * Math.PI * 2) * 22;
              const translateZ = idx % 2 === 0 ? 35 : -15;

              return (
                <motion.div
                  key={`${item.url}-${idx}`}
                  whileHover={{
                    scale: 1.4,
                    rotateZ: 0,
                    rotateY: 0,
                    translateZ: 80,
                    zIndex: 50,
                    transition: { duration: 0.25, ease: 'easeOut' },
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative flex-shrink-0 cursor-pointer group"
                  style={{
                    transform: `translateY(${translateY}px) rotateZ(${rotateZ}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.85), 0 0 20px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* White Polaroid/Slide Photo Frame */}
                  <div className="bg-white/95 p-1.5 sm:p-2 pb-6 sm:pb-8 rounded-sm border border-white/50 backdrop-blur-md w-32 sm:w-40 md:w-48 transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_0_35px_rgba(255,255,255,0.4)]">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 rounded-[1px]">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Glass Sheen Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* CANON 24-105mm 1:4 L CAMERA LENS (Right Side matching reference photo) */}
      <div className="absolute right-[-8%] top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none select-none z-10 opacity-95">
        <motion.div
          animate={{
            rotateZ: [0, 2, -2, 0],
            y: [-6, 6, -6],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-[560px] h-[560px] flex items-center justify-center"
        >
          {/* Outer Metallic Lens Housing */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-[0_0_90px_rgba(0,0,0,0.98)] border-4 border-slate-800">
            {/* Red Luxury L-Series Accent Line */}
            <div className="absolute inset-3.5 rounded-full border-[5px] border-red-600/90 shadow-[0_0_15px_rgba(220,38,38,0.7)]" />

            {/* Rim Text Ring */}
            <div className="absolute inset-9 rounded-full border-2 border-slate-700 bg-slate-950 flex items-center justify-center">
              {/* Circular SVG Lens Markings */}
              <svg className="absolute inset-0 w-full h-full p-2 text-[11px] font-mono tracking-widest fill-slate-300 uppercase font-bold" viewBox="0 0 200 200">
                <path id="lensTextPath2" d="M 100, 100 m -78, 0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" fill="none" />
                <text className="text-[9px] fill-slate-200 font-extrabold tracking-[0.26em]">
                  <textPath href="#lensTextPath2" startOffset="0%">
                    24 - 105mm  1:4 L  ø77mm  CANON EF LENS  ULTRASONIC
                  </textPath>
                </text>
              </svg>

              {/* Inner Lens Glass Elements & Reflections */}
              <div className="relative w-[360px] h-[360px] rounded-full bg-gradient-to-br from-slate-950 via-indigo-950/80 to-purple-950/90 border-4 border-slate-900 overflow-hidden shadow-inner">
                {/* Aperture Blades Pattern Overlay */}
                <div className="absolute inset-0 opacity-35 flex items-center justify-center">
                  <div className="w-60 h-60 rounded-full border-8 border-dashed border-purple-300/40 rotate-12 animate-spin" style={{ animationDuration: '45s' }} />
                </div>

                {/* Violet & Cyan Lens Coating Glare Reflections */}
                <div className="absolute -top-14 -left-14 w-72 h-72 bg-gradient-to-br from-indigo-400/25 via-purple-400/15 to-transparent rounded-full blur-2xl transform -rotate-45" />
                <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-gradient-to-tl from-cyan-400/25 via-blue-400/15 to-transparent rounded-full blur-2xl" />

                {/* Center Glass Convex Element Highlight */}
                <div className="absolute inset-16 rounded-full border border-purple-300/30 bg-radial from-slate-900/60 via-purple-950/40 to-black shadow-[inset_0_0_50px_rgba(0,0,0,0.95)] flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border border-cyan-400/40 bg-purple-400/10 backdrop-blur-sm" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM FOOTER METADATA BAR (Matching exact reference image layout) */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between text-[11px] font-mono tracking-widest text-slate-400/80 uppercase pointer-events-auto">
        <div className="flex items-center gap-4">
          <span className="text-slate-500 font-bold">FEATURED IN:</span>
          <span className="hover:text-white transition-colors cursor-pointer">VOGUE</span>
          <span className="text-slate-600">|</span>
          <span className="hover:text-white transition-colors cursor-pointer">WIRED</span>
          <span className="text-slate-600">|</span>
          <span className="hover:text-white transition-colors cursor-pointer">APPLE</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-slate-400 animate-pulse">
          <span>SCROLL OR DRAG TO EXPLORE</span>
        </div>

        <div>
          <span>© 2026 — MOTION WAVE</span>
        </div>
      </div>
    </div>
  );
};
