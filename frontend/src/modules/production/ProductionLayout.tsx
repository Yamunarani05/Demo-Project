import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Camera,
  Calendar,
  Clock,
  HardDrive,
  Activity,
  Layers,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProductionLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/production/dashboard', label: 'Production Overview', icon: Activity },
    { to: '/production/schedules', label: 'Shoot Schedules', icon: Calendar },
    { to: '/production/live-event', label: 'Live Shoot Tracker', icon: Clock },
    { to: '/production/cards', label: 'Media Card Check-in', icon: HardDrive },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
            <Camera size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-purple-600 uppercase">Stage 6</span>
              <span className="text-slate-300">/</span>
              <h1 className="text-base font-black text-slate-900 tracking-tight">ON-GROUND PRODUCTION</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">Photographer, Videographer & Drone Shoot Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800">{user?.name || 'Production Lead'}</span>
            <span className="text-[11px] text-purple-600 font-semibold uppercase">{user?.role || 'Photographer'}</span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Navigation Sub-header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center gap-2 overflow-x-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`
            }
          >
            <item.icon size={15} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
