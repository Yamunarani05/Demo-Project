import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CTASectionProps {
  onOpenDemo: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onOpenDemo }) => {
  return (
    <section className="py-24 md:py-36 bg-white relative overflow-hidden text-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Soft background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-purple-100/70 blur-[120px] rounded-full pointer-events-none -z-10" />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight font-display mb-6"
        >
          Ready to Make Your <br />
          Workflow Smarter?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-12 font-normal leading-relaxed"
        >
          Bring your projects, people, clients, and creativity into one intelligent workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex justify-center"
        >
          <button
            onClick={() => (window.location.href = '/login?role=studio_admin&flow=trial')}
            className="px-9 py-4 rounded-full bg-[#181126] hover:bg-black text-white font-semibold text-base shadow-xl shadow-purple-950/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 group cursor-pointer"
          >
            <span>Start Your 14-Day Free Trial</span>
            <ArrowRight className="w-4 h-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

      </div>
    </section>
  );
};
