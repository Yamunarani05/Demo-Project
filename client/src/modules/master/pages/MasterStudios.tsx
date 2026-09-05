import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2,
  Search,
  MapPin,
  ChevronRight,
  Users,
  Camera,
  Scissors,
  FolderKanban,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  AnimatedCounter,
  containerStagger,
  itemFadeSlide,
} from '../components/MasterMotion';

export default function MasterStudios() {
  const { studiosList, approveStudio, rejectStudio } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  const activeCount = studiosList.filter((s) => s.status === 'active' || s.status === 'approved').length;
  const pendingCount = studiosList.filter((s) => s.status === 'pending').length;

  const cities = ['all', ...Array.from(new Set(studiosList.map((s) => s.city)))];

  const filteredStudios = studiosList.filter((studio) => {
    const matchSearch =
      studio.name.toLowerCase().includes(search.toLowerCase()) ||
      studio.city.toLowerCase().includes(search.toLowerCase()) ||
      studio.adminName.toLowerCase().includes(search.toLowerCase());
    const matchCity = selectedCity === 'all' || studio.city === selectedCity;
    return matchSearch && matchCity;
  });

  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={itemFadeSlide}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
            Studios Overview Directory ({studiosList.length} Studios Total)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor client counts, staff numbers, photographers, and access requests across all photography studios.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <div className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{activeCount} Active</span>
          </div>
          {pendingCount > 0 && (
            <div className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{pendingCount} Pending</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filter Controls with Focus Animation */}
      <motion.div
        variants={itemFadeSlide}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-purple-600" />
          <input
            type="text"
            placeholder="Search studio by name, admin, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">City:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all cursor-pointer"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city === 'all' ? 'All Cities' : city}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Studios Cards Grid with AnimatePresence */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredStudios.map((studio, idx) => {
            const isPending = studio.status === 'pending';
            const isRejected = studio.status === 'rejected';

            return (
              <motion.div
                key={studio.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
                onClick={() => !isPending && navigate(`/master/studios/${studio.id}`)}
                className={`rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                  isPending
                    ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                    : isRejected
                    ? 'bg-rose-50/30 border-rose-200/80 hover:border-rose-300'
                    : 'bg-white border-slate-200/80 hover:border-purple-300'
                }`}
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        className={`w-12 h-12 rounded-2xl text-white font-bold flex items-center justify-center text-base shadow-md shrink-0 ${
                          isPending
                            ? 'bg-amber-500 shadow-amber-900/20'
                            : isRejected
                            ? 'bg-rose-600 shadow-rose-900/20'
                            : 'bg-purple-600 shadow-purple-900/20'
                        }`}
                      >
                        {idx + 1}
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-purple-700 transition-colors">
                          {studio.name}
                        </h3>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{studio.city}, {studio.state}</span>
                        </div>
                      </div>
                    </div>

                    {isPending ? (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-300 flex items-center gap-1.5 shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pending Approval</span>
                      </span>
                    ) : isRejected ? (
                      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold border border-rose-300 flex items-center gap-1 shadow-xs">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Rejected</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 flex items-center gap-1.5 shadow-xs">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 italic mb-4">
                    "{studio.tagline}"
                  </p>

                  {/* 4 Statistics Metrics */}
                  <div className="grid grid-cols-4 gap-2.5 p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-center mb-4 group-hover:bg-purple-50/20 transition-colors">
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
                        <FolderKanban className="w-3 h-3 text-purple-600" />
                        <span>Clients</span>
                      </div>
                      <div className="text-lg font-black text-purple-700 mt-1">
                        <AnimatedCounter end={studio.onboardedClientsCount || (isPending ? 0 : 5)} duration={600} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
                        <Users className="w-3 h-3 text-indigo-600" />
                        <span>Employees</span>
                      </div>
                      <div className="text-lg font-black text-slate-900 mt-1">
                        <AnimatedCounter end={studio.totalEmployees || 12} duration={600} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
                        <Camera className="w-3 h-3 text-emerald-600" />
                        <span>Photographers</span>
                      </div>
                      <div className="text-lg font-black text-emerald-700 mt-1">
                        <AnimatedCounter end={studio.photographersCount || 7} duration={600} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
                        <Scissors className="w-3 h-3 text-amber-600" />
                        <span>Editors</span>
                      </div>
                      <div className="text-lg font-black text-amber-700 mt-1">
                        <AnimatedCounter end={studio.editorsCount || 5} duration={600} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Controls / Details Button */}
                {isPending ? (
                  <div className="pt-3 border-t border-amber-200/60 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); approveStudio(studio.id); }}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); rejectStudio(studio.id); }}
                      className="py-2 px-3 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold text-xs border border-rose-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
                    <span>Open Studio Details & Client Monitoring</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}


