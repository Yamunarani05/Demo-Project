import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import {
  Users,
  PlusCircle,
  Sparkles,
  Layers,
  Activity,
  Calendar,
  MapPin,
  TrendingUp,
  Clock,
  Camera,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

function AnimatedCounter({ end, duration = 800 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
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

export default function StudioDashboard() {
  const { activeStudio, getStudioClients, activitiesList } = useAuth();
  const navigate = useNavigate();

  const studioClients = getStudioClients();

  const preWedClients = studioClients.filter(
    (c) => c.shootType === 'Pre-Wedding' || c.shootType === 'Both'
  );
  const postWedClients = studioClients.filter(
    (c) => c.shootType === 'Post-Wedding' || c.shootType === 'Both'
  );

  const avgProgress =
    studioClients.length > 0
      ? Math.round(
          studioClients.reduce((acc, c) => acc + (c.preWeddingProgress || c.postWeddingProgress || 0), 0) /
            studioClients.length
        )
      : 0;

  const kpis = [
    {
      label: 'Studio Clients',
      value: studioClients.length,
      subtext: `${preWedClients.length} Pre-Wed · ${postWedClients.length} Post-Wed`,
      icon: Users,
      iconBg: 'bg-purple-100 text-purple-700',
      borderAccent: 'border-purple-200/80',
    },
    {
      label: 'Pre-Wedding Shoots',
      value: preWedClients.length,
      subtext: 'Active visual pipelines',
      icon: Sparkles,
      iconBg: 'bg-blue-100 text-blue-700',
      borderAccent: 'border-blue-200/80',
    },
    {
      label: 'Post-Wedding Shoots',
      value: postWedClients.length,
      subtext: 'Review & delivery stages',
      icon: Layers,
      iconBg: 'bg-indigo-100 text-indigo-700',
      borderAccent: 'border-indigo-200/80',
    },
    {
      label: 'Overall Completion',
      value: avgProgress,
      isPercentage: true,
      subtext: 'Studio workflow velocity',
      icon: Activity,
      iconBg: 'bg-emerald-100 text-emerald-700',
      borderAccent: 'border-emerald-200/80',
    },
  ];

  const studioActivities = activitiesList.filter((a) => a.studioId === activeStudio?.id);

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
      {/* Studio Welcome & Onboard Client CTA Banner - Clean White / Soft Glow */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-3">
            <Camera className="w-3.5 h-3.5" />
            <span>{activeStudio?.name} · {activeStudio?.city}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 font-display">
            Welcome, {activeStudio?.adminName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Manage your photography shoots, onboard demo clients, and monitor Pre-Wedding & Post-Wedding workflow stages.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Link
            to="/studio/clients/onboard"
            className="px-6 py-3.5 rounded-2xl bg-[#5E35B1] hover:bg-[#512DA8] text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Onboard New Client</span>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`bg-white rounded-3xl p-6 border ${kpi.borderAccent} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-600">
                  {kpi.label}
                </span>
                <div className={`w-10 h-10 rounded-2xl ${kpi.iconBg} flex items-center justify-center font-bold shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
                  <AnimatedCounter end={kpi.value} />
                  {kpi.isPercentage && '%'}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{kpi.subtext}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Studio Clients & Workflow Workspace Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Active Client Workspace ({studioClients.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive client cards. Click to update Pre-Wedding or Post-Wedding workflow milestones.
            </p>
          </div>
          <Link
            to="/studio/clients/onboard"
            className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 self-start"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Onboard New Client</span>
          </Link>
        </div>

        <div className="space-y-4">
          {studioClients.map((client) => {
            const hasPre = client.preWeddingStages.length > 0;
            const hasPost = client.postWeddingStages.length > 0;

            return (
              <motion.div
                key={client.id}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                className="p-6 rounded-3xl border border-purple-200/80 bg-white hover:border-purple-400 hover:shadow-md transition-all shadow-sm"
              >
                {/* Client Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-bold flex items-center justify-center text-base shadow-md shadow-purple-900/20 shrink-0">
                      {client.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">
                          {client.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold font-mono">
                          {client.serialNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                          {client.shootType}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-1 flex-wrap">
                        <span>{client.eventType}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {client.eventDate}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {client.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/studio/clients/${client.id}`}
                      className="px-4 py-2.5 rounded-xl bg-[#5E35B1] hover:bg-[#512DA8] text-white font-bold text-xs shadow-md shadow-purple-900/20 transition-all flex items-center gap-1.5"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Pre-Wedding Interactive Snippet */}
                {hasPre && (
                  <div className="mt-4 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        Pre-Wedding Workflow ({client.preWeddingProgress}%)
                      </span>
                      <Link
                        to={`/studio/clients/${client.id}/pre-wedding`}
                        className="text-xs font-semibold text-purple-600 hover:underline"
                      >
                        Manage Stages →
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {client.preWeddingStages.map((st) => {
                        const isDone = st.status === 'completed';
                        const isInProg = st.status === 'in_progress';
                        return (
                          <div
                            key={st.id}
                            className={`p-2.5 rounded-xl text-center border text-[11px] ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                                : isInProg
                                ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="truncate font-medium">{st.name}</div>
                            <div className="text-[10px] mt-0.5">
                              {isDone ? '✓ Completed' : isInProg ? '→ In Progress' : '○ Pending'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Post-Wedding Interactive Snippet */}
                {hasPost && (
                  <div className="mt-3 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        Post-Wedding Workflow ({client.postWeddingProgress}%)
                      </span>
                      <Link
                        to={`/studio/clients/${client.id}/post-wedding`}
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Manage Stages →
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {client.postWeddingStages.map((st) => {
                        const isDone = st.status === 'completed';
                        const isInProg = st.status === 'in_progress';
                        return (
                          <div
                            key={st.id}
                            className={`p-2.5 rounded-xl text-center border text-[11px] ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                                : isInProg
                                ? 'bg-indigo-100 border-indigo-300 text-indigo-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="truncate font-medium">{st.name}</div>
                            <div className="text-[10px] mt-0.5">
                              {isDone ? '✓ Completed' : isInProg ? '→ In Progress' : '○ Pending'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Studio Live Activity Feed */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm"
      >
        <h3 className="font-bold text-slate-900 text-base mb-4 font-display">
          Recent Studio Activity
        </h3>
        <div className="space-y-3">
          {studioActivities.slice(0, 4).map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs"
            >
              <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900">
                    {act.clientName} · {act.action}
                  </strong>
                  <span className="text-[11px] text-slate-400">{act.timeAgo}</span>
                </div>
                <p className="text-slate-500 mt-0.5">{act.details}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
