import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  FolderKanban,
  Search,
  Building2,
  Calendar,
  MapPin,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
} from 'lucide-react';

export default function MasterClients() {
  const { clientsList, studiosList } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedStudio, setSelectedStudio] = useState('all');

  const filteredStudios = studiosList.filter((s) => selectedStudio === 'all' || s.id === selectedStudio);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
            <Eye className="w-3.5 h-3.5" />
            <span>Studio → Client Relationship View</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Client Monitoring by Studio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify which clients belong to which photography studio, shoot deliverables, and live workflow progress.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold self-start">
          {clientsList.length} Active Client Workspaces Monitored
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by couple name, location, or lead ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Filter Studio:</span>
          <select
            value={selectedStudio}
            onChange={(e) => setSelectedStudio(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All 10 Studios</option>
            {studiosList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Studio → Clients Accordion / Grouped List */}
      <div className="space-y-5">
        {filteredStudios.map((studio) => {
          const studioClients = clientsList.filter(
            (c) =>
              c.studioId === studio.id &&
              (c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.location.toLowerCase().includes(search.toLowerCase()) ||
                c.serialNumber.toLowerCase().includes(search.toLowerCase()))
          );

          if (search && studioClients.length === 0) return null;

          return (
            <div
              key={studio.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm"
            >
              {/* Studio Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-purple-900/20 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg text-slate-900">{studio.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                        {studio.onboardedClientsCount || 5} Total Onboarded Clients
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {studio.city}, {studio.state} · Admin: <strong className="text-slate-700">{studio.adminName}</strong>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/master/studios/${studio.id}`}
                  className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1 self-start sm:self-center"
                >
                  <span>Studio Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Clients under this Studio */}
              <div className="mt-4 space-y-3">
                {studioClients.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                    No active clients match search for this studio.
                  </div>
                ) : (
                  studioClients.map((client) => {
                    const activeStage =
                      client.preWeddingStages.find((s) => s.status === 'in_progress') ||
                      client.postWeddingStages.find((s) => s.status === 'in_progress') ||
                      client.preWeddingStages[0] ||
                      client.postWeddingStages[0];

                    const progress =
                      client.shootType === 'Post-Wedding'
                        ? client.postWeddingProgress
                        : client.preWeddingProgress;

                    return (
                      <div
                        key={client.id}
                        className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {client.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold font-mono">
                                {client.serialNumber}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                                {client.shootType}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3 flex-wrap">
                              <span>{client.eventType}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {client.eventDate}
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {client.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress & Current Stage */}
                        <div className="flex items-center gap-5 sm:text-right">
                          <div>
                            <div className="text-[11px] text-slate-400">Current Phase</div>
                            <div className="text-xs font-bold text-purple-700 mt-0.5">
                              {activeStage?.name || 'Onboarded'}
                            </div>
                          </div>

                          <div className="w-24">
                            <div className="text-[11px] font-bold text-slate-700 mb-1">
                              {progress}% Done
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-purple-600 h-1.5 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
