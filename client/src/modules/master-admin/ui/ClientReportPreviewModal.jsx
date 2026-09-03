import React, { useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3, Briefcase, CheckCircle, Clock, FileText, IndianRupee, UserRound, Users, AlertCircle } from 'lucide-react'
import { date, flowLabel, label, money } from '../utils'
import Badge from './Badge'

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#8b5cf6']

export default function ClientReportPreviewModal({ isOpen, onClose, state }) {
  const contentRef = useRef(null)
  if (!isOpen || !state) return null

  const { client, employees = [], invoices = [], report } = state
  const invoice = invoices[0] || {}
  const workStats = report?.workProgress || {}
  const blockers = Array.isArray(report?.blockers) ? report.blockers : []
  const milestoneRows = Array.isArray(report?.milestones) ? report.milestones : []
  const activityLog = Array.isArray(report?.activityLog) ? report.activityLog : []
  const phaseBreakdown = Array.isArray(report?.phaseBreakdown) ? report.phaseBreakdown : []
  const overdueItems = Array.isArray(report?.overdue) ? report.overdue : []

  const totalTasks = workStats.total || 0
  const completedTasks = workStats.completed || 0
  const pendingTasks = workStats.pending || 0
  const overdueTasks = workStats.overdue || 0
  const progressPercent = workStats.completionPercent || 0
  const onTimePercent = workStats.onTimePercent || 0
  const attendanceRate = report?.attendanceRate || 0

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const handleDownloadPDF = async () => {
    const element = contentRef.current
    if (!element) return
    try {
      const html2pdf = (await import('html2pdf.js')).default
      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename: `Report-${client.serialNumber || client.id}.pdf`,
          html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(element)
        .save()
    } catch (err) {
      console.error('PDF download failed:', err)
    }
  }

  const workStatusData = [
    { name: 'Completed', value: completedTasks },
    { name: 'In Progress', value: pendingTasks - overdueTasks },
    { name: 'Overdue', value: overdueTasks },
  ].filter(d => d.value > 0)

  const phaseChartData = phaseBreakdown.map(p => ({
    phase: label(p.phase),
    Completed: p.completed,
    Pending: p.pending,
  }))

  const allIssues = [...new Map([...overdueItems, ...blockers].map(item => [item.id, item])).values()]

  return (
    <div className="inv-modal-overlay" onClick={onClose}>
      <div className="inv-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: 900 }}>
        <div className="inv-modal-header">
          <h2>Client Report — {client.name}</h2>
          <div className="inv-modal-header-actions">
            <button onClick={handleDownloadPDF} className="inv-modal-btn inv-btn-download" title="Download PDF">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <button onClick={onClose} className="inv-modal-btn inv-btn-close" title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div className="inv-modal-scroll" style={{ background: '#f3f4f6' }}>
          <div ref={contentRef} className="comprehensive-report" style={{ width: 780, minWidth: 780, margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>

            {/* COVER PAGE */}
            <section className="report-cover-page">
              <div className="report-cover-brand-band" />
              <div className="report-cover-content">
                <div className="report-cover-logo-placeholder">
                  <span className="report-cover-logo-text">RA</span>
                </div>
                <h1 className="report-cover-title">Comprehensive Client Report</h1>
                <div className="report-cover-divider" />
                <div className="report-cover-event">
                  <span className="report-cover-event-label">Event</span>
                  <span className="report-cover-event-value">{client.eventType || 'N/A'}</span>
                </div>
                <div className="report-cover-client-name">{client.name}</div>
                <table className="report-cover-meta">
                  <tbody>
                    <tr><td>Lead ID</td><td>{client.serialNumber || client.id || 'N/A'}</td></tr>
                    <tr><td>Event Date</td><td>{date(client.eventDate) || 'N/A'}</td></tr>
                    <tr><td>Flow Type</td><td>{flowLabel(client.flowType)}</td></tr>
                    <tr><td>Generated On</td><td>{dateStr} at {timeStr}</td></tr>
                    <tr><td>Report ID</td><td>RPT-{String(client.serialNumber || client.id || 'NA').replace(/[^a-zA-Z0-9]/g, '-')}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="report-cover-footer-text">Red Angle Master Admin · Confidential</div>
            </section>

            {/* EXECUTIVE SUMMARY */}
            <section className="report-section">
              <h1 className="report-section-header">1. Executive Summary</h1>
              <p className="report-section-desc">High-level snapshot of the client engagement, key outcomes, and critical metrics.</p>
              <div className="report-kpi-grid">
                {[
                  { icon: <CheckCircle size={20} />, bg: '#ecfdf5', fg: '#10b981', label: 'Work Completion', value: `${progressPercent}%`, sub: `${completedTasks} of ${totalTasks} tasks` },
                  { icon: <IndianRupee size={20} />, bg: '#fef3c7', fg: '#f59e0b', label: 'Outstanding Balance', value: money(invoice.balance || 0), sub: `Total: ${money(invoice.total || 0)}` },
                  { icon: <Users size={20} />, bg: '#dbeafe', fg: '#3b82f6', label: 'Assigned Team', value: employees.length, sub: 'Active members' },
                  { icon: <AlertCircle size={20} />, bg: '#ede9fe', fg: '#8b5cf6', label: 'Active Blockers', value: blockers.length, sub: blockers.length > 0 ? 'Require attention' : 'No blockers' },
                  { icon: <Clock size={20} />, bg: '#f3f4f6', fg: '#6b7280', label: 'Overdue Tasks', value: overdueTasks, sub: overdueTasks > 0 ? 'Past deadline' : 'On track' },
                  { icon: <UserRound size={20} />, bg: '#ecfdf5', fg: '#10b981', label: 'Attendance Rate', value: `${attendanceRate}%`, sub: 'Overall attendance' },
                ].map((k, i) => (
                  <div className="report-kpi-card" key={i}>
                    <div className="report-kpi-icon" style={{ background: k.bg, color: k.fg }}><span>{k.icon.props.children}</span></div>
                    <div className="report-kpi-label">{k.label}</div>
                    <div className="report-kpi-value">{k.value}</div>
                    <div className="report-kpi-sub">{k.sub}</div>
                  </div>
                ))}
              </div>
              <div className="report-status-bar">
                <span className="report-status-label">Overall:</span>
                <Badge value={overdueTasks > 0 ? 'Overdue' : pendingTasks > 0 ? 'In Progress' : 'Completed'} />
                <span className="report-status-label" style={{ marginLeft: 16 }}>Phase:</span>
                <Badge value={label(client.currentPhase)} />
                <span className="report-status-label" style={{ marginLeft: 16 }}>Status:</span>
                <Badge value={label(client.phaseStatus)} />
              </div>
            </section>

            {/* EVENT DETAILS */}
            <section className="report-section">
              <h1 className="report-section-header">2. Event / Project Details</h1>
              <table className="report-table">
                <thead><tr><th style={{ width: '28%' }}>Field</th><th>Value</th><th style={{ width: '28%' }}>Field</th><th>Value</th></tr></thead>
                <tbody>
                  {[
                    ['Client Name', client.name, 'Lead ID', client.serialNumber || client.id],
                    ['Event Type', client.eventType || 'N/A', 'Event Date', date(client.eventDate) || 'N/A'],
                    ['Flow Type', flowLabel(client.flowType), 'Location', client.location || 'N/A'],
                    ['Email', client.email || 'N/A', 'Phone', client.phone || 'N/A'],
                    ['Current Phase', label(client.currentPhase), 'Phase Status', label(client.phaseStatus)],
                    ['Phase Owner', label(client.phaseOwner) || 'N/A', 'Pre-Production Step', label(client.preProductionStep) || 'N/A'],
                    ['Assignment', client.assignmentStatus, 'Status', label(client.status)],
                    ['Invoice ID', client.invoiceId || 'N/A', 'Created At', date(client.createdAt) || 'N/A'],
                  ].map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'report-row-even' : ''}>
                      <td><strong>{r[0]}</strong></td><td>{String(r[1] ?? '')}</td>
                      <td><strong>{r[2]}</strong></td><td>{String(r[3] ?? '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* WORK BREAKDOWN */}
            <section className="report-section">
              <h1 className="report-section-header">3. Work & Task Breakdown</h1>
              <p className="report-section-desc">Task completion by phase, priority distribution, and full task list.</p>
              <h2 className="report-subsection-header">Completion by Phase</h2>
              <table className="report-table">
                <thead><tr><th>Phase</th><th>Total</th><th>Completed</th><th>Pending</th><th>Progress</th></tr></thead>
                <tbody>
                  {phaseBreakdown.length > 0 ? phaseBreakdown.map((p, i) => (
                    <tr key={p.phase} className={i % 2 === 0 ? 'report-row-even' : ''}>
                      <td><strong>{label(p.phase)}</strong></td><td>{p.total}</td><td>{p.completed}</td><td>{p.pending}</td>
                      <td>
                        <div className="report-progress-cell">
                          <div className="report-progress-bar"><div className="report-progress-fill" style={{ width: `${p.completionPercent}%`, background: p.completionPercent === 100 ? '#10b981' : p.completionPercent > 50 ? '#3b82f6' : '#f59e0b' }} /></div>
                          <span>{p.completionPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={5} className="report-empty">No data</td></tr>}
                </tbody>
              </table>

              <h2 className="report-subsection-header">Milestones</h2>
              <table className="report-table">
                <thead><tr><th>Phase</th><th>Status</th><th>Assignee</th><th>Assessment</th></tr></thead>
                <tbody>
                  {milestoneRows.length > 0 ? milestoneRows.map((m, i) => (
                    <tr key={m.id} className={i % 2 === 0 ? 'report-row-even' : ''}>
                      <td><strong>{label(m.phase)}</strong></td><td><Badge value={m.status} /></td><td>{m.employee || 'N/A'}</td>
                      <td>{m.deadline && new Date(m.deadline) < new Date() && !String(m.status).toLowerCase().includes('complete') ? <span className="report-delayed">Delayed</span> : String(m.status).toLowerCase().includes('complete') ? <span className="report-on-time">On Time</span> : <span className="report-in-progress">In Progress</span>}</td>
                    </tr>
                  )) : <tr><td colSpan={4} className="report-empty">No milestones</td></tr>}
                </tbody>
              </table>
            </section>

            {/* RESOURCES */}
            <section className="report-section">
              <h1 className="report-section-header">4. Resource & Personnel Summary</h1>
              <table className="report-table">
                <thead><tr><th>Name</th><th>Employee ID</th><th>Role</th><th>Group</th></tr></thead>
                <tbody>
                  {employees.length > 0 ? employees.map((emp, i) => (
                    <tr key={`${emp.employeeId}-${emp.task}`} className={i % 2 === 0 ? 'report-row-even' : ''}>
                      <td><strong>{emp.name}</strong></td>
                      <td className="report-id-cell">{emp.employeeId || 'N/A'}</td>
                      <td>{emp.role}</td>
                      <td>{emp.group}</td>
                    </tr>
                  )) : <tr><td colSpan={4} className="report-empty">No team members</td></tr>}
                </tbody>
              </table>
            </section>

            {/* FINANCIAL */}
            <section className="report-section">
              <h1 className="report-section-header">5. Financial Summary</h1>
              {invoice.invoiceId ? (
                <table className="report-table">
                  <thead><tr><th>Invoice ID</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr>
                      <td className="report-id-cell">{invoice.invoiceId}</td>
                      <td><strong>{money(invoice.total)}</strong></td>
                      <td style={{ color: '#10b981', fontWeight: 700 }}>{money(invoice.paid)}</td>
                      <td style={{ color: invoice.balance > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{money(invoice.balance)}</td>
                      <td><Badge value={invoice.status} /></td>
                    </tr>
                  </tbody>
                </table>
              ) : <div className="report-empty-section">No financial data available.</div>}
            </section>

            {/* KPIs + Charts */}
            <section className="report-section">
              <h1 className="report-section-header">6. Performance Metrics & KPIs</h1>
              <div className="report-charts-grid">
                <div className="report-chart-card">
                  <h3 className="report-chart-title">Task Status</h3>
                  <div className="report-chart-wrap">
                    {workStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={workStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {workStatusData.map((e, idx) => <Cell key={e.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="report-no-chart">No data</div>}
                  </div>
                </div>
                <div className="report-chart-card">
                  <h3 className="report-chart-title">Phase Completion</h3>
                  <div className="report-chart-wrap">
                    {phaseChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={phaseChartData}>
                          <XAxis dataKey="phase" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="Completed" fill="#10b981" radius={[3,3,0,0]} />
                          <Bar dataKey="Pending" fill="#f59e0b" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <div className="report-no-chart">No data</div>}
                  </div>
                </div>
              </div>
              <table className="report-table">
                <thead><tr><th>Metric</th><th>Value</th><th>Benchmark</th><th>Status</th></tr></thead>
                <tbody>
                  <tr className="report-row-even"><td>Completion Rate</td><td><strong>{progressPercent}%</strong></td><td>80%</td><td>{progressPercent >= 80 ? <span className="report-on-time">On Target</span> : <span className="report-delayed">Needs Work</span>}</td></tr>
                  <tr><td>On-Time Delivery</td><td><strong>{onTimePercent}%</strong></td><td>90%</td><td>{onTimePercent >= 90 ? <span className="report-on-time">On Target</span> : <span className="report-delayed">Needs Work</span>}</td></tr>
                  <tr className="report-row-even"><td>Attendance Rate</td><td><strong>{attendanceRate}%</strong></td><td>85%</td><td>{attendanceRate >= 85 ? <span className="report-on-time">On Target</span> : <span className="report-delayed">Needs Work</span>}</td></tr>
                  <tr><td>Pending Tasks</td><td><strong>{pendingTasks}</strong></td><td>0</td><td>{pendingTasks === 0 ? <span className="report-on-time">Cleared</span> : <span className="report-in-progress">{pendingTasks} Remaining</span>}</td></tr>
                  <tr className="report-row-even"><td>Overdue Tasks</td><td><strong>{overdueTasks}</strong></td><td>0</td><td>{overdueTasks === 0 ? <span className="report-on-time">None</span> : <span className="report-delayed">{overdueTasks} Overdue</span>}</td></tr>
                  <tr><td>Team Size</td><td><strong>{employees.length}</strong></td><td>—</td><td><span className="report-in-progress">Assigned</span></td></tr>
                </tbody>
              </table>
            </section>

            {/* ISSUES */}
            <section className="report-section">
              <h1 className="report-section-header">7. Issues, Risks & Resolutions</h1>
              {allIssues.length > 0 ? (
                <table className="report-table">
                  <thead><tr><th>Task</th><th>Assignee</th><th>Status</th><th>Deadline</th><th>Risk</th></tr></thead>
                  <tbody>
                    {allIssues.map((item, i) => (
                      <tr key={item.id} className={i % 2 === 0 ? 'report-row-even' : ''}>
                        <td><strong>{label(item.task)}</strong></td><td>{item.employee || 'N/A'}</td>
                        <td><Badge value={item.status} /></td><td>{date(item.deadline) || 'N/A'}</td>
                        <td>{item.deadline && new Date(item.deadline) < new Date() ? <span className="report-risk-high">High</span> : String(item.status).toLowerCase().includes('blocked') ? <span className="report-risk-medium">Medium</span> : <span className="report-risk-low">Low</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="report-empty-section">No issues or risks identified.</div>}
            </section>

            {/* ACTIVITY LOG */}
            <section className="report-section">
              <h1 className="report-section-header">8. Activity Log & Audit Trail</h1>
              <table className="report-table">
                <thead><tr><th>Date</th><th>Task</th><th>Phase</th><th>Assignee</th><th>Status</th></tr></thead>
                <tbody>
                  {activityLog.length > 0 ? activityLog.slice(0, 25).map((row, i) => (
                    <tr key={row.id} className={i % 2 === 0 ? 'report-row-even' : ''}>
                      <td className="report-date-cell">{date(row.startDate) || 'N/A'}</td>
                      <td><strong>{label(row.task)}</strong></td><td>{label(row.phase)}</td><td>{row.employee || 'N/A'}</td><td><Badge value={row.status} /></td>
                    </tr>
                  )) : <tr><td colSpan={5} className="report-empty">No activity records.</td></tr>}
                </tbody>
              </table>
            </section>

            {/* SIGN-OFF */}
            <section className="report-section report-signoff-section">
              <div className="report-signoff">
                <div className="report-signoff-box">
                  <h3>Prepared By</h3><div className="report-signoff-line" />
                  <p>Master Admin — Red Angle</p><p className="report-signoff-date">{dateStr}</p>
                </div>
                <div className="report-signoff-box">
                  <h3>Reviewed By</h3><div className="report-signoff-line" />
                  <p className="report-signoff-muted">(To be signed)</p>
                </div>
              </div>
              <div className="report-confidentiality">
                <p><strong>Confidentiality Notice:</strong> This report contains proprietary information belonging to Red Angle and is intended solely for internal management use.</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}