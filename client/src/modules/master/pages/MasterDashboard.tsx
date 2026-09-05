import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2,
  Users,
  FolderKanban,
  Camera,
  Scissors,
  ChevronRight,
  Eye,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import {
  AnimatedCounter,
  containerStagger,
  itemFadeSlide,
} from '../components/MasterMotion';

export default function MasterDashboard() {
  const { studiosList, pendingRequests, activitiesList, approveStudio, rejectStudio } = useAuth();
  const navigate = useNavigate();

  // Active / Approved Studios
  const activeStudiosList = studiosList.filter((s) => s.status === 'active' || s.status === 'approved');

  const totalStudios = activeStudiosList.length;
  const totalClients = activeStudiosList.reduce(
    (sum, s) => sum + (s.onboardedClientsCount || 5),
    0
  );
  const totalEmployees = activeStudiosList.reduce(
    (sum, s) => sum + (s.totalEmployees || 12),
    0
  );
  const totalPhotographers = activeStudiosList.reduce(
    (sum, s) => sum + (s.photographersCount || 7),
    0
  );
  const totalEditors = activeStudiosList.reduce(
    (sum, s) => sum + (s.editorsCount || 5),
    0
  );

  // Large Summary Visual Statistic Cards
  const statCards = [
    {
      label: 'Total Studios',
      value: totalStudios,
      subtext: `${totalStudios} Active Studios`,
      icon: Building2,
      iconBg: 'bg-purple-100 text-purple-700',
      borderAccent: 'border-purple-200/80 hover:border-purple-300',
      valColor: 'text-purple-950',
    },
    {
      label: 'Total Clients',
      value: totalClients,
      subtext: `Across ${totalStudios} studios`,
      icon: FolderKanban,
      iconBg: 'bg-blue-100 text-blue-700',
      borderAccent: 'border-blue-200/80 hover:border-blue-300',
      valColor: 'text-blue-950',
    },
    {
      label: 'Total Employees',
      value: totalEmployees,
      subtext: 'Studio staff members',
      icon: Users,
      iconBg: 'bg-indigo-100 text-indigo-700',
      borderAccent: 'border-indigo-200/80 hover:border-indigo-300',
      valColor: 'text-indigo-950',
    },
    {
      label: 'Photographers',
      value: totalPhotographers,
      subtext: 'Active camera crew',
      icon: Camera,
      iconBg: 'bg-emerald-100 text-emerald-700',
      borderAccent: 'border-emerald-200/80 hover:border-emerald-300',
      valColor: 'text-emerald-950',
    },
    {
      label: 'Editors',
      value: totalEditors,
      subtext: 'Post-production team',
      icon: Scissors,
      iconBg: 'bg-amber-100 text-amber-700',
      borderAccent: 'border-amber-200/80 hover:border-amber-300',
      valColor: 'text-amber-950',
    },
  ];

  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Top Welcome Header - Premium White / Ambient Glow */}
      <motion.div
        variants={itemFadeSlide}
        className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-3 shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Great Master Admin · Overall Monitoring Command</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-3xl font-black text-slate-900 font-display tracking-tight"
          >
            Photography Studios Monitoring Command
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl"
          >
            Real-time overview of onboarded studios, access requests, client counts, crew, and live studio workflow.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex items-center gap-3 shrink-0 relative z-10"
        >
          <span className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span>{totalStudios} Studios Active</span>
          </span>
          {pendingRequests.length > 0 && (
            <span className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold flex items-center gap-2 shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <span>{pendingRequests.length} Pending Approval</span>
            </span>
          )}
        </motion.div>
      </motion.div>

      {/* 5 Animated Statistic Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Platform Summary Statistics
          </h2>
          <span className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
            Live Real-Time Counts
          </span>
        </div>

        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={itemFadeSlide}
                whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
                className={`bg-white rounded-3xl p-6 border ${stat.borderAccent} shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-600">
                    {stat.label}
                  </span>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className={`w-10 h-10 rounded-2xl ${stat.iconBg} flex items-center justify-center font-bold shadow-xs shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
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
        </motion.div>
      </div>

      {/* NEW STUDIO ACCESS REQUESTS SECTION */}
      {pendingRequests.length > 0 && (
        <motion.div
          variants={itemFadeSlide}
          className="bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-bold flex items-center justify-center shadow-md shadow-amber-900/20 shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">
                    New Studio Access Requests
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-300">
                    {pendingRequests.length} Pending
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Review newly registered photography studios and grant or reject platform access.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence>
              {pendingRequests.map((req) => (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{req.name}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                            Pending Approval
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.city}, {req.state}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-purple-600" />
                          Admin: {req.adminName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">Requested Today</span>
                      </div>
                      <div className="text-slate-600 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.adminEmail}</span>
                      </div>
                      {req.adminPhone && (
                        <div className="text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.adminPhone}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-center text-[11px]">
                        <div>
                          <div className="text-slate-400">Employees</div>
                          <div className="font-bold text-slate-800">{req.totalEmployees || 1}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Photographers</div>
                          <div className="font-bold text-emerald-700">{req.photographersCount || 1}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Editors</div>
                          <div className="font-bold text-amber-700">{req.editorsCount || 1}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approve / Reject Controls */}
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => approveStudio(req.id)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Access</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => rejectStudio(req.id)}
                      className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Studio Overview Section */}
      <motion.div
        variants={itemFadeSlide}
        className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Studio Directory ({activeStudiosList.length} Active Studios)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of onboarded clients, staff, photographers, and editors for each active studio.
            </p>
          </div>
          <Link
            to="/master/studios"
            className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-full transition-colors inline-flex items-center gap-1 self-start group"
          >
            <span>View All Studios</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Clean Studio Cards Grid with Staggered Animations */}
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {activeStudiosList.map((studio, idx) => (
            <motion.div
              key={studio.id}
              variants={itemFadeSlide}
              whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
              onClick={() => navigate(`/master/studios/${studio.id}`)}
              className="p-6 rounded-3xl border border-slate-200/80 hover:border-purple-300 hover:shadow-md bg-white hover:bg-purple-50/10 transition-all cursor-pointer flex flex-col justify-between group shadow-xs"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-purple-900/20 shrink-0"
                    >
                      {idx + 1}
                    </motion.div>
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

                  {/* Status Badge with subtle pulse indicator */}
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 flex items-center gap-1.5 shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>Active</span>
                  </span>
                </div>

                {/* 4 Statistics Matrix */}
                <div className="grid grid-cols-4 gap-2.5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 text-center mb-4 group-hover:bg-purple-50/20 transition-colors">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500">Clients</div>
                    <div className="text-lg font-black text-purple-700 mt-0.5">
                      <AnimatedCounter end={studio.onboardedClientsCount || 5} duration={600} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500">Employees</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      <AnimatedCounter end={studio.totalEmployees || 12} duration={600} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500">Photographers</div>
                    <div className="text-lg font-black text-emerald-700 mt-0.5">
                      <AnimatedCounter end={studio.photographersCount || 7} duration={600} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500">Editors</div>
                    <div className="text-lg font-black text-amber-700 mt-0.5">
                      <AnimatedCounter end={studio.editorsCount || 5} duration={600} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Hover Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-bold">
                <span>View Studio Details & Clients</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Recent Activity Monitoring Section */}
      <motion.div
        variants={itemFadeSlide}
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
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 group"
          >
            <span>View All Activity</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="space-y-3"
        >
          {activitiesList.slice(0, 5).map((act) => (
            <motion.div
              key={act.id}
              variants={itemFadeSlide}
              whileHover={{ x: 3, transition: { duration: 0.15 } }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-purple-50/30 hover:border-purple-200/60 transition-all shadow-xs"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 3 }}
                className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs"
              >
                <Camera className="w-4 h-4" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-xs sm:text-sm text-slate-900">
                    {act.studioName} · <span className="text-purple-700 font-semibold">{act.clientName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">{act.timeAgo}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {act.action}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{act.details}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}


