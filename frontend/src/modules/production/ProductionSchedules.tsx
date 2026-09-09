import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Camera,
  Video,
  Plane,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductionSchedules() {
  const [roleFilter, setRoleFilter] = useState<'all' | 'photographer' | 'videographer' | 'drone'>('all');

  const schedules = [
    {
      id: 'sch_1',
      date: '2026-09-15',
      time: '05:30 AM – 06:30 PM',
      client: 'Arun & Priya (Pre-Wedding)',
      venue: 'Ooty Tea Garden & Avalanche Lake, Nilgiris',
      assignedPhotographer: 'Karthik Rajan',
      assignedVideographer: 'Vijay Anand',
      dronePilot: 'Vijay Anand',
      kitReady: true,
      shotListCount: 28,
      status: 'Confirmed',
    },
    {
      id: 'sch_2',
      date: '2026-09-22',
      time: '04:00 PM – 11:30 PM',
      client: 'Karan Malhotra & Rhea Batra (Engagement)',
      venue: 'JW Marriott Grand Ballroom, Bangalore',
      assignedPhotographer: 'Deepak Menon',
      assignedVideographer: 'Anita Sharma',
      dronePilot: 'N/A (Indoor)',
      kitReady: true,
      shotListCount: 20,
      status: 'Confirmed',
    },
    {
      id: 'sch_3',
      date: '2026-09-28',
      time: '06:00 AM – 10:00 PM',
      client: 'Karthik Subramanian & Divya Raman (Wedding)',
      venue: 'Mahabalipuram Beach Resort, Chennai',
      assignedPhotographer: 'Rohan Deshmukh',
      assignedVideographer: 'Sameer Khan',
      dronePilot: 'Sameer Khan',
      kitReady: true,
      shotListCount: 45,
      status: 'Planning Review',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">SHOOT SCHEDULES</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Daily call times, venue addresses & camera crew rosters</p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'photographer', 'videographer', 'drone'].map(f => (
            <button
              key={f}
              onClick={() => setRoleFilter(f as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                roleFilter === f ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {schedules.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-purple-300 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-600 uppercase tracking-wider">{item.date}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                {item.status}
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">{item.client}</h2>
              <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-1.5">
                <MapPin size={13} className="shrink-0 mt-0.5 text-slate-400" />
                <span>{item.venue}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1"><Clock size={12} /> Call Time:</span>
                <span className="font-bold">{item.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1"><Camera size={12} /> Lead Photo:</span>
                <span className="font-bold">{item.assignedPhotographer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1"><Video size={12} /> Video Lead:</span>
                <span className="font-bold">{item.assignedVideographer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1"><Plane size={12} /> Drone:</span>
                <span className="font-bold">{item.dronePilot}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{item.shotListCount} Planned Shots</span>
              <Link
                to="/production/live-event"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Open Event Tracker <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
