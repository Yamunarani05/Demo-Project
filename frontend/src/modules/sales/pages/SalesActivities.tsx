import React, { useEffect, useState } from 'react';
import {
  History,
  Clock,
  User,
  FileText,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { api } from '../../../services/api';

export default function SalesActivities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesActivities({ limit: 50 });
      if (res.success) {
        setActivities(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load sales activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'LEAD_CREATED':
        return <User size={15} className="text-blue-600" />;
      case 'LEAD_STAGE_UPDATED':
        return <TrendingUp size={15} className="text-indigo-600" />;
      case 'FOLLOWUP_SCHEDULED':
      case 'FOLLOWUP_COMPLETED':
        return <Clock size={15} className="text-amber-600" />;
      case 'QUOTATION_CREATED':
      case 'QUOTATION_SENT':
        return <FileText size={15} className="text-purple-600" />;
      case 'QUOTATION_ACCEPTED':
      case 'LEAD_CONVERTED':
        return <CheckCircle2 size={15} className="text-emerald-600" />;
      default:
        return <Sparkles size={15} className="text-[#5B42F3]" />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17152B] tracking-tight">
          Sales & Client Activity Stream
        </h1>
        <p className="text-xs sm:text-sm text-[#68647A] mt-0.5">
          Real-time audit log of client inquiries, quotation events, and team communications.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-3 border-[#5B42F3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white border border-[#E5E1F2] rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-[#5B42F3] flex items-center justify-center mx-auto mb-3">
            <History size={24} />
          </div>
          <h3 className="font-extrabold text-sm text-[#17152B]">No activities recorded yet</h3>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E1F2] rounded-2xl p-6 shadow-xs">
          <div className="relative border-l-2 border-[#E5E1F2] ml-4 space-y-6 py-2">
            {activities.map((act) => (
              <div key={act.id} className="relative pl-6 group">
                {/* Timeline Dot with Icon */}
                <div className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-xl bg-white border-2 border-[#E5E1F2] group-hover:border-[#5B42F3] flex items-center justify-center shadow-xs transition-colors">
                  {getActivityIcon(act.type)}
                </div>

                <div className="bg-[#F8F6FF]/60 hover:bg-[#F8F6FF] border border-[#E5E1F2] rounded-xl p-4 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                    <span className="text-xs font-extrabold text-[#17152B]">{act.title}</span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {act.createdAt ? new Date(act.createdAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>

                  <div className="mt-2.5 pt-2 border-t border-[#E5E1F2]/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Logged by: <strong className="text-slate-800">{act.createdByName || 'Sales Team'}</strong></span>
                    {act.leadName && (
                      <span className="font-semibold text-[#5B42F3] bg-purple-50 px-2 py-0.5 rounded">
                        Lead: {act.leadName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
