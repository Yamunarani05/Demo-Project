import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  Clock,
  LogOut,
  Camera,
  Shield,
  ChevronRight,
  Home,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MasterLayout() {
  const { user, logout, studiosList } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info('Logged out from Great Master Admin');
    navigate('/login');
  };

  const navItems = [
    { to: '/master/dashboard', icon: LayoutDashboard, label: 'Dashboard Overview' },
    { to: '/master/studios', icon: Building2, label: 'Studios Overview' },
    { to: '/master/clients', icon: FolderKanban, label: 'Client Monitoring' },
    { to: '/master/employees', icon: Users, label: 'Employee Monitoring' },
    { to: '/master/activity', icon: Clock, label: 'Activity Monitoring' },
  ];

  // Breadcrumb generator
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = [{ label: 'Great Master Admin', to: '/master/dashboard' }];

    if (path.includes('/master/studios/')) {
      const studioId = path.split('/master/studios/')[1];
      const studio = studiosList.find((s) => s.id === studioId);
      parts.push({ label: 'Studios Overview', to: '/master/studios' });
      parts.push({ label: studio?.name || 'Studio Details', to: path });
    } else if (path === '/master/studios') {
      parts.push({ label: 'Studios Overview', to: path });
    } else if (path === '/master/clients') {
      parts.push({ label: 'Client Monitoring', to: path });
    } else if (path === '/master/employees' || path === '/master/admins') {
      parts.push({ label: 'Employee Monitoring', to: path });
    } else if (path === '/master/activity') {
      parts.push({ label: 'Activity Monitoring', to: path });
    } else {
      parts.push({ label: 'Dashboard Overview', to: '/master/dashboard' });
    }

    return parts;
  };

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden">
      {/* Clean Light Purple Sidebar */}
      <aside className="w-64 bg-[#f8f6ff] text-slate-700 flex flex-col fixed inset-y-0 left-0 z-30 border-r border-purple-100 select-none">
        {/* Brand Header */}
        <motion.div
          whileHover={{ backgroundColor: 'rgba(237, 233, 254, 0.6)' }}
          transition={{ duration: 0.2 }}
          onClick={() => navigate('/master/dashboard')}
          className="p-5 border-b border-purple-100 flex items-center gap-3 cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-900/20 shrink-0"
          >
            <Camera className="w-5 h-5" />
          </motion.div>
          <div>
            <div className="font-extrabold text-sm tracking-wider uppercase text-slate-900 font-display leading-tight">
              DEMO PROJECT
            </div>
            <div className="text-[10px] text-purple-600 font-bold uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-3 h-3 text-purple-500" />
              <span>Great Master</span>
            </div>
          </div>
        </motion.div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-900/20'
                      : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-500'}`} />
                    <span className="transition-transform group-hover:translate-x-0.5">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Switcher / Logout */}
        <div className="p-3 border-t border-purple-100 space-y-2">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors group"
          >
            <Home className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>← Landing Page</span>
          </NavLink>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </motion.button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
        {/* Topbar */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-8 flex items-center justify-between"
        >
          {/* Breadcrumbs */}
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

          {/* Topbar Right Controls */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="hidden sm:block text-right text-xs">
                <div className="font-bold text-slate-800 leading-tight">Rajesh Malhotra</div>
                <div className="text-[10px] text-purple-600 font-semibold">Great Master Admin</div>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                whileHover={{ scale: 1.08 }}
                className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-purple-900/20"
              >
                GM
              </motion.div>
            </motion.div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 p-8 bg-white">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
