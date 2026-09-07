import React, { useRef } from 'react'

const formatCurrency = n =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatDate = date => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const MERGE_INTO = {
  wedding: 'SERVICE',
  shoot: 'SERVICE',
  ritual: 'SERVICE',
  rituals: 'SERVICE',
  engagement: 'SERVICE',
  reception: 'SERVICE',
}

const CATEGORY_ORDER = {
  'add on services': 0, 'add-on services': 0, 'add on service': 0, 'add-on service': 0,
  'add-ons': 0, 'add-on': 0, addons: 0, addon: 0,
  service: 10, services: 10, packages: 15,
  deliverable: 50, deliverables: 50,
  complementary: 70, complimentary: 70,
}

function buildSortedEntries(itemsByCategory) {
  const raw = { ...(itemsByCategory || {}) }
  const merged = {}

  for (const [cat, items] of Object.entries(raw)) {
    const key = cat.toLowerCase()
    if (key === 'service' || key === 'services' || key === 'packages' || key === 'package') continue

    const parent = MERGE_INTO[key]
    if (parent) {
      if (!merged[parent]) merged[parent] = []
      merged[parent].push(...items)
    } else {
      const existing = Object.keys(merged).find(k => k.toLowerCase() === key)
      const dest = existing ?? cat
      if (!merged[dest]) merged[dest] = []
      merged[dest].push(...items)
    }
  }

  return Object.entries(merged).sort(([a], [b]) => {
    const aOrd = CATEGORY_ORDER[a.toLowerCase()] ?? 40
    const bOrd = CATEGORY_ORDER[b.toLowerCase()] ?? 40
    return aOrd - bOrd
  })
}

function getPackageTitle(itemsByCategory) {
  const raw = { ...(itemsByCategory || {}) }
  for (const [cat, items] of Object.entries(raw)) {
    const key = cat.toLowerCase()
    if (key === 'service' || key === 'services' || key === 'packages' || key === 'package') {
      if (items && items.length > 0 && items[0].name) {
        const pkgName = items[0].name.toUpperCase()
        return pkgName.includes('PACKAGE') ? `${pkgName} DESCRIPTION` : `${pkgName} PACKAGE DESCRIPTION`
      }
    }
  }
  return 'RED ANGLE REGULAR PREMIUM PACKAGE DESCRIPTION'
}

