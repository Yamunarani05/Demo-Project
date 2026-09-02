import React from 'react';
import { motion } from 'framer-motion';

// Curated high-res photo assets matching exact reference screenshot (Daisy, Yosemite, Studio, Portrait, Architecture, Fashion)
const REEL_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=400&q=80",
    title: "White Daisy Blossom"
  },
  {
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80",
    title: "Yosemite Granite Peaks"
  },
  {
    url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=400&q=80",
    title: "Studio Camera Setup"
  },
  {
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    title: "Editorial Studio Portrait"
  },
  {
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
    title: "Avant-Garde Fashion"
  },
  {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    title: "Alpine Lake Reflection"
  },
  {
    url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=400&q=80",
    title: "Architectural Curves"
  },
  {
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80",
    title: "Urban Commercial Motion"
  },
  {
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    title: "Eternal Vows Wedding"
  },
  {
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80",
    title: "Misty Pine Forest"
  },
];

export const AnimatedBackground: React.FC = () => {
  // Duplicate list to achieve a seamless 100% infinite continuous loop
  const displayPhotos = [...REEL_PHOTOS, ...REEL_PHOTOS, ...REEL_PHOTOS];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#040405] font-sans">
      {/* Dark Ambient Vignette Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_45%,_var(--tw-gradient-stops))] from-slate-900/30 via-[#050507] to-black" />

      {/* 3D PERSPECTIVE WIREFRAME GRID FLOOR (Matching reference screenshot mesh3d) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className="w-[220vw] h-[160vh] origin-bottom opacity-30 gpu-layer"
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
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="flex items-center gap-5 sm:gap-8 whitespace-nowrap pt-8 sm:pt-12"
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform',
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
                  className="relative flex-shrink-0 cursor-pointer group"
                  style={{
                    transform: `translate3d(0, ${translateY}px, ${translateZ}px) rotateZ(${rotateZ}deg) rotateY(${rotateY}deg)`,
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.85), 0 0 20px rgba(255, 255, 255, 0.1)',
                    willChange: 'transform',
                  }}
                >
                  {/* Classic Pure White Polaroid Photo Frame */}
                  <div className="bg-white p-2 sm:p-2.5 pb-7 sm:pb-9 rounded-sm border-2 border-white w-32 sm:w-40 md:w-48 transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.7)] group-hover:scale-105">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 rounded-[1px]">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                        loading="eager"
                        decoding="async"
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

      {/* CANON EOS 90D CAMERA FRONT VIEW (Crystal-clear sharp camera cutout floating slowly up & down) */}
      <div className="absolute right-[-2%] top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none select-none z-10 opacity-100">
        <motion.div
          animate={{
            y: [-16, 16, -16],
            rotateZ: [-1.2, 1.2, -1.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-[540px] h-auto flex items-center justify-center filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]"
        >
          <img
            src="/canon-90d-transparent.png"
            alt="Canon EOS 90D Camera"
            className="w-full h-auto object-contain brightness-110 contrast-105 drop-shadow-[0_0_20px_rgba(168,85,247,0.25)]"
          />
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
