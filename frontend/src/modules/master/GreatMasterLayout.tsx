import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Crown,
  LayoutDashboard,
  Building2,
  Users,
  CheckSquare,
  Clock,
  Sliders,
  LogOut,
  ChevronRight,
  Bell,
  Home,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import ModuleSwitcher from '../../components/shared/ModuleSwitcher';
import PhotographySketchBackground from './components/PhotographySketchBackground';

function LiveDateTime() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <div className="flex flex-col items-end text-xs leading-tight text-right">
      <span className="font-bold text-[#17152B] text-[13px]">{dateStr}</span>
      <span className="text-[#68647A] font-medium text-[11px] mt-0.5">{timeStr}</span>
    </div>
  );
}

export default function GreatMasterLayout() {
  const { logout, user, pendingRequests, studiosList } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info('Signed out from Great Master Portal');
    navigate('/great-master/login');
  };

  const navItems = [
    { to: '/great-master/dashboard', icon: LayoutDashboard, label: 'Platform Dashboard' },
    { to: '/great-master/masters', icon: Building2, label: 'Masters / Studios' },
    {
      to: '/great-master/approvals',
      icon: CheckSquare,
      label: 'Approvals Queue',
      badge: pendingRequests.length > 0 ? pendingRequests.length : undefined,
    },
    { to: '/great-master/users', icon: Users, label: 'Platform Users' },
    { to: '/great-master/activity', icon: Clock, label: 'System Activity' },
    { to: '/great-master/settings', icon: Sliders, label: 'Settings & Monitoring' },
  ];

  // Dynamic Breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = [{ label: 'Great Master', to: '/great-master/dashboard' }];

    if (path.includes('/great-master/masters/')) {
      const studioId = path.split('/great-master/masters/')[1];
      const studio = studiosList.find((s) => s.id === studioId);
      parts.push({ label: 'Masters Directory', to: '/great-master/masters' });
      parts.push({ label: studio?.name || 'Studio Details', to: path });
    } else if (path === '/great-master/masters') {
      parts.push({ label: 'Masters Directory', to: path });
    } else if (path === '/great-master/approvals') {
      parts.push({ label: 'Approvals Queue', to: path });
    } else if (path === '/great-master/users') {
      parts.push({ label: 'Platform Users', to: path });
    } else if (path === '/great-master/activity') {
      parts.push({ label: 'System Activity', to: path });
    } else if (path === '/great-master/settings') {
      parts.push({ label: 'System Settings', to: path });
    } else {
      parts.push({ label: 'Dashboard Overview', to: '/great-master/dashboard' });
    }

    return parts;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex relative overflow-hidden font-sans">
      {/* Clean Light Lavender Sidebar matching first white theme */}
      <aside className="w-64 bg-[#F8F6FF] text-[#17152B] flex flex-col fixed inset-y-0 left-0 z-30 border-r border-[#E5E1F2] select-none shadow-xs">
        {/* Brand Header */}
        <div
          onClick={() => navigate('/great-master/dashboard')}
          className="p-5 border-b border-[#E5E1F2] flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#5B42F3] flex items-center justify-center text-white shadow-md shadow-[#5B42F3]/25 shrink-0 group-hover:scale-105 transition-transform">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wide text-[#17152B] font-display leading-tight">
              GREAT MASTER
            </div>
            <div className="mt-1">
              <span className="bg-[#ECE8FD] text-[#5B42F3] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block">
                Platform Admin
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 pt-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/great-master/dashboard' && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#ECE8FD] text-[#5B42F3] font-semibold border-l-4 border-[#5B42F3] shadow-xs'
                    : 'text-[#68647A] hover:text-[#5B42F3] hover:bg-[#F2EDFE]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-[#5B42F3]' : 'text-[#68647A] group-hover:text-[#5B42F3]'
                    }`}
                  />
                  <span className="transition-transform group-hover:translate-x-0.5">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions / Logout */}
        <div className="p-3 border-t border-[#E5E1F2] space-y-1.5">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#68647A] hover:text-[#5B42F3] hover:bg-[#ECE8FD] transition-colors group"
          >
            <Home className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>← Landing Page</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#68647A] hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#68647A] group-hover:text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
        {/* Animated Photography Sketches in Background */}
        <PhotographySketchBackground />

        {/* Top Header Bar */}
        <header className="h-16 px-6 bg-white/80 backdrop-blur-md border-b border-[#E5E1F2] flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            {getBreadcrumbs().map((bc, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight size={13} className="text-[#68647A]" />}
                {idx === getBreadcrumbs().length - 1 ? (
                  <span className="font-bold text-[#17152B]">{bc.label}</span>
                ) : (
                  <span
                    onClick={() => navigate(bc.to)}
                    className="text-[#68647A] hover:text-[#5B42F3] cursor-pointer transition-colors"
                  >
                    {bc.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Center/Right: Module Switcher, Clock, Profile */}
          <div className="flex items-center gap-4">
            <ModuleSwitcher variant="topbar" />

            <div className="h-6 w-px bg-[#E5E1F2]" />

            <LiveDateTime />

            <div className="h-6 w-px bg-[#E5E1F2]" />

            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#5B42F3] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                GM
              </div>
              <div className="hidden md:block text-left text-xs leading-tight">
                <div className="font-bold text-[#17152B]">
                  {user?.name || 'Great Master'}
                </div>
                <div className="text-[10px] text-[#5B42F3] font-semibold">
                  Super Administrator
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
