import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Briefcase, CalendarDays, CheckCircle, Clock, FileText, IndianRupee, Mail, MapPin, Phone, UserRound, Users, Eye, Download } from 'lucide-react'
import { api } from '../api'
import { date, flowLabel, label, money } from '../utils'
import Badge from '../ui/Badge'
import Table from '../ui/Table'
import InvoiceModal from '../ui/InvoiceModal'
import ClientReportPreviewModal from '../ui/ClientReportPreviewModal'

const tabs = [
  ['details', 'Details'],
  ['employees', 'Employees'],
  ['work', 'Work Tracker'],
  ['invoice', 'Invoice'],
  ['attendance', 'Attendance'],
  ['report', 'Report'],
]

export default function ClientDetail() {
  const { clientId } = useParams()
  const [active, setActive] = useState('details')
  const [state, setState] = useState({ loading: true })

  useEffect(() => {
    Promise.all([
      api.client(clientId),
      api.clientEmployees(clientId),
      api.clientWorkTracker(clientId),
      api.clientInvoice(clientId),
      api.clientAttendance(clientId),
      api.clientReport(clientId),
    ]).then(([client, employees, work, invoices, attendance, report]) => {
      setState({ loading: false, client, employees, work, invoices, attendance, report })
    }).catch(() => setState({ loading: false }))
  }, [clientId])

  if (state.loading) return <div className="loading">Loading client...</div>
  if (!state.client) return <div className="card padded">Client not found.</div>

  const { client } = state

  return (
    <div>
      <Link className="back-link" to="/sales/clients"><ArrowLeft size={16} /> Back to clients</Link>
      <div className="client-header card padded">
        <div>
          <div className="title-row">
            <h1>{client.name}</h1>
            <Badge value={flowLabel(client.flowType)} />
            <Badge value={client.assignmentStatus} />
          </div>
          <p>{client.serialNumber} · {client.eventType} · {date(client.eventDate)}</p>
        </div>
        <div className="header-metrics">
          <Metric label="Current phase" value={label(client.currentPhase)} />
          <Metric label="Phase owner" value={label(client.phaseOwner)} />
          <Metric label="Pre-production step" value={label(client.preProductionStep)} />
          <Metric label="Invoice balance" value={money(client.invoiceBalance)} />
        </div>
      </div>

      <div className="tabs">
        {tabs.map(([key, text]) => <button key={key} onClick={() => setActive(key)} className={active === key ? 'active' : ''}>{text}</button>)}
      </div>

      {active === 'details' && <Details client={client} setActive={setActive} />}
      {active === 'employees' && <Employees rows={state.employees || []} />}
      {active === 'work' && <Work rows={state.work || []} client={client} />}
      {active === 'invoice' && <Invoice rows={state.invoices || []} clientId={clientId} />}
      {active === 'attendance' && <AttendanceRows rows={state.attendance || []} />}
      {active === 'report' && <Report state={state} />}
    </div>
  )
}

function Metric({ label, value }) {
  return <div><span>{label}</span><strong>{value}</strong></div>
}

