// src/pages/public/PublicInvoiceView.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import redAngleLogo from "../../assets/red_angle_logo.png";

interface PackageItem {
  unit: number;
  package: {
    packageTitle: string;
  };
}

interface PublicInvoiceData {
  invoiceId: number;
  billingDate: string;
  status: string;
  token: string;
  totalPrice: number;
  totalAmount: number;
  discount: number;
  paid: number;
  itemsByCategory?: Record<string, { name: string; quantity: number }[]>;
  previewEvents?: { title: string; value: string }[];
  previewItems?: { category: string; items: any[] }[];
  qtyOverrides?: Record<string, number>;

  lead: {
    firstName: string;
    lastName: string;
    address: string | null;
    email: string | null;
    contactNumber: string | null;
    eventType: string | null;
    eventDate: string | null;
    description: string | null;
    leadSerialNumber?: string;
    leadType?: string;
    leadId?: number;
  };
  packageInvoices: PackageItem[];
}

const formatCurrency = (n: number) =>
  n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const formatDate = (date?: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const PublicInvoiceView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [invoice, setInvoice] = useState<PublicInvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [issueMode, setIssueMode] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState(invoice?.status || "");

  const apiBase = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${apiBase}/invoices/public/${token}`)
      .then((res) => {
        setInvoice(res.data.data);
        setStatus(res.data.data.status);
      })
      .catch(() =>
        setMessage("Unable to load invoice. The link may be invalid or expired.")
      )
      .finally(() => setLoading(false));
  }, [token, apiBase]);


  useEffect(() => {
    console.log("Invoice from API:", invoice);
  }, [invoice]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading invoiceâ€¦
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {message}
      </div>
    );
  }


  const handleAccept = async () => {
    if (!invoice?.token) return;
    try {
      setSubmitting(true);
      await axios.put(
        `${apiBase}/invoices/public/${encodeURIComponent(invoice.token)}/status`,
        { status: "approved" }
      );
      setStatus("approved"); // âœ… update UI
      setMessage("Invoice approved successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to approve invoice. Please contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendIssue = async () => {
    if (!invoice) return;
    if (!issueTitle.trim() || !issueDescription.trim()) {
      setMessage("Please fill both title and description.");
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(
        `${apiBase}/invoices/public/${invoice.token}/issues`,
        {
          issueTitle: issueTitle.trim(),
          description: issueDescription.trim(),
        }
      );
      setMessage("Issue sent successfully. Our team will contact you soon.");
      setIssueMode(false);
      setIssueTitle("");
      setIssueDescription("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to send issue. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };


  const handleRejectClick = () => setIssueMode(true);


  const discount = invoice.discount ?? 0;
  const paid = invoice.paid ?? 0;

  const rawCats = invoice.itemsByCategory as Record<string, any[]> | undefined;
  const qtyOverrides = invoice.qtyOverrides || {};

  const getOverrideQty = (item: any, cat: string, idx: number): number | undefined => {
    if (!item || !item.name) return undefined;
    if (qtyOverrides[item.name] !== undefined) return qtyOverrides[item.name];
    const oldKey = `${cat}-${idx}`;
    if (qtyOverrides[oldKey] !== undefined) return qtyOverrides[oldKey];
    if (rawCats) {
      for (const [c, catItems] of Object.entries(rawCats)) {
        const foundIdx = catItems.findIndex((ci: any) => ci.name === item.name);
        if (foundIdx !== -1 && qtyOverrides[`${c}-${foundIdx}`] !== undefined) {
          return qtyOverrides[`${c}-${foundIdx}`];
        }
      }
    }
    return undefined;
  };

  const baseTotal = invoice.totalAmount ?? invoice.totalPrice ?? 0;
  let subtotal = baseTotal;

  if (Object.keys(qtyOverrides).length > 0) {
    let delta = 0;
    if (rawCats) {
      for (const [cat, items] of Object.entries(rawCats)) {
        items.forEach((item: any, idx: number) => {
          const overrideQty = getOverrideQty(item, cat, idx);
          if (overrideQty !== undefined) {
            const originalQty = Number(item.quantity || 1);
            const price = Number(item.price || 0);
            delta += (overrideQty - originalQty) * price;
          }
        });
      }
    }
    subtotal = baseTotal + delta;
  }

  if (qtyOverrides["TOTAL_OVERRIDE"] !== undefined) {
    subtotal = qtyOverrides["TOTAL_OVERRIDE"];
  }

  let overall = subtotal - discount;
  if (qtyOverrides["OVERALL_OVERRIDE"] !== undefined) {
    overall = qtyOverrides["OVERALL_OVERRIDE"];
  }

  const rawPaid = Number(invoice.paid ?? 0);
  const leadPaid = Number((invoice as any)?.lead?.paidAmount || 0);
  const verifiedPayments = (((invoice as any)?.payments || []) as any[]).filter(
    (p: any) => p.status === "VERIFIED" || !p.status
  );

  const totalPaid = verifiedPayments.length > 0
    ? verifiedPayments.reduce((sum: number, p: any) => sum + Number(p.paid || p.amount || 0), 0)
    : (rawPaid > 0 ? rawPaid : leadPaid);

  let balance = Math.max(0, overall - totalPaid);


  const clientName = `${invoice.lead.firstName} ${invoice.lead.lastName}`.trim();
  const contact = invoice.lead.email || invoice.lead.contactNumber || "-";

  const getEventValue = (title: string) => {
    return (
      invoice.previewEvents?.find(
        (e) => e.title.toUpperCase() === title.toUpperCase()
      )?.value || "-"
    );
  };






  return (
    <div className="min-h-screen bg-gray-200 flex justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-md max-h-[90vh] overflow-y-auto">

        {/* ================= INVOICE CONTENT ================= */}
        <div id="invoice-content" className="flex justify-center bg-white py-2">
          <style>{`
              /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• INVOICE WRAP â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
              .inv {
                background: #fff;
                width: 780px;
                border: 2px solid #000;
                font-size: 11.5px;
                color: #000;
                font-family: Arial, Helvetica, sans-serif;
              }

              /* â”€â”€ TOP BAR â”€â”€ */
              .inv-top {
                border-bottom: 1px solid #000;
                padding: 6px 14px 5px;
                font-weight: 700;
                font-size: 11.5px;
              }
              .inv-top table { width: 100%; border-collapse: collapse; }
              .inv-top td   { vertical-align: top; line-height: 1.65; }
              .inv-top .mid {
                text-align: center;
                font-size: 13px;
                font-weight: 900;
                text-decoration: underline;
                letter-spacing: 2px;
              }
              .inv-top .right { text-align: right; }

              /* â”€â”€ LOGO / ADDRESS â”€â”€ */
              .inv-logo {
                border-bottom: 1px solid #000;
                padding: 10px 16px 8px;
                text-align: center;
              }
              .inv-logo-row {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 5px;
              }
              .inv-brand    { font-size: 26px; font-weight: 900; color: #c00; letter-spacing: 1px; line-height: 1; }
              .inv-studio   { font-size: 11px; font-weight: 700; letter-spacing: 5px; color: #111; }
              .inv-address  { font-size: 12.5px; font-weight: 700; margin-top: 2px; }

              /* â”€â”€ CLIENT + EVENT TABLE â”€â”€ */
              .inv-client-table {
                width: 100%;
                border-collapse: collapse;
                border-bottom: 1px solid #000;
              }
              .inv-client-cell {
                width: 170px;
                border-right: 1px solid #000;
                padding: 8px 10px;
                vertical-align: top;
                font-weight: 700;
                font-size: 11.5px;
                line-height: 1.6;
              }
              .inv-client-name { font-size: 12px; font-weight: 900; margin-top: 14px; text-transform: uppercase; }
              .inv-event-inner { width: 100%; border-collapse: collapse; }
              .inv-event-inner tr { border-bottom: 1px solid #000; }
              .inv-event-inner tr:last-child { border-bottom: none; }
              .inv-ev-label {
                width: 140px;
                padding: 5px 8px;
                font-weight: 700;
                border-right: 1px solid #000;
                white-space: nowrap;
                vertical-align: middle;
                font-size: 11.5px;
                text-transform: uppercase;
              }
              .inv-ev-value {
                padding: 5px 8px;
                vertical-align: middle;
                position: relative;
                font-size: 11.5px;
                font-weight: 600;
                text-transform: uppercase;
              }

              /* â”€â”€ ITEMS TABLE â”€â”€ */
              .inv-items {
                width: 100%;
                border-collapse: collapse;
                border-top: 1.5px solid #000;
                border-bottom: 1px solid #000;
                font-size: 11.5px;
              }
              .inv-items thead tr { border-bottom: 1.5px solid #000; }
              .inv-items th {
                padding: 7px 8px;
                font-weight: 700;
                font-size: 11.5px;
                border-right: 1px solid #000;
                text-align: center;
                background: #fff;
              }
              .inv-items th:last-child { border-right: none; }
              .inv-items th.th-sl  { width: 58px; }
              .inv-items th.th-qty { width: 88px; }

              .inv-items td {
                padding: 3.5px 8px;
                border-right: 1px solid #000;
                vertical-align: middle;
              }
              .inv-items td:last-child { border-right: none; }
              .inv-items .td-sl  { text-align: center; width: 58px; }
              .inv-items .td-qty { text-align: center; width: 88px; }

              /* â”€â”€ CATEGORY HEADER ROW â”€â”€ */
              .inv-cat-row td {
                padding: 6px 8px 4px;
                background: #fff;
              }
              .inv-cat-row .td-sl {
                border-right: 1px solid #000;
              }
              .inv-cat-label {
                font-weight: 700;
                font-size: 11.5px;
                text-transform: uppercase;
                text-decoration: underline;
                letter-spacing: 0.3px;
              }

              /* â”€â”€ TOTALS â”€â”€ */
              .inv-totals-row td {
                padding: 5px 10px;
                border-bottom: 1px solid #000;
              }
              .inv-totals-row:last-child td {
                border-bottom: none;
              }
              .inv-totals-row .t-label {
                text-align: right;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
              }
              .inv-totals-row .t-amount {
                text-align: center;
                font-weight: 700;
                position: relative;
                white-space: nowrap;
              }
              .inv-overall td {
                font-weight: 900;
                font-size: 12.5px;
              }

              /* â”€â”€ NOTES â”€â”€ */
              .inv-notes {
                border-top: 1px solid #000;
                padding: 10px 14px 14px;
                font-size: 10.5px;
                line-height: 1.48;
              }
              .inv-notes-title {
                font-weight: 700;
                font-size: 11px;
                margin-bottom: 5px;
                text-transform: uppercase;
              }
              .inv-note-item {
                display: flex;
                gap: 5px;
                margin-bottom: 3px;
                align-items: flex-start;
                text-transform: uppercase;
              }
              .inv-note-bullet { flex-shrink: 0; font-size: 13px; line-height: 1.25; }
            `}</style>

          <div className="inv">

            {/* TOP BAR */}
            <div className="inv-top">
              <table>
                <tbody>
                  <tr>
                    <td style={{ width: "34%" }}>
                      GSTIN : 33ABIFR7594P1Z8
                      <div style={{ marginTop: 2 }}>DATE : {formatDate(invoice.billingDate)}</div>
                    </td>
                    <td className="mid" style={{ width: "32%" }}>PROFORMA INVOICE</td>
                    <td className="right" style={{ width: "34%" }}>
                      BILL NO : {invoice.invoiceId ? `INV${invoice.invoiceId}` : (invoice.lead.leadSerialNumber || `${invoice.lead.leadType ?? "LD"}-${invoice.lead.leadId}`)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* LOGO + ADDRESS */}
            <div className="inv-logo">
              <div className="inv-logo-row">
                <img
                  src={redAngleLogo}
                  alt="Red Angle Studio"
                  style={{ width: "240px", objectFit: "contain", margin: "5px 0" }}
                />
              </div>
              <div className="inv-address">
                AP 742, G-Block, 2nd Street, 11th Main Rd, Anna Nagar, Chennai, Tamil Nadu 600040.
              </div>
            </div>

            {/* CLIENT + EVENT DETAILS */}
            <table className="inv-client-table">
              <tbody>
                <tr>
                  <td className="inv-client-cell">
                    TO
                    <div className="inv-client-name">{clientName}</div>
                    <div style={{ marginTop: 4, fontWeight: 600 }}>{contact}</div>
                  </td>
                  <td style={{ padding: 0, verticalAlign: "top" }}>
                    <table className="inv-event-inner">
                      <tbody>
                        {(invoice.previewEvents && invoice.previewEvents.length > 0
                          ? invoice.previewEvents
                          : [
                            { title: "EVENT NAME", value: getEventValue("EVENT NAME") },
                            { title: "ENGAGEMENT", value: getEventValue("ENGAGEMENT") },
                            { title: "WEDDING", value: getEventValue("WEDDING") },
                            { title: "RECEPTION", value: getEventValue("RECEPTION") },
                            { title: "RITUALS", value: getEventValue("RITUALS") },
                            { title: "LOCATION", value: getEventValue("LOCATION") },
                          ]
                        ).map((row: any, i: number) => (
                          <tr key={i}>
                            <td className="inv-ev-label">{row.title || row.label} :</td>
                            <td className="inv-ev-value">{row.value || row.val || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ITEMS TABLE */}
            <table className="inv-items">
              <thead>
                <tr>
                  <th className="th-sl">SL.NO</th>
                  <th style={{ textAlign: "center" }}>
                    {(() => {
                      const raw = { ...invoice.itemsByCategory } as Record<string, any[]>;
                      for (const [cat, items] of Object.entries(raw)) {
                        const key = cat.toLowerCase();
                        if (key === "service" || key === "services" || key === "packages" || key === "package") {
                          if (items && items.length > 0 && items[0].name) {
                            const pkgName = items[0].name.toUpperCase();
                            return pkgName.includes("PACKAGE")
                              ? `${pkgName} DESCRIPTION`
                              : `${pkgName} PACKAGE DESCRIPTION`;
                          }
                        }
                      }
                      return "RED ANGLE ELITE PREMIUM PACKAGE DESCRIPTION";
                    })()}
                  </th>
                  <th className="th-qty">QTY./Unit</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Sorting logic identical to the modal
                  const MERGE_INTO: Record<string, string> = {
                    wedding: "SERVICE",
                    shoot: "SERVICE",
                    ritual: "SERVICE",
                    rituals: "SERVICE",
                    engagement: "SERVICE",
                    reception: "SERVICE",
                    "extra complementary": "COMPLEMENTARY",
                  };
                  const CATEGORY_ORDER: Record<string, number> = {
                    "add on services": 0, "add-on services": 0, "add on service": 0,
                    "add-on service": 0, "add-ons": 0, "add-on": 0, addons: 0, addon: 0,
                    service: 10, services: 10, packages: 15,
                    deliverable: 50, deliverables: 50,
                    complementary: 70, complimentary: 70,
                  };
                  const raw = { ...invoice.itemsByCategory };
                  const merged: Record<string, any[]> = {};

                  for (const [cat, items] of Object.entries(raw)) {
                    const key = cat.toLowerCase();
                    if (key === "package" || key === "packages") continue;
                    if (key === "service" || key === "services") continue;

                    const parent = MERGE_INTO[key];
                    const defaultDest = parent || Object.keys(merged).find((k) => k.toLowerCase() === key) || cat;

                    for (const item of (items as any[])) {
                      let dest = defaultDest;
                      if (item && item.name && typeof item.name === 'string' && item.name.toUpperCase().includes("(EXTRA COMPLEMENTARY)")) {
                        dest = "COMPLEMENTARY";
                      }

                      if (!merged[dest]) merged[dest] = [];
                      merged[dest].push(item);
                    }
                  }



                  const sortedCategories = Object.entries(merged)
                    .map(([cat, items]) => {
                      const validItems = items.filter((i: any, idx: number) => {
                        if (!i || !i.name || i.name.trim() === "") return false;
                        const override = getOverrideQty(i, cat, idx);
                        const qty = override !== undefined ? override : Number(i.quantity || 1);
                        return qty > 0;
                      });
                      return [cat, validItems] as [string, any[]];
                    })
                    .filter(([cat, items]) => items.length > 0)
                    .sort(([a], [b]) => {
                      const aOrd = CATEGORY_ORDER[a.toLowerCase()] ?? 40;
                      const bOrd = CATEGORY_ORDER[b.toLowerCase()] ?? 40;
                      return aOrd - bOrd;
                    });

                  let finalItems = [];
                  if (invoice.previewItems && invoice.previewItems.length > 0) {
                    finalItems = invoice.previewItems.map((c: any) => [c.category, c.items]);
                  } else {
                    finalItems = sortedCategories;
                  }

                  return finalItems.map(([category, items]: any) => {
                    let slNo = 1;
                    return (
                      <React.Fragment key={category}>
                        <tr className="inv-cat-row">
                          <td className="td-sl"></td>
                          <td style={{ borderRight: "1px solid #000" }}>
                            <span className="inv-cat-label">{category} :</span>
                          </td>
                          <td></td>
                        </tr>
                        {items.map((item: any, idx: number) => {
                          const override = getOverrideQty(item, category, idx);
                          const qty = override !== undefined ? override : Number(item.quantity || 1);
                          return (
                            <tr key={`${category}-${idx}`}>
                              <td className="td-sl">{slNo++}.</td>
                              <td style={{ borderRight: "1px solid #000", textTransform: "uppercase" }}>
                                {item.name}
                              </td>
                              <td className="td-qty">
                                <span>{String(qty).padStart(2, "0")}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  });
                })()}

                {/* TOTALS SECTION */}
                <tr className="inv-totals-row" style={{ borderTop: "1.5px solid #000" }}>
                  <td></td>
                  <td className="t-label">TOTAL</td>
                  <td className="t-amount">{formatCurrency(subtotal)}</td>
                </tr>
                {discount > 0 && (
                  <tr className="inv-totals-row">
                    <td></td>
                    <td className="t-label">DISCOUNT</td>
                    <td className="t-amount">{formatCurrency(discount)}</td>
                  </tr>
                )}
                <tr className="inv-totals-row inv-overall">
                  <td></td>
                  <td className="t-label">OVERALL BUDGET</td>
                  <td className="t-amount">{formatCurrency(overall)}</td>
                </tr>
                <tr className="inv-totals-row">
                  <td></td>
                  <td className="t-label">PAID</td>
                  <td className="t-amount">{formatCurrency(totalPaid)}</td>
                </tr>
                <tr className="inv-totals-row">
                  <td></td>
                  <td className="t-label">BALANCE</td>
                  <td className="t-amount">{formatCurrency(balance)}</td>
                </tr>
              </tbody>
            </table>

            {/* NOTES */}
            <div className="inv-notes">
              <div className="inv-notes-title">IMPORTANT NOTES :</div>
              <div className="inv-notes-list">
                {[
                  "5 HOURS PER SESSION (INCLUDING PRE OR POST WEDDING), IN CASE ADDITIONAL DURATION OF TIME HAPPENS IN THE EVENTS, THEN THE COVERAGE COST MAY DIFFER.",
                  "TOKEN ADVANCE IS NON REFUNDABLE.",
                  "IN DELIVERABLES LIKE ALBUMS & VIDEOS, IF ANY CORRECTIONS ARISES REG ALBUM PDF AND VIDEOS THEN ALL THE CORRECTIONS SHOULD BE CONVEYED ONCE OR TWICE BEYOND THAT THIRD OR FOURTH CORRECTIONS OR MORE THAN THAT, EXTRA PAYMENT WILL BE CHARGED ACCORDING TO THE SERVICES.",
                  "YOU WILL RECEIVE ALL YOUR DELIVERABLES AS PER INVOICE, IF INCASE ANY OTHER SERVICES YOU ARE EXPECTING FROM RED ANGLE WHICH IS NOT MENTIONED IN YOUR INVOICE WILL BE CHARGED AS EXTRA PAYMENT.",
                  "IN INVOICE PRE OR POST WEDDING SHOOT WILL BE PLANNED ACCORDING TO YOU IN SHOOTERS AVAILABLE DATES AND IN MUHURTHAM DATES & IF MUHURTHAM DATES ARE COMING IN WEEKENDS, THEN TEAM WILL NOT BE ABLE TO SHOOT AT THAT TIME.",
                  "IF ADD-ON SESSIONS TAKEN BEFORE YOUR EVENTS, THEN THE PAYMENT OF 80% IN YOUR QUOTATION (EXCLUDING TOKEN ADVANCE) AND ADD ON SESSIONS AMOUNT SHOULD BE PAID AT THE END OF THE SESSION ON THE SAME DAY.",
                  "INCASE YOU ARE OPTING FOR POST WEDDING SHOOT, THEN VALIDITY OF THE COMPLIMENTARY SHOOT WILL BE ONLY FOR 90 DAYS AFTER YOUR WEDDING OR ELSE PAYMENT SHOULD BE MADE FOR POST WEDDING SHOOT, IF THE DURATION OF TIME (5 HOURS) EXCEEDS THEN YOU NEED TO PAY FOR POST WEDDING SHOOT.",
                  "FOR YOUR ALBUM, YOU NEED TO SELECT THE PHOTOS FIRST THEN ONLY WE CAN ABLE TO START YOUR FURTHER DELIVERABLE WORKS (NOTE: PRIORITIZE PHOTO SELECTION). WE HAVE PIX OFFCE SUPPORT FOR PHOTO SELECTION WHICH WILL BE EXPIRED WITHIN 150 DAYS. IF YOU ARE DELAYING, THEN PHOTO SELECTION WILL BE DONE BY YOU MANUALLY.",
                  "IF YOU ARE FINNALIZING THE ALBUM PDF LAYOUT, AT THAT TIME THE REMAINING 20% OF PENDING PAYMENT WILL BE PAID ONCE YOU ARE GIVING APPROVAL FOR ALBUM PRINTING.",
                  "MODES OF PAYMENT WILL BE ACCOUNT TRANSFER OR GPAY/PHONEPE OR CASH. CREDIT/DEBIT CARD PAYMENTS WILL NOT BE ACCEPTABLE.",
                  "TRAVEL, FOOD AND ACCOMMODATION SHOULD BE TAKEN CARE BY THE CLIENT (PRE OR POST SHOOT, WEDDING, RECEPTION AND ANY OTHER EVENTS).",
                  "IF INCASE ANY HUMAN ERROR OR TECHNICAL ERROR HAPPENS IN FUTURE WHICH AFFECTS ANY OF THE FOOTAGES, THEN FOR THAT PARTICULAR SERVICE, THE CHARGED AMOUNT WILL BE REFUNDED.",
                  "WE WILL KEEP YOUR CONTENT FOR 6 MONTHS ONLY FROM YOUR EVENT DATE SO BEFORE THAT KINDLY BRING YOUR PENDRIVE OR HARDISK AND COPY ALL YOUR RAW FOOTAGES. WE WILL NOT HAVE BACKUP OF YOUR RAW FOOTAGES ONCE THE TIME PERIOD AS EXPIRED.",
                  "ONCE THE ENTIRE CONTENT COPIED FROM US THROUGH HARD DISK OR PENDRIVE, WHICH EXCEEDS THE TIME PERIOD OF 6 MONTHS, AFTER THAT YOU HAVE TO BRING THE COPIED CONTENT FOR THE COMPLETION OF DELIVERABLES. (INCLUDES BOTH PHOTOS AND VIDEOS)."
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


        {/* ================= FOOTER ACTIONS ================= */}
        <div className="border-t p-4 bg-gray-50 flex justify-end gap-3">
          {issueMode && (
            <div className="w-full bg-white border p-4 rounded-md mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Tell us what is wrong with this invoice
              </h3>
              <input
                type="text"
                className="border rounded-md px-2 py-1 text-xs w-full mb-2"
                placeholder="Issue title"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
              />
              <textarea
                className="border rounded-md px-2 py-1 text-xs w-full min-h-[100px] mb-2"
                placeholder="Describe the issue in detail"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIssueMode(false)}
                  className="px-3 py-1 text-xs rounded-full border border-gray-300 text-gray-700"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendIssue}
                  disabled={submitting}
                  className="px-3 py-1 text-xs rounded-full bg-red-600 text-white flex items-center gap-1 disabled:opacity-60"
                >
                  <XCircle className="w-4 h-4" />
                  Send Issue
                </button>
              </div>
            </div>
          )}

          {status === "approved" ? (
            <div className="px-4 py-2 text-xs rounded-full bg-green-600 text-white flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              ACCEPTED
            </div>
          ) : !issueMode ? (
            <>
              <button
                onClick={handleRejectClick}
                disabled={submitting}
                className="px-4 py-2 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1 disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" />
                Reject & Raise Issue
              </button>
              <button
                onClick={handleAccept}
                disabled={submitting}
                className="px-4 py-2 text-xs rounded-full bg-green-600 text-white flex items-center gap-1 disabled:opacity-60"
              >
                <CheckCircle className="w-4 h-4" />
                Accept Invoice
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PublicInvoiceView;
