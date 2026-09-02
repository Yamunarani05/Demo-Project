import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { api } from '../api'
import { flowLabel } from '../utils'
import Table from '../ui/Table'
import { Filters } from './Clients.jsx'
import ClientWorkTrackerModal from '../ui/ClientWorkTrackerModal'

export default function WorkTracker() {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ flowType: 'all', phase: 'all', search: '' })
  const [loading, setLoading] = useState(true)
  const [selectedClientId, setSelectedClientId] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.workTracker(filters).then(setItems).finally(() => setLoading(false))
  }, [filters])

  const visible = items.filter(item => `${item.client} ${item.task} ${item.employee}`.toLowerCase().includes((filters.search || '').toLowerCase()))

  const groupedClients = []
  const clientMap = new Map()

  visible.forEach(item => {
    if (!clientMap.has(item.clientId)) {
      const newGroup = {
        clientId: item.clientId,
        clientName: item.client,
        flowType: item.flowType,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0
      }
      clientMap.set(item.clientId, newGroup)
      groupedClients.push(newGroup)
    }
    
    const group = clientMap.get(item.clientId)
    const isCompleted = String(item.status).toLowerCase().includes('complete')
    group.totalTasks += 1
    if (isCompleted) {
      group.completedTasks += 1
    } else {
      group.pendingTasks += 1
    }
  })

  return (
    <div>
      <div className="page-head"><div><h1>Sales Work Tracker</h1><p>Combined task tracking across all Sales clients.</p></div></div>
      <Filters filters={filters} setFilters={setFilters} />
      <Table headers={['Client', 'Flow', 'Total Tasks', 'Completed', 'Pending', 'Action']} empty={loading ? 'Loading work...' : 'No clients found matching the criteria.'}>
        {!loading && groupedClients.length ? groupedClients.map(group => (
          <tr key={group.clientId}>
            <td>
              <button 
                onClick={() => setSelectedClientId(group.clientId)} 
                style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: '13px' }}
                title="View Client Details"
              >
                {group.clientName}
              </button>
            </td>
            <td>{flowLabel(group.flowType)}</td>
            <td>{group.totalTasks}</td>
            <td style={{ color: '#10b981', fontWeight: 600 }}>{group.completedTasks}</td>
            <td style={{ color: group.pendingTasks > 0 ? '#f59e0b' : 'inherit' }}>{group.pendingTasks}</td>
            <td>
              <button onClick={() => setSelectedClientId(group.clientId)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }} title="View Tracker">
                <Eye size={16} />
              </button>
            </td>
          </tr>
        )) : null}
      </Table>

      <ClientWorkTrackerModal 
        isOpen={!!selectedClientId} 
        onClose={() => setSelectedClientId(null)} 
        clientId={selectedClientId} 
      />
    </div>
  )
}
