import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Users,
  Camera,
  Scissors,
  Building2,
  MapPin,
  ChevronRight,
  Eye,
} from 'lucide-react';

export default function MasterEmployees() {
  const { studiosList } = useAuth();

  const totalEmployees = studiosList.reduce((sum, s) => sum + (s.totalEmployees || 12), 0);
  const totalPhotographers = studiosList.reduce((sum, s) => sum + (s.photographersCount || 7), 0);
  const totalEditors = studiosList.reduce((sum, s) => sum + (s.editorsCount || 5), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
            <Eye className="w-3.5 h-3.5" />
            <span>Staff Count Monitoring</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Employee & Crew Monitoring by Studio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of total studio employees, active camera photographers, and post-production editors per studio.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold self-start">
          {totalEmployees} Total Staff Monitored
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-900/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Employees
            </div>
            <div className="text-3xl font-black text-slate-900 mt-0.5">
              {totalEmployees}
            </div>
            <div className="text-[11px] text-slate-400">Across 10 studios</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-900/20">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Photographers
            </div>
            <div className="text-3xl font-black text-emerald-800 mt-0.5">
              {totalPhotographers}
            </div>
            <div className="text-[11px] text-emerald-600">Active camera crew</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-900/20">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Editors
            </div>
            <div className="text-3xl font-black text-amber-800 mt-0.5">
              {totalEditors}
            </div>
            <div className="text-[11px] text-amber-600">Colorists & post-prod</div>
          </div>
        </div>
      </div>

      {/* Studio Employee Breakdown Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base font-display">
            Staff & Crew Distribution (10 Studios)
          </h2>
          <span className="text-xs text-slate-400">Read-only count monitoring</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Studio Name</th>
                <th className="py-3.5 px-4">Studio Admin</th>
                <th className="py-3.5 px-4 text-center">Total Employees</th>
                <th className="py-3.5 px-4 text-center">Photographers</th>
                <th className="py-3.5 px-4 text-center">Editors</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studiosList.map((studio, idx) => (
                <tr key={studio.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 text-sm">{studio.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{studio.city}, {studio.state}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">
                    {studio.adminName}
                  </td>
                  <td className="py-4 px-4 text-center font-black text-slate-900 text-sm">
                    {studio.totalEmployees || 12}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-emerald-700 text-sm">
                    {studio.photographersCount || 7}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-amber-700 text-sm">
                    {studio.editorsCount || 5}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      to={`/master/studios/${studio.id}`}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors inline-flex items-center gap-1"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
