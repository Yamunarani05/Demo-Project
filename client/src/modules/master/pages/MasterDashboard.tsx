import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2,
  Users,
  FolderKanban,
  Camera,
  Scissors,
  Clock,
  ChevronRight,
  Eye,
  MapPin,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

// Smooth Count-Up Number Component
function AnimatedCounter({ end, duration = 1000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count}</span>;
}

export default function MasterDashboard() {
  const { studiosList, clientsList, activitiesList } = useAuth();
  const navigate = useNavigate();

  const totalStudios = studiosList.length;
  const activeStudios = studiosList.filter((s) => s.status === 'active').length;

  const totalClients = studiosList.reduce(
    (sum, s) => sum + (s.onboardedClientsCount || 5),
    0
  );
  const totalEmployees = studiosList.reduce(
    (sum, s) => sum + (s.totalEmployees || 12),
    0
  );
  const totalPhotographers = studiosList.reduce(
    (sum, s) => sum + (s.photographersCount || 7),
    0
  );
  const totalEditors = studiosList.reduce(
    (sum, s) => sum + (s.editorsCount || 5),
    0
  );

  // Large Summary Visual Statistic Cards
  const statCards = [
    {
      label: 'Total Studios',
      value: totalStudios,
      subtext: `${activeStudios} Active Studios`,
      icon: Building2,
      iconBg: 'bg-purple-100 text-purple-700',
      borderAccent: 'border-purple-200/80',
      valColor: 'text-purple-950',
    },
    {
      label: 'Total Clients',
      value: totalClients,
      subtext: 'Across 10 studios',
      icon: FolderKanban,
      iconBg: 'bg-blue-100 text-blue-700',
      borderAccent: 'border-blue-200/80',
      valColor: 'text-blue-950',
    },
    {
      label: 'Total Employees',
      value: totalEmployees,
      subtext: 'Studio staff members',
      icon: Users,
      iconBg: 'bg-indigo-100 text-indigo-700',
      borderAccent: 'border-indigo-200/80',
      valColor: 'text-indigo-950',
    },
    {
      label: 'Photographers',
      value: totalPhotographers,
      subtext: 'Active camera crew',
      icon: Camera,
      iconBg: 'bg-emerald-100 text-emerald-700',
      borderAccent: 'border-emerald-200/80',
      valColor: 'text-emerald-950',
    },
    {
      label: 'Editors',
      value: totalEditors,
      subtext: 'Post-production team',
      icon: Scissors,
      iconBg: 'bg-amber-100 text-amber-700',
      borderAccent: 'border-amber-200/80',
      valColor: 'text-amber-950',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Top Welcome Header - Premium White / Ambient Glow */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-3">
            <Eye className="w-3.5 h-3.5" />
            <span>Great Master Admin · Overall Monitoring Command</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 font-display">
            Photography Studios Monitoring Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Real-time overview of onboarded studios, client counts, photographers, editors, and where work is currently happening.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <span className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>10 of 10 Studios Active</span>
          </span>
        </div>
      </motion.div>

      {/* 5 Animated Statistic Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Platform Summary Statistics
          </h2>
          <span className="text-[11px] text-purple-600 font-semibold">Live Real-Time Counts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`bg-white rounded-3xl p-6 border ${stat.borderAccent} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-600">
                    {stat.label}
                  </span>
                  <div className={`w-10 h-10 rounded-2xl ${stat.iconBg} flex items-center justify-center font-bold shadow-sm shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className={`text-4xl font-black ${stat.valColor} tracking-tight font-display`}>
                    <AnimatedCounter end={stat.value} duration={800} />
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    {stat.subtext}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Studio Overview Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Studio Overview (10 Studios)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of onboarded clients, staff, photographers, and editors for each studio.
            </p>
          </div>
          <Link
            to="/master/studios"
            className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-full transition-colors inline-flex items-center gap-1 self-start"
          >
            <span>View All Studios</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Clean Studio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {studiosList.map((studio, idx) => (
            <motion.div
              key={studio.id}
              variants={itemVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              onClick={() => navigate(`/master/studios/${studio.id}`)}
              className="p-6 rounded-3xl border border-slate-200/80 hover:border-purple-300 hover:shadow-md bg-white hover:bg-purple-50/10 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-purple-900/20 shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-purple-700 transition-colors">
                        {studio.name}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{studio.city}, {studio.state}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Active</span>
                  </span>
                </div>

                {/* 4 Statistics Matrix */}
                <div className="grid grid-cols-4 gap-2.5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 text-center mb-4">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500">Clients</div>
                    <div className="text-lg font-black text-purple-700 mt-0.5">
                      {studio.onboardedClientsCount || 5}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500">Employees</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      {studio.totalEmployees || 12}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500">Photographers</div>
                    <div className="text-lg font-black text-emerald-700 mt-0.5">
                      {studio.photographersCount || 7}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500">Editors</div>
                    <div className="text-lg font-black text-amber-700 mt-0.5">
                      {studio.editorsCount || 5}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-bold group-hover:translate-x-1 transition-transform">
                <span>View Studio Details & Clients</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity Monitoring Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg font-display">
              Recent Studio Activity (Where Work Is Happening)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live updates of client onboarding, shoot milestones, and workflow movements.
            </p>
          </div>
          <Link
            to="/master/activity"
            className="text-xs font-bold text-purple-700 hover:text-purple-800"
          >
            View All Activity →
          </Link>
        </div>

        <div className="space-y-3">
          {activitiesList.slice(0, 5).map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/60 transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                <Camera className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-xs sm:text-sm text-slate-900">
                    {act.studioName} · <span className="text-purple-700 font-semibold">{act.clientName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{act.timeAgo}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {act.action}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{act.details}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
