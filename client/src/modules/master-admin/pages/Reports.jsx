import React, { useEffect, useState } from 'react'
import {
  BarChart3,
  Download,
  Eye,
  FileText,
  IndianRupee,
  TrendingUp,
  Users,
  CalendarCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Briefcase,
} from 'lucide-react'
import { api } from '../api'
import { flowLabel, label, money } from '../utils'
import Badge from '../ui/Badge'
import Table from '../ui/Table'
import StatCard from '../ui/StatCard'
import ReportPreviewModal from '../ui/ReportPreviewModal'

const REPORT_TABS = [
  ['overview', 'Overview'],
  ['conversion', 'Conversion'],
  ['work', 'Work'],
  ['invoice', 'Invoice'],
  ['assignment', 'Assignment Load'],
]

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showReportModal, setShowReportModal] = useState(false)

  useEffect(() => {
    api.reports().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading reports...</div>

  const conversion = data?.conversion || {}
  const work = data?.workCompletion || {}
  const invoice = data?.invoiceCollection || {}
  const attendance = data?.attendance || {}
  const delivery = data?.clientDeliveryStatus || {}
  const assignmentRows = data?.assignmentLoad || []

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Sales Reports</h1>
          <p>Combined reporting for conversion, assignment load, work, invoices, attendance, and delivery status.</p>
        </div>
        <div className="head-actions">
          <button className="primary-btn" onClick={() => setShowReportModal(true)}>
            <Eye size={16} />
            View Full Report
          </button>
          <button className="action-btn" onClick={() => downloadReport(data)}>
            <Download size={16} />
            Export JSON
          </button>
        </div>
      </div>

      <div className="tabs">
        {REPORT_TABS.map(([key, text]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={activeTab === key ? 'active' : ''}>{text}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab conversion={conversion} work={work} invoice={invoice} attendance={attendance} delivery={delivery} />
      )}
      {activeTab === 'conversion' && <ConversionTab data={conversion} />}
      {activeTab === 'work' && <WorkTab work={work} />}
      {activeTab === 'invoice' && <InvoiceTab invoice={invoice} />}
      {activeTab === 'assignment' && <AssignmentTab rows={assignmentRows} />}

      <ReportPreviewModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        data={data}
      />
    </div>
  )
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ conversion, work, invoice, attendance, delivery }) {
  return (
    <div>
      <div className="section-title-row">
        <BarChart3 size={18} />
        <h2>Report Summary</h2>
      </div>
      <div className="stat-grid owner-stat-grid">
        <StatCard title="Lead-to-Booking" value={`${conversion.leadToBookingRatio || 0}%`} subtitle={`${conversion.totalLeads || 0} leads`} icon={<TrendingUp size={18} />} />
        <StatCard title="Work Completion" value={work.total || 0} subtitle={`${work.completed || 0} done · ${work.pending || 0} open · ${work.late || 0} late`} icon={<CheckCircle size={18} />} />
        <StatCard title="Invoice Collection" value={money(invoice.invoiceTotal || 0)} subtitle={`Paid: ${money(invoice.invoicePaid || 0)} · Balance: ${money(invoice.invoiceBalance || 0)}`} icon={<IndianRupee size={18} />} />
        <StatCard title="Attendance" value={attendance.total || 0} subtitle={`Present: ${attendance.present || 0} · Absent: ${attendance.absent || 0}`} icon={<CalendarCheck size={18} />} />
        <StatCard title="Pending Deliveries" value={delivery.pendingDeliveries || 0} subtitle={`Completed: ${delivery.completed || 0} · Delayed: ${delivery.delayed || 0}`} icon={<Clock size={18} />} />
        <StatCard title="Avg Delivery Time" value={`${delivery.averageDeliveryTime || 0} days`} subtitle={`Active: ${delivery.active || 0} clients`} icon={<Briefcase size={18} />} />
      </div>
    </div>
  )
}

