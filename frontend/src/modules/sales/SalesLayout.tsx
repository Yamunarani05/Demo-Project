import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Eye,
  UserPlus,
  Link as LinkIcon,
  Receipt,
  Calendar,
  CheckCircle,
  Users,
  FileText,
  BarChart2,
  LogOut,
  Bell,
  Camera,
  Layers,
  ArrowRight
} from 'lucide-react';
import ModuleSwitcher from '../../components/shared/ModuleSwitcher';

function LiveClock() {
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
    <div className="flex flex-col items-end text-xs leading-tight text-right select-none">
      <span className="font-bold text-[#17152B] text-[12px]">{dateStr}</span>
      <span className="text-[#68647A] font-medium text-[11px] mt-0.5">{timeStr}</span>
    </div>
  );
}

export default function SalesLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/sales/dashboard', icon: LayoutDashboard },
    { label: 'View Leads', path: '/sales/view-leads', altPath: '/sales/leads', icon: Eye },
    { label: 'Assign Leads', path: '/sales/assign-leads', icon: UserPlus },
    { label: 'Tracking', path: '/sales/tracking', icon: LinkIcon },
    { label: 'Invoice', path: '/sales/invoice', altPath: '/sales/invoices', icon: Receipt },
    { label: 'Attendance', path: '/sales/attendance', icon: Calendar },
    { label: 'Approval', path: '/sales/approval', icon: CheckCircle },
    { label: 'Employees', path: '/sales/employees', icon: Users },
    { label: 'Quotation', path: '/sales/quotation', altPath: '/sales/quotations', icon: FileText },
    { label: 'Report', path: '/sales/report', altPath: '/sales/reports', icon: BarChart2 },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex relative overflow-hidden font-sans">
      {/* Sidebar matching exact Screenshot Layout */}
      <aside className="w-64 bg-[#EDE8FD]/70 backdrop-blur-md text-[#17152B] border-r border-[#E5E1F2] p-4 flex flex-col justify-between shrink-0 select-none shadow-xs z-30">
        <div>
          {/* Brand Header */}
          <div className="flex flex-col items-start px-3 py-3 mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-9 h-9 rounded-xl bg-[#5B42F3] flex items-center justify-center font-bold text-white shadow-md shadow-[#5B42F3]/25 shrink-0"
              >
                <Camera size={18} />
              </motion.div>
              <h2 className="font-black text-sm tracking-wide text-[#17152B] uppercase">DEMO STUDIO</h2>
            </div>
            <div className="mt-2 pl-12">
              <span className="bg-[#E4DCFD] text-[#5B42F3] px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider inline-block">
                Admin
              </span>
            </div>
          </div>

          {/* Navigation Items with Animated Active Pill */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.altPath && location.pathname === item.altPath);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'text-white shadow-md shadow-[#5B42F3]/25'
                      : 'text-[#524E66] hover:text-[#5B42F3] hover:bg-white/60'
                  }`}
                >
                  {/* Fluid Framer-Motion Active Pill Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="salesSidebarActiveIndicator"
                      className="absolute inset-0 bg-[#5B42F3] rounded-2xl z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 relative z-10 ${
                      isActive ? 'text-white' : 'text-[#524E66]'
                    }`}
                  />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout Button */}
        <div className="pt-4 border-t border-[#E5E1F2]/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 text-xs font-bold text-[#524E66] hover:text-[#5B42F3] px-4 py-2.5 rounded-2xl bg-white border border-[#E5E1F2] hover:bg-white/90 transition-all shadow-xs group cursor-pointer"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Header matching exact Screenshot (Notification Bell, Clock, Admin Manager Chip) */}
        <header className="h-16 border-b border-[#E5E1F2] bg-white/80 backdrop-blur-md px-8 flex items-center justify-end sticky top-0 z-20 gap-5">
          {/* Module Switcher */}
          <div className="mr-auto hidden md:block">
            <ModuleSwitcher variant="topbar" />
          </div>

          {/* Notification Bell with red count badge */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer shadow-2xs"
          >
            <Bell size={17} className="text-slate-600" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#EF4444] text-white text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
              62
            </span>
          </motion.div>

          {/* Live Date & Time Clock */}
          <LiveClock />

          {/* Admin Manager Profile Chip */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="text-right leading-tight">
              <div className="text-xs font-extrabold text-[#17152B]">Admin Manager</div>
              <div className="text-[10px] text-slate-400 font-semibold">Admin · ID: 1</div>
            </div>
            <div className="w-8.5 h-8.5 rounded-full bg-[#5B42F3] text-white font-extrabold text-xs flex items-center justify-center shadow-sm shadow-[#5B42F3]/25">
              AM
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 relative">
          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
