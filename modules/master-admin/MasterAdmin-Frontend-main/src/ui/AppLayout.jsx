import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Camera,
  LayoutDashboard,
  Building2,
  CheckSquare,
  FolderKanban,
  Users,
  Clock,
  LogOut,
  Home,
  Search,
  Plus,
  ChevronRight,
  HelpCircle,
  Sparkles,
} from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'
import { Toaster } from 'sonner'

const nav = [
  { to: '/sales/dashboard', icon: LayoutDashboard, label: 'Dashboard Overview' },
  { to: '/sales/clients', icon: Building2, label: 'Studios Overview' },
  { to: '/sales/work-tracker', icon: CheckSquare, label: 'Access Requests', badge: 1 },
  { to: '/sales/reports', icon: FolderKanban, label: 'Client Monitoring' },
  { to: '/sales/employees', icon: Users, label: 'Employee Monitoring' },
  { to: '/sales/attendance', icon: Clock, label: 'Activity Monitoring' },
]

function LiveDateTime() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <div className="topbar-datetime">
      <span className="topbar-date">{dateStr}</span>
      <span className="topbar-time">{timeStr}</span>
    </div>
  )
}

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('master_admin_user') || '{}')
  const [globalSearch, setGlobalSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Studios')

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="app-shell">
        {/* Left Sidebar */}
        <aside className="sidebar">
          {/* Top Branding Card */}
          <div className="brand" onClick={() => navigate('/sales/dashboard')}>
            <div className="brand-mark">
              <Camera size={22} />
            </div>
            <div className="brand-text">
              <div className="brand-name">DEMO STUDIO</div>
              <div className="brand-badge">MASTER ADMIN</div>
            </div>
          </div>

          {/* Admin Profile snippet integrated into sidebar */}
          <div className="sidebar-profile-card">
            <div className="avatar">MA</div>
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">Master Admin</span>
              <span className="sidebar-profile-id">Salem, India · ID: 1</span>
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* Navigation Menu */}
          <nav className="sidebar-nav">
            {nav.map((item, idx) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to + idx}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-item-content">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Floating Help & System Logs Widget */}
          <div className="sidebar-help-card">
            <div className="help-icon-bubble">
              <HelpCircle size={18} />
            </div>
            <h4 className="help-card-title">Help Center</h4>
            <p className="help-card-desc">Have a problem? Check system logs or reach out.</p>
            <button
              type="button"
              className="help-card-btn"
              onClick={() => navigate('/sales/attendance')}
            >
              System Logs
            </button>
          </div>

          {/* Bottom links */}
          <div className="sidebar-bottom">
            <a
              href="http://localhost:5174/"
              className="sidebar-link-btn"
            >
              <Home size={15} />
              <span>← Landing Page</span>
            </a>

            <button
              className="logout"
              onClick={() => {
                localStorage.removeItem('master_admin_token')
                localStorage.removeItem('master_admin_user')
                navigate('/login')
              }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <section className="content-shell">
          {/* Top Header Bar */}
          <header className="topbar">
            {/* Left: Filter/Category Pills */}
            <div className="topbar-filter-pills">
              {['All Studios', 'Pending Actions', 'Analytics'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  className={`filter-pill ${activeCategory === tab ? 'active' : ''}`}
                  onClick={() => setActiveCategory(tab)}
                >
                  {tab === 'All Studios' && <Sparkles size={13} />}
                  <span>{tab}</span>
                </button>
              ))}
            </div>

            {/* Center: Global Search Bar */}
            <div className="topbar-search-wrap">
              <Search size={15} className="topbar-search-icon" />
              <input
                type="text"
                placeholder="Search studios, clients, or requests..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="topbar-search-input"
              />
            </div>

            {/* Right: Quick Action, Notification Bell, Date/Time */}
            <div className="topbar-right">
              <button
                type="button"
                className="quick-action-btn"
                onClick={() => navigate('/sales/clients')}
              >
                <Plus size={15} />
                <span>Add Studio</span>
              </button>

              <NotificationDropdown />

              <LiveDateTime />
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
