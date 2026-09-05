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
  TrendingUp,
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

  // Clean stat cards matching the second template design
  const statCards = [
    {
      label: 'Total Studios',
      sublabel: 'Studios',
      value: totalStudios,
      icon: Building2,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
    },
    {
      label: 'Total Clients',
      sublabel: 'Clients',
      value: totalClients,
      icon: FolderKanban,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Total Employees',
      sublabel: 'Employees',
      value: totalEmployees,
      icon: Users,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
    {
      label: 'Photographers',
      sublabel: 'Photographers',
      value: totalPhotographers,
      icon: Camera,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      label: 'Editors',
      sublabel: 'Editors',
      value: totalEditors,
      icon: Scissors,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
  ];

  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Clean Dashboard Header */}
      <motion.div variants={itemFadeSlide}>
        <h1 className="text-2xl font-bold text-slate-900 font-display">
          Master Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time overview of onboarded studios, access requests, and platform statistics.
        </p>
      </motion.div>

      {/* 5 Clean Stat Cards — matching template 2 style */}
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
              whileHover={{ y: -2, transition: { duration: 0.2, ease: 'easeOut' } }}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-purple-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 font-medium">
                  {stat.label}
                </span>
                <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-sm font-bold text-slate-700 mb-1">
                {stat.sublabel}
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                <AnimatedCounter end={stat.value} duration={800} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* NEW STUDIO ACCESS REQUESTS SECTION */}
      {pendingRequests.length > 0 && (
        <motion.div
          variants={itemFadeSlide}
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    New Studio Access Requests
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                    {pendingRequests.length} Pending
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
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
                  className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between hover:border-purple-200 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{req.name}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                            Pending
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.city}, {req.state}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-100 text-xs space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-purple-500" />
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
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px]">
                        <div>
                          <div className="text-slate-400">Employees</div>
                          <div className="font-bold text-slate-800">{req.totalEmployees || 1}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Photographers</div>
                          <div className="font-bold text-emerald-600">{req.photographersCount || 1}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Editors</div>
                          <div className="font-bold text-amber-600">{req.editorsCount || 1}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approve / Reject Controls */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => approveStudio(req.id)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Access</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => rejectStudio(req.id)}
                      className="py-2.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-semibold text-xs border border-slate-200 hover:border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
        className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Studio Directory ({activeStudiosList.length} Active Studios)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of onboarded clients, staff, photographers, and editors for each active studio.
            </p>
          </div>
          <Link
            to="/master/studios"
            className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-full transition-colors inline-flex items-center gap-1 self-start group border border-purple-200"
          >
            <span>View All Studios</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Clean Studio Cards Grid */}
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {activeStudiosList.map((studio, idx) => (
            <motion.div
              key={studio.id}
              variants={itemFadeSlide}
              whileHover={{ y: -2, transition: { duration: 0.2, ease: 'easeOut' } }}
              onClick={() => navigate(`/master/studios/${studio.id}`)}
              className="p-5 rounded-xl border border-slate-200 hover:border-purple-200 hover:shadow-md bg-white transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-purple-700 transition-colors">
                        {studio.name}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{studio.city}, {studio.state}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span>Active</span>
                  </span>
                </div>

                {/* 4 Statistics */}
                <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-center mb-3">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400">Clients</div>
                    <div className="text-base font-extrabold text-purple-700 mt-0.5">
                      <AnimatedCounter end={studio.onboardedClientsCount || 5} duration={600} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400">Employees</div>
                    <div className="text-base font-extrabold text-slate-900 mt-0.5">
                      <AnimatedCounter end={studio.totalEmployees || 12} duration={600} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400">Photographers</div>
                    <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                      <AnimatedCounter end={studio.photographersCount || 7} duration={600} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400">Editors</div>
                    <div className="text-base font-extrabold text-amber-600 mt-0.5">
                      <AnimatedCounter end={studio.editorsCount || 5} duration={600} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-bold">
                <span>View Studio Details & Clients</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Recent Activity Section */}
      <motion.div
        variants={itemFadeSlide}
        className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg font-display">
              Recent Studio Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live updates of client onboarding, shoot milestones, and workflow movements.
            </p>
          </div>
          <Link
            to="/master/activity"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="space-y-2.5"
        >
          {activitiesList.slice(0, 5).map((act) => (
            <motion.div
              key={act.id}
              variants={itemFadeSlide}
              whileHover={{ x: 2, transition: { duration: 0.15 } }}
              className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-purple-50/30 hover:border-purple-200/60 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xs shrink-0 mt-0.5">
                <Camera className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-xs sm:text-sm text-slate-900">
                    {act.studioName} · <span className="text-purple-600 font-semibold">{act.clientName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">{act.timeAgo}</span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
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
