import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Bell,
  Sparkles,
  Building2,
  LogOut,
  Shield,
  Heart,
  UserCheck,
  Check,
  ChevronDown,
} from 'lucide-react';

interface GlobalHeaderProps {
  onOpenSearch: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ onOpenSearch }) => {
  const { user, role, activeStudio, studiosList, switchStudio, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const NOTIFICATIONS = [
    { id: '1', title: 'Priya & Arun finalized 120 selections', sub: 'Ooty Pre-Wedding shoot', time: '5m ago', unread: true },
    { id: '2', title: 'RAW Tethering sync completed (1,400 photos)', sub: 'Pixel Stories Goa Wedding', time: '25m ago', unread: true },
    { id: '3', title: 'Color grading approved by Creative QC', sub: 'Lens Studio & Co.', time: '1h ago', unread: false },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Bar Input (Click opens spotlight modal) */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenSearch}
          className="w-full max-w-md px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs text-slate-400 flex items-center justify-between transition-colors group cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-[#5E35B1] transition-colors" />
            <span className="truncate">Search studios, couples, shoots, photographers...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-md">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Studio Switcher for Studio Admins */}
        {role === 'studio_admin' && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <select
              value={activeStudio?.id || 'studio_1'}
              onChange={(e) => switchStudio(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              {studiosList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Persona Switcher CTA */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-[#5E35B1] border border-purple-200 transition-all shadow-2xs"
          title="Switch Demo Persona"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Switch Persona</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-900">Live Shoot Notifications</span>
                <span className="text-[10px] text-purple-700 font-bold">Mark all read</span>
              </div>
              <div className="space-y-2">
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] truncate">{n.title}</span>
                      <span className="text-[9px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{n.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Logout */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center font-black text-xs text-[#5E35B1]">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
              {user?.name || 'User'}
            </p>
            <p className="text-[9px] font-semibold text-purple-700 uppercase leading-tight">
              {role.replace(/_/g, ' ')}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
