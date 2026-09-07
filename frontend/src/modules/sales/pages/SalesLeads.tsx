import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  MapPin,
  ChevronRight,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { api } from '../../../services/api';

const PIPELINE_STAGES = [
  { key: 'NEW', label: 'New Inquiries', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'CONTACTED', label: 'Contacted', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'QUALIFIED', label: 'Qualified', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'QUOTATION_SENT', label: 'Quotation Sent', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { key: 'CONVERTED', label: 'Converted Client', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'LOST', label: 'Lost / Closed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export default function SalesLeads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Lead Form State
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    email: '',
    eventType: 'Wedding',
    eventDate: '',
    location: '',
    estimatedBudget: 150000,
    source: 'Website / Direct',
    notes: '',
  });

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesLeads({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.success) {
        setLeads(res.data || []);
        setSummary(res.summary || {});
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLeads();
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createSalesLead(formData);
      if (res.success) {
        setIsAddModalOpen(false);
        setActionNotice(`Lead "${formData.clientName}" created successfully!`);
        setTimeout(() => setActionNotice(null), 3500);
        setFormData({
          clientName: '',
          phone: '',
          email: '',
          eventType: 'Wedding',
          eventDate: '',
          location: '',
          estimatedBudget: 150000,
          source: 'Website / Direct',
          notes: '',
        });
        loadLeads();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to create lead');
    }
  };

  const handleAdvanceStage = async (leadId: string, currentStatus: string) => {
    const sequence = ['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTATION_SENT', 'NEGOTIATION', 'CONVERTED'];
    const idx = sequence.indexOf(currentStatus);
    if (idx === -1 || idx === sequence.length - 1) return;
    const nextStatus = sequence[idx + 1];

    if (nextStatus === 'CONVERTED') {
      handleConvertLead(leadId);
      return;
    }

    try {
      await api.updateSalesLead(leadId, { status: nextStatus });
      loadLeads();
    } catch (err: any) {
      alert(err?.message || 'Failed to update stage');
    }
  };

  const handleConvertLead = async (leadId: string) => {
    try {
      const res = await api.convertSalesLead(leadId, {
        confirmedBudget: 180000,
        notes: 'Converted through sales pipeline board',
      });
      if (res.success) {
        setActionNotice(`🎉 Converted to Client & Shoot Project in Pre-Production!`);
        setTimeout(() => setActionNotice(null), 4000);
        loadLeads();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to convert lead');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Action Notification */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <Link
            to="/pre-production/dashboard"
            className="underline text-emerald-950 font-extrabold flex items-center gap-1"
          >
            Go to Pre-Production <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17152B] tracking-tight">
            Leads & Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[#68647A] mt-0.5">
            Capture prospective inquiry details, advance pipeline stages, and convert to projects.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-white border border-[#E5E1F2] rounded-xl p-1 flex items-center text-xs font-bold">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'board' ? 'bg-[#ECE8FD] text-[#5B42F3]' : 'text-[#68647A] hover:text-[#17152B]'
              }`}
            >
              Pipeline Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-[#ECE8FD] text-[#5B42F3]' : 'text-[#68647A] hover:text-[#17152B]'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#5B42F3] hover:bg-[#4E35E0] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#5B42F3]/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5E1F2] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, location, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B42F3] transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              statusFilter === 'ALL' ? 'bg-[#5B42F3] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({leads.length})
          </button>
          {PIPELINE_STAGES.slice(0, 5).map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                statusFilter === s.key ? 'bg-[#5B42F3] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {s.label} ({summary[s.key] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Content Area: Board View or Table View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {PIPELINE_STAGES.filter((s) => s.key !== 'LOST').map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage.key);
            return (
              <div key={stage.key} className="bg-slate-50/70 border border-[#E5E1F2] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${stage.color}`}>
                      {stage.label}
                    </span>
                    <span className="text-xs font-bold text-slate-500">({stageLeads.length})</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {stageLeads.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No leads in this stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white border border-[#E5E1F2] rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-xs text-[#17152B]">{lead.clientName}</h4>
                            <p className="text-[11px] text-[#5B42F3] font-semibold">{lead.eventType}</p>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            ₹{(lead.estimatedBudget || 0).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-600">
                          {lead.eventDate && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Calendar size={12} />
                              <span>{lead.eventDate}</span>
                            </div>
                          )}
                          {lead.location && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <MapPin size={12} />
                              <span className="truncate">{lead.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone size={12} />
                            <span>{lead.phone}</span>
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          <Link
                            to={`/sales/quotations?leadId=${lead.id}`}
                            className="text-[10px] font-bold text-[#5B42F3] hover:underline flex items-center gap-1"
                            title="Generate Quote for this Lead"
                          >
                            <FileText size={11} />
                            <span>+ Quote</span>
                          </Link>

                          {stage.key !== 'CONVERTED' ? (
                            <button
                              onClick={() => handleAdvanceStage(lead.id, lead.status)}
                              className="text-[10px] font-bold text-slate-700 hover:text-[#5B42F3] px-2 py-1 rounded bg-slate-100 hover:bg-[#ECE8FD] transition-colors flex items-center gap-0.5"
                            >
                              <span>Next Stage</span>
                              <ChevronRight size={11} />
                            </button>
                          ) : (
                            <Link
                              to="/pre-production/dashboard"
                              className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                            >
                              <span>Pre-Prod</span>
                              <ArrowRight size={11} />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-[#E5E1F2] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#F8F6FF] text-[#68647A] text-[11px] uppercase tracking-wider border-b border-[#E5E1F2]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Client / Couple</th>
                  <th className="py-3.5 px-4 font-bold">Event & Date</th>
                  <th className="py-3.5 px-4 font-bold">Location</th>
                  <th className="py-3.5 px-4 font-bold">Contact</th>
                  <th className="py-3.5 px-4 font-bold">Budget</th>
                  <th className="py-3.5 px-4 font-bold">Stage</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1F2]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F8F6FF]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-[#17152B]">{lead.clientName}</div>
                      <div className="text-[10px] text-slate-400">Source: {lead.source}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{lead.eventType}</div>
                      <div className="text-[10px] text-slate-500">{lead.eventDate || 'Date TBD'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{lead.location || '—'}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono">{lead.phone}</div>
                      <div className="text-slate-400 text-[10px] truncate max-w-[150px]">{lead.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                      ₹{(lead.estimatedBudget || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                        lead.status === 'CONVERTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        lead.status === 'QUOTATION_SENT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        lead.status === 'QUALIFIED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/sales/quotations?leadId=${lead.id}`}
                          className="px-2.5 py-1 bg-[#ECE8FD] hover:bg-purple-200 text-[#5B42F3] rounded-lg font-bold text-[11px] transition-colors"
                        >
                          + Quote
                        </Link>
                        {lead.status !== 'CONVERTED' && (
                          <button
                            onClick={() => handleConvertLead(lead.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Convert
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E1F2] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E1F2]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-[#5B42F3] rounded-xl">
                  <Users size={18} />
                </div>
                <h3 className="font-extrabold text-base text-[#17152B]">Capture New Inquiry</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Client / Couple Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram & Radhika"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Event Type
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  >
                    <option>Wedding</option>
                    <option>Pre-Wedding</option>
                    <option>Engagement</option>
                    <option>Birthday</option>
                    <option>Maternity</option>
                    <option>Corporate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Tentative Event Date
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Estimated Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Taj West End, Bangalore"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Notes & Special Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Needs cinematic drone footage, candid photography..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#5B42F3] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E1F2]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#5B42F3] hover:bg-[#4E35E0] text-white shadow-md shadow-[#5B42F3]/25"
                >
                  Save & Add to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
