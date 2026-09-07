import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Briefcase,
  CalendarCheck,
  Camera,
  Database,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'
import { Toaster } from 'sonner'

const nav = [
  { to: '/sales/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sales/clients', icon: Users, label: 'Clients' },
  { to: '/sales/employees', icon: Briefcase, label: 'Employees' },
  { to: '/sales/work-tracker', icon: BarChart3, label: 'Work Tracker' },
  { to: '/sales/invoices', icon: Receipt, label: 'Invoices' },
  { to: '/sales/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/sales/reports', icon: FileText, label: 'Reports' },
]

const preprodNav = [
  { to: '/pre-production/dashboard', icon: Camera, label: 'Pre-prod Dashboard' },
  { to: '/pre-production/client', icon: Users, label: 'Assign Client' },
  { to: '/pre-production/raw-data', icon: Database, label: 'Raw Data' },
  { to: '/pre-production/qc-check', icon: ShieldCheck, label: 'QC Checking' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('master_admin_user') || '{}')

  return (
    <>
      <Toaster />
      <div className="app-shell">
      <aside className="sidebar">
        <div className="brand" onClick={() => navigate('/sales/dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-[#5E35B1] flex items-center justify-center text-white shadow-md shadow-purple-900/20 shrink-0">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="font-extrabold text-sm tracking-wider uppercase text-[#5E35B1] font-display leading-tight">
              DEMO PROJECT
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold -mt-0.5">
              Master Admin
            </div>
          </div>
        </div>
        <div className="sidebar-divider" />
        
        <div className="nav-label">Master Admin</div>
        <nav>
          {nav.map(item => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-divider my-3" />
        <div className="nav-label flex items-center justify-between">
          <span>Pre-production</span>
          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">Phase 1</span>
        </div>
        <nav>
          {preprodNav.map(item => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto pt-4">
          <NavLink to="/" className="nav-item mb-2 text-slate-500 hover:text-purple-600">
            <Home size={16} />
            <span>← Landing Page</span>
          </NavLink>
          <button
            className="logout"
            onClick={() => {
              localStorage.removeItem('master_admin_token')
              localStorage.removeItem('master_admin_user')
              navigate('/')
            }}
          >
            <LogOut size={16} />
            Exit Demo
          </button>
        </div>
      </aside>

      <section className="content-shell">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: 'auto' }}>
            <NotificationDropdown />
            <div className="user-block">
              <div className="user-text">
              <strong>{user.name || 'Master Admin'}</strong>
              <span>Master Admin</span>
            </div>
            <div className="avatar">{(user.name || 'M').charAt(0).toUpperCase()}</div>
          </div>
          </div>
        </header>
        <main className="page-body">
          <Outlet />
        </main>
      </section>
    </div>
    </>
  )
}
