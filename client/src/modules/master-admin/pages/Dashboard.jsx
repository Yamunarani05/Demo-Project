import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CalendarCheck,
  CheckCircle,
  Clock,
  Download,
  IndianRupee,
  Receipt,
  Search,
  TrendingUp,
  Users,
  Zap,
  Activity,
  BarChart3,
  Building2,
  DollarSign,
  UserCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { date, flowLabel, label, money } from '../utils'
import Badge from '../ui/Badge'
import StatCard from '../ui/StatCard'
import Table from '../ui/Table'

const DASHBOARD_TABS = [
  ['overview', 'Overview'],
  ['focus', "Today's Focus"],
  ['team-finance', 'Team & Finance'],
  ['activity', 'Activity'],
]

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    api.dashboard().then(setData).finally(() => setLoading(false))
  }, [])

  const owner = data?.ownerDashboard
  const quickClients = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return []
    return (data?.recentClients || []).filter(client =>
      `${client.serialNumber} ${client.name} ${client.phone} ${client.email}`.toLowerCase().includes(term)
    )
  }, [data, search])

  if (loading) return <div className="loading">Loading owner dashboard...</div>
  if (!data || !owner) return <div className="card padded">No dashboard data available.</div>

  const health = owner.companyHealth || {}
  const finance = owner.financialSnapshot || {}
  const growth = owner.businessGrowthMetrics || {}
  const focus = owner.todayFocus || {}
  const team = owner.teamPerformance || {}
  const experience = owner.clientExperience || {}

  return (
    <div>
      <div className="page-head dashboard-head">
        <div>
          <h1>Owner Master Dashboard</h1>
          <p>Company health, operational bottlenecks, finance, team performance, automation, and growth in one view.</p>
        </div>
        <div className="head-actions">
          <div className="search-box dashboard-search">
            <Search size={18} />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Quick client search..." />
          </div>
          <button className="action-btn" onClick={() => downloadReport('daily', data)}>
            <Download size={16} />
            Daily
          </button>
          <button className="action-btn" onClick={() => downloadReport('monthly', data)}>
            <Download size={16} />
            Monthly
          </button>
        </div>
      </div>

      {search.trim() && (
        <div className="quick-search-results">
          {quickClients.length ? quickClients.map(client => (
            <Link key={client.id} to={`/sales/clients/${client.id}`}>
              <strong>{client.name}</strong>
              <span>{client.serialNumber} · {flowLabel(client.flowType)} · {money(client.invoiceBalance)} balance</span>
            </Link>
          )) : <span>No recent clients matched the search.</span>}
        </div>
      )}

      <div className="tabs">
        {DASHBOARD_TABS.map(([key, text]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={activeTab === key ? 'active' : ''}>{text}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab
          health={health}
          pipeline={owner.workflowPipeline}
          advanceRows={health.advancePaymentsReceived || []}
          data={data}
        />
      )}
      {activeTab === 'focus' && (
        <FocusTab
          focus={focus}
          alerts={owner.smartAlertCenter || []}
        />
      )}
      {activeTab === 'team-finance' && (
        <TeamFinanceTab
          team={team}
          finance={finance}
          growth={growth}
          automation={owner.automationControlCenter || []}
        />
      )}
      {activeTab === 'activity' && (
        <ActivityTab
          activity={owner.clientActivityPanel || []}
          experience={experience}
        />
      )}
    </div>
  )
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ health, pipeline, advanceRows, data }) {
  return (
    <div>
      <div className="section-title-row">
        <Building2 size={18} />
        <h2>Company Health</h2>
      </div>
      <div className="stat-grid owner-stat-grid">
        <StatCard title="Active Clients" value={health.totalActiveClients} subtitle="Open assignments" icon={<Users size={18} />} />
        <StatCard title="Team Present" value={health.teamActiveCount} subtitle="Today" icon={<UserCheck size={18} />} />
        <StatCard title="Today Shoots" value={health.todayShoots} subtitle="Events due" icon={<CalendarCheck size={18} />} />
        <StatCard title="Pending Deliveries" value={health.pendingDeliveries} subtitle="Not delivered" icon={<Clock size={18} />} />
        <StatCard title="Delayed Projects" value={health.delayedProjects} subtitle="Past event date" icon={<AlertTriangle size={18} />} />
        <StatCard title="Pending Payments" value={health.pendingPayments} subtitle="Balance due" icon={<Receipt size={18} />} />
        <StatCard title="This Month Income" value={money(health.thisMonthIncome)} subtitle="Collected" icon={<IndianRupee size={18} />} />
        <StatCard title="This Month Expenses" value={money(health.thisMonthExpenses)} subtitle="Operating costs" icon={<Receipt size={18} />} />
      </div>

      <div className="section-title-row">
        <BarChart3 size={18} />
        <h2>Workflow Pipeline</h2>
      </div>
      <div className="pipeline-grid">
        {(pipeline?.stages || []).map(stage => (
          <div className={`pipeline-stage ${stage.bottleneck ? 'bottleneck' : ''}`} key={stage.stage}>
            <span>{stage.stage}</span>
            <strong>{stage.totalClients}</strong>
            <small>{stage.averageCompletionDays} avg days</small>
          </div>
        ))}
      </div>
      {(pipeline?.bottlenecks || []).length > 0 && (
        <p className="section-note">
          Bottlenecks: {pipeline.bottlenecks.join(', ')}
        </p>
      )}

      <div className="section-title-row">
        <IndianRupee size={18} />
        <h2>Advance Payments Received</h2>
      </div>
      <Table headers={['Date', 'Sales Person', 'Client', 'Amount']} empty="No advance payments found.">
        {advanceRows.length ? advanceRows.map(row => (
          <tr key={`${row.clientId}-${row.amount}-${row.date}`}>
            <td>{date(row.date)}</td>
            <td>{label(row.salesPerson)}</td>
            <td><Link to={`/sales/clients/${row.clientId}`}>{row.client}</Link></td>
            <td>{money(row.amount)}</td>
          </tr>
        )) : null}
      </Table>
    </div>
  )
}

/* ─── TODAY'S FOCUS TAB ─── */
function FocusTab({ focus, alerts }) {
  const areas = [
    ['Follow-ups', focus.todayFollowUps?.length || 0],
    ['Due Deliveries', focus.todayDueDeliveries?.length || 0],
    ['Approvals Pending', focus.clientApprovalPending?.length || 0],
    ['Team Pending', focus.teamPendingTasks?.length || 0],
    ['Delayed Projects', focus.delayedProjects?.length || 0],
    ['Emergency Alerts', focus.emergencyAlerts?.length || 0],
  ]

  return (
    <div className="dashboard-grid two-col">
      <div className="card padded">
        <div className="card-title"><Bell size={18} /><strong>Today's Focus Areas</strong></div>
        <div className="mini-grid">
          {areas.map(([name, value]) => (
            <div className="metric" key={name}>
              <span>{name}</span>
              <strong style={{ color: value > 0 ? '#ef4444' : '#10b981' }}>{value}</strong>
            </div>
          ))}
        </div>
        {focus.teamPendingTasks?.length > 0 && (
          <>
            <h4 style={{ margin: '16px 0 8px', fontSize: 13, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Team Tasks</h4>
            <div className="mini-list">
              {focus.teamPendingTasks.slice(0, 6).map(item => (
                <div className="mini-list-row" key={item.id}>
                  <span>{item.task}</span>
                  <small>{item.client} · {item.employee || '-'}</small>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card padded">
        <div className="card-title"><AlertTriangle size={18} /><strong>Smart Alert Center</strong></div>
        {alerts.length > 0 ? (
          <div className="mini-list">
            {alerts.slice(0, 10).map((alert, idx) => (
              <div className="mini-list-row" key={`${alert.clientId}-${idx}`}>
                <span><SeverityDot severity={alert.severity} /> {alert.title}</span>
                <small>{alert.client} · {alert.detail}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="mini-empty">No alerts found.</div>
        )}
      </div>
    </div>
  )
}

/* ─── TEAM & FINANCE TAB ─── */
function TeamFinanceTab({ team, finance, growth, automation }) {
  const editorRows = team.editorWisePendingCount?.length ? team.editorWisePendingCount : []
  const designerRows = team.designerWorkload?.length ? team.designerWorkload : []

  return (
    <div>
      <div className="section-title-row">
        <Users size={18} />
        <h2>Team Performance</h2>
      </div>
      <div className="dashboard-grid two-col">
        <div className="card padded">
          <div className="card-title"><strong>Productivity Metrics</strong></div>
          <div className="mini-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <div className="metric"><span>CRM Follow-ups</span><strong>{team.crmFollowUpStatus?.pending || 0}</strong></div>
            <div className="metric"><span>Productivity</span><strong>{team.productivityPercentage || 0}%</strong></div>
            <div className="metric"><span>Late Tasks</span><strong style={{ color: (team.lateTaskReport?.length || 0) > 0 ? '#ef4444' : '#10b981' }}>{team.lateTaskReport?.length || 0}</strong></div>
          </div>
          {editorRows.length > 0 && (
            <>
              <h4 className="mini-heading">Editor Workload</h4>
              <div className="mini-list">
                {editorRows.slice(0, 5).map(row => (
                  <div className="mini-list-row" key={row.employeeId}>
                    <span>{row.name}</span>
                    <small>{row.pendingCount} pending</small>
                  </div>
                ))}
              </div>
            </>
          )}
          {designerRows.length > 0 && (
            <>
              <h4 className="mini-heading">Designer Workload</h4>
              <div className="mini-list">
                {designerRows.slice(0, 5).map(row => (
                  <div className="mini-list-row" key={row.employeeId}>
                    <span>{row.name}</span>
                    <small>{row.workload} tasks</small>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card padded">
          <div className="card-title"><strong>Financial Snapshot</strong></div>
          <div className="finance-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
            <div className="metric"><span>Monthly Revenue</span><strong>{money(finance.monthlyRevenue)}</strong></div>
            <div className="metric"><span>Monthly Expenses</span><strong>{money(finance.monthlyExpenses)}</strong></div>
            <div className="metric"><span>Pending Balances</span><strong>{money(finance.pendingBalances)}</strong></div>
            <div className="metric"><span>Advance Received</span><strong>{money(finance.advanceReceived)}</strong></div>
            <div className="metric"><span>Avg Project Value</span><strong>{money(finance.averageProjectValue)}</strong></div>
            <div className="metric"><span>Top Package</span><strong>{finance.topSellingPackage || '-'}</strong></div>
          </div>
        </div>
      </div>

      <div className="section-title-row">
        <TrendingUp size={18} />
        <h2>Growth & Automation</h2>
      </div>
      <div className="dashboard-grid two-col">
        <div className="card padded">
          <div className="card-title"><strong>Business Growth</strong></div>
          <div className="mini-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <div className="metric"><span>Monthly Growth</span><strong>{growth.monthlyGrowthPercentage || 0}%</strong></div>
            <div className="metric"><span>Lead to Booking</span><strong>{growth.leadToBookingConversionRatio || 0}%</strong></div>
            <div className="metric"><span>Repeat Clients</span><strong>{growth.repeatClientCount || 0}</strong></div>
            <div className="metric"><span>Referrals</span><strong>{growth.referralClientCount || 0}</strong></div>
            <div className="metric"><span>Avg Delivery Time</span><strong>{growth.averageDeliveryTime || 0} days</strong></div>
            <div className="metric"><span>Most Profitable</span><strong>{growth.mostProfitablePackage || '-'}</strong></div>
          </div>
        </div>

        <div className="card padded">
          <div className="card-title"><Zap size={18} /><strong>Automation Control</strong></div>
          <div className="automation-list">
            {automation.map(row => (
              <div className="automation-row" key={row.name}>
                <span>{row.name}</span>
                <Badge value={row.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── ACTIVITY TAB ─── */
function ActivityTab({ activity, experience }) {
  return (
    <div className="dashboard-grid two-col">
      <div className="card padded">
        <div className="card-title"><Activity size={18} /><strong>Client Activity Panel</strong></div>
        {activity.length > 0 ? (
          <div className="mini-list">
            {activity.map((row, idx) => (
              <div className="mini-list-row" key={`${row.clientId}-${idx}`}>
                <span>{row.type}</span>
                <small>{row.client} · {date(row.date)}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="mini-empty">No recent client activity.</div>
        )}
      </div>

      <div className="card padded">
        <div className="card-title"><CheckCircle size={18} /><strong>Client Experience</strong></div>
        <div className="mini-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <div className="metric"><span>Feedbacks</span><strong>{experience.feedbackCount || 0}</strong></div>
          <div className="metric"><span>Avg Rating</span><strong>{experience.averageRating || 0}</strong></div>
          <div className="metric"><span>Google Review Ready</span><strong>{experience.googleReviewTriggerReady || 0}</strong></div>
        </div>
        {(experience.deliveryCompletedClients || []).length > 0 && (
          <>
            <h4 className="mini-heading">Delivery Completed</h4>
            <div className="mini-list">
              {experience.deliveryCompletedClients.slice(0, 6).map(row => (
                <div className="mini-list-row" key={row.clientId}>
                  <span>{row.client}</span>
                  <small>{row.eventType} · Review ready</small>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── SHARED COMPONENTS ─── */

function SeverityDot({ severity }) {
  return <i className={`severity-dot ${severity || 'green'}`} />
}

function downloadReport(type, data) {
  const payload = {
    reportType: type,
    generatedAt: new Date().toISOString(),
    ownerDashboard: data.ownerDashboard,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `master-dashboard-${type}-report.json`
  link.click()
  URL.revokeObjectURL(url)
}