/* ─── CONVERSION TAB ─── */
function ConversionTab({ data }) {
  return (
    <div>
      <div className="section-title-row">
        <TrendingUp size={18} />
        <h2>Sales Conversion</h2>
      </div>
      <div className="dashboard-grid two-col">
        <div className="card padded">
          <div className="card-title"><strong>Conversion Metrics</strong></div>
          <div className="mini-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
            <div className="metric"><span>Total Leads</span><strong>{data.totalLeads || 0}</strong></div>
            <div className="metric"><span>Bookings</span><strong>{data.bookings || 0}</strong></div>
            <div className="metric"><span>Completed</span><strong>{data.completed || 0}</strong></div>
            <div className="metric"><span>Conversion Ratio</span><strong>{data.leadToBookingRatio || 0}%</strong></div>
          </div>
        </div>
        <div className="card padded">
          <div className="card-title"><strong>Flow Breakdown</strong></div>
          <div className="mini-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <div className="metric"><span>Pre Clients</span><strong>{data.preWedding?.clients || 0}</strong></div>
            <div className="metric"><span>Pre Total</span><strong>{money(data.preWedding?.invoiceTotal || 0)}</strong></div>
            <div className="metric"><span>Pre Balance</span><strong>{money(data.preWedding?.invoiceBalance || 0)}</strong></div>
            <div className="metric"><span>Post Clients</span><strong>{data.postWedding?.clients || 0}</strong></div>
            <div className="metric"><span>Post Total</span><strong>{money(data.postWedding?.invoiceTotal || 0)}</strong></div>
            <div className="metric"><span>Post Balance</span><strong>{money(data.postWedding?.invoiceBalance || 0)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── WORK TAB ─── */
function WorkTab({ work }) {
  return (
    <div>
      <div className="section-title-row">
        <CheckCircle size={18} />
        <h2>Work Completion</h2>
      </div>
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <StatCard title="Total Tasks" value={work.total || 0} subtitle="All work items" icon={<Briefcase size={18} />} />
        <StatCard title="Completed" value={work.completed || 0} subtitle="Done" icon={<CheckCircle size={18} />} />
        <StatCard title="Pending" value={work.pending || 0} subtitle="In progress" icon={<Clock size={18} />} />
        <StatCard title="Late" value={work.late || 0} subtitle="Past deadline" icon={<AlertTriangle size={18} />} />
      </div>
      <div className="card padded" style={{ marginTop: 20 }}>
        <div className="card-title"><strong>Completion Status</strong></div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span>Completed</span>
              <span style={{ fontWeight: 700, color: '#10b981' }}>{work.completed || 0}/{work.total || 0}</span>
            </div>
            <div className="report-progress-bar" style={{ height: 10 }}>
              <div className="report-progress-fill" style={{ width: `${work.total ? (work.completed / work.total) * 100 : 0}%`, background: '#10b981', height: 10, borderRadius: 5 }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span>Pending</span>
              <span style={{ fontWeight: 700, color: '#f59e0b' }}>{work.pending || 0}/{work.total || 0}</span>
            </div>
            <div className="report-progress-bar" style={{ height: 10 }}>
              <div className="report-progress-fill" style={{ width: `${work.total ? (work.pending / work.total) * 100 : 0}%`, background: '#f59e0b', height: 10, borderRadius: 5 }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span>Late</span>
              <span style={{ fontWeight: 700, color: '#ef4444' }}>{work.late || 0}/{work.total || 0}</span>
            </div>
            <div className="report-progress-bar" style={{ height: 10 }}>
              <div className="report-progress-fill" style={{ width: `${work.total ? (work.late / work.total) * 100 : 0}%`, background: '#ef4444', height: 10, borderRadius: 5 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── INVOICE TAB ─── */
function InvoiceTab({ invoice }) {
  const paidPercent = invoice.invoiceTotal ? Math.round((invoice.invoicePaid / invoice.invoiceTotal) * 100) : 0
  const balancePercent = invoice.invoiceTotal ? Math.round((invoice.invoiceBalance / invoice.invoiceTotal) * 100) : 0

  return (
    <div>
      <div className="section-title-row">
        <IndianRupee size={18} />
        <h2>Invoice Collection</h2>
      </div>
      <div className="dashboard-grid two-col">
        <div className="card padded">
          <div className="card-title"><strong>Financial Summary</strong></div>
          <div className="mini-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
            <div className="metric"><span>Total Invoiced</span><strong>{money(invoice.invoiceTotal || 0)}</strong></div>
            <div className="metric"><span>Total Paid</span><strong style={{ color: '#10b981' }}>{money(invoice.invoicePaid || 0)}</strong></div>
            <div className="metric"><span>Outstanding</span><strong style={{ color: '#ef4444' }}>{money(invoice.invoiceBalance || 0)}</strong></div>
            <div className="metric"><span>Collection Rate</span><strong>{paidPercent}%</strong></div>
          </div>
        </div>
        <div className="card padded">
          <div className="card-title"><strong>Collection Breakdown</strong></div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span>Collected</span>
              <span style={{ fontWeight: 700, color: '#10b981' }}>{paidPercent}%</span>
            </div>
            <div className="report-progress-bar" style={{ height: 12 }}>
              <div className="report-progress-fill" style={{ width: `${paidPercent}%`, background: '#10b981', height: 12, borderRadius: 6 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0 8px', fontSize: 13 }}>
              <span>Outstanding</span>
              <span style={{ fontWeight: 700, color: '#ef4444' }}>{balancePercent}%</span>
            </div>
            <div className="report-progress-bar" style={{ height: 12 }}>
              <div className="report-progress-fill" style={{ width: `${balancePercent}%`, background: '#ef4444', height: 12, borderRadius: 6 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── ASSIGNMENT TAB ─── */
function AssignmentTab({ rows }) {
  return (
    <div>
      <div className="section-title-row">
        <Users size={18} />
        <h2>Assignment Load</h2>
      </div>
      <div className="card padded" style={{ marginBottom: 16 }}>
        <div className="mini-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <div className="metric"><span>Total Employees</span><strong>{rows.length}</strong></div>
          <div className="metric"><span>Total Tasks</span><strong>{rows.reduce((s, r) => s + (r.currentTasks || 0), 0)}</strong></div>
          <div className="metric"><span>Avg Tasks/Employee</span><strong>{rows.length ? Math.round(rows.reduce((s, r) => s + (r.currentTasks || 0), 0) / rows.length) : 0}</strong></div>
        </div>
      </div>
      <Table headers={['Employee ID', 'Name', 'Role', 'Tasks', 'Flow Involvement', 'Attendance']} empty="No assignment load rows found.">
        {rows.length ? rows.slice(0, 20).map(row => (
          <tr key={`${row.employeeId}-${row.role}`}>
            <td className="accent">{row.employeeId}</td>
            <td><strong>{row.name}</strong></td>
            <td><Badge value={label(row.role)} /></td>
            <td><span className="badge" style={{ background: row.currentTasks > 3 ? '#fef2f2' : '#f0fdf4', color: row.currentTasks > 3 ? '#dc2626' : '#16a34a' }}>{row.currentTasks}</span></td>
            <td>{String(row.flowInvolvement || '').split(', ').map(flowLabel).join(', ')}</td>
            <td>{row.attendanceToday || '-'}</td>
          </tr>
        )) : null}
      </Table>
    </div>
  )
}

function downloadReport(data) {
  const blob = new Blob([JSON.stringify(data || {}, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'sales-master-report.json'
  link.click()
  URL.revokeObjectURL(url)
}