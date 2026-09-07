import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Mail,
  Users,
  Calendar,
  X,
  AlertCircle,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';
import { api } from '../../../services/api';

export default function SalesFollowUps() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [dueTodayCount, setDueTodayCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'completed' | 'all'>('today');
  const [leads, setLeads] = useState<any[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New follow up modal state
  const [formData, setFormData] = useState({
    leadId: '',
    leadName: '',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: '11:00 AM',
    type: 'CALL',
    notes: '',
  });

  const loadFollowUps = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesFollowUps({ filter });
      if (res.success) {
        setFollowUps(res.data || []);
        setDueTodayCount(res.dueTodayCount || 0);
      }
    } catch (err) {
      console.error('Failed to load followups:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLeadsList = async () => {
    try {
      const res = await api.getSalesLeads();
      if (res.success) {
        setLeads(res.data || []);
        if (res.data?.length > 0 && !formData.leadId) {
          setFormData((prev) => ({
            ...prev,
            leadId: res.data[0].id,
            leadName: res.data[0].clientName,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load leads list:', err);
    }
  };

  useEffect(() => {
    loadFollowUps();
  }, [filter]);

  useEffect(() => {
    loadLeadsList();
  }, []);

  const handleMarkComplete = async (id: string) => {
    try {
      await api.updateSalesFollowUp(id, {
        status: 'COMPLETED',
        outcome: 'Follow-up successfully conducted with client.',
      });
      setActionNotice('Follow-up marked as completed!');
      setTimeout(() => setActionNotice(null), 3000);
      loadFollowUps();
    } catch (err: any) {
      alert(err?.message || 'Failed to complete follow up');
    }
  };

  const handleReschedule = async (id: string, currentFollowUp: any) => {
    const newDate = prompt('Enter new follow-up date (YYYY-MM-DD):', currentFollowUp.followUpDate);
    if (!newDate) return;
    try {
      await api.updateSalesFollowUp(id, {
        followUpDate: newDate,
        status: 'PENDING',
        notes: `${currentFollowUp.notes || ''} (Rescheduled to ${newDate})`,
      });
      setActionNotice(`Rescheduled to ${newDate}`);
      setTimeout(() => setActionNotice(null), 3000);
      loadFollowUps();
    } catch (err: any) {
      alert(err?.message || 'Failed to reschedule');
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedLead = leads.find((l) => l.id === formData.leadId);
      const payload = {
        ...formData,
        leadName: selectedLead ? selectedLead.clientName : formData.leadName,
      };
      const res = await api.createSalesFollowUp(payload);
      if (res.success) {
        setIsScheduleModalOpen(false);
        setActionNotice(`Follow-up scheduled with ${payload.leadName}!`);
        setTimeout(() => setActionNotice(null), 3500);
        setFormData({
          leadId: leads[0]?.id || '',
          leadName: leads[0]?.clientName || '',
          followUpDate: new Date().toISOString().split('T')[0],
          followUpTime: '11:00 AM',
          type: 'CALL',
          notes: '',
        });
        loadFollowUps();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to schedule follow up');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17152B] tracking-tight">
              Follow-ups & Client Touchpoints
            </h1>
            {dueTodayCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {dueTodayCount} Due Today
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#68647A] mt-0.5">
            Never lose an inquiry: organize phone calls, WhatsApp messages, and quote reviews.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="bg-[#5B42F3] hover:bg-[#4E35E0] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#5B42F3]/25 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-[#E5E1F2] rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setFilter('today')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            filter === 'today'
              ? 'bg-[#5B42F3] text-white shadow-xs'
              : 'text-[#68647A] hover:bg-[#F8F6FF]'
          }`}
        >
          <Clock size={14} />
          <span>Due Today ({dueTodayCount})</span>
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            filter === 'upcoming'
              ? 'bg-[#5B42F3] text-white shadow-xs'
              : 'text-[#68647A] hover:bg-[#F8F6FF]'
          }`}
        >
          <Calendar size={14} />
          <span>Upcoming Schedule</span>
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            filter === 'completed'
              ? 'bg-[#5B42F3] text-white shadow-xs'
              : 'text-[#68647A] hover:bg-[#F8F6FF]'
          }`}
        >
          <CheckCircle2 size={14} />
          <span>Completed</span>
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filter === 'all'
              ? 'bg-[#5B42F3] text-white shadow-xs'
              : 'text-[#68647A] hover:bg-[#F8F6FF]'
          }`}
        >
          All Records
        </button>
      </div>

      {/* Follow-up Queue Cards */}
      {followUps.length === 0 ? (
        <div className="bg-white border border-[#E5E1F2] rounded-2xl p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-[#5B42F3] flex items-center justify-center mx-auto">
            <CalendarCheck size={24} />
          </div>
          <h3 className="font-extrabold text-sm text-[#17152B]">No follow-ups in this view</h3>
          <p className="text-xs text-[#68647A] max-w-sm mx-auto">
            All caught up! You can schedule a new call or reminder for any active lead in your pipeline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followUps.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-4.5 shadow-xs transition-shadow flex flex-col justify-between space-y-3 ${
                item.status === 'COMPLETED' ? 'border-slate-200 opacity-80' : 'border-[#E5E1F2] hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-xl text-xs font-bold ${
                      item.type === 'CALL' ? 'bg-blue-50 text-blue-600' :
                      item.type === 'WHATSAPP' ? 'bg-emerald-50 text-emerald-600' :
                      item.type === 'MEETING' ? 'bg-purple-50 text-purple-600' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {item.type === 'CALL' && <Phone size={14} />}
                      {item.type === 'WHATSAPP' && <MessageSquare size={14} />}
                      {item.type === 'EMAIL' && <Mail size={14} />}
                      {item.type === 'MEETING' && <Users size={14} />}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#17152B]">{item.leadName}</h4>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {item.type} • {item.followUpTime || 'Time TBD'}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    item.followUpDate <= new Date().toISOString().split('T')[0] ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {item.status === 'COMPLETED' ? 'Done' : item.followUpDate}
                  </span>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Agenda / Notes: </span>
                  {item.notes || 'Routine follow-up call with prospective client'}
                </div>

                {item.outcome && (
                  <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                    <span className="font-bold">Outcome: </span>{item.outcome}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {item.status !== 'COMPLETED' && (
                <div className="pt-2 border-t border-[#E5E1F2] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleReschedule(item.id, item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw size={12} />
                    <span>Reschedule</span>
                  </button>

                  <button
                    onClick={() => handleMarkComplete(item.id)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#5B42F3] hover:bg-[#4E35E0] text-white shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Mark Done</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E1F2] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E1F2]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-[#5B42F3] rounded-xl">
                  <CalendarCheck size={18} />
                </div>
                <h3 className="font-extrabold text-base text-[#17152B]">Schedule Follow-up</h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Select Lead *
                </label>
                <select
                  required
                  value={formData.leadId}
                  onChange={(e) => {
                    const l = leads.find((x) => x.id === e.target.value);
                    setFormData({
                      ...formData,
                      leadId: e.target.value,
                      leadName: l ? l.clientName : '',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                >
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.clientName} ({lead.eventType}) - {lead.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 03:00 PM"
                    value={formData.followUpTime}
                    onChange={(e) => setFormData({ ...formData, followUpTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Channel / Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="WHATSAPP">WhatsApp Chat</option>
                  <option value="EMAIL">Email Follow-up</option>
                  <option value="MEETING">In-Studio / Client Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Agenda / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Discuss revised discount on Wedding Cinematic package..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E1F2]">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#5B42F3] hover:bg-[#4E35E0] text-white shadow-md shadow-[#5B42F3]/25"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
