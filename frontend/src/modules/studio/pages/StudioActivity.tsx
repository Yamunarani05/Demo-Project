import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Clock, Camera } from 'lucide-react';

export default function StudioActivity() {
  const { activeStudio, activitiesList } = useAuth();
  const studioActivities = activitiesList.filter((a) => a.studioId === activeStudio?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            {activeStudio?.name} Activity Feed
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational audit log of client onboarding, shoot milestones, and deliverables.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
          {studioActivities.length} Events
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="space-y-4">
          {studioActivities.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No recent activity recorded for this studio yet.
            </div>
          ) : (
            studioActivities.map((act) => (
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
                      {act.clientName} · <span className="text-purple-700 font-semibold">{act.action}</span>
                    </div>
                    <span className="text-xs text-slate-400">{act.timeAgo}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{act.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
