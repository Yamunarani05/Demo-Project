import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  Sparkles,
  Layers,
  Activity,
  Clock,
  LogOut,
  Camera,
  ChevronRight,
  Building2,
  Home,
} from 'lucide-react';
import { toast } from 'sonner';
import ModuleSwitcher from '../../components/shared/ModuleSwitcher';

export default function StudioLayout() {
  const { user, activeStudio, logout, getStudioClients } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const studioClients = getStudioClients();
  const primaryClient = studioClients[0];

  const handleLogout = () => {
    logout();
    toast.info('Logged out from Studio Admin');
    navigate('/login');
  };

  const navItems = [
    { to: '/studio/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/studio/clients', icon: Users, label: `Clients (${studioClients.length})` },
    { to: '/studio/clients/onboard', icon: PlusCircle, label: '+ Onboard Client', highlight: true },
    {
      to: primaryClient
        ? `/studio/clients/${primaryClient.id}/pre-wedding`
        : '/studio/workflow',
      icon: Sparkles,
      label: 'Pre-Wedding',
    },
    {
      to: primaryClient
        ? `/studio/clients/${primaryClient.id}/post-wedding`
        : '/studio/workflow',
      icon: Layers,
      label: 'Post-Wedding',
    },
    { to: '/studio/workflow', icon: Activity, label: 'Workflow' },
    { to: '/studio/activity', icon: Clock, label: 'Studio Activity' },
  ];

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = [
      { label: activeStudio?.name || 'Studio Admin', to: '/studio/dashboard' },
    ];

    if (path.includes('/studio/clients/onboard')) {
      parts.push({ label: 'Clients', to: '/studio/clients' });
      parts.push({ label: 'Onboard New Client', to: path });
    } else if (path.includes('/studio/clients/')) {
      const partsArr = path.split('/studio/clients/')[1].split('/');
      const clientId = partsArr[0];
      const sub = partsArr[1];
      const client = studioClients.find((c) => c.id === clientId);

      parts.push({ label: 'Clients', to: '/studio/clients' });
      parts.push({ label: client?.name || 'Client Workspace', to: `/studio/clients/${clientId}` });
      if (sub === 'pre-wedding') {
        parts.push({ label: 'Pre-Wedding Workflow', to: path });
      } else if (sub === 'post-wedding') {
        parts.push({ label: 'Post-Wedding Workflow', to: path });
      }
    } else if (path === '/studio/clients') {
      parts.push({ label: 'Clients', to: path });
    } else if (path === '/studio/workflow') {
      parts.push({ label: 'Workflow Timeline', to: path });
    } else if (path === '/studio/activity') {
      parts.push({ label: 'Activity Feed', to: path });
    } else {
      parts.push({ label: 'Dashboard', to: '/studio/dashboard' });
    }

    return parts;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex relative overflow-hidden font-sans">
      {/* Studio Admin Sidebar matching first white theme */}
      <aside className="w-64 bg-[#F8F6FF] text-[#17152B] flex flex-col fixed inset-y-0 left-0 z-30 border-r border-[#E5E1F2] select-none shadow-xs">
        {/* Brand Header */}
        <div
          onClick={() => navigate('/studio/dashboard')}
          className="p-5 border-b border-[#E5E1F2] flex items-center gap-3 cursor-pointer group hover:bg-[#F2EDFE] transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#5B42F3] flex items-center justify-center text-white shadow-md shadow-[#5B42F3]/25 shrink-0 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold text-sm tracking-wider uppercase text-[#17152B] font-display leading-tight truncate">
              {activeStudio?.name || 'STUDIO PORTAL'}
            </div>
            <div className="text-[10px] text-[#5B42F3] font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-[#5B42F3] shrink-0" />
              <span>Studio Workspace</span>
            </div>
          </div>
        </div>

        {/* Active Studio Selector Badge */}
        <div className="mx-3 my-3 p-3 rounded-xl bg-white border border-[#E5E1F2] text-xs shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between mb-1">
            <span>Active Studio</span>
            <span className="text-[10px] text-emerald-600 font-bold">● Live</span>
          </div>
          <div className="text-[#17152B] font-bold text-sm leading-tight truncate">
            {activeStudio?.name || 'Studio Aurora'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Admin: {activeStudio?.adminName} ({activeStudio?.city})
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5">
            Studio Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to + item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#ECE8FD] text-[#5B42F3] font-semibold border-l-4 border-[#5B42F3] shadow-xs'
                      : item.highlight
                      ? 'text-[#5B42F3] bg-[#ECE8FD]/70 hover:bg-[#ECE8FD] font-semibold border border-purple-200'
                      : 'text-[#68647A] hover:text-[#5B42F3] hover:bg-[#F2EDFE]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Logout */}
        <div className="p-3 border-t border-[#E5E1F2] space-y-1.5">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#68647A] hover:text-[#5B42F3] hover:bg-[#ECE8FD] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>← Landing Page</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#68647A] hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-[#68647A]" />
            <span>Exit / Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#E5E1F2] sticky top-0 z-20 px-8 flex items-center justify-between">
          {/* Breadcrumbs & Module Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
              {getBreadcrumbs().map((b, idx, arr) => (
                <React.Fragment key={b.to + idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  {idx === arr.length - 1 ? (
                    <span className="font-semibold text-slate-900">{b.label}</span>
                  ) : (
                    <NavLink to={b.to} className="hover:text-purple-600 transition-colors">
                      {b.label}
                    </NavLink>
                  )}
                </React.Fragment>
              ))}
            </div>
            <ModuleSwitcher />
          </div>

          {/* Topbar Right Controls */}
          <div className="flex items-center gap-4">
            <Link
              to="/studio/clients/onboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm shadow-purple-900/30 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Onboard Client</span>
            </Link>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs border border-purple-200">
                {activeStudio?.adminName?.split(' ').map((n) => n[0]).join('') || 'SA'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-bold text-slate-800 leading-tight">
                  {activeStudio?.adminName}
                </div>
                <div className="text-[10px] text-purple-700 font-semibold">
                  {activeStudio?.name} Admin
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