function Details({ client, setActive }) {
  const stageOrder = client.flowType === 'post_wedding'
    ? ['event', 'post_production']
    : ['pre_production', 'event', 'post_production']
  const currentIndex = stageOrder.indexOf(client.currentPhase)
  const team = String(client.assignedTeamSummary || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

  return (
    <div className="client-detail-dashboard">
      <div className="client-overview-grid">
        <DetailPanel title="Client Contact" icon={<UserRound size={18} />}>
          <InfoLine icon={<Mail size={15} />} label="Email" value={client.email} />
          <InfoLine icon={<Phone size={15} />} label="Phone" value={client.phone} />
          <InfoLine icon={<MapPin size={15} />} label="Location" value={client.location} />
        </DetailPanel>

        <DetailPanel title="Event Summary" icon={<CalendarDays size={18} />}>
          <Metric label="Lead ID" value={client.serialNumber} />
          <Metric label="Event type" value={client.eventType} />
          <Metric label="Event date" value={date(client.eventDate)} />
        </DetailPanel>

        <DetailPanel title="Billing" icon={<IndianRupee size={18} />}>
          <Metric label="Invoice ID" value={client.invoiceId} />
          <Metric label="Total" value={money(client.invoiceTotal)} />
          <Metric label="Paid" value={money(client.invoicePaid)} />
          <Metric label="Balance" value={money(client.invoiceBalance)} />
        </DetailPanel>
      </div>

      <div className="detail-wide-grid">
        <div className="card padded">
          <div className="card-title">
            <strong>Workflow Status</strong>
            <Badge value={flowLabel(client.flowType)} />
          </div>
          <div className="client-stage-timeline">
            {stageOrder.map((stage, index) => {
              const state = index < currentIndex || String(client.phaseStatus).toLowerCase().includes('complete')
                ? 'completed'
                : index === currentIndex
                  ? 'active'
                  : 'pending'
              return (
                <div className={`client-stage-node ${state}`} key={stage}>
                  <span>{index + 1}</span>
                  <strong>{label(stage)}</strong>
                </div>
              )
            })}
          </div>
          <div className="workflow-meta-grid">
            <Metric label="Current phase" value={label(client.currentPhase)} />
            <Metric label="Phase status" value={label(client.phaseStatus)} />
            <Metric label="Phase owner" value={label(client.phaseOwner)} />
            <Metric label="Current step" value={label(client.preProductionStep)} />
          </div>
        </div>

        <div className="card padded">
          <div className="card-title">
            <strong>Assigned Team</strong>
            <Badge value={client.assignmentStatus} />
          </div>
          <div className="team-chip-list">
            {team.length ? team.map(member => <span key={member}>{member}</span>) : <span>Unassigned</span>}
          </div>
          <div className="detail-actions">
            <button className="action-btn" onClick={() => setActive('employees')}>
              <Briefcase size={16} />
              Employees
            </button>
            <button className="action-btn" onClick={() => setActive('work')}>
              <CalendarDays size={16} />
              Work Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailPanel({ title, icon, children }) {
  return (
    <div className="card padded detail-panel">
      <div className="card-title">
        <strong>{title}</strong>
        {icon}
      </div>
      <div className="detail-panel-body">{children}</div>
    </div>
  )
}

function InfoLine({ icon, label, value }) {
  return (
    <div className="info-line">
      <div className="info-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value || '-'}</strong>
      </div>
    </div>
  )
}

function Employees({ rows }) {
  return <Table headers={['Group', 'Task', 'Employee ID', 'Name', 'Role']} empty="No employees assigned to this client.">{rows.length ? rows.map(row => <tr key={`${row.employeeId}-${row.task}`}><td>{row.group}</td><td>{row.task}</td><td className="accent">{row.employeeId}</td><td>{row.name}</td><td>{row.role}</td></tr>) : null}</Table>
}

function Work({ rows, client }) {
  const stageRows = rows.filter(row => row.isStageRow)
  const taskRows = rows.filter(row => !row.isStageRow)
  return (
    <div>
      <div className="workflow-strip card padded">
        <div className="card-title">
          <strong>{flowLabel(client.flowType)} stage order</strong>
          <Badge value={label(client.currentPhase)} />
        </div>
        <div className="stage-strip">
          {stageRows.map(row => (
            <div className={`stage-pill ${String(row.status).toLowerCase().replace(/\s+/g, '-')}`} key={row.id}>
              <span>{label(row.phase)}</span>
              <strong>{label(row.status)}</strong>
            </div>
          ))}
        </div>
      </div>
      <Table headers={['Stage', 'Task', 'Employee', 'Role', 'Status', 'Start', 'Deadline']} empty="No client-scoped work tracker rows found.">
        {rows.length ? rows.map(row => (
          <tr key={row.id}>
            <td>{label(row.phase)}</td>
            <td>{label(row.task)}</td>
            <td>{row.employee}</td>
            <td>{row.role || '-'}</td>
            <td><Badge value={row.status} /></td>
            <td>{date(row.startDate)}</td>
            <td>{date(row.deadline)}</td>
          </tr>
        )) : null}
      </Table>
      {taskRows.length > 0 && <p className="section-note">Stage rows are ordered by the client flow type; task rows below each stage come from CRM stage tracking and assigned project work.</p>}
    </div>
  )
}

function Invoice({ rows }) {
  const [previewInvoice, setPreviewInvoice] = useState(null)

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        {rows.length > 0 ? (
          rows.map((row, idx) => (
            <button key={row.invoiceId || idx} className="inv-view-invoice-btn" onClick={() => setPreviewInvoice(row)}>
              <FileText size={16} />
              View Proforma Invoice {rows.length > 1 ? idx + 1 : ''}
            </button>
          ))
        ) : (
          <button className="inv-view-invoice-btn" disabled>
            <FileText size={16} />
            View Proforma Invoice
          </button>
        )}
      </div>
      <Table headers={['Invoice ID', 'Total', 'Paid', 'Balance', 'Status', 'Due Date', 'Action']} empty="No invoice found for this client.">
        {rows.length ? rows.map(row => (
          <tr key={row.invoiceId}>
            <td className="accent">{row.invoiceId}</td>
            <td>{money(row.total)}</td>
            <td>{money(row.paid)}</td>
            <td>{money(row.balance)}</td>
            <td><Badge value={row.status} /></td>
            <td>{date(row.dueDate)}</td>
            <td>
              <button className="icon-btn" onClick={() => setPreviewInvoice(row)} title="View Invoice">
                <Eye size={16} />
              </button>
            </td>
          </tr>
        )) : null}
      </Table>
      {previewInvoice && <InvoiceModal invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} />}
    </div>
  )
}


function AttendanceRows({ rows }) {
  return <Table headers={['Employee', 'Role', 'Date', 'Check-in', 'Check-out', 'Status']} empty="No attendance records for assigned employees.">{rows.length ? rows.map(row => <tr key={`${row.employeeId}-${row.date}-${row.id}`}><td>{row.employee}</td><td>{row.role || '-'}</td><td>{date(row.date)}</td><td>{row.checkIn || '-'}</td><td>{row.checkOut || '-'}</td><td><Badge value={row.status || 'Absent'} /></td></tr>) : null}</Table>
}

function Report({ state }) {
  const [showPreview, setShowPreview] = useState(false)
  const { client, employees = [], work = [], invoices = [], report } = state
  const workStats = report?.workProgress || {}
  const invoice = invoices.reduce((acc, inv) => ({
    total: acc.total + Number(inv.total || 0),
    paid: acc.paid + Number(inv.paid || 0),
    balance: acc.balance + Number(inv.balance || 0),
  }), { total: 0, paid: 0, balance: 0 })
  const blockers = Array.isArray(report?.blockers) ? report.blockers : []

  const totalTasks = workStats.total || 0
  const completedTasks = workStats.completed || 0
  const pendingTasks = workStats.pending || 0
  const overdueTasks = workStats.overdue || 0
  const progressPercent = workStats.completionPercent || 0
  const attendanceRate = report?.attendanceRate || 0

  return (
    <div>
      <div className="card padded" style={{ marginBottom: 16, background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', border: '1px solid #e0e7ff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Client Report</h3>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>Comprehensive report for {client.name}</p>
              </div>
            </div>
          </div>
          <button className="primary-btn" onClick={() => setShowPreview(true)}>
            <Eye size={16} />
            View Full Report
          </button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="card padded" style={{ borderLeft: '3px solid #10b981' }}>
          <span style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Work Completion</span>
          <strong style={{ fontSize: 28, display: 'block', marginTop: 4 }}>{progressPercent}%</strong>
          <span style={{ fontSize: 13, color: '#6b7280' }}>{completedTasks}/{totalTasks} tasks</span>
        </div>
        <div className="card padded" style={{ borderLeft: '3px solid #f59e0b' }}>
          <span style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Outstanding</span>
          <strong style={{ fontSize: 28, display: 'block', marginTop: 4 }}>{money(invoice.balance || 0)}</strong>
          <span style={{ fontSize: 13, color: '#6b7280' }}>of {money(invoice.total || 0)}</span>
        </div>
        <div className="card padded" style={{ borderLeft: '3px solid #3b82f6' }}>
          <span style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Team Size</span>
          <strong style={{ fontSize: 28, display: 'block', marginTop: 4 }}>{employees.length}</strong>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Assigned members</span>
        </div>
        <div className="card padded" style={{ borderLeft: `3px solid ${blockers.length > 0 ? '#ef4444' : '#10b981'}` }}>
          <span style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Blockers</span>
          <strong style={{ fontSize: 28, display: 'block', marginTop: 4, color: blockers.length > 0 ? '#ef4444' : '#10b981' }}>{blockers.length}</strong>
          <span style={{ fontSize: 13, color: '#6b7280' }}>{blockers.length > 0 ? 'Requires attention' : 'All clear'}</span>
        </div>
      </div>

      <div className="dashboard-grid two-col" style={{ marginTop: 20 }}>
        <div className="card padded">
          <div className="card-title"><Briefcase size={16} className="accent" /><strong>Team Assignment</strong></div>
          {employees.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {employees.slice(0, 6).map(emp => (
                <div key={`${emp.employeeId}-${emp.task}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #f3f4f6' }}>
                  <div><strong style={{ fontSize: 14 }}>{emp.name}</strong><span style={{ fontSize: 12, color: '#6b7280', display: 'block' }}>{emp.employeeId}</span></div>
                  <div style={{ textAlign: 'right' }}><span style={{ fontSize: 13, fontWeight: 600 }}>{emp.role}</span><span style={{ fontSize: 11, color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>{emp.group}</span></div>
                </div>
              ))}
              {employees.length > 6 && <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', margin: 0 }}>+{employees.length - 6} more members</p>}
            </div>
          ) : <div className="mini-empty">No team members assigned.</div>}
        </div>
        <div className="card padded">
          <div className="card-title"><AlertCircle size={16} color="#ef4444" /><strong>Issues & Blockers</strong></div>
          {blockers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {blockers.slice(0, 5).map(task => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 8, borderBottom: '1px solid #f3f4f6' }}>
                  <div><strong style={{ fontSize: 14 }}>{label(task.task)}</strong><span style={{ fontSize: 12, color: '#6b7280', display: 'block' }}>{task.employee}</span></div>
                  <Badge value={task.status} />
                </div>
              ))}
            </div>
          ) : <div className="mini-empty" style={{ color: '#10b981', fontWeight: 600 }}>No issues or blockers.</div>}
        </div>
      </div>

      <div className="card padded" style={{ marginTop: 20 }}>
        <div className="card-title"><Clock size={16} className="accent" /><strong>Recent Activity</strong></div>
        <Table headers={['Task', 'Phase', 'Assignee', 'Status', 'Deadline']} empty="No work items found.">
          {work.filter(r => !r.isStageRow).slice(0, 6).map(row => (
            <tr key={row.id}>
              <td style={{ fontWeight: 600 }}>{label(row.task)}</td>
              <td>{label(row.phase)}</td>
              <td>{row.employee}</td>
              <td><Badge value={row.status} /></td>
              <td>{date(row.deadline)}</td>
            </tr>
          ))}
        </Table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 12 }}>
        <button className="primary-btn" onClick={() => setShowPreview(true)}>
          <Eye size={16} />
          View Full Report
        </button>
        <button className="action-btn" onClick={() => downloadClientReport(state)}>
          <Download size={16} />
          Export Data
        </button>
      </div>

      <ClientReportPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        state={state}
      />
    </div>
  )
}

function downloadClientReport(state) {
  const { client, report } = state
  const payload = { client, report, exportedAt: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Client-Report-${client.serialNumber || client.id}.json`
  link.click()
  URL.revokeObjectURL(url)
}
