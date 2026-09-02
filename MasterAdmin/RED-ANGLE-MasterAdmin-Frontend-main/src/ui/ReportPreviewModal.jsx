import React, { useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { date, flowLabel, label, money } from '../utils'
import Badge from './Badge'

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280']

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ReportPreviewModal({ isOpen, onClose, data }) {
  const contentRef = useRef(null)

  if (!isOpen || !data) return null

  const conversion = data.conversion || {}
  const workCompletion = data.workCompletion || {}
  const invoice = data.invoiceCollection || {}
  const attendance = data.attendance || {}
  const delivery = data.clientDeliveryStatus || {}
  const assignRows = data.assignmentLoad || []

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
          filename: `Master-Sales-Report-${dateStr.replace(/\s+/g, '-')}.pdf`,
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

  const chartData = [
    { name: 'Completed', value: workCompletion.completed || 0 },
    { name: 'Pending', value: (workCompletion.pending || 0) - (workCompletion.late || 0) },
    { name: 'Late', value: workCompletion.late || 0 },
  ].filter(d => d.value > 0)

  const hasEmployees = assignRows.length > 0

  return (
    <div className="inv-modal-overlay" onClick={onClose}>
      <div className="inv-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: 900 }}>
        <div className="inv-modal-header">
          <h2>Master Sales Report</h2>
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

            {/* Cover Page */}
            <section className="report-cover-page">
              <div className="report-cover-brand-band" />
              <div className="report-cover-content">
                <div className="report-cover-logo-placeholder">
                  <span className="report-cover-logo-text">RA</span>
                </div>
                <h1 className="report-cover-title">Master Sales Report</h1>
                <div className="report-cover-divider" />
                <div className="report-cover-client-name">Red Angle Studio</div>
                <table className="report-cover-meta">
                  <tbody>
                    <tr><td>Report Type</td><td>Combined Sales Report</td></tr>
                    <tr><td>Generated On</td><td>{dateStr} at {timeStr}</td></tr>
                    <tr><td>Report ID</td><td>MSR-{now.getTime().toString(36).toUpperCase()}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="report-cover-footer-text">Red Angle Master Admin · Confidential</div>
            </section>

            {/* Executive Summary */}
            <section className="report-section">
              <h1 className="report-section-header">1. Executive Summary</h1>
              <p className="report-section-desc">High-level snapshot of overall sales performance, work completion, invoice collection, and delivery status.</p>
              <div className="report-kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                <div className="report-kpi-card">
                  <div className="report-kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }} style-hack><span>✓</span></div>
                  <div className="report-kpi-label">Lead-to-Booking</div>
                  <div className="report-kpi-value">{conversion.leadToBookingRatio || 0}%</div>
                  <div className="report-kpi-sub">{conversion.totalLeads || 0} total leads</div>
                </div>
                <div className="report-kpi-card">
                  <div className="report-kpi-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}><span>W</span></div>
                  <div className="report-kpi-label">Work Completion</div>
                  <div className="report-kpi-value">{workCompletion.total || 0}</div>
                  <div className="report-kpi-sub">{workCompletion.completed || 0} completed · {workCompletion.late || 0} late</div>
                </div>
                <div className="report-kpi-card">
                  <div className="report-kpi-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}><span>$</span></div>
                  <div className="report-kpi-label">Outstanding</div>
                  <div className="report-kpi-value">{money(invoice.invoiceBalance || 0)}</div>
                  <div className="report-kpi-sub">Of {money(invoice.invoiceTotal || 0)} total</div>
                </div>
                <div className="report-kpi-card">
                  <div className="report-kpi-icon" style={{ background: '#ede9fe', color: '#8b5cf6' }}><span>A</span></div>
                  <div className="report-kpi-label">Attendance</div>
                  <div className="report-kpi-value">{attendance.total || 0}</div>
                  <div className="report-kpi-sub">{attendance.present || 0} present · {attendance.absent || 0} absent</div>
                </div>
                <div className="report-kpi-card">
                  <div className="report-kpi-icon" style={{ background: '#fce7f3', color: '#ec4899' }}><span>D</span></div>
                  <div className="report-kpi-label">Pending Deliveries</div>
                  <div className="report-kpi-value">{delivery.pendingDeliveries || 0}</div>
                  <div className="report-kpi-sub">{delivery.delayed || 0} delayed</div>
                </div>
                <div className="report-kpi-card">
                  <div className="report-kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><span>T</span></div>
                  <div className="report-kpi-label">Avg Delivery Time</div>
                  <div className="report-kpi-value">{delivery.averageDeliveryTime || 0}d</div>
                  <div className="report-kpi-sub">{delivery.active || 0} active clients</div>
                </div>
              </div>
            </section>

            {/* Conversion */}
            <section className="report-section">
              <h1 className="report-section-header">2. Sales Conversion</h1>
              <p className="report-section-desc">Lead-to-booking conversion metrics and flow breakdown.</p>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Pre-Wedding</th>
                    <th>Post-Wedding</th>
                    <th>Combined</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="report-row-even">
                    <td><strong>Clients</strong></td>
                    <td>{conversion.preWedding?.clients || 0}</td>
                    <td>{conversion.postWedding?.clients || 0}</td>
                    <td>{(conversion.preWedding?.clients || 0) + (conversion.postWedding?.clients || 0)}</td>
                  </tr>
                  <tr>
                    <td><strong>Active</strong></td>
                    <td>{conversion.preWedding?.activeClients || 0}</td>
                    <td>{conversion.postWedding?.activeClients || 0}</td>
                    <td>{(conversion.preWedding?.activeClients || 0) + (conversion.postWedding?.activeClients || 0)}</td>
                  </tr>
                  <tr className="report-row-even">
                    <td><strong>Completed</strong></td>
                    <td>{conversion.preWedding?.completedClients || 0}</td>
                    <td>{conversion.postWedding?.completedClients || 0}</td>
                    <td>{(conversion.preWedding?.completedClients || 0) + (conversion.postWedding?.completedClients || 0)}</td>
                  </tr>
                  <tr>
                    <td><strong>Invoice Total</strong></td>
                    <td>{money(conversion.preWedding?.invoiceTotal || 0)}</td>
                    <td>{money(conversion.postWedding?.invoiceTotal || 0)}</td>
                    <td>{money((conversion.preWedding?.invoiceTotal || 0) + (conversion.postWedding?.invoiceTotal || 0))}</td>
                  </tr>
                  <tr className="report-row-even">
                    <td><strong>Invoice Balance</strong></td>
                    <td>{money(conversion.preWedding?.invoiceBalance || 0)}</td>
                    <td>{money(conversion.postWedding?.invoiceBalance || 0)}</td>
                    <td>{money((conversion.preWedding?.invoiceBalance || 0) + (conversion.postWedding?.invoiceBalance || 0))}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Work Completion + Chart */}
            <section className="report-section">
              <h1 className="report-section-header">3. Work Completion & KPIs</h1>
              <p className="report-section-desc">Task completion metrics with visual distribution.</p>

              <div className="report-charts-grid" style={{ marginBottom: 24 }}>
                <div className="report-chart-card">
                  <h3 className="report-chart-title">Task Status Distribution</h3>
                  <div className="report-chart-wrap">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {chartData.map((entry, idx) => <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="report-no-chart">No data</div>}
                  </div>
                </div>
                <div className="report-chart-card">
                  <h3 className="report-chart-title">Work Overview</h3>
                  <table style={{ width: '100%', fontSize: 13 }}>
                    <tbody>
                      <tr><td style={{ padding: '6px 0' }}>Total Tasks</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{workCompletion.total || 0}</td></tr>
                      <tr><td style={{ padding: '6px 0' }}>Completed</td><td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{workCompletion.completed || 0}</td></tr>
                      <tr><td style={{ padding: '6px 0' }}>Pending</td><td style={{ textAlign: 'right', fontWeight: 700, color: '#f59e0b' }}>{workCompletion.pending || 0}</td></tr>
                      <tr><td style={{ padding: '6px 0' }}>Late</td><td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>{workCompletion.late || 0}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h2 className="report-subsection-header">Invoice Collection</h2>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Amount</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="report-row-even">
                    <td><strong>Total Invoiced</strong></td>
                    <td>{money(invoice.invoiceTotal || 0)}</td>
                    <td>100%</td>
                  </tr>
                  <tr>
                    <td><strong>Total Paid</strong></td>
                    <td style={{ color: '#10b981', fontWeight: 700 }}>{money(invoice.invoicePaid || 0)}</td>
                    <td>{invoice.invoiceTotal ? Math.round((invoice.invoicePaid / invoice.invoiceTotal) * 100) : 0}%</td>
                  </tr>
                  <tr className="report-row-even">
                    <td><strong>Outstanding</strong></td>
                    <td style={{ color: '#ef4444', fontWeight: 700 }}>{money(invoice.invoiceBalance || 0)}</td>
                    <td>{invoice.invoiceTotal ? Math.round((invoice.invoiceBalance / invoice.invoiceTotal) * 100) : 0}%</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Assignment Load */}
            <section className="report-section">
              <h1 className="report-section-header">4. Assignment Load</h1>
              <p className="report-section-desc">Employee assignment breakdown with task counts, flow involvement, and attendance.</p>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Tasks</th>
                    <th>Flow</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {hasEmployees ? assignRows.slice(0, 20).map((row, i) => (
                    <tr key={row.employeeId} className={i % 2 === 0 ? 'report-row-even' : ''}>
                      <td><strong>{row.name}</strong></td>
                      <td>{label(row.role)}</td>
                      <td>{row.currentTasks || 0}</td>
                      <td>{String(row.flowInvolvement || '').split(', ').map(flowLabel).join(', ') || '-'}</td>
                      <td>{row.attendanceToday || '-'}</td>
                    </tr>
                  )) : <tr><td colSpan={5} className="report-empty">No assignment data</td></tr>}
                </tbody>
              </table>
              {assignRows.length > 20 && (
                <p className="report-more-note">Showing 20 of {assignRows.length} employees.</p>
              )}
            </section>

            {/* Attendance */}
            <section className="report-section">
              <h1 className="report-section-header">5. Attendance Summary</h1>
              <p className="report-section-desc">Employee attendance metrics across all active projects.</p>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="report-row-even">
                    <td><strong>Total Records</strong></td>
                    <td>{attendance.total || 0}</td>
                    <td>100%</td>
                  </tr>
                  <tr>
                    <td><strong>Present</strong></td>
                    <td style={{ color: '#10b981', fontWeight: 700 }}>{attendance.present || 0}</td>
                    <td>{attendance.total ? Math.round((attendance.present / attendance.total) * 100) : 0}%</td>
                  </tr>
                  <tr className="report-row-even">
                    <td><strong>Absent</strong></td>
                    <td style={{ color: '#ef4444', fontWeight: 700 }}>{attendance.absent || 0}</td>
                    <td>{attendance.total ? Math.round((attendance.absent / attendance.total) * 100) : 0}%</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Delivery */}
            <section className="report-section">
              <h1 className="report-section-header">6. Client Delivery Status</h1>
              <p className="report-section-desc">Delivery pipeline overview including pending, completed, and delayed projects.</p>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="report-row-even"><td><strong>Active Clients</strong></td><td>{delivery.active || 0}</td></tr>
                  <tr><td><strong>Completed</strong></td><td style={{ color: '#10b981', fontWeight: 700 }}>{delivery.completed || 0}</td></tr>
                  <tr className="report-row-even"><td><strong>Pending Deliveries</strong></td><td style={{ color: '#f59e0b', fontWeight: 700 }}>{delivery.pendingDeliveries || 0}</td></tr>
                  <tr><td><strong>Delayed</strong></td><td style={{ color: '#ef4444', fontWeight: 700 }}>{delivery.delayed || 0}</td></tr>
                  <tr className="report-row-even"><td><strong>Avg Delivery Time</strong></td><td>{delivery.averageDeliveryTime || 0} days</td></tr>
                </tbody>
              </table>
            </section>

            {/* Sign-off */}
            <section className="report-section report-signoff-section">
              <div className="report-signoff">
                <div className="report-signoff-box">
                  <h3>Prepared By</h3>
                  <div className="report-signoff-line" />
                  <p>Master Admin — Red Angle</p>
                  <p className="report-signoff-date">{dateStr}</p>
                </div>
                <div className="report-signoff-box">
                  <h3>Reviewed By</h3>
                  <div className="report-signoff-line" />
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