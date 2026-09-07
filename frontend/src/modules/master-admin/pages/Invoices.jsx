import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { api } from '../api'
import { date, flowLabel, money } from '../utils'
import Badge from '../ui/Badge'
import Table from '../ui/Table'
import InvoiceModal from '../ui/InvoiceModal'

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [flowType, setFlowType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [previewInvoice, setPreviewInvoice] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.invoices({ flowType }).then(setInvoices).finally(() => setLoading(false))
  }, [flowType])

  return (
    <div>
      <div className="page-head">
        <div><h1>Sales Invoices</h1><p>Combined billing across Sales clients.</p></div>
        <select value={flowType} onChange={event => setFlowType(event.target.value)}>
          <option value="all">All flows</option>
          <option value="pre_wedding">Pre-wedding</option>
          <option value="post_wedding">Post-wedding</option>
        </select>
      </div>
      <Table headers={['Invoice ID', 'Client', 'Flow', 'Event Type', 'Total', 'Paid', 'Balance', 'Status', 'Due Date', 'Action']} empty={loading ? 'Loading invoices...' : 'No invoices found.'}>
        {!loading && invoices.length ? invoices.map(invoice => (
          <tr key={`${invoice.clientId}-${invoice.invoiceId}`}>
            <td className="accent">{invoice.invoiceId}</td>
            <td><Link to={`/sales/clients/${invoice.clientId}`}>{invoice.client}</Link></td>
            <td>{flowLabel(invoice.flowType)}</td>
            <td>{invoice.eventType}</td>
            <td>{money(invoice.total)}</td>
            <td>{money(invoice.paid)}</td>
            <td>{money(invoice.balance)}</td>
            <td><Badge value={invoice.status} /></td>
            <td>{date(invoice.dueDate)}</td>
            <td>
              <button className="icon-btn" onClick={() => setPreviewInvoice(invoice)} title="View Invoice">
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