const IMPORTANT_NOTES = [
  '5 HOURS PER SESSION (INCLUDING PRE OR POST WEDDING), IN CASE ADDITIONAL DURATION OF TIME HAPPENS IN THE EVENTS, THEN THE COVERAGE COST MAY DIFFER.',
  'TOKEN ADVANCE IS NON REFUNDABLE.',
  'IN DELIVERABLES LIKE ALBUMS & VIDEOS, IF ANY CORRECTIONS ARISES REG ALBUM PDF AND VIDEOS THEN ALL THE CORRECTIONS SHOULD BE CONVEYED ONCE OR TWICE BEYOND THAT THIRD OR FOURTH CORRECTIONS OR MORE THAN THAT, EXTRA PAYMENT WILL BE CHARGED ACCORDING TO THE SERVICES.',
  'YOU WILL RECEIVE ALL YOUR DELIVERABLES AS PER INVOICE, IF INCASE ANY OTHER SERVICES YOU ARE EXPECTING FROM RED ANGLE WHICH IS NOT MENTIONED IN YOUR INVOICE WILL BE CHARGED AS EXTRA PAYMENT.',
  'IN INVOICE PRE OR POST WEDDING SHOOT WILL BE PLANNED ACCORDING TO YOU IN SHOOTERS AVAILABLE DATES AND IN MUHURTHAM DATES & IF MUHURTHAM DATES ARE COMING IN WEEKENDS, THEN TEAM WILL NOT BE ABLE TO SHOOT AT THAT TIME.',
  'IF ADD-ON SESSIONS TAKEN BEFORE YOUR EVENTS, THEN THE PAYMENT OF 80% IN YOUR QUOTATION (EXCLUDING TOKEN ADVANCE) AND ADD ON SESSIONS AMOUNT SHOULD BE PAID AT THE END OF THE SESSION ON THE SAME DAY.',
  'INCASE YOU ARE OPTING FOR POST WEDDING SHOOT, THEN VALIDITY OF THE COMPLIMENTARY SHOOT WILL BE ONLY FOR 90 DAYS AFTER YOUR WEDDING OR ELSE PAYMENT SHOULD BE MADE FOR POST WEDDING SHOOT, IF THE DURATION OF TIME (5 HOURS) EXCEEDS THEN YOU NEED TO PAY FOR POST WEDDING SHOOT.',
  'FOR YOUR ALBUM, YOU NEED TO SELECT THE PHOTOS FIRST THEN ONLY WE CAN ABLE TO START YOUR FURTHER DELIVERABLE WORKS (NOTE: PRIORITIZE PHOTO SELECTION). WE HAVE PIX OFFCE SUPPORT FOR PHOTO SELECTION WHICH WILL BE EXPIRED WITHIN 150 DAYS. IF YOU ARE DELAYING, THEN PHOTO SELECTION WILL BE DONE BY YOU MANUALLY.',
  'IF YOU ARE FINNALIZING THE ALBUM PDF LAYOUT, AT THAT TIME THE REMAINING 20% OF PENDING PAYMENT WILL BE PAID ONCE YOU ARE GIVING APPROVAL FOR ALBUM PRINTING.',
  'MODES OF PAYMENT WILL BE ACCOUNT TRANSFER OR GPAY/PHONEPE OR CASH. CREDIT/DEBIT CARD PAYMENTS WILL NOT BE ACCEPTABLE.',
  'TRAVEL, FOOD AND ACCOMMODATION SHOULD BE TAKEN CARE BY THE CLIENT (PRE OR POST SHOOT, WEDDING, RECEPTION AND ANY OTHER EVENTS).',
  'IF INCASE ANY HUMAN ERROR OR TECHNICAL ERROR HAPPENS IN FUTURE WHICH AFFECTS ANY OF THE FOOTAGES, THEN FOR THAT PARTICULAR SERVICE, THE CHARGED AMOUNT WILL BE REFUNDED.',
  'WE WILL KEEP YOUR CONTENT FOR 6 MONTHS ONLY FROM YOUR EVENT DATE SO BEFORE THAT KINDLY BRING YOUR PENDRIVE OR HARDISK AND COPY ALL YOUR RAW FOOTAGES. WE WILL NOT HAVE BACKUP OF YOUR RAW FOOTAGES ONCE THE TIME PERIOD AS EXPIRED.',
  'ONCE THE ENTIRE CONTENT COPIED FROM US THROUGH HARD DISK OR PENDRIVE, WHICH EXCEEDS THE TIME PERIOD OF 6 MONTHS, AFTER THAT YOU HAVE TO BRING THE COPIED CONTENT FOR THE COMPLETION OF DELIVERABLES. (INCLUDES BOTH PHOTOS AND VIDEOS).',
]

