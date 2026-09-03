import React, { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import {
  Sparkles,
  Layers,
  ArrowLeft,
  Calendar,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  Camera,
  ChevronRight,
  Check,
  Circle,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClientWorkspace() {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { getClientById, updateClientStage, activeStudio } = useAuth();

  const client = getClientById(clientId || '');

  // Determine active tab from URL or fallback
  const isPreWeddingRoute = location.pathname.endsWith('/pre-wedding');
  const isPostWeddingRoute = location.pathname.endsWith('/post-wedding');

  const defaultTab =
    client?.shootType === 'Post-Wedding'
      ? 'post-wedding'
      : 'pre-wedding';

  const [activeTab, setActiveTab] = useState<'pre-wedding' | 'post-wedding'>(
    isPreWeddingRoute ? 'pre-wedding' : isPostWeddingRoute ? 'post-wedding' : defaultTab
  );

  if (!client) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Client Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested client could not be located in this studio.
        </p>
        <Link
          to="/studio/dashboard"
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/20"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const handleStageStatusChange = (
    workflowType: 'pre_wedding' | 'post_wedding',
    stageId: string,
    newStatus: 'completed' | 'in_progress' | 'scheduled' | 'pending'
  ) => {
    updateClientStage(client.id, workflowType, stageId, newStatus);
    toast.success(`Workflow stage updated to "${newStatus}"!`, {
      description: 'Progress and monitoring dashboard updated.',
    });
  };

  const preWeddingProgress = client.preWeddingProgress;
  const postWeddingProgress = client.postWeddingProgress;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Header & Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/studio/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio Dashboard</span>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Managing Studio:</span>
          <strong className="text-purple-700 font-bold bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            {activeStudio?.name}
          </strong>
        </div>
      </div>

      {/* Client Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-purple-900/20 shrink-0">
              {client.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                  {client.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold font-mono">
                  {client.serialNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                  {client.shootType}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                <span className="font-semibold text-slate-700">{client.eventType}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Event Date: <strong className="text-slate-700">{client.eventDate}</strong>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {client.location}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {client.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-purple-50/60 rounded-2xl border border-purple-100/80 shrink-0">
            <div>
              <div className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Financial Snapshot</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                ₹{(client.paidAmount / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-500">paid of ₹{(client.budget / 1000).toFixed(0)}k</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Advance Cleared</span>
              </div>
            </div>
          </div>
        </div>

        {client.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 italic">
            <strong>Notes:</strong> "{client.notes}"
          </div>
        )}
      </div>

      {/* Workflow Scope Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('pre-wedding')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'pre-wedding'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pre-Wedding ({preWeddingProgress}%)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('post-wedding')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'post-wedding'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Post-Wedding ({postWeddingProgress}%)</span>
        </button>
      </div>

      {/* PRE-WEDDING WORKFLOW VIEW */}
      {activeTab === 'pre-wedding' && (
        <div className="space-y-6">
          {client.preWeddingStages.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <p className="text-xs text-slate-500">
                Pre-Wedding workflow was not included in this client's scope.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              {/* Pipeline Progress Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Visual Pre-Wedding Timeline</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Pre-Wedding Shoot Stages ({preWeddingProgress}% Completed)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any stage status below to toggle between Completed, In Progress, Scheduled, or Pending.
                  </p>
                </div>

                <div className="w-full sm:w-56 bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200/80">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${preWeddingProgress}%` }}
                  />
                </div>
              </div>

              {/* Linear Step Timeline Visualizer (Section 12 requirement) */}
              <div className="mb-8 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 overflow-x-auto">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Pipeline Stage Sequence
                </div>
                <div className="flex items-center gap-2 min-w-max">
                  {client.preWeddingStages.map((stage, idx, arr) => {
                    const isDone = stage.status === 'completed';
                    const isInProg = stage.status === 'in_progress';
                    return (
                      <React.Fragment key={stage.id}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : isInProg
                                ? 'bg-purple-600 text-white ring-4 ring-purple-200'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isDone ? '✓' : isInProg ? '→' : '○'}
                          </span>
                          <span className={`text-xs font-bold ${isDone ? 'text-emerald-800' : isInProg ? 'text-purple-900' : 'text-slate-400'}`}>
                            {stage.name}
                          </span>
                        </div>
                        {idx < arr.length - 1 && (
                          <div className={`w-8 h-0.5 ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Stage Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {client.preWeddingStages.map((stage, idx) => {
                  const isCompleted = stage.status === 'completed';
                  const isInProgress = stage.status === 'in_progress';
                  const isScheduled = stage.status === 'scheduled';
                  const isPending = stage.status === 'pending';

                  return (
                    <motion.div
                      key={stage.id}
                      whileHover={{ y: -2 }}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isCompleted
                          ? 'bg-emerald-50/40 border-emerald-200/80 shadow-sm'
                          : isInProgress
                          ? 'bg-purple-50/70 border-purple-300 shadow-md ring-2 ring-purple-500/20'
                          : isScheduled
                          ? 'bg-blue-50/40 border-blue-200/80'
                          : 'bg-slate-50/60 border-slate-200 opacity-80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Stage {idx + 1}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isInProgress
                                ? 'bg-purple-600 text-white animate-pulse'
                                : isScheduled
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {stage.status.replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base mb-1">
                          {stage.name}
                        </h3>

                        {stage.completedAt && (
                          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed on {stage.completedAt}</span>
                          </div>
                        )}

                        {stage.assignedTo && (
                          <div className="text-[11px] text-purple-700 font-medium mb-2">
                            Assigned: {stage.assignedTo}
                          </div>
                        )}
                      </div>

                      {/* Status Selector Controls */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Change Status:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleStageStatusChange('pre_wedding', stage.id, 'completed')
                            }
                            className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
                            }`}
                          >
                            ✓ Completed
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStageStatusChange('pre_wedding', stage.id, 'in_progress')
                            }
                            className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                              isInProgress
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-purple-50'
                            }`}
                          >
                            → In Progress
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStageStatusChange('pre_wedding', stage.id, 'scheduled')
                            }
                            className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                              isScheduled
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50'
                            }`}
                          >
                            📅 Scheduled
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStageStatusChange('pre_wedding', stage.id, 'pending')
                            }
                            className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                              isPending
                                ? 'bg-slate-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            ○ Pending
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* POST-WEDDING WORKFLOW VIEW */}
      {activeTab === 'post-wedding' && (
        <div className="space-y-6">
          {client.postWeddingStages.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <p className="text-xs text-slate-500">
                Post-Wedding workflow was not configured for this client.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              {/* Pipeline Progress Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Visual Post-Wedding Timeline</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Post-Wedding Shoot Stages ({postWeddingProgress}% Completed)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any stage status below to toggle between Completed, In Progress, Scheduled, or Pending.
                  </p>
                </div>

                <div className="w-full sm:w-56 bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200/80">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${postWeddingProgress}%` }}
                  />
                </div>
              </div>

              {/* Linear Step Timeline Visualizer (Section 12 requirement) */}
              <div className="mb-8 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 overflow-x-auto">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Pipeline Stage Sequence
                </div>
                <div className="flex items-center gap-2 min-w-max">
                  {client.postWeddingStages.map((stage, idx, arr) => {
                    const isDone = stage.status === 'completed';
                    const isInProg = stage.status === 'in_progress';
                    return (
                      <React.Fragment key={stage.id}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : isInProg
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isDone ? '✓' : isInProg ? '→' : '○'}
                          </span>
                          <span className={`text-xs font-bold ${isDone ? 'text-emerald-800' : isInProg ? 'text-indigo-900' : 'text-slate-400'}`}>
                            {stage.name}
                          </span>
                        </div>
                        {idx < arr.length - 1 && (
                          <div className={`w-8 h-0.5 ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Stage Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {client.postWeddingStages.map((stage, idx) => {
                  const isCompleted = stage.status === 'completed';
                  const isInProgress = stage.status === 'in_progress';
                  const isScheduled = stage.status === 'scheduled';
                  const isPending = stage.status === 'pending';

                  return (
                    <motion.div
                      key={stage.id}
                      whileHover={{ y: -2 }}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isCompleted
                          ? 'bg-emerald-50/40 border-emerald-200/80 shadow-sm'
                          : isInProgress
                          ? 'bg-indigo-50/70 border-indigo-300 shadow-md ring-2 ring-indigo-500/20'
                          : isScheduled
                          ? 'bg-blue-50/40 border-blue-200/80'
                          : 'bg-slate-50/60 border-slate-200 opacity-80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Stage {idx + 1}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isInProgress
                                ? 'bg-indigo-600 text-white'
                                : isScheduled
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {stage.status.replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base mb-1">
                          {stage.name}
                        </h3>

                        {stage.completedAt && (
                          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed on {stage.completedAt}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Selector Controls */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Change Status:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleStageStatusChange('post_wedding', stage.id, 'completed')
                            }
                            className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
                            }`}
                          >
                            ✓ Completed
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStageStatusChange('post_wedding', stage.id, 'in_progress')
                            }
                            className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                              isInProgress
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50'
                            }`}
                          >
                            → In Progress
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStageStatusChange('post_wedding', stage.id, 'scheduled')
                            }
                            className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                              isScheduled
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50'
                            }`}
                          >
                            📅 Scheduled
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStageStatusChange('post_wedding', stage.id, 'pending')
                            }
                            className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                              isPending
                                ? 'bg-slate-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            ○ Pending
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
