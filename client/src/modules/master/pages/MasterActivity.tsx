import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Clock, Camera, Sparkles, FolderKanban, CheckCircle2, Building2 } from 'lucide-react';

export default function MasterActivity() {
  const { activitiesList, studiosList } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Live Cross-Studio Activity Feed
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit log of client onboarding, shoot stage updates, and deliveries across all 10 photography studios.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
          {activitiesList.length} Total Events
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="space-y-4">
          {activitiesList.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/60 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="font-bold text-sm text-slate-900">
                    {act.studioName} · <span className="text-purple-700 font-semibold">{act.clientName}</span>
                  </div>
                  <span className="text-xs text-slate-400">{act.timeAgo}</span>
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {act.action}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{act.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
