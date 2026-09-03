import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2,
  Search,
  MapPin,
  ChevronRight,
  Users,
  Camera,
  Scissors,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react';

export default function MasterStudios() {
  const { studiosList, clientsList } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  const cities = ['all', ...Array.from(new Set(studiosList.map((s) => s.city)))];

  const filteredStudios = studiosList.filter((studio) => {
    const matchSearch =
      studio.name.toLowerCase().includes(search.toLowerCase()) ||
      studio.city.toLowerCase().includes(search.toLowerCase());
    const matchCity = selectedCity === 'all' || studio.city === selectedCity;
    return matchSearch && matchCity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Studios Overview Directory (10 Studios)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor client counts, staff numbers, photographers, and editors across all 10 photography studios.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold self-start">
          10 Studios Active & Monitored
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search studio by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">City:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city === 'all' ? 'All Cities' : city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Studios Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredStudios.map((studio, idx) => {
          const studioClients = clientsList.filter((c) => c.studioId === studio.id);

          return (
            <div
              key={studio.id}
              onClick={() => navigate(`/master/studios/${studio.id}`)}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Top Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-bold flex items-center justify-center text-base shadow-md shadow-purple-900/20 shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-purple-700 transition-colors">
                        {studio.name}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{studio.city}, {studio.state}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Active</span>
                  </span>
                </div>

                <p className="text-xs text-slate-500 italic mb-4">
                  "{studio.tagline}"
                </p>

                {/* 4 Statistics Metrics */}
                <div className="grid grid-cols-4 gap-2.5 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center mb-4">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
                      <FolderKanban className="w-3 h-3 text-purple-600" />
                      <span>Clients</span>
                    </div>
                    <div className="text-lg font-black text-purple-700 mt-1">
                      {studio.onboardedClientsCount || 5}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
                      <Users className="w-3 h-3 text-indigo-600" />
                      <span>Employees</span>
                    </div>
                    <div className="text-lg font-black text-slate-900 mt-1">
                      {studio.totalEmployees || 12}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
                      <Camera className="w-3 h-3 text-emerald-600" />
                      <span>Photographers</span>
                    </div>
                    <div className="text-lg font-black text-emerald-700 mt-1">
                      {studio.photographersCount || 7}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
                      <Scissors className="w-3 h-3 text-amber-600" />
                      <span>Editors</span>
                    </div>
                    <div className="text-lg font-black text-amber-700 mt-1">
                      {studio.editorsCount || 5}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Details Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700 group-hover:translate-x-0.5 transition-transform">
                <span>Open Studio Details & Client Monitoring</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
