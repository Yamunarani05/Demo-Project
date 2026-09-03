import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Activity,
  Sparkles,
  Layers,
  Calendar,
  MapPin,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

export default function StudioWorkflow() {
  const { activeStudio, getStudioClients } = useAuth();
  const studioClients = getStudioClients();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            {activeStudio?.name} Workflow Pipelines
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage monitoring for all client shoots currently in production.
          </p>
        </div>

        <Link
          to="/studio/clients/onboard"
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition-all flex items-center gap-1.5 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Onboard Client</span>
        </Link>
      </div>

      <div className="space-y-5">
        {studioClients.map((client) => {
          const hasPre = client.preWeddingStages.length > 0;
          const hasPost = client.postWeddingStages.length > 0;

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg text-slate-900">{client.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                      {client.serialNumber}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                    <span>{client.eventType}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {client.location}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {client.eventDate}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/studio/clients/${client.id}`}
                  className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-center"
                >
                  <span>Open Client Workspace</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Pre-Wedding Stages */}
              {hasPre && (
                <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Pre-Wedding Workflow ({client.preWeddingProgress}%)
                    </span>
                    <Link
                      to={`/studio/clients/${client.id}/pre-wedding`}
                      className="text-xs font-semibold text-purple-600 hover:underline"
                    >
                      Update Stage Status →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {client.preWeddingStages.map((st, idx) => {
                      const isDone = st.status === 'completed';
                      const isInProg = st.status === 'in_progress';
                      return (
                        <div
                          key={st.id}
                          className={`p-2.5 rounded-lg text-center border text-xs ${
                            isDone
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                              : isInProg
                              ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="text-[10px] opacity-70">Step {idx + 1}</div>
                          <div className="truncate font-semibold mt-0.5">{st.name}</div>
                          <div className="text-[10px] mt-1 font-bold">
                            {isDone ? '✓ Completed' : isInProg ? '→ In Progress' : '○ Pending'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Post-Wedding Stages */}
              {hasPost && (
                <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Post-Wedding Workflow ({client.postWeddingProgress}%)
                    </span>
                    <Link
                      to={`/studio/clients/${client.id}/post-wedding`}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Update Stage Status →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {client.postWeddingStages.map((st, idx) => {
                      const isDone = st.status === 'completed';
                      const isInProg = st.status === 'in_progress';
                      return (
                        <div
                          key={st.id}
                          className={`p-2.5 rounded-lg text-center border text-xs ${
                            isDone
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                              : isInProg
                              ? 'bg-indigo-100 border-indigo-300 text-indigo-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="text-[10px] opacity-70">Stage {idx + 1}</div>
                          <div className="truncate font-semibold mt-0.5">{st.name}</div>
                          <div className="text-[10px] mt-1 font-bold">
                            {isDone ? '✓ Completed' : isInProg ? '→ In Progress' : '○ Pending'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
