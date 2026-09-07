import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Search,
  Phone,
  Mail,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { api } from '../../../services/api';

export default function SalesClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesClients({ search: search || undefined });
      if (res.success) {
        setClients(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load sales clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadClients();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17152B] tracking-tight">
            Converted Clients & Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#68647A] mt-0.5">
            Prospective inquiries that have signed proposals and moved to active Pre-Production execution.
          </p>
        </div>

        <Link
          to="/pre-production/dashboard"
          className="bg-[#5B42F3] hover:bg-[#4E35E0] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#5B42F3]/25 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Layers size={14} />
          <span>Go to Pre-Production Workspace</span>
        </Link>
      </div>

      {/* Search & Info Banner */}
      <div className="bg-white border border-[#E5E1F2] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B42F3]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            Filter
          </button>
        </form>

        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-1.5">
          <ShieldCheck size={15} />
          <span>{clients.length} Active Booked Clients</span>
        </div>
      </div>

      {/* Client List Cards */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-3 border-[#5B42F3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white border border-[#E5E1F2] rounded-2xl p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-[#5B42F3] flex items-center justify-center mx-auto">
            <UserCheck size={24} />
          </div>
          <h3 className="font-extrabold text-sm text-[#17152B]">No converted clients found</h3>
          <p className="text-xs text-[#68647A] max-w-sm mx-auto">
            When you accept a quotation or mark a lead as converted, they will appear here and in Pre-Production!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((client) => {
            const balance = (client.totalBudget || client.budget || 0) - (client.paidAmount || 0);
            return (
              <div
                key={client.id}
                className="bg-white border border-[#E5E1F2] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#17152B]">{client.name}</h3>
                      <span className="text-[10px] font-semibold text-[#5B42F3] bg-purple-50 px-2 py-0.5 rounded-md">
                        {client.eventType || client.shootTitle || 'Wedding Event'}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Client
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Phone size={13} />
                      <span className="font-mono">{client.phone}</span>
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Mail size={13} />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.eventDate && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={13} />
                        <span>{client.eventDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Financials pill */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Contract:</span>
                      <span className="font-bold text-slate-900">
                        ₹{(client.totalBudget || client.budget || 180000).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Paid Advance:</span>
                      <span className="font-bold">
                        ₹{(client.paidAmount || 50000).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200">
                      <span>Balance Due:</span>
                      <span className="font-extrabold text-amber-700">
                        ₹{balance > 0 ? balance.toLocaleString('en-IN') : '1,30,000'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Handover & Pre-Production Navigation */}
                <div className="pt-3 border-t border-[#E5E1F2]">
                  <Link
                    to="/pre-production/dashboard"
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#ECE8FD] hover:bg-[#5B42F3] text-[#5B42F3] hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Layers size={13} />
                    <span>Open in Pre-Production</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
