import React from 'react';
import { motion } from 'framer-motion';

export const StatsSection: React.FC = () => {
  const logos = [
    'NT STUDIO',
    'FRAMEWORK',
    'VISIONARY',
    'PIXEL HOUSE',
    'NORTHLIGHT',
    'MOMENT STUDIO',
  ];

  const stats = [
    { value: '500+', label: 'PROJECTS MANAGED' },
    { value: '120+', label: 'CREATIVE TEAMS' },
    { value: '98%', label: 'CLIENT SATISFACTION' },
  ];

  return (
    <section className="py-20 md:py-28 bg-white border-t border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display mb-3"
          >
            Trusted by Growing Creative Businesses
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base text-slate-500"
          >
            Empowering the next generation of visual storytellers.
          </motion.p>
        </div>

        {/* Brand Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 mb-20"
        >
          {logos.map((logo) => (
            <span
              key={logo}
              className="text-base sm:text-lg font-bold tracking-widest text-brand-700 hover:text-brand-900 transition-colors uppercase cursor-default"
            >
              {logo}
            </span>
          ))}
        </motion.div>

        {/* 3 Metric Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-8 border-t border-slate-100">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="space-y-2"
            >
              <span className="text-4xl sm:text-6xl font-extrabold text-brand-nav font-display tracking-tight block">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 block">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
