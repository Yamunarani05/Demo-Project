import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Activity,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function MasterMonitoring() {
  const { studiosList, clientsList, activitiesList, switchStudio } = useAuth();
  const navigate = useNavigate();

  const handleOpenStudio = (studioId: string) => {
    navigate(`/master/studios/${studioId}`);
  };

  const handleImpersonate = (studioId: string) => {
    switchStudio(studioId);
    navigate('/studio/dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Platform Workflow Matrix</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Multi-Studio Workflow Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual monitoring of Pre-Wedding and Post-Wedding stage pipelines across all 10 photography studios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
            10 Studios Live
          </span>
        </div>
      </div>

      {/* Multi-Studio Matrix Cards */}
      <div className="space-y-4">
        {studiosList.map((studio, idx) => {
          const studioClients = clientsList.filter((c) => c.studioId === studio.id);
          const client = studioClients[0];
          const hasPreWed = client && client.preWeddingStages.length > 0;
          const hasPostWed = client && client.postWeddingStages.length > 0;

          return (
            <div
              key={studio.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all"
            >
              {/* Studio Summary Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-purple-900/20 shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        {studio.name}
                      </h3>
                      <span className="text-xs text-slate-400">({studio.city})</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        Admin: {studio.adminName}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Assigned Client: <strong className="text-purple-700">{client?.name || 'No Client'}</strong> ·{' '}
                      Event Date: {client?.eventDate || 'N/A'} · Venue: {client?.location || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Total Completion</div>
                    <div className="text-base font-black text-purple-700">
                      {client?.preWeddingProgress || client?.postWeddingProgress || 0}% Complete
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleImpersonate(studio.id)}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors"
                  >
                    Manage Studio →
                  </button>
                </div>
              </div>

              {/* Workflows Pipelines */}
              <div className="mt-4 space-y-3">
                {/* Pre-Wedding Pipeline */}
                {hasPreWed && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Pre-Wedding Workflow
                        </span>
                      </div>
                      <span className="text-xs font-bold text-purple-700">
                        {client.preWeddingProgress}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {client.preWeddingStages.map((stage, sIdx) => {
                        const isDone = stage.status === 'completed';
                        const isInProg = stage.status === 'in_progress';
                        return (
                          <div
                            key={stage.id}
                            className={`p-2 rounded-lg text-center border text-[11px] ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                                : isInProg
                                ? 'bg-purple-100/70 border-purple-300 text-purple-900 font-bold animate-pulse'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="truncate font-medium">{stage.name}</div>
                            <div className="text-[10px] mt-0.5">
                              {isDone ? '✓ Done' : isInProg ? '→ Active' : '○ Pending'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Post-Wedding Pipeline */}
                {hasPostWed && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Post-Wedding Workflow
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-700">
                        {client.postWeddingProgress}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {client.postWeddingStages.map((stage, sIdx) => {
                        const isDone = stage.status === 'completed';
                        const isInProg = stage.status === 'in_progress';
                        return (
                          <div
                            key={stage.id}
                            className={`p-2 rounded-lg text-center border text-[11px] ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                                : isInProg
                                ? 'bg-indigo-100/70 border-indigo-300 text-indigo-900 font-bold'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="truncate font-medium">{stage.name}</div>
                            <div className="text-[10px] mt-0.5">
                              {isDone ? '✓ Done' : isInProg ? '→ Active' : '○ Pending'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
