import React, { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { api } from '../api'
import { date } from '../utils'
import Badge from '../ui/Badge'
import Table from '../ui/Table'

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [flowType, setFlowType] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.attendance({ flowType }).then(setRecords).finally(() => setLoading(false))
  }, [flowType])

  const present = records.filter(row => row.status === 'Present').length
  const absent = records.filter(row => row.status === 'Absent').length

  return (
    <div>
      <div className="page-head">
        <div><h1>Sales Attendance</h1><p>Attendance for employees assigned to Sales clients.</p></div>
        <div className="head-actions">
          <select value={flowType} onChange={event => setFlowType(event.target.value)}>
            <option value="all">All flows</option>
            <option value="pre_wedding">Pre-wedding</option>
            <option value="post_wedding">Post-wedding</option>
          </select>
          <button className="action-btn" onClick={() => downloadMonthlyAttendance(records)}>
            <Download size={16} />
            Monthly Export
          </button>
        </div>
      </div>
      <div className="summary-row">
        <div className="card padded"><span>Total records</span><strong>{records.length}</strong></div>
        <div className="card padded"><span>Present</span><strong>{present}</strong></div>
        <div className="card padded"><span>Absent</span><strong>{absent}</strong></div>
      </div>
      <Table headers={['Employee ID', 'Employee', 'Role', 'Date', 'Check-in', 'Check-out', 'Status']} empty={loading ? 'Loading attendance...' : 'No attendance records found.'}>
        {!loading && records.length ? records.map(row => (
          <tr key={`${row.employeeId}-${row.date}-${row.id}`}>
            <td className="accent">{row.employeeId}</td>
            <td>{row.employee}</td>
            <td>{row.role || '-'}</td>
            <td>{date(row.date)}</td>
            <td>{row.checkIn || '-'}</td>
            <td>{row.checkOut || '-'}</td>
            <td><Badge value={row.status || 'Absent'} /></td>
          </tr>
        )) : null}
      </Table>
    </div>
  )
}

function downloadMonthlyAttendance(records) {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthRows = records.filter(row => String(row.date || '').startsWith(month))
  const blob = new Blob([JSON.stringify(monthRows, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sales-attendance-${month}.json`
  link.click()
  URL.revokeObjectURL(url)
}
