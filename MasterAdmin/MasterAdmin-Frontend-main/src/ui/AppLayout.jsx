import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, Briefcase, CalendarCheck, FileText, LayoutDashboard, LogOut, Receipt, Users } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'
import { Toaster } from 'sonner'

const nav = [
  { to: '/sales/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sales/clients', icon: Users, label: 'Clients' },
  { to: '/sales/employees', icon: Briefcase, label: 'Production Staff' },
  { to: '/sales/work-tracker', icon: BarChart3, label: 'Work Tracker' },
  { to: '/sales/invoices', icon: Receipt, label: 'Invoices' },
  { to: '/sales/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/sales/reports', icon: FileText, label: 'Reports' },
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
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #5b5fc7)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 16 }}>DP</div>
          <div>
            <div className="brand-name">Demo Studio</div>
            <div className="brand-sub">Master Admin</div>
          </div>
        </div>
        <div className="sidebar-divider" />
        <div className="nav-label">Master Operations</div>
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
        <button
          className="logout"
          onClick={() => {
            localStorage.removeItem('master_admin_token')
            localStorage.removeItem('master_admin_user')
            navigate('/login')
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
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
