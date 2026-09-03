import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  Users,
  Camera,
  Scissors,
  FolderKanban,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Activity,
} from 'lucide-react';

export default function MasterStudioDetail() {
  const { studioId } = useParams<{ studioId: string }>();
  const { studiosList, clientsList, activitiesList } = useAuth();

  const studio = studiosList.find((s) => s.id === studioId) || studiosList[0];
  const studioClients = clientsList.filter((c) => c.studioId === studio.id);
  const studioActivities = activitiesList.filter((a) => a.studioId === studio.id);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/master/studios"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studios Overview</span>
        </Link>
        <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
          Studio Monitoring Mode
        </span>
      </div>

      {/* Main Studio Profile & Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-purple-900/20 shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 font-display">
                  {studio.name}
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Active</span>
                </span>
                <span className="px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                  {studio.plan}
                </span>
              </div>
              <p className="text-sm text-slate-500 italic mt-1">
                "{studio.tagline}"
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {studio.city}, {studio.state}
                </span>
                <span>·</span>
                <span>Admin: <strong className="text-slate-700">{studio.adminName}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Large Statistic Cards for this Studio */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 text-center">
            <div className="text-xs font-bold text-purple-900 flex items-center justify-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
              <span>Total Clients</span>
            </div>
            <div className="text-2xl font-black text-purple-800 mt-1">
              {studio.onboardedClientsCount || 5}
            </div>
            <div className="text-[11px] text-purple-600 mt-0.5">Onboarded projects</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Total Employees</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {studio.totalEmployees || 12}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Full-time & crew</div>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
            <div className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Photographers</span>
            </div>
            <div className="text-2xl font-black text-emerald-800 mt-1">
              {studio.photographersCount || 7}
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Camera operators</div>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100 text-center">
            <div className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-amber-600" />
              <span>Editors</span>
            </div>
            <div className="text-2xl font-black text-amber-800 mt-1">
              {studio.editorsCount || 5}
            </div>
            <div className="text-[11px] text-amber-600 mt-0.5">Color & post-prod</div>
          </div>
        </div>
      </div>

      {/* Studio's Client List & Monitoring */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Clients Onboarded Under {studio.name} ({studioClients.length})
            </h2>
            <p className="text-xs text-slate-500">
              Monitoring client shoot scopes, event dates, venues, and current workflow progress.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {studioClients.map((client) => {
            const hasPre = client.preWeddingStages.length > 0;
            const hasPost = client.postWeddingStages.length > 0;
            const activeStageName =
              client.preWeddingStages.find((s) => s.status === 'in_progress')?.name ||
              client.postWeddingStages.find((s) => s.status === 'in_progress')?.name ||
              'Scheduled';

            return (
              <div
                key={client.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                {/* Client Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">
                        {client.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                        {client.serialNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                        {client.shootType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                      <span>{client.eventType}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {client.location}
                      </span>
                      <span>·</span>
                      <span>Shoot Date: <strong className="text-slate-700">{client.eventDate}</strong></span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs font-semibold text-slate-500">Current Work Phase</div>
                    <div className="text-sm font-bold text-purple-700 mt-0.5">
                      {activeStageName}
                    </div>
                  </div>
                </div>

                {/* Pre-Wedding Stage Progress */}
                {hasPre && (
                  <div className="mt-3.5">
                    <div className="flex justify-between text-xs font-semibold text-purple-900 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        Pre-Wedding Workflow Progress
                      </span>
                      <span className="text-purple-700 font-bold">{client.preWeddingProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${client.preWeddingProgress}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 text-[10px]">
                      {client.preWeddingStages.map((st) => (
                        <div
                          key={st.id}
                          className={`p-1.5 rounded text-center truncate ${
                            st.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : st.status === 'in_progress'
                              ? 'bg-purple-200 text-purple-900 font-bold'
                              : 'bg-white text-slate-400'
                          }`}
                        >
                          {st.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post-Wedding Stage Progress */}
                {hasPost && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs font-semibold text-indigo-900 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-600" />
                        Post-Wedding Workflow Progress
                      </span>
                      <span className="text-indigo-700 font-bold">{client.postWeddingProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${client.postWeddingProgress}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px]">
                      {client.postWeddingStages.map((st) => (
                        <div
                          key={st.id}
                          className={`p-1.5 rounded text-center truncate ${
                            st.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : st.status === 'in_progress'
                              ? 'bg-indigo-200 text-indigo-900 font-bold'
                              : 'bg-white text-slate-400'
                          }`}
                        >
                          {st.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Studio Activity Status */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4 font-display">
          Current Activity Status & Workflow Movements
        </h3>
        <div className="space-y-3">
          {studioActivities.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No recent activity recorded for this studio.
            </div>
          ) : (
            studioActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900">{act.action}</strong>
                    <span className="text-[11px] text-slate-400">{act.timeAgo}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{act.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
