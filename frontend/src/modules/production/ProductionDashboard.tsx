import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Video,
  Plane,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  MapPin,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductionDashboard() {
  const [stats] = useState({
    activeShootsToday: 3,
    photographersOnField: 5,
    dronePilotsActive: 2,
    completedShootsThisWeek: 11,
  });

  const activeShoots = [
    {
      id: 'shoot_1',
      title: 'Arun & Priya Royal Pre-Wedding',
      location: 'Ooty Tea Estate & Avalanche Lake',
      leadPhotographer: 'Karthik Rajan',
      cinematographer: 'Vijay Anand',
      dronePilot: 'Vijay Anand',
      callTime: '05:30 AM',
      status: 'SHOOTING',
      progress: 65,
    },
    {
      id: 'shoot_2',
      title: 'Karthik & Divya Beachside Sangeet',
      location: 'Mahabalipuram Beach Resort',
      leadPhotographer: 'Rohan Deshmukh',
      cinematographer: 'Sameer Khan',
      dronePilot: 'Sameer Khan',
      callTime: '04:00 PM',
      status: 'CALL_TIME',
      progress: 20,
    },
    {
      id: 'shoot_3',
      title: 'Siddharth & Meera Heritage Shoot',
      location: 'Nandi Hills / Cubbon Park',
      leadPhotographer: 'Prasad Reddy',
      cinematographer: 'Deepak Menon',
      dronePilot: 'Deepak Menon',
      callTime: 'Completed at 01:00 PM',
      status: 'RAW_INGEST_PENDING',
      progress: 90,
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">PRODUCTION DASHBOARD</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Real-time monitoring of on-ground shoots, field crews & live camera operations</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/production/live-event"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-md shadow-purple-600/25 flex items-center gap-1.5"
          >
            <Clock size={15} />
            <span>Open Live Event Tracker</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Today</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Camera size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.activeShootsToday}</div>
          <span className="text-[11px] font-semibold text-emerald-600">On schedule across venues</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Field Photographers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.photographersOnField}</div>
          <span className="text-[11px] font-semibold text-blue-600">Equipped with 4K Cine gears</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Drone Pilots Live</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Plane size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.dronePilotsActive}</div>
          <span className="text-[11px] font-semibold text-amber-600">DGCA certified pilots</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Completed This Week</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.completedShootsThisWeek}</div>
          <span className="text-[11px] font-semibold text-emerald-600">100% on-time check-in</span>
        </div>
      </div>

      {/* Active Shoots Monitoring List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Live Shoot Feed</h2>
          <span className="text-xs text-purple-600 font-bold">Auto-syncing every 30s</span>
        </div>
        <div className="divide-y divide-slate-100">
          {activeShoots.map(shoot => (
            <div key={shoot.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{shoot.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    shoot.status === 'SHOOTING' ? 'bg-emerald-100 text-emerald-700' :
                    shoot.status === 'CALL_TIME' ? 'bg-amber-100 text-amber-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {shoot.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={13} /> {shoot.location}</span>
                  <span>•</span>
                  <span>Lead: {shoot.leadPhotographer}</span>
                  <span>•</span>
                  <span>Cine: {shoot.cinematographer}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700">Call Time: {shoot.callTime}</div>
                  <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${shoot.progress}%` }} />
                  </div>
                </div>
                <Link
                  to="/production/live-event"
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white hover:border-purple-600 hover:text-purple-600 transition-all flex items-center gap-1"
                >
                  Track <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
