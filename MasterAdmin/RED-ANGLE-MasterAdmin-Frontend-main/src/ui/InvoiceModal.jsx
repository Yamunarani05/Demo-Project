import React from 'react'

const formatCurrency = n =>
  Number(n || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

const formatDate = date => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

const CATEGORY_ORDER = {
  'add on services': 0, 'add-on services': 0, 'add on service': 0,
  'add-on service': 0, 'add-ons': 0, 'add-on': 0, addons: 0, addon: 0,
  service: 10, services: 10, packages: 15,
  deliverable: 50, deliverables: 50,
  complementary: 70, complimentary: 70,
}

const MERGE_INTO = {
  wedding: 'SERVICE', shoot: 'SERVICE', ritual: 'SERVICE',
  rituals: 'SERVICE', engagement: 'SERVICE', reception: 'SERVICE',
}

function buildSortedCategories(raw, getOverrideQty) {
  const merged = {}
  for (const [cat, items] of Object.entries(raw || {})) {
    const key = cat.toLowerCase()
    if (key === 'package' || key === 'packages') continue
    if (key === 'service' || key === 'services') continue
    const parent = MERGE_INTO[key]
    const defaultDest = parent || Object.keys(merged).find(k => k.toLowerCase() === key) || cat

    for (const item of items) {
      let dest = defaultDest
      if (item && item.name && typeof item.name === 'string' && item.name.toUpperCase().includes('(EXTRA COMPLEMENTARY)')) {
        dest = 'COMPLEMENTARY'
      }
      if (!merged[dest]) merged[dest] = []
      merged[dest].push(item)
    }
  }
  return Object.entries(merged)
    .map(([cat, items]) => {
      const validItems = items.filter((i, idx) => {
        if (!i || !i.name || i.name.trim() === '') return false
        const override = getOverrideQty(i, cat, idx)
        const qty = override !== undefined ? override : Number(i.quantity || 1)
        return qty > 0
      })
      return [cat, validItems]
    })
    .filter(([_cat, items]) => items.length > 0)
    .sort(([a], [b]) => {
      const aOrd = CATEGORY_ORDER[a.toLowerCase()] ?? 40
      const bOrd = CATEGORY_ORDER[b.toLowerCase()] ?? 40
      return aOrd - bOrd
    })
}

function getHeaderTitle(raw) {
  for (const [cat, items] of Object.entries(raw || {})) {
    const key = cat.toLowerCase()
    if (key === 'service' || key === 'services' || key === 'packages' || key === 'package') {
      if (items?.length > 0 && items[0].name) {
        const pkgName = items[0].name.toUpperCase()
        return pkgName.includes('PACKAGE') ? `${pkgName} DESCRIPTION` : `${pkgName} PACKAGE DESCRIPTION`
      }
    }
  }
  return 'BASIC QUOTATION - PACKAGE DESCRIPTION'
}

export default function InvoiceModal({ invoice, onClose }) {
  if (!invoice) return null

  const data = typeof invoice.invoiceData === 'string' ? JSON.parse(invoice.invoiceData || '{}') : (invoice.invoiceData || {})
  
  const clientName = invoice.client || '-'
  const contact = data.lead?.email || data.lead?.contactNumber || '-'
  const rawCats = data.itemsByCategory || {}
  const qtyOverrides = data.qtyOverrides || {}

  const getOverrideQty = (item, cat, idx) => {
    if (!item || !item.name) return undefined
    if (qtyOverrides[item.name] !== undefined) return qtyOverrides[item.name]
    const oldKey = `${cat}-${idx}`
    if (qtyOverrides[oldKey] !== undefined) return qtyOverrides[oldKey]
    if (rawCats) {
      for (const [c, catItems] of Object.entries(rawCats)) {
        const foundIdx = catItems.findIndex(ci => ci.name === item.name)
        if (foundIdx !== -1 && qtyOverrides[`${c}-${foundIdx}`] !== undefined) {
          return qtyOverrides[`${c}-${foundIdx}`]
        }
      }
    }
    return undefined
  }

  const baseTotal = data.totalAmount ?? data.totalPrice ?? invoice.total ?? 0
  let subtotal = baseTotal
  
  if (Object.keys(qtyOverrides).length > 0) {
    let delta = 0
    for (const [cat, items] of Object.entries(rawCats)) {
      items.forEach((item, idx) => {
        const overrideQty = getOverrideQty(item, cat, idx)
        if (overrideQty !== undefined) {
          const originalQty = Number(item.quantity || 1)
          const price = Number(item.price || 0)
          delta += (overrideQty - originalQty) * price
        }
      })
    }
    subtotal = baseTotal + delta
  }

  const discount = data.discount ?? 0
  const paid = invoice.paid ?? 0
  const overall = subtotal - discount
  const balance = invoice.balance ?? (overall - paid)
  
  const sortedCategories = buildSortedCategories(rawCats, getOverrideQty)
  const headerTitle = getHeaderTitle(rawCats)

  const getEventValue = label =>
    data.previewEvents?.find(e => e.title.toUpperCase() === label.toUpperCase())?.value || '-'

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content invoice-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 850, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa' }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Invoice Preview</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>&times;</button>
        </div>
        
        <div style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', background: '#f1f5f9', padding: 20 }}>
          <div className="flex justify-center bg-white py-4" style={{ display: 'flex', justifyContent: 'center', background: '#fff', padding: '16px 0', borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <style>{`
              .inv { background:#fff; width:780px; border:2px solid #000; font-size:11.5px; color:#000; font-family:Arial,Helvetica,sans-serif; margin: 0 auto; }
              .inv-top { border-bottom:1px solid #000; padding:6px 14px 5px; font-weight:700; font-size:11.5px; }
              .inv-top table { width:100%; border-collapse:collapse; }
              .inv-top td { vertical-align:top; line-height:1.65; }
              .inv-top .mid { text-align:center; font-size:13px; font-weight:900; text-decoration:underline; letter-spacing:2px; }
              .inv-top .right { text-align:right; }
              .inv-logo { border-bottom:1px solid #000; padding:10px 16px 8px; text-align:center; }
              .inv-logo-row { display:inline-flex; align-items:center; gap:10px; margin-bottom:5px; }
              .inv-address { font-size:12.5px; font-weight:700; margin-top:2px; }
              .inv-client-table { width:100%; border-collapse:collapse; border-bottom:1px solid #000; }
              .inv-client-cell { width:170px; border-right:1px solid #000; padding:8px 10px; vertical-align:top; font-weight:700; font-size:11.5px; line-height:1.6; }
              .inv-client-name { font-size:12px; font-weight:900; margin-top:14px; text-transform:uppercase; }
              .inv-event-inner { width:100%; border-collapse:collapse; }
              .inv-event-inner tr { border-bottom:1px solid #000; }
              .inv-event-inner tr:last-child { border-bottom:none; }
              .inv-ev-label { width:140px; padding:5px 8px; font-weight:700; border-right:1px solid #000; white-space:nowrap; vertical-align:middle; font-size:11.5px; text-transform: uppercase; }
              .inv-ev-value { padding:5px 8px; vertical-align:middle; font-size:11.5px; font-weight:600; text-transform: uppercase; }
              .inv-items { width:100%; border-collapse:collapse; border-top:1.5px solid #000; border-bottom:1px solid #000; font-size:11.5px; }
              .inv-items thead tr { border-bottom:1.5px solid #000; }
              .inv-items th { padding:7px 8px; font-weight:700; font-size:11.5px; border-right:1px solid #000; text-align:center; background:#fff; }
              .inv-items th:last-child { border-right:none; }
              .inv-items th.th-sl { width:58px; }
              .inv-items th.th-qty { width:88px; }
              .inv-items td { padding:3.5px 8px; border-right:1px solid #000; vertical-align:middle; }
              .inv-items td:last-child { border-right:none; }
              .inv-items .td-sl { text-align:center; width:58px; }
              .inv-items .td-qty { text-align:center; width:88px; }
              .inv-cat-row td { padding:6px 8px 4px; background:#fff; }
              .inv-cat-row .td-sl { border-right:1px solid #000; }
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
              <div className="inv-top">
                <table><tbody><tr>
                  <td style={{ width: '34%' }}>
                    GSTIN : 33ABIFR7594P1Z8
                    <div style={{ marginTop: 2 }}>DATE : {formatDate(data.billingDate || invoice.createdAt)}</div>
                  </td>
                  <td className="mid" style={{ width: '32%' }}>PROFORMA INVOICE</td>
                  <td className="right" style={{ width: '34%' }}>
                    BILL NO : {invoice.serialNumber || data.lead?.leadSerialNumber || invoice.clientId}
                  </td>
                </tr></tbody></table>
              </div>

              <div className="inv-logo">
                <div className="inv-logo-row">
                  <h1 style={{ fontSize: 26, fontWeight: 900, color: '#c00', letterSpacing: 1, margin: 0 }}>RED ANGLE</h1>
                </div>
                <div className="inv-address">
                  AP 742, G-Block, 2nd Street, 11th Main Rd, Anna Nagar, Chennai, Tamil Nadu 600040.
                </div>
              </div>

              <table className="inv-client-table"><tbody><tr>
                <td className="inv-client-cell">
                  TO
                  <div className="inv-client-name">{clientName}</div>
                  <div style={{ marginTop: 4, fontWeight: 600 }}>{contact}</div>
                </td>
                <td style={{ padding: 0, verticalAlign: 'top' }}>
                  <table className="inv-event-inner"><tbody>
                    {[
                      { label: 'EVENT NAME', val: getEventValue('EVENT NAME') },
                      { label: 'ENGAGEMENT', val: getEventValue('ENGAGEMENT') },
                      { label: 'WEDDING', val: getEventValue('WEDDING') },
                      { label: 'RECEPTION', val: getEventValue('RECEPTION') },
                      { label: 'RITUALS', val: getEventValue('RITUALS') },
                      { label: 'LOCATION', val: getEventValue('LOCATION') },
                    ].map(row => (
                      <tr key={row.label}>
                        <td className="inv-ev-label">{row.label} :</td>
                        <td className="inv-ev-value">{row.val}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </td>
              </tr></tbody></table>

              <table className="inv-items">
                <thead>
                  <tr>
                    <th className="th-sl">SL.NO</th>
                    <th style={{ textAlign: 'center' }}>{headerTitle}</th>
                    <th className="th-qty">QTY./UNIT</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCategories.map(([category, items]) => {
                    let slNo = 1
                    return (
                      <React.Fragment key={category}>
                        <tr className="inv-cat-row">
                          <td className="td-sl"></td>
                          <td style={{ borderRight: '1px solid #000' }}>
                            <span className="inv-cat-label">{category} :</span>
                          </td>
                          <td></td>
                        </tr>
                        {items.map((item, idx) => {
                          const overrideQty = getOverrideQty(item, category, idx)
                          const finalQty = overrideQty !== undefined ? overrideQty : (item.quantity || 1)
                          return (
                            <tr key={`${category}-${idx}`}>
                              <td className="td-sl">{slNo++}.</td>
                              <td style={{ borderRight: '1px solid #000', textTransform: 'uppercase' }}>
                                {item.name}
                              </td>
                              <td className="td-qty">
                                {String(finalQty).padStart(2, '0')}
                              </td>
                            </tr>
                          )
                        })}
                      </React.Fragment>
                    )
                  })}

                  <tr className="inv-totals-row" style={{ borderTop: '1.5px solid #000' }}>
                    <td></td><td className="t-label">TOTAL</td>
                    <td className="t-amount">{formatCurrency(subtotal)}</td>
                  </tr>
                  <tr className="inv-totals-row">
                    <td></td><td className="t-label">DISCOUNT</td>
                    <td className="t-amount">{formatCurrency(discount)}</td>
                  </tr>
                  <tr className="inv-totals-row inv-overall">
                    <td></td><td className="t-label">OVERALL BUDGET</td>
                    <td className="t-amount">{formatCurrency(overall)}</td>
                  </tr>
                  <tr className="inv-totals-row">
                    <td></td><td className="t-label">PAID</td>
                    <td className="t-amount">{formatCurrency(paid)}</td>
                  </tr>
                  <tr className="inv-totals-row">
                    <td></td><td className="t-label">BALANCE</td>
                    <td className="t-amount">{formatCurrency(balance)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="inv-notes">
                <div className="inv-notes-title">IMPORTANT NOTES :</div>
                {[
                  "5 HOURS PER SESSION (INCLUDING PRE OR POST WEDDING), IN CASE ADDITIONAL DURATION OF TIME HAPPENS IN THE EVENTS, THEN THE COVERAGE COST MAY DIFFER.",
                  "TOKEN ADVANCE IS NON REFUNDABLE.",
                  "IN DELIVERABLES LIKE ALBUMS & VIDEOS, IF ANY CORRECTIONS ARISES REG ALBUM PDF AND VIDEOS THEN ALL THE CORRECTIONS SHOULD BE CONVEYED ONCE OR TWICE BEYOND THAT THIRD OR FOURTH CORRECTIONS OR MORE THAN THAT, EXTRA PAYMENT WILL BE CHARGED ACCORDING TO THE SERVICES.",
                  "YOU WILL RECEIVE ALL YOUR DELIVERABLES AS PER INVOICE, IF INCASE ANY OTHER SERVICES YOU ARE EXPECTING FROM RED ANGLE WHICH IS NOT MENTIONED IN YOUR INVOICE WILL BE CHARGED AS EXTRA PAYMENT.",
                  "IN INVOICE PRE OR POST WEDDING SHOOT WILL BE PLANNED ACCORDING TO YOU IN SHOOTERS AVAILABLE DATES AND IN MUHURTHAM DATES & IF MUHURTHAM DATES ARE COMING IN WEEKENDS, THEN TEAM WILL NOT BE ABLE TO SHOOT AT THAT TIME.",
                  "IF ADD-ON SESSIONS TAKEN BEFORE YOUR EVENTS, THEN THE PAYMENT OF 80% IN YOUR QUOTATION (EXCLUDING TOKEN ADVANCE) AND ADD ON SESSIONS AMOUNT SHOULD BE PAID AT THE END OF THE SESSION ON THE SAME DAY.",
                  "INCASE YOU ARE OPTING FOR POST WEDDING SHOOT, THEN VALIDITY OF THE COMPLIMENTARY SHOOT WILL BE ONLY FOR 90 DAYS AFTER YOUR WEDDING OR ELSE PAYMENT SHOULD BE MADE FOR POST WEDDING SHOOT.",
                  "FOR YOUR ALBUM, YOU NEED TO SELECT THE PHOTOS FIRST THEN ONLY WE CAN ABLE TO START YOUR FURTHER DELIVERABLE WORKS (NOTE: PRIORITIZE PHOTO SELECTION). WE HAVE PIX OFFICE SUPPORT FOR PHOTO SELECTION WHICH WILL BE EXPIRED WITHIN 150 DAYS.",
                  "IF YOU ARE FINALIZING THE ALBUM PDF LAYOUT, AT THAT TIME THE REMAINING 20% OF PENDING PAYMENT WILL BE PAID ONCE YOU ARE GIVING APPROVAL FOR ALBUM PRINTING.",
                  "MODES OF PAYMENT WILL BE ACCOUNT TRANSFER OR GPAY/PHONEPE OR CASH. CREDIT/DEBIT CARD PAYMENTS WILL NOT BE ACCEPTABLE.",
                  "TRAVEL, FOOD AND ACCOMMODATION SHOULD BE TAKEN CARE BY THE CLIENT (PRE OR POST SHOOT, WEDDING, RECEPTION AND ANY OTHER EVENTS).",
                  "IF INCASE ANY HUMAN ERROR OR TECHNICAL ERROR HAPPENS IN FUTURE WHICH AFFECTS ANY OF THE FOOTAGES, THEN FOR THAT PARTICULAR SERVICE, THE CHARGED AMOUNT WILL BE REFUNDED.",
                  "WE WILL KEEP YOUR CONTENT FOR 6 MONTHS ONLY FROM YOUR EVENT DATE SO BEFORE THAT KINDLY BRING YOUR PENDRIVE OR HARDISK AND COPY ALL YOUR RAW FOOTAGES.",
                  "ONCE THE ENTIRE CONTENT COPIED FROM US THROUGH HARD DISK OR PENDRIVE, WHICH EXCEEDS THE TIME PERIOD OF 6 MONTHS, AFTER THAT YOU HAVE TO BRING THE COPIED CONTENT FOR THE COMPLETION OF DELIVERABLES.",
                ].map((note, idx) => (
                  <div className="inv-note-item" key={idx}>
                    <span className="inv-note-bullet">&bull;</span>
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
