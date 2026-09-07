import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { date, flowLabel, label } from '../utils'
import Badge from './Badge'
import Table from './Table'

export default function ClientWorkTrackerModal({ isOpen, onClose, clientId }) {
  const [loading, setLoading] = useState(false)
  const [client, setClient] = useState(null)
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!isOpen || !clientId) return
    let isMounted = true
    setLoading(true)
    
    Promise.all([
      api.client(clientId),
      api.clientWorkTracker(clientId)
    ]).then(([clientData, workData]) => {
      if (isMounted) {
        setClient(clientData)
        setRows(workData || [])
        setLoading(false)
      }
    }).catch(err => {
      console.error('Failed to fetch client work tracker details:', err)
      if (isMounted) setLoading(false)
    })

    return () => { isMounted = false }
  }, [isOpen, clientId])

  if (!isOpen) return null

  return (
    <div className="inv-modal-overlay" onClick={onClose}>
      <div className="inv-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: 950, overflow: 'hidden' }}>
        <div className="inv-modal-header">
          <h2>Client Work Tracker {client ? `— ${client.name}` : ''}</h2>
          <div className="inv-modal-header-actions">
            <button onClick={onClose} className="inv-modal-btn inv-btn-close" title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div className="inv-modal-scroll" style={{ background: '#fff', padding: '24px' }}>
          {loading ? (
            <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>Loading details...</div>
          ) : !client ? (
            <div className="card padded" style={{ textAlign: 'center' }}>Failed to load client details.</div>
          ) : (
            <Work rows={rows} client={client} />
          )}
        </div>
      </div>
    </div>
  )
}

function Work({ rows, client }) {
  const stageRows = rows.filter(row => row.isStageRow)
  const taskRows = rows.filter(row => !row.isStageRow)
  
  return (
    <div>
      <div className="workflow-strip card padded" style={{ marginBottom: '24px' }}>
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
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border)' }}>
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
      </div>
      {taskRows.length > 0 && <p className="section-note" style={{ marginTop: '16px', color: '#6b7280', fontSize: '13px' }}>Stage rows are ordered by the client flow type; task rows below each stage come from CRM stage tracking and assigned project work.</p>}
    </div>
  )
}
