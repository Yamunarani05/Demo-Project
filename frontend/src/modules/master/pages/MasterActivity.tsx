import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { Camera } from 'lucide-react';
import {
  AnimatedCounter,
  containerStagger,
  itemFadeSlide,
} from '../components/MasterMotion';

export default function MasterActivity() {
  const { activitiesList } = useAuth();

  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div
        variants={itemFadeSlide}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
            Live Cross-Studio Activity Feed
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit log of client onboarding, shoot stage updates, and deliveries across all 10 photography studios.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1.5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
          <span>
            <AnimatedCounter end={activitiesList.length} duration={600} /> Total Events
          </span>
        </div>
      </motion.div>

      <motion.div
        variants={itemFadeSlide}
        className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm"
      >
        <motion.div variants={containerStagger} className="space-y-4">
          {activitiesList.map((act) => (
            <motion.div
              key={act.id}
              variants={itemFadeSlide}
              whileHover={{ x: 4, transition: { duration: 0.15 } }}
              className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-purple-50/30 hover:border-purple-200/60 transition-all shadow-xs"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 3 }}
                className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
              >
                <Camera className="w-5 h-5" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="font-bold text-sm text-slate-900">
                    {act.studioName} · <span className="text-purple-700 font-semibold">{act.clientName}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{act.timeAgo}</span>
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {act.action}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{act.details}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

