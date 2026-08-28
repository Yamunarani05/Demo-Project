import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Sparkles, Users2, CheckCircle, Zap } from 'lucide-react';
import { IMAGES } from '../data/images';

export const AISection: React.FC = () => {
  const points = [
    {
      icon: Layers,
      title: 'One Connected Workflow',
      description:
        'From initial lead capture to final gallery delivery, every step of your process is seamlessly integrated.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Decisions',
      description:
        'Leverage intelligent insights for pricing, scheduling, and automated task management to focus on what matters.',
    },
    {
      icon: Users2,
      title: 'Built for Creative Teams',
      description:
        'Collaborate with retouchers, assistants, and clients in real-time within a unified, beautiful workspace.',
    },
  ];

  return (
    <section id="ai" className="py-20 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Headings & 3 Feature Points */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-display">
                More Than <br />
                Management. <br />
                <span className="text-brand-700">A Smarter Way</span> to <br />
                Create.
              </h2>
            </motion.div>

            <div className="space-y-6 pt-2">
              {points.map((point, index) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={point.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0 mt-1 text-brand-600 group-hover:bg-brand-nav group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {point.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Tablet Workspace & Overlapping Floating AI Card */}
          <div className="lg:col-span-7 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-900"
            >
              {/* Tablet Workspace Visual */}
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={IMAGES.aiTablet}
                  alt="Photography Management Tablet Interface"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>

              {/* Tablet Screen UI Overlay Graphic */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/30 via-transparent to-transparent pointer-events-none" />
            </motion.div>

            {/* Overlapping Floating AI Card (Matching Video Exactly) */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -bottom-8 -left-4 sm:left-6 md:left-8 bg-white/95 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-float border border-brand-100 max-w-[280px] sm:max-w-xs w-full z-20"
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-nav to-brand-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    AI Smart Culling
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-brand-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-semibold text-emerald-600">Active</span>
                  </div>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="text-slate-500">Auto Selection</span>
                  <span className="text-brand-700 font-bold">85% Complete</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: '0%' }}
                    whileInView={{ width: '85%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-brand-600 to-purple-500 rounded-full"
                  />
                </div>
              </div>

              {/* Mini Status Tag */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>1,420 RAW photos sorted</span>
                <span className="text-brand-600 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> 0.8s/image
                </span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
