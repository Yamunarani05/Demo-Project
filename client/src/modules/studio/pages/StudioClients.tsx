import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Users,
  PlusCircle,
  Search,
  Calendar,
  MapPin,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function StudioClients() {
  const { activeStudio, getStudioClients } = useAuth();
  const [search, setSearch] = useState('');

  const studioClients = getStudioClients();

  const filteredClients = studioClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.serialNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            {activeStudio?.name} Client Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active photography projects, booking details, and workflow progress.
          </p>
        </div>

        <Link
          to="/studio/clients/onboard"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition-all flex items-center gap-1.5 self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Onboard New Client</span>
        </Link>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, lead ID, or venue location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredClients.map((client) => {
          const hasPre = client.preWeddingStages.length > 0;
          const hasPost = client.postWeddingStages.length > 0;

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-bold flex items-center justify-center text-base shadow-md shadow-purple-900/20 shrink-0">
                      {client.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">
                          {client.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                          {client.serialNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{client.location}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                    {client.shootType}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs border border-slate-100 mb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Celebration Type:</span>
                    <strong className="text-slate-900">{client.eventType}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Event Date:</span>
                    <strong className="text-slate-900">{client.eventDate}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Budget / Paid:</span>
                    <strong className="text-emerald-700">
                      ₹{(client.paidAmount / 1000).toFixed(0)}k / ₹{(client.budget / 1000).toFixed(0)}k
                    </strong>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2 mb-4">
                  {hasPre && (
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-purple-900 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          Pre-Wedding Workflow
                        </span>
                        <span className="text-purple-700 font-bold">{client.preWeddingProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${client.preWeddingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {hasPost && (
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-indigo-900 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-indigo-600" />
                          Post-Wedding Workflow
                        </span>
                        <span className="text-indigo-700 font-bold">{client.postWeddingProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${client.postWeddingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Link
                  to={`/studio/clients/${client.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Open Client Workspace</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
