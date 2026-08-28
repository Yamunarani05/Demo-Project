import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { IMAGES } from '../data/images';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote:
        'Demo Project has completely transformed how we manage our high-volume production. The AI features are a game-changer for our studio’s efficiency.',
      name: 'Sarah Jenkins',
      role: 'CREATIVE DIRECTOR, FRAMEWORK',
      avatar: IMAGES.avatarSarah,
      isPrimary: false,
    },
    {
      quote:
        'The client review galleries are the most professional we’ve ever used. Our approval times have been cut in half and clients love the interface.',
      name: 'Michael Chen',
      role: 'LEAD PHOTOGRAPHER, NORTHLIGHT',
      avatar: IMAGES.avatarMichael,
      isPrimary: true,
    },
    {
      quote:
        'The tethering, smart culling, and multi-team workflows have allowed us to scale our creative commercial business without adding extra overhead.',
      name: 'Elena Rostova',
      role: 'EXECUTIVE PRODUCER, VISIONARY',
      avatar: IMAGES.avatarElena,
      isPrimary: false,
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-slate-50/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Cards Slider / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 min-h-[360px] ${
                item.isPrimary
                  ? 'bg-brand-nav text-white shadow-2xl scale-105 z-10'
                  : 'bg-white text-slate-900 shadow-soft border border-slate-200/80'
              }`}
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 fill-amber-400 text-amber-400 ${
                        item.isPrimary ? 'fill-amber-300 text-amber-300' : ''
                      }`}
                    />
                  ))}
                </div>

                {/* Quote Text */}
                <p
                  className={`text-base sm:text-lg leading-relaxed font-medium mb-8 ${
                    item.isPrimary ? 'text-white' : 'text-slate-700'
                  }`}
                >
                  “{item.quote}”
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-purple-200/20">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/40 shadow-sm"
                />
                <div>
                  <h4
                    className={`font-bold text-sm tracking-wide ${
                      item.isPrimary ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {item.name}
                  </h4>
                  <p
                    className={`text-[11px] font-semibold tracking-wider uppercase ${
                      item.isPrimary ? 'text-purple-200' : 'text-slate-500'
                    }`}
                  >
                    {item.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
