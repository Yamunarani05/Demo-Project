import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Eye, Search } from 'lucide-react'
import { api } from '../api'
import { date, flowLabel, label, money } from '../utils'
import Badge from '../ui/Badge'
import Table from '../ui/Table'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [filters, setFilters] = useState({ flowType: 'all', phase: 'all', assignmentStatus: 'all', fromDate: '', toDate: '', search: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.clients(filters).then(setClients).finally(() => setLoading(false))
  }, [filters])

  const visibleClients = clients.filter(client => {
    if (filters.assignmentStatus && filters.assignmentStatus !== 'all' && client.assignmentStatus !== filters.assignmentStatus) return false
    const eventDate = client.eventDate ? new Date(client.eventDate) : null
    if (filters.fromDate && eventDate && eventDate < new Date(filters.fromDate)) return false
    if (filters.toDate && eventDate) {
      const endDate = new Date(filters.toDate)
      endDate.setHours(23, 59, 59, 999)
      if (eventDate > endDate) return false
    }
    return true
  })

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Sales Clients</h1>
          <p>All clients in one combined Sales view. Open a client to see its flow-specific assignment data.</p>
        </div>
      </div>
      <Filters
        filters={filters}
        setFilters={setFilters}
        showAssignment
        showDates
        action={
          <button className="action-btn" onClick={() => downloadRows('sales-clients-report', visibleClients)}>
            <Download size={16} />
            Download
          </button>
        }
      />
      <Table headers={['Lead ID', 'Client', 'Contact', 'Event', 'Flow', 'Phase', 'Assignment', 'Team', 'Balance', 'Action']} empty={loading ? 'Loading clients...' : 'No clients found.'}>
        {!loading && visibleClients.length ? visibleClients.map(client => (
          <tr key={client.id}>
            <td className="accent">{client.serialNumber}</td>
            <td><Link to={`/sales/clients/${client.id}`}>{client.name}</Link></td>
            <td>{client.phone}<small>{client.email}</small></td>
            <td>{client.eventType}<small>{date(client.eventDate)}</small></td>
            <td>{flowLabel(client.flowType)}</td>
            <td>{label(client.currentPhase)}</td>
            <td><Badge value={client.assignmentStatus} /></td>
            <td className="truncate">{client.assignedTeamSummary}</td>
            <td>{money(client.invoiceBalance)}</td>
            <td><Link className="icon-link" to={`/sales/clients/${client.id}`}><Eye size={16} /></Link></td>
          </tr>
        )) : null}
      </Table>
    </div>
  )
}

export function Filters({ filters, setFilters, showAssignment = false, showDates = false, action = null }) {
  return (
    <div className="filters">
      <div className="search-box">
        <Search size={14} />
        <input value={filters.search || ''} onChange={event => setFilters(current => ({ ...current, search: event.target.value }))} placeholder="Search client, lead ID, phone, email..." />
      </div>
      <select value={filters.flowType || 'all'} onChange={event => setFilters(current => ({ ...current, flowType: event.target.value }))}>
        <option value="all">All flows</option>
        <option value="pre_wedding">Pre-wedding</option>
        <option value="post_wedding">Post-wedding</option>
      </select>
      <select value={filters.phase || 'all'} onChange={event => setFilters(current => ({ ...current, phase: event.target.value }))}>
        <option value="all">All phases</option>
        <option value="pre_production">Pre-production</option>
        <option value="event">Event</option>
        <option value="post_production">Post-production</option>
      </select>
      {showAssignment && (
        <select value={filters.assignmentStatus || 'all'} onChange={event => setFilters(current => ({ ...current, assignmentStatus: event.target.value }))}>
          <option value="all">All assignments</option>
          <option value="Assigned">Assigned</option>
          <option value="Unassigned">Unassigned</option>
        </select>
      )}
      {showDates && (
        <>
          <input className="filter-input" type="date" value={filters.fromDate || ''} onChange={event => setFilters(current => ({ ...current, fromDate: event.target.value }))} />
          <input className="filter-input" type="date" value={filters.toDate || ''} onChange={event => setFilters(current => ({ ...current, toDate: event.target.value }))} />
        </>
      )}
      {action}
    </div>
  )
}

function downloadRows(name, rows) {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${name}.json`
  link.click()
  URL.revokeObjectURL(url)
}
