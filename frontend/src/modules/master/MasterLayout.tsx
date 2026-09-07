import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  Clock,
  LogOut,
  Camera,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Package,
  CreditCard,
  BarChart3,
  Sliders,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import ModuleSwitcher from '../../components/shared/ModuleSwitcher';

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

export default function MasterLayout() {
  const { user, logout, studiosList, activeStudio, switchStudio } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info('Signed out from Master Workspace');
    navigate('/login');
  };

  // Master Studio Operational Workflow Navigation
  const navItems = [
    { to: '/master/dashboard', icon: LayoutDashboard, label: 'Studio Dashboard' },
    { to: '/master/clients', icon: Users, label: 'Clients' },
    { to: '/master/products', icon: Package, label: 'Products & Packages' },
    { to: '/sales/dashboard', icon: TrendingUp, label: 'Sales & Client CRM' },
    { to: '/pre-production/dashboard', icon: Sparkles, label: 'Pre-Production' },
    { to: '/studio/workflow', icon: Camera, label: 'Production & Workflow' },
    { to: '/studio/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/sales/invoice', icon: CreditCard, label: 'Invoices & Payments' },
    { to: '/sales/report', icon: BarChart3, label: 'Studio Reports' },
    { to: '/master/settings', icon: Sliders, label: 'Studio Settings' },
  ];

  // Dynamic Breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = [{ label: activeStudio?.name || 'Master Studio', to: '/master/dashboard' }];

    if (path.includes('/master/clients')) {
      parts.push({ label: 'Clients Management', to: '/master/clients' });
    } else if (path.includes('/master/products')) {
      parts.push({ label: 'Products & Packages', to: '/master/products' });
    } else if (path.includes('/sales')) {
      parts.push({ label: 'Sales & Client Workflow', to: '/sales/dashboard' });
    } else if (path.includes('/pre-production')) {
      parts.push({ label: 'Pre-Production CRM', to: '/pre-production/dashboard' });
    } else if (path.includes('/workflow')) {
      parts.push({ label: 'Production Pipeline', to: '/studio/workflow' });
    } else if (path.includes('/settings')) {
      parts.push({ label: 'Studio Settings', to: '/master/settings' });
    } else {
      parts.push({ label: 'Dashboard Overview', to: '/master/dashboard' });
    }

    return parts;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex relative overflow-hidden font-sans">
      {/* Clean Light Lavender Sidebar */}
      <aside className="w-64 bg-[#F8F6FF] text-[#17152B] flex flex-col fixed inset-y-0 left-0 z-30 border-r border-[#E5E1F2] select-none shadow-xs">
        {/* Brand Header */}
        <div
          onClick={() => navigate('/master/dashboard')}
          className="h-16 flex items-center px-6 gap-3 border-b border-[#E5E1F2] bg-white cursor-pointer hover:bg-slate-50/80 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5E35B1] to-[#7E57C2] flex items-center justify-center text-white shadow-md shadow-purple-900/10 shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-wider uppercase text-[#17152B] leading-none">
              LUMINA
            </span>
            <span className="text-[10px] text-[#7E57C2] font-extrabold uppercase tracking-widest mt-1">
              MASTER WORKSPACE
            </span>
          </div>
        </div>

        {/* Studio Switcher Pill */}
        <div className="p-3 border-b border-[#E5E1F2] bg-white/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E5E1F2] shadow-2xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-black text-xs shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-black text-xs text-[#17152B] truncate">{activeStudio?.name || 'Studio Aurora'}</div>
                <div className="text-[10px] text-slate-400 font-semibold truncate">{activeStudio?.city || 'Bangalore'} · Master</div>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-black text-[#8E8A9F] uppercase tracking-wider">
            Studio Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#5E35B1] text-white shadow-sm shadow-purple-900/10'
                    : 'text-[#4A455E] hover:bg-white hover:text-[#17152B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#7E57C2]'}`} />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Sign Out */}
        <div className="p-3 border-t border-[#E5E1F2] bg-white">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name[0] : 'M'}
              </div>
              <div className="truncate">
                <div className="font-bold text-xs text-slate-900 truncate">{user?.name || 'Master Admin'}</div>
                <div className="text-[10px] text-purple-700 font-bold uppercase">{user?.role === 'great_master' ? 'Great Master' : 'Master Admin'}</div>
              </div>
            </div>
            {user?.role === 'great_master' && (
              <Link
                to="/great-master/dashboard"
                className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold"
                title="Return to Great Master Portal"
              >
                Exit
              </Link>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0 bg-[#F8F9FD] min-h-screen relative z-10">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E5E1F2] px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            {getBreadcrumbs().map((bc, idx) => (
              <React.Fragment key={bc.to + idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#8E8A9F]" />}
                {idx === getBreadcrumbs().length - 1 ? (
                  <span className="font-bold text-[#17152B]">{bc.label}</span>
                ) : (
                  <Link to={bc.to} className="text-[#68647A] hover:text-[#5E35B1] transition-colors">
                    {bc.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Module Switcher & Live Clock */}
          <div className="flex items-center gap-6">
            <ModuleSwitcher />
            <div className="h-6 w-[1px] bg-[#E5E1F2] hidden md:block" />
            <LiveDateTime />
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
