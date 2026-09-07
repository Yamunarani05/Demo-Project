import React, { useEffect, useState } from 'react'
import {
  Building2,
  MonitorPlay,
  Zap,
  CreditCard,
  Clock,
  TrendingUp,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MapPin,
  Camera,
  Users,
  MoreVertical,
  Share2,
  Edit3,
  Plus,
  ArrowRight,
  Check,
  Video,
  FileText,
  Sparkles,
  Award,
  Bell,
  CheckSquare,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { api } from '../api'

/* ─── Performance Chart Data (May–Sept 2026) ─── */
const performanceData = [
  { month: 'May 2026', demoRequests: 8, freeTrials: 4, paidStudios: 2 },
  { month: 'Jun 2026', demoRequests: 11, freeTrials: 5, paidStudios: 3 },
  { month: 'Jul 2026', demoRequests: 14, freeTrials: 6, paidStudios: 4 },
  { month: 'Aug 2026', demoRequests: 22, freeTrials: 11, paidStudios: 7 },
  { month: 'Sept 2026', demoRequests: 18, freeTrials: 9, paidStudios: 10 },
]

/* ─── 5 Quick Access Cards Config ─── */
const quickCards = [
  {
    label: 'Total Studios',
    title: 'Registered Studios',
    value: 11,
    icon: Building2,
    iconBg: '#ECE8FD',
    iconColor: '#5B42F3',
    link: '/sales/clients',
    linkText: 'View →',
  },
  {
    label: 'Demo Requests',
    title: 'Inquiries & Demos',
    value: 18,
    icon: MonitorPlay,
    iconBg: '#FFF4EC',
    iconColor: '#F97316',
  },
  {
    label: 'Free Trial',
    title: 'Active Trials',
    value: 1,
    icon: Zap,
    iconBg: '#F3E8FF',
    iconColor: '#8B5CF6',
  },
  {
    label: 'Paid Studios',
    title: 'Subscribed Clients',
    value: 10,
    icon: CreditCard,
    iconBg: '#E8F8F0',
    iconColor: '#10B981',
  },
  {
    label: 'Pending Approvals',
    title: 'Waiting for Review',
    value: 1,
    badge: 'Action Needed',
    icon: Clock,
    iconBg: '#FFE4E6',
    iconColor: '#F43F5E',
    link: '/sales/work-tracker',
  },
]

/* ─── Circular SVG Progress Ring Component ─── */
function ProgressRing({ percentage, color = '#5B42F3', size = 52, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="progress-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring-svg">
        <circle
          stroke="#f1f5f9"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="progress-ring-text">{percentage}%</span>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(5)

  useEffect(() => {
    api.dashboard().then(setData).finally(() => setLoading(false))
  }, [])

  return (
    <div className="dashboard-modular-page">
      {/* 3-Column Layout: Left 2-Col Main Flow + Right 1-Col Widgets */}
      <div className="dashboard-3col-layout">
        {/* ─── LEFT 2-COLUMN MAIN FLOW ─── */}
        <div className="dashboard-main-flow">
          {/* 1. Hero Header & Quick Access Horizontal Row */}
          <div className="hero-modular-card">
            <div className="hero-text-content">
              <div className="hero-greeting-pill">
                <Sparkles size={13} />
                <span>Master Operations Portal</span>
              </div>
              <h1 className="hero-title-main">
                Welcome Back, <span className="hero-name-accent">Master Admin!</span>
              </h1>
              <p className="hero-subtitle-main">
                Monitor studios, demo requests, trials, payments, approvals, and platform activity.
              </p>
            </div>

            {/* 5 Quick Action Metric Cards in horizontal scroll / flex row */}
            <div className="hero-quick-row">
              {quickCards.map((card, idx) => {
                const Icon = card.icon
                return (
                  <div
                    key={idx}
                    className={`hero-metric-mini ${card.link ? 'clickable' : ''}`}
                    onClick={() => card.link && navigate(card.link)}
                  >
                    <div className="mini-icon-circle" style={{ background: card.iconBg, color: card.iconColor }}>
                      <Icon size={18} />
                    </div>
                    <div className="mini-content">
                      <div className="mini-metric-num">{card.value}</div>
                      <div className="mini-metric-title">{card.title}</div>
                      {card.badge && (
                        <span className="mini-metric-badge">{card.badge}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. Middle Section — 3 Circular Progress Rings & KPI Summary */}
          <div className="progress-rings-row">
            {/* Ring Card 1: Conversion Rate */}
            <div className="ring-kpi-card">
              <div className="ring-card-top">
                <ProgressRing percentage={55.6} color="#5B42F3" size={54} strokeWidth={5} />
                <div className="ring-card-titles">
                  <span className="ring-category-tag violet">CONVERSION FUNNEL</span>
                  <h3 className="ring-card-title">Demo to Paid</h3>
                  <p className="ring-card-sub">10 of 18 demo leads converted</p>
                </div>
              </div>
              <div className="ring-card-footer">
                <span className="ring-footer-meta">55.6% overall ratio</span>
                <button
                  type="button"
                  className="ring-action-pill"
                  onClick={() => navigate('/sales/clients')}
                >
                  Check →
                </button>
              </div>
            </div>

            {/* Ring Card 2: Trial Activation */}
            <div className="ring-kpi-card">
              <div className="ring-card-top">
                <ProgressRing percentage={71.4} color="#8B5CF6" size={54} strokeWidth={5} />
                <div className="ring-card-titles">
                  <span className="ring-category-tag purple">TRIAL ACTIVATION</span>
                  <h3 className="ring-card-title">Active Trials</h3>
                  <p className="ring-card-sub">5 of 7 completed trials upgraded</p>
                </div>
              </div>
              <div className="ring-card-footer">
                <span className="ring-footer-meta">1 trial in progress</span>
                <button
                  type="button"
                  className="ring-action-pill"
                  onClick={() => navigate('/sales/clients')}
                >
                  Check →
                </button>
              </div>
            </div>

            {/* Ring Card 3: Payment Completion */}
            <div className="ring-kpi-card">
              <div className="ring-card-top">
                <ProgressRing percentage={90.9} color="#10B981" size={54} strokeWidth={5} />
                <div className="ring-card-titles">
                  <span className="ring-category-tag green">BILLING & INVOICING</span>
                  <h3 className="ring-card-title">Payment Settled</h3>
                  <p className="ring-card-sub">10 active studios fully settled</p>
                </div>
              </div>
              <div className="ring-card-footer">
                <span className="ring-footer-meta">0 overdue invoices</span>
                <button
                  type="button"
                  className="ring-action-pill"
                  onClick={() => navigate('/sales/reports')}
                >
                  Check →
                </button>
              </div>
            </div>
          </div>

          {/* 3. Action Items / To-Do Row (Dark Card + Light Card) */}
          <div className="todo-section-wrap">
            <div className="section-header-row">
              <h2 className="section-title">To do list</h2>
              <div className="section-header-actions">
                <button type="button" className="icon-tiny-btn" title="Share">
                  <Share2 size={14} />
                </button>
                <button type="button" className="icon-tiny-btn" title="Edit">
                  <Edit3 size={14} />
                </button>
              </div>
            </div>

            <div className="todo-cards-grid">
              {/* Card 1: High-contrast Dark Card */}
              <div className="todo-card-dark">
                <div className="todo-card-badge-row">
                  <span className="dark-badge-pill">URGENT</span>
                  <span className="dark-badge-category">Studio Verification</span>
                </div>
                <h3 className="todo-dark-title">Pending Access Approvals</h3>
                <p className="todo-dark-desc">
                  Review 1 new studio verification: <strong>Hii team</strong> (Admin: Yamunarani RG, Salem, TN).
                </p>
                <div className="todo-dark-footer">
                  <button
                    type="button"
                    className="todo-dark-btn"
                    onClick={() => navigate('/sales/work-tracker')}
                  >
                    Review Now →
                  </button>
                  <div className="todo-avatar-stamp">
                    <span className="avatar-chip">YR</span>
                    <span className="avatar-chip-name">Yamunarani</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Secondary Light Card */}
              <div className="todo-card-light">
                <div className="todo-card-badge-row">
                  <span className="light-badge-pill orange">High Priority</span>
                  <span className="light-badge-category">Lead Pipeline</span>
                </div>
                <h3 className="todo-light-title">Lead Acquisition Follow-up</h3>
                <p className="todo-light-desc">
                  18 demo requests waiting for slot confirmation and customer dispatch.
                </p>
                <div className="todo-light-footer">
                  <button
                    type="button"
                    className="todo-light-btn"
                    onClick={() => navigate('/sales/clients')}
                  >
                    Schedule Demos →
                  </button>
                  <div className="todo-avatar-stamp">
                    <span className="avatar-chip violet">MA</span>
                    <span className="avatar-chip-name">Master Admin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Detailed Activity Pipeline ("My assignments" style table) */}
          <div className="assignments-section-card">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">My assignments & studio activity</h2>
                <p className="section-subtitle">Real-time studio milestones, assignments, and onboarding pipeline.</p>
              </div>
              <div className="section-header-actions">
                <button type="button" className="icon-tiny-btn" title="Edit">
                  <Edit3 size={14} />
                </button>
                <button type="button" className="icon-tiny-btn" title="Share">
                  <Share2 size={14} />
                </button>
              </div>
            </div>

            <div className="assignment-rows-list">
              {/* Row 1 */}
              <div className="assignment-row-item">
                <div className="assign-icon-box lavender">
                  <Camera size={16} />
                </div>
                <div className="assign-info-col">
                  <div className="assign-title">Studio Moments · ₹45,000</div>
                  <div className="assign-date">05 Sept 2026 · 11:30 AM</div>
                </div>
                <div className="assign-duration-col">
                  <span className="assign-duration-val">45 mins ago</span>
                  <span className="assign-duration-lbl">Duration</span>
                </div>
                <div className="assign-progress-col">
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill green" style={{ width: '100%' }} />
                  </div>
                  <span className="progress-pct-text">100%</span>
                </div>
                <div className="assign-ratio-col">1 / 1</div>
                <div className="assign-date-col">05 Sept</div>
                <div className="assign-action-col">
                  <button
                    type="button"
                    className="assign-action-pill"
                    onClick={() => navigate('/sales/reports')}
                  >
                    Details
                  </button>
                </div>
              </div>

              {/* Row 2 */}
              <div className="assignment-row-item">
                <div className="assign-icon-box orange">
                  <Video size={16} />
                </div>
                <div className="assign-info-col">
                  <div className="assign-title">Studio Aurora · Rahul & Ananya</div>
                  <div className="assign-date">04 Sept 2026 · 02:15 PM</div>
                </div>
                <div className="assign-duration-col">
                  <span className="assign-duration-val">02 h 15 m</span>
                  <span className="assign-duration-lbl">Duration</span>
                </div>
                <div className="assign-progress-col">
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill violet" style={{ width: '80%' }} />
                  </div>
                  <span className="progress-pct-text">80%</span>
                </div>
                <div className="assign-ratio-col">4 / 5</div>
                <div className="assign-date-col">04 Sept</div>
                <div className="assign-action-col">
                  <button
                    type="button"
                    className="assign-action-pill"
                    onClick={() => navigate('/sales/clients')}
                  >
                    View
                  </button>
                </div>
              </div>

              {/* Row 3 */}
              <div className="assignment-row-item">
                <div className="assign-icon-box blue">
                  <Users size={16} />
                </div>
                <div className="assign-info-col">
                  <div className="assign-title">Studio DreamFrame · 3 Photographers</div>
                  <div className="assign-date">03 Sept 2026 · 09:45 AM</div>
                </div>
                <div className="assign-duration-col">
                  <span className="assign-duration-val">04 h 15 m</span>
                  <span className="assign-duration-lbl">Duration</span>
                </div>
                <div className="assign-progress-col">
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill blue" style={{ width: '65%' }} />
                  </div>
                  <span className="progress-pct-text">65%</span>
                </div>
                <div className="assign-ratio-col">2 / 3</div>
                <div className="assign-date-col">03 Sept</div>
                <div className="assign-action-col">
                  <button
                    type="button"
                    className="assign-action-pill"
                    onClick={() => navigate('/sales/employees')}
                  >
                    Manage
                  </button>
                </div>
              </div>

              {/* Row 4 */}
              <div className="assignment-row-item">
                <div className="assign-icon-box rose">
                  <ShieldAlert size={16} />
                </div>
                <div className="assign-info-col">
                  <div className="assign-title">Hii team · Studio Access Request</div>
                  <div className="assign-date">05 Sept 2026 · 10:15 AM</div>
                </div>
                <div className="assign-duration-col">
                  <span className="assign-duration-val">Just now</span>
                  <span className="assign-duration-lbl">Duration</span>
                </div>
                <div className="assign-progress-col">
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill rose" style={{ width: '25%' }} />
                  </div>
                  <span className="progress-pct-text">25%</span>
                </div>
                <div className="assign-ratio-col">1 / 4</div>
                <div className="assign-date-col">Today</div>
                <div className="assign-action-col">
                  <button
                    type="button"
                    className="assign-action-pill highlight"
                    onClick={() => navigate('/sales/work-tracker')}
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>

            {/* Add New Studio / Assignment Button */}
            <button
              type="button"
              className="add-assignment-btn"
              onClick={() => navigate('/sales/clients')}
            >
              <Plus size={16} />
              <span>Add new studio or demo request</span>
            </button>
          </div>

          {/* 5. Performance Analytics Chart (Preserving All Existing Metrics) */}
          <div className="performance-modular-card">
            <div className="performance-header">
              <div>
                <h2 className="card-title">Performance Analytics</h2>
                <p className="card-subtitle">Demo requests, trials and paid conversions over the last 5 months.</p>
              </div>
              <button className="date-picker-trigger" type="button">
                <span>01/09/2026</span>
                <Calendar size={15} color="#64748b" />
              </button>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={performanceData} margin={{ top: 15, right: 25, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="demoAreaGradMod" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="trialAreaGradMod" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="paidAreaGradMod" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#f1f5f9' }}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="demoRequests"
                  name="Demo Requests"
                  stroke="#F97316"
                  strokeWidth={3}
                  fill="url(#demoAreaGradMod)"
                  dot={{ r: 4, fill: '#ffffff', stroke: '#F97316', strokeWidth: 2.5 }}
                  activeDot={{ r: 6, fill: '#F97316', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="freeTrials"
                  name="Free Trials"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fill="url(#trialAreaGradMod)"
                  dot={{ r: 4, fill: '#ffffff', stroke: '#8B5CF6', strokeWidth: 2.5 }}
                  activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="paidStudios"
                  name="Paid Studios"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#paidAreaGradMod)"
                  dot={{ r: 4, fill: '#ffffff', stroke: '#10B981', strokeWidth: 2.5 }}
                  activeDot={{ r: 6, fill: '#10B981', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="chart-legend">
              <div className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: '#F97316' }} />
                <span>Demo Requests</span>
              </div>
              <div className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: '#8B5CF6' }} />
                <span>Free Trials</span>
              </div>
              <div className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: '#10B981' }} />
                <span>Paid Studios</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT 1-COLUMN SIDEBAR WIDGETS ─── */}
        <div className="dashboard-side-widgets">
          {/* Widget 1: Mini Calendar & Schedule */}
          <div className="widget-card calendar-widget">
            <div className="calendar-widget-header">
              <h3 className="calendar-title">September 2026</h3>
              <div className="calendar-nav-arrows">
                <button type="button" className="cal-arrow-btn">
                  <ChevronLeft size={14} />
                </button>
                <button type="button" className="cal-arrow-btn">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="calendar-days-row">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Dates strip */}
            <div className="calendar-dates-row">
              {[
                { day: 31, d: '31', isCurrent: false },
                { day: 1, d: '01', isCurrent: true },
                { day: 2, d: '02', isCurrent: true },
                { day: 3, d: '03', isCurrent: true },
                { day: 4, d: '04', isCurrent: true },
                { day: 5, d: '05', isCurrent: true, isToday: true },
                { day: 6, d: '06', isCurrent: true },
              ].map(item => (
                <button
                  key={item.d}
                  type="button"
                  className={`cal-date-btn ${item.isToday ? 'active-today' : ''} ${!item.isCurrent ? 'muted' : ''}`}
                  onClick={() => setSelectedDay(item.day)}
                >
                  {item.d}
                </button>
              ))}
            </div>

            <div className="widget-divider" />

            {/* Timeline Schedule Items */}
            <div className="schedule-timeline-list">
              <div className="timeline-slot">
                <div className="timeline-time">10:30–12:00</div>
                <div className="timeline-event-box">
                  <div className="timeline-event-icon orange">
                    <Video size={14} />
                  </div>
                  <div className="timeline-event-info">
                    <div className="timeline-event-title">Studio Demo Call</div>
                    <div className="timeline-event-sub">10:30–12:00 · Rahul & Ananya</div>
                  </div>
                  <button type="button" className="timeline-dots-btn">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>

              <div className="timeline-slot">
                <div className="timeline-time">12:30–13:30</div>
                <div className="timeline-event-box">
                  <div className="timeline-event-icon rose">
                    <ShieldCheck size={14} />
                  </div>
                  <div className="timeline-event-info">
                    <div className="timeline-event-title">Studio Access Verification</div>
                    <div className="timeline-event-sub">12:30–13:30 · Hii team Review</div>
                  </div>
                  <button type="button" className="timeline-dots-btn">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>

              <div className="timeline-slot">
                <div className="timeline-time">15:00–16:30</div>
                <div className="timeline-event-box">
                  <div className="timeline-event-icon green">
                    <CreditCard size={14} />
                  </div>
                  <div className="timeline-event-info">
                    <div className="timeline-event-title">Payment Settlement</div>
                    <div className="timeline-event-sub">15:00–16:30 · Razorpay Sync</div>
                  </div>
                  <button type="button" className="timeline-dots-btn">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 2: Notifications & Board Meeting Card */}
          <div className="widget-card notification-widget">
            <div className="widget-header-flex">
              <div className="notif-title-wrap">
                <Bell size={16} className="notif-bell-icon" />
                <h3 className="widget-title">Notifications</h3>
              </div>
              <button type="button" className="clear-link-btn">
                Clear
              </button>
            </div>

            {/* Upcoming Event Chip */}
            <div className="upcoming-event-pill-card">
              <div className="event-pill-top">
                <span className="event-pill-title">Upcoming System Audit</span>
                <span className="event-pill-time">Time: 45 min</span>
              </div>
              <div className="event-pill-date">Wed, 09 Sept · 11:00 AM – 11:45 AM</div>
            </div>

            {/* Board Meeting / Studio Review Card */}
            <div className="board-meeting-card">
              <div className="meeting-card-header">
                <div>
                  <h4 className="meeting-title">Studio License Review</h4>
                  <div className="meeting-meta-date">Sept 05 at 4:00 PM</div>
                </div>
                <button type="button" className="meeting-edit-icon" title="Edit Review">
                  <Edit3 size={13} />
                </button>
              </div>

              <p className="meeting-desc">
                Review annual subscription upgrade with Studio DreamFrame admin.
              </p>

              <div className="meeting-actions-row">
                <button type="button" className="meeting-btn-outline">
                  Reschedule
                </button>
                <button
                  type="button"
                  className="meeting-btn-accept"
                  onClick={() => navigate('/sales/work-tracker')}
                >
                  Accept Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}