export default function InvoicePreviewModal({ isOpen, onClose, invoice }) {
  const contentRef = useRef(null)

  if (!isOpen || !invoice) return null

  const qtyOverrides = invoice.qtyOverrides || {}
  const getQty = (key, originalQty) =>
    qtyOverrides[key] !== undefined ? qtyOverrides[key] : originalQty

  const subtotal = invoice.totalAmount || 0
  const discount = invoice.discount || 0
  const overall = subtotal - discount
  const paid = invoice.paid || 0
  const balance = overall - paid

  const entries = buildSortedEntries(invoice.itemsByCategory)
  const hasItems = entries.length > 0

  const handleDownloadPDF = async () => {
    const element = contentRef.current
    if (!element) return
    try {
      const html2pdf = (await import('html2pdf.js')).default
      html2pdf()
        .set({
          margin: [5, 5, 5, 5],
          filename: `Invoice-${invoice.billNo || invoice.invoiceId}.pdf`,
          html2canvas: { scale: 2, width: element.scrollWidth, windowWidth: element.scrollWidth },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save()
    } catch (err) {
      console.error('PDF download failed:', err)
    }
  }

  const eventRows = [
    { label: 'EVENT NAME', value: invoice.eventName },
    { label: 'ENGAGEMENT', value: invoice.engagementDetails },
    { label: 'WEDDING', value: invoice.weddingDetails },
    { label: 'RECEPTION', value: invoice.receptionDetails },
    { label: 'RITUALS', value: invoice.ritualsDetails },
    { label: 'LOCATION', value: invoice.location },
  ]

  return (
    <div className="inv-modal-overlay" onClick={onClose}>
      <div className="inv-modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="inv-modal-header">
          <h2>Proforma Invoice Outline</h2>
          <div className="inv-modal-header-actions">
            <button onClick={handleDownloadPDF} className="inv-modal-btn inv-btn-download" title="Download PDF">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <button onClick={onClose} className="inv-modal-btn inv-btn-close" title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Scrollable invoice content */}
        <div className="inv-modal-scroll">
          <div ref={contentRef} className="inv-paper">
            <style>{`
              .inv { background:#fff; width:100%; min-width:700px; border:2px solid #000; font-size:11.5px; color:#000; font-family:Arial,Helvetica,sans-serif; }
              .inv-top { border-bottom:1px solid #000; padding:6px 14px 5px; font-weight:700; font-size:11.5px; }
              .inv-top table { width:100%; border-collapse:collapse; }
              .inv-top td { vertical-align:top; line-height:1.65; }
              .inv-top .mid { text-align:center; font-size:13px; font-weight:900; text-decoration:underline; letter-spacing:2px; }
              .inv-top .right { text-align:right; }
              .inv-logo { border-bottom:1px solid #000; padding:10px 16px 8px; text-align:center; }
              .inv-address { font-size:12.5px; font-weight:700; margin-top:2px; }
              .inv-client-table { width:100%; border-collapse:collapse; border-bottom:1px solid #000; }
              .inv-client-cell { width:170px; border-right:1px solid #000; padding:8px 10px; vertical-align:top; font-weight:700; font-size:11.5px; line-height:1.6; }
              .inv-client-name { font-size:12px; font-weight:900; margin-top:14px; text-transform:uppercase; }
              .inv-event-inner { width:100%; border-collapse:collapse; }
              .inv-event-inner tr { border-bottom:1px solid #000; }
              .inv-event-inner tr:last-child { border-bottom:none; }
              .inv-ev-label { width:140px; padding:5px 8px; font-weight:700; border-right:1px solid #000; white-space:nowrap; vertical-align:middle; font-size:11.5px; text-transform: uppercase; }
              .inv-ev-value { padding:5px 8px; vertical-align:middle; font-size:11.5px; font-weight:600; text-transform: uppercase; }
              .inv-items { width:100%; border-collapse:collapse; border-top:1.5px solid #000; border-bottom:1px solid #000; font-size:11.5px; table-layout:fixed; }
              .inv-items thead tr { border-bottom:1.5px solid #000; }
              .inv-items th { padding:7px 8px; font-weight:700; font-size:11.5px; border-right:1px solid #000; text-align:center; }
              .inv-items th:last-child { border-right:none; }
              .inv-items th.th-sl { width:58px; }
              .inv-items th.th-qty { width:88px; }
              .inv-items td { padding:3.5px 8px; border-right:1px solid #000; vertical-align:middle; }
              .inv-items td:last-child { border-right:none; }
              .inv-items .td-sl { text-align:center; width:58px; border-right:1px solid #000; }
              .inv-items .td-qty { text-align:center; width:88px; }
              .inv-cat-row td { padding:6px 8px 4px; border-right:1px solid #000; }
              .inv-cat-row td:last-child { border-right:none; }
              .inv-cat-label { font-weight:700; font-size:11.5px; text-transform:uppercase; text-decoration:underline; letter-spacing:0.3px; }
              .inv-totals-row td { padding:5px 10px; border-bottom:1px solid #000; }
              .inv-totals-row:last-child td { border-bottom:none; }
              .inv-totals-row .t-label { text-align:right; font-weight:600; text-transform:uppercase; letter-spacing:0.3px; }
              .inv-totals-row .t-amount { text-align:center; font-weight:700; white-space:nowrap; }
              .inv-overall td { font-weight:900; font-size:12.5px; }
              .inv-notes { border-top:1px solid #000; padding:10px 14px 14px; font-size:10.5px; line-height:1.48; }
              .inv-notes-title { font-weight:700; font-size:11px; margin-bottom:5px; text-transform:uppercase; }
              .inv-note-item { display:flex; gap:5px; margin-bottom:3px; align-items:flex-start; text-transform:uppercase; }
              .inv-note-bullet { flex-shrink:0; font-size:13px; line-height:1.25; }
            `}</style>

            <div className="inv">
              {/* Top bar */}
              <div className="inv-top">
                <table><tbody><tr>
                  <td style={{ width: '34%' }}>
                    GSTIN : 33ABIFR7594P1Z8
                    <div style={{ marginTop: 2 }}>DATE : {formatDate(invoice.billingDate)}</div>
                  </td>
                  <td className="mid" style={{ width: '32%' }}>PROFORMA INVOICE</td>
                  <td className="right" style={{ width: '34%' }}>
                    BILL NO : {invoice.billNo ?? invoice.invoiceId}
                  </td>
                </tr></tbody></table>
              </div>

              {/* Logo */}
              <div className="inv-logo">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
                  <img src="/red_angle_logo.png" alt="Red Angle Studio" style={{ height: 70, objectFit: 'contain' }}
                    onError={e => { e.target.style.display = 'none' }} />
                </div>
                <div className="inv-address">
                  AP 742, G-Block, 2nd Street, 11th Main Rd, Anna Nagar, Chennai, Tamil Nadu 600040.
                </div>
              </div>

              {/* Client + Event details */}
              <table className="inv-client-table"><tbody><tr>
                <td className="inv-client-cell">
                  TO
                  <div className="inv-client-name">{invoice.name}</div>
                  <div style={{ marginTop: 4, fontWeight: 600 }}>{invoice.contact}</div>
                </td>
                <td style={{ padding: 0, verticalAlign: 'top' }}>
                  <table className="inv-event-inner"><tbody>
                    {eventRows.map(row => (
                      <tr key={row.label}>
                        <td className="inv-ev-label">{row.label} :</td>
                        <td className="inv-ev-value" style={{ textTransform: 'uppercase' }}>
                          <div style={{ minHeight: 18 }}>{row.value || ''}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody></table>
                </td>
              </tr></tbody></table>

              {/* Items table */}
              <table className="inv-items">
                <thead><tr>
                  <th className="th-sl">SL.NO</th>
                  <th style={{ textAlign: 'center' }}>{getPackageTitle(invoice.itemsByCategory)}</th>
                  <th className="th-qty">QTY./Unit</th>
                </tr></thead>
                <tbody>
                  {hasItems ? entries.map(([category, items]) => {
                    let slNo = 1
                    return (
                      <React.Fragment key={category}>
                        <tr className="inv-cat-row">
                          <td className="td-sl">&nbsp;</td>
                          <td><span className="inv-cat-label">{category} :</span></td>
                          <td className="td-qty">&nbsp;</td>
                        </tr>
                        {items.map((item, idx) => {
                          const rawKey = `${category}-${idx}`
                          const qty = getQty(rawKey, item.quantity)
                          return (
                            <tr key={`${category}-${idx}`}>
                              <td className="td-sl">{slNo++}.</td>
                              <td style={{ textTransform: 'uppercase' }}>{item.name}</td>
                              <td className="td-qty">{String(qty).padStart(2, '0')}</td>
                            </tr>
                          )
                        })}
                      </React.Fragment>
                    )
                  }) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '20px 8px', color: '#666', fontStyle: 'italic' }}>
                        No invoice items available
                      </td>
                    </tr>
                  )}

                  {/* Totals */}
                  <tr className="inv-totals-row" style={{ borderTop: '1.5px solid #000' }}>
                    <td></td>
                    <td className="t-label">TOTAL</td>
                    <td className="t-amount">{formatCurrency(subtotal)}</td>
                  </tr>
                  <tr className="inv-totals-row">
                    <td></td>
                    <td className="t-label">DISCOUNT</td>
                    <td className="t-amount">{formatCurrency(discount)}</td>
                  </tr>
                  <tr className="inv-totals-row inv-overall">
                    <td></td>
                    <td className="t-label">OVERALL BUDGET</td>
                    <td className="t-amount">{formatCurrency(overall)}</td>
                  </tr>
                  <tr className="inv-totals-row">
                    <td></td>
                    <td className="t-label">PAID</td>
                    <td className="t-amount">{formatCurrency(paid)}</td>
                  </tr>
                  <tr className="inv-totals-row">
                    <td></td>
                    <td className="t-label">BALANCE</td>
                    <td className="t-amount">{formatCurrency(balance)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Important notes */}
              <div className="inv-notes">
                <div className="inv-notes-title">IMPORTANT NOTES :</div>
                {IMPORTANT_NOTES.map((note, idx) => (
                  <div className="inv-note-item" key={idx}>
                    <span className="inv-note-bullet">&#8226;</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
