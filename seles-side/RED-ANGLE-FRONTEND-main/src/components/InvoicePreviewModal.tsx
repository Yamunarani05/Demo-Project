import React from "react";
import { X, Download, Printer, Plus, Trash2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import type { CreatedItem } from "./CreateInvoiceModal";
import toast from "react-hot-toast";
import logoImage from "../assets/red_angle_logo.png";
import api from "../Services/apiClient";
import { isUnauthorizedDemoPortal } from "../utils/demoAuth";

export interface AddonItem {
  id: string | number;
  quantity: number;
  addonService: {
    name: string;
  };
}

export interface PreviewInvoice {
  lead?: any;
  plan?: string;
  id?: string;
  name?: string;
  contact?: string;
  invoiceId?: string | number;
  token?: string;
  billingDate?: string;
  eventName?: string;
  billNo?: string;
  location?: string;
  description?: string;
  items?: CreatedItem[];
  totalAmount?: number;
  paid?: number;
  discount?: number;
  engagementDetails?: string;
  weddingDetails?: string;
  receptionDetails?: string;
  ritualsDetails?: string;
  addons?: AddonItem[];
  itemsByCategory?: Record<
    string,
    {
      id?: number;
      name: string;
      quantity: number;
      price?: number;
    }[]
  >;
  status?: string;
  qtyOverrides?: Record<string, number>;
  previewEvents?: { title: string; value: string }[];
  previewItems?: { category: string; items: any[] }[];
  payments?: any[];
}

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: PreviewInvoice | null;
  onEditInvoice?: (invoiceId: string) => void;
  onSaveInvoice?: (
    invoiceId: string,
    discount: number,
    paid: number,
    events: { title: string; value: string }[],
    qtyOverrides: Record<string, number>,
    isSendToClient?: boolean,
    previewItems?: { category: string; items: any[] }[],
    billNo?: string
  ) => void;
  onSendInvoice?: (
    invoiceId: string,
    discount: number,
    paid: number,
    events: { title: string; value: string }[],
    qtyOverrides: Record<string, number>
  ) => Promise<void> | void;
  onSendInvoiceWhatsApp?: (
    token: string,
    invoiceId: string,
    discount: number,
    paid: number,
    events: { title: string; value: string }[],
    qtyOverrides: Record<string, number>
  ) => Promise<void> | void;
  onAddAddon?: () => void;
  hideActions?: boolean;
}

// â”€â”€ Plain Indian-format number (no â‚¹ symbol) â€” matches the reference image â”€â”€
const formatCurrency = (n: number) =>
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSaveInvoice,
  onSendInvoice,
  onSendInvoiceWhatsApp,
  onAddAddon,
  hideActions: externalHideActions,
}) => {
  const [isDownloadingPDF, setIsDownloadingPDF] = React.useState(false);
  const hideActions = externalHideActions || isDownloadingPDF;

  if (!invoice) return null;

  const [discountValue, setDiscountValue] = React.useState<number>(
    invoice.discount ?? 0
  );
  const [isDiscountVisible, setIsDiscountVisible] = React.useState<boolean>(
    (invoice.discount ?? 0) > 0
  );
  const [paidValue, setPaidValue] = React.useState<number>(
    invoice.paid ?? 0
  );
  const [received80Value, setReceived80Value] = React.useState<number>(
    (invoice?.qtyOverrides as any)?.RECEIVED_80 ?? (invoice as any)?.received80 ?? 0
  );
  const [dynamicEvents, setDynamicEvents] = React.useState<{ title: string; value: string }[]>([]);
  const [dynamicItems, setDynamicItems] = React.useState<{ category: string; items: any[] }[]>([]);
  const [showAddEvent, setShowAddEvent] = React.useState(false);

  // Initialize from saved state or empty
  const [qtyOverrides, setQtyOverrides] = React.useState<Record<string, number>>(invoice.qtyOverrides ?? {});
  const [discountFocused, setDiscountFocused] = React.useState(false);
  const [paidFocused, setPaidFocused] = React.useState(false);
  const [received80Focused, setReceived80Focused] = React.useState(false);

  const [billNoValue, setBillNoValue] = React.useState<string>(
    invoice?.invoiceId ? `INV${invoice.invoiceId}` : (invoice?.billNo ?? "")
  );

  const [showAddAddon, setShowAddAddon] = React.useState(false);
  const [availableAddons, setAvailableAddons] = React.useState<any[]>([]);
  const [selectedAddonId, setSelectedAddonId] = React.useState<string>("");
  const [addonQty, setAddonQty] = React.useState<number>(1);
  const [addonCategory, setAddonCategory] = React.useState<string>("");
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = React.useState(false);
  React.useEffect(() => {
    if (isOpen) {
      setBillNoValue(
        invoice?.invoiceId ? `INV${invoice.invoiceId}` : (invoice?.billNo ?? "")
      );
      setQtyOverrides(invoice?.qtyOverrides ?? {});
      setDiscountValue(invoice?.discount ?? 0);
      setIsDiscountVisible(Number(invoice?.discount ?? 0) > 0);

      const rawPaid = Number(invoice?.paid ?? (invoice as any)?.lead?.paidAmount ?? 0);
      setPaidValue(rawPaid);
      if (invoice?.previewEvents && invoice.previewEvents.length > 0) {
        setDynamicEvents(invoice.previewEvents);
      } else {
        const defaultEventName = invoice?.eventName || invoice?.lead?.eventType || (invoice?.plan && invoice?.plan !== "Standard" ? invoice?.plan : "");
        setDynamicEvents([
          { title: "EVENT NAME", value: defaultEventName ?? "" },
          { title: "ENGAGEMENT", value: invoice?.engagementDetails ?? "" },
          { title: "WEDDING", value: invoice?.weddingDetails ?? "" },
          { title: "RECEPTION", value: invoice?.receptionDetails ?? "" },
          { title: "RITUALS", value: invoice?.ritualsDetails ?? "" },
          { title: "LOCATION", value: invoice?.location ?? "" },
        ]);
      }

      if (invoice?.previewItems && invoice.previewItems.length > 0) {
        setDynamicItems(invoice.previewItems);
      } else {
        setDynamicItems(
          buildSortedEntries().map(([cat, items]) => ({
            category: cat,
            items: items.map((i: any, idx: number) => ({
              ...i,
              quantity: getQty(i, cat, idx, Number(i.quantity ?? 1))
            }))
          }))
        );
      }

      api.get("/invoices/addons")
        .then(res => setAvailableAddons(res.data?.data || []))
        .catch(err => console.error("Could not fetch addons", err));
    }
  }, [isOpen, invoice]);

  // Build a per-item price map from itemsByCategory for dynamic total calc
  const getItemPrice = (category: string, itemName: string): number => {
    const raw = (invoice as any).itemsByCategory as Record<string, any[]> | undefined;
    if (!raw) return 0;
    for (const [cat, items] of Object.entries(raw)) {
      if (cat.toLowerCase() === category.toLowerCase()) {
        const found = items.find((i: any) => i.name === itemName);
        if (found) return Number(found.price || 0);
      }
    }
    return 0;
  };

  const updateQty = (key: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    setQtyOverrides((prev) => ({ ...prev, [key]: newQty }));
  };

  const getOverrideQty = React.useCallback((item: any, cat: string, idx: number): number | undefined => {
    if (!item || !item.name) return undefined;
    if (qtyOverrides[item.name] !== undefined) return qtyOverrides[item.name];

    const oldKey = `${cat}-${idx}`;
    if (qtyOverrides[oldKey] !== undefined) return qtyOverrides[oldKey];

    const rawCats = (invoice as any).itemsByCategory as Record<string, any[]> | undefined;
    if (rawCats) {
      for (const [c, catItems] of Object.entries(rawCats)) {
        const foundIdx = catItems.findIndex((ci: any) => ci.name === item.name);
        if (foundIdx !== -1 && qtyOverrides[`${c}-${foundIdx}`] !== undefined) {
          return qtyOverrides[`${c}-${foundIdx}`];
        }
      }
    }
    return undefined;
  }, [qtyOverrides, invoice]);

  const getQty = (item: any, cat: string, idx: number, originalQty: number): number => {
    const override = getOverrideQty(item, cat, idx);
    return override !== undefined ? override : originalQty;
  };

  // Calculate dynamic subtotal based on qty overrides
  const subtotal = React.useMemo(() => {
    const baseTotal = invoice.totalAmount ?? 0;
    // If no overrides, return original total
    if (Object.keys(qtyOverrides).length === 0) return baseTotal;
    // Compute delta from overrides
    let delta = 0;
    const raw = (invoice as any).itemsByCategory as Record<string, any[]> | undefined;
    if (raw) {
      for (const [cat, items] of Object.entries(raw)) {
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
    let computedSubtotal = baseTotal + delta;
    if (qtyOverrides["TOTAL_OVERRIDE"] !== undefined) {
      computedSubtotal = qtyOverrides["TOTAL_OVERRIDE"];
    }
    return computedSubtotal;
  }, [invoice.totalAmount, qtyOverrides, (invoice as any).itemsByCategory, refreshKey, getOverrideQty]);

  const overall = React.useMemo(() => {
    if (qtyOverrides["OVERALL_OVERRIDE"] !== undefined) return qtyOverrides["OVERALL_OVERRIDE"];
    return subtotal - discountValue;
  }, [subtotal, discountValue, qtyOverrides]);

  const additionalPayments = React.useMemo(() => {
    const list = ((invoice as any)?.payments || []) as any[];
    return list.filter(
      (p) => (p.status === "VERIFIED" || !p.status) && p.notes !== "Initial Advance Payment"
    );
  }, [invoice]);

  const additionalPaymentsSum = React.useMemo(() => {
    return additionalPayments.reduce(
      (sum, p) => sum + Number(p.paid || p.amount || 0),
      0
    );
  }, [additionalPayments]);

  const balance = React.useMemo(() => {
    return Math.max(0, overall - paidValue);
  }, [overall, paidValue]);

  const handleOverrideTotal = (key: string, val: string) => {
    const numeric = val.replace(/[^0-9.]/g, "");
    setQtyOverrides(prev => {
      const copy = { ...prev };
      if (numeric === "") {
        delete copy[key];
      } else {
        copy[key] = Number(numeric);
      }
      return copy;
    });
  };

  const [totalFocused, setTotalFocused] = React.useState(false);
  const [overallFocused, setOverallFocused] = React.useState(false);
  const [balanceFocused, setBalanceFocused] = React.useState(false);

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const [events, setEvents] = React.useState<{ title: string; value: string }[]>([
    { title: "Event Name", value: invoice.eventName ?? "" },
    { title: "DATE", value: formatDate(invoice.billingDate) },
  ]);
  const [paymentHistory, setPaymentHistory] = React.useState<any[]>([]);

  const isPaymentRow = (title: string) =>
    /^\d+(st|nd|rd|th)\s*payment/i.test(title.trim()) ||
    /^payment/i.test(title.trim()) ||
    /advance/i.test(title.trim());

  // Load markings & payment history from API when the Add Event modal opens
  React.useEffect(() => {
    if (showAddEvent && invoice.invoiceId) {
      Promise.all([
        api.get(`/invoices/${invoice.invoiceId}/markings`).catch(() => ({ data: { data: [] } })),
        api.get(`/payments/invoice/${invoice.invoiceId}`).catch(() => ({ data: { payments: [] } })),
      ]).then(([resMarkings, resPayments]) => {
        const savedMarkings = resMarkings.data?.data || [];
        const paymentsList = (resPayments.data?.payments || (invoice as any)?.payments || [])
          .filter((p: any) => p.status === "VERIFIED" || !p.status)
          .sort((a: any, b: any) => new Date(a.paymentDate || a.createdAt).getTime() - new Date(b.paymentDate || b.createdAt).getTime());

        setPaymentHistory(paymentsList);

        const eventMarkings = savedMarkings.filter((m: any) => !isPaymentRow(m.label));
        if (eventMarkings.length > 0) {
          setEvents(eventMarkings.map((m: any) => ({ title: m.label, value: m.value })));
        } else {
          setEvents([
            { title: "Event Name", value: invoice.eventName ?? "" },
            { title: "DATE", value: formatDate(invoice.billingDate) },
          ]);
        }
      });
    }
  }, [showAddEvent, invoice]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    // Give React a moment to re-render without inputs/buttons
    await new Promise(resolve => setTimeout(resolve, 150));

    const element = document.getElementById("invoice-content");
    if (!element) {
      setIsDownloadingPDF(false);
      return;
    }
    (html2pdf as any)()
      .set({
        margin: 8,
        filename: `Invoice-${invoice.invoiceId}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ['css', 'legacy'], avoid: 'tr' }
      })
      .from(element)
      .save()
      .then(() => {
        setIsDownloadingPDF(false);
      });
  };

  // â”€â”€ Which sub-categories get merged INTO a parent category â”€â”€
  // Keys are lowercase category names from the DB; value is the canonical parent label.
  const MERGE_INTO: Record<string, string> = {
    wedding: "SERVICE",
    shoot: "SERVICE",
    ritual: "SERVICE",
    rituals: "SERVICE",
    engagement: "SERVICE",
    reception: "SERVICE",
    "extra complementary": "COMPLEMENTARY",
  };

  // â”€â”€ Final sort order (after merging) â”€â”€
  const CATEGORY_ORDER: Record<string, number> = {
    // add-on variants â†’ first
    "add on services": 0,
    "add-on services": 0,
    "add on service": 0,
    "add-on service": 0,
    "add-ons": 0,
    "add-on": 0,
    addons: 0,
    addon: 0,
    // service block (merged)
    service: 10,
    services: 10,
    packages: 15,
    // deliverables
    deliverable: 50,
    deliverables: 50,
    // complimentary
    complementary: 70,
    complimentary: 70,
  };

  const buildSortedEntries = (): [string, any[]][] => {
    const raw = { ...(invoice as any).itemsByCategory } as Record<string, any[]>;

    // Step 1 â€” merge sub-categories into their parent bucket
    const merged: Record<string, any[]> = {};

    for (const [cat, items] of Object.entries(raw)) {
      const key = cat.toLowerCase();

      // Skip the raw "service"/"services" key â€” it holds package-level items
      // (e.g. "RedAngle Elite Premium") that should NOT appear in the list.
      // Only sub-category items (wedding, shoot, rituals â€¦) are rendered.
      if (key === "service" || key === "services") continue;

      const parent = MERGE_INTO[key]; // e.g. "SERVICE"
      const defaultDest = parent || Object.keys(merged).find((k) => k.toLowerCase() === key) || cat;

      for (const item of items) {
        let dest = defaultDest;
        if (item && item.name && typeof item.name === 'string' && item.name.toUpperCase().includes("(EXTRA COMPLEMENTARY)")) {
          dest = "COMPLEMENTARY";
        }

        if (!merged[dest]) merged[dest] = [];
        merged[dest].push(item);
      }
    }

    // Step 2 â€” filter out empty items/categories and sort by CATEGORY_ORDER
    return Object.entries(merged)
      .map(([cat, items]) => {
        const validItems = items.filter((i: any, idx: number) => {
          if (!i || !i.name || i.name.trim() === "") return false;
          const qty = getQty(i, cat, idx, Number(i.quantity || 1));
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
  };

  const getFormattedEvents = () => dynamicEvents;

  const handleSave = (isSendToClient = false) => {
    console.log("handleSave called with discountValue:", discountValue);
    if (onSaveInvoice) {
      const mergedQtyOverrides = {
        ...qtyOverrides,
        RECEIVED_80: received80Value,
      };
      onSaveInvoice(
        String(invoice.invoiceId),
        discountValue,
        paidValue,
        getFormattedEvents(),
        mergedQtyOverrides,
        isSendToClient,
        dynamicItems,
        billNoValue
      );
      onClose();
    }
  };

  const handleUpdateCategoryName = (catIdx: number, newName: string) => {
    setDynamicItems(prev => {
      const copy = [...prev];
      copy[catIdx] = { ...copy[catIdx], category: newName };
      return copy;
    });
  };

  const handleUpdateItemName = (catIdx: number, itemIdx: number, newName: string) => {
    setDynamicItems(prev => {
      const copy = [...prev];
      const itemsCopy = [...copy[catIdx].items];
      itemsCopy[itemIdx] = { ...itemsCopy[itemIdx], name: newName };
      copy[catIdx] = { ...copy[catIdx], items: itemsCopy };
      return copy;
    });
  };

  const handleUpdateItemQty = (catIdx: number, itemIdx: number, delta: number) => {
    setDynamicItems(prev => {
      const copy = [...prev];
      const itemsCopy = [...copy[catIdx].items];
      const currentQty = Number(itemsCopy[itemIdx].quantity || 1);
      const newQty = Math.max(0, currentQty + delta);
      itemsCopy[itemIdx] = { ...itemsCopy[itemIdx], quantity: newQty };
      copy[catIdx] = { ...copy[catIdx], items: itemsCopy };
      return copy;
    });
  };

  const handleSetItemQty = (catIdx: number, itemIdx: number, newQty: number) => {
    setDynamicItems(prev => {
      const copy = [...prev];
      const itemsCopy = [...copy[catIdx].items];
      itemsCopy[itemIdx] = { ...itemsCopy[itemIdx], quantity: Math.max(0, newQty) };
      copy[catIdx] = { ...copy[catIdx], items: itemsCopy };
      return copy;
    });
  };

  const handleAddCategory = () => {
    setDynamicItems(prev => [...prev, { category: "NEW HEADING", items: [] }]);
  };

  const handleAddItem = (catIdx: number) => {
    setDynamicItems(prev => {
      const copy = [...prev];
      copy[catIdx] = {
        ...copy[catIdx],
        items: [...copy[catIdx].items, { name: "NEW ITEM", quantity: 1, price: 0 }]
      };
      return copy;
    });
  };

  const handleDeleteItem = (catIdx: number, itemIdx: number) => {
    setDynamicItems(prev => {
      const copy = [...prev];
      const itemsCopy = [...copy[catIdx].items];
      itemsCopy.splice(itemIdx, 1);
      copy[catIdx] = { ...copy[catIdx], items: itemsCopy };
      return copy;
    });
  };

  const handleDeleteCategory = (catIdx: number) => {
    setDynamicItems(prev => prev.filter((_, i) => i !== catIdx));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-[980px] rounded shadow-xl flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal header ── */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-lg"></h2>
          <div className="flex gap-3">
            <button onClick={handlePrint} title="Print">  <Printer size={18} /></button>
            <button onClick={handleDownloadPDF} title="Download"><Download size={18} /></button>
            <button onClick={() => setShowAddEvent(true)} title="Add event"><Plus size={18} /></button>
            {!hideActions && (
              <button
                onClick={() => setShowAddAddon(true)}
                title="Add Add-on"
                className="flex items-center gap-1 text-sm bg-blue-50 px-2.5 py-1 rounded text-blue-600 font-medium border border-blue-200"
              >
                <Plus size={14} /> Add-on
              </button>
            )}
            <button onClick={onClose} title="Close">  <X size={18} /></button>
          </div>
        </div>

        {/* ── Invoice body ── */}
        <div className="overflow-y-auto flex-1">
          <div id="invoice-content" className="flex justify-center bg-white py-5 px-6">
            <style>{`
              /* ═══════════════ INVOICE WRAP ═══════════════ */
              .inv {
                background: #fff;
                width: 900px;
                border: 2px solid #000;
                font-size: 13px;
                color: #000;
                font-family: Arial, Helvetica, sans-serif;
              }

              /* ── TOP BAR ── */
              .inv-top {
                border-bottom: 1px solid #000;
                padding: 8px 16px 7px;
                font-weight: 700;
                font-size: 12.5px;
              }
              .inv-top table { width: 100%; border-collapse: collapse; }
              .inv-top td   { vertical-align: top; line-height: 1.65; }
              .inv-top .mid {
                text-align: center;
                font-size: 14.5px;
                font-weight: 900;
                text-decoration: underline;
                letter-spacing: 2px;
              }
              .inv-top .right { text-align: right; }

              /* ── LOGO / ADDRESS ── */
              .inv-logo {
                border-bottom: 1px solid #000;
                padding: 12px 18px 10px;
                text-align: center;
              }
              .inv-logo-row {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 5px;
              }
              .inv-logo-svg { width: 54px; height: 54px; }
              .inv-brand    { font-size: 28px; font-weight: 900; color: #c00; letter-spacing: 1px; line-height: 1; }
              .inv-studio   { font-size: 12px; font-weight: 700; letter-spacing: 5px; color: #111; }
              .inv-address  { font-size: 13.5px; font-weight: 700; margin-top: 3px; }

              /* ── CLIENT + EVENT TABLE ── */
              .inv-client-table {
                width: 100%;
                border-collapse: collapse;
                border-bottom: 1px solid #000;
              }
              .inv-client-cell {
                width: 200px;
                border-right: 1px solid #000;
                padding: 9px 12px;
                vertical-align: top;
                font-weight: 700;
                font-size: 13px;
                line-height: 1.6;
              }
              .inv-client-name { font-size: 14px; font-weight: 900; margin-top: 14px; text-transform: uppercase; }
              .inv-event-inner { width: 100%; border-collapse: collapse; }
              .inv-event-inner tr { border-bottom: 1px solid #000; }
              .inv-event-inner tr:last-child { border-bottom: none; }
              .inv-ev-label {
                width: 160px;
                padding: 6px 10px;
                font-weight: 700;
                border-right: 1px solid #000;
                white-space: nowrap;
                vertical-align: middle;
                font-size: 13px;
                text-transform: uppercase;
              }
              .inv-ev-value {
                padding: 6px 10px;
                vertical-align: middle;
                position: relative;
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
              }

              /* ── ITEMS TABLE ── */
              .inv-items {
                width: 100%;
                border-collapse: collapse;
                border-top: 1.5px solid #000;
                border-bottom: 1px solid #000;
                font-size: 13px;
              }
              .inv-items thead tr { border-bottom: 1.5px solid #000; }
              .inv-items th {
                padding: 8px 10px;
                font-weight: 700;
                font-size: 13px;
                border-right: 1px solid #000;
                text-align: center;
              }
              .inv-items th:last-child { border-right: none; }
              .inv-items th.th-sl  { width: 65px; }
              .inv-items th.th-qty { width: 100px; }

              .inv-items td {
                padding: 4.5px 10px;
                border-right: 1px solid #000;
                vertical-align: middle;
              }
              .inv-items td:last-child { border-right: none; }
              .inv-items .td-sl  { text-align: center; width: 65px; }
              .inv-items .td-qty { text-align: center; width: 100px; }

              /* ── QTY +/- BUTTONS: show only on hover ── */
              .qty-wrap { display: flex; align-items: center; justify-content: center; gap: 2px; }
              .qty-btn {
                width: 20px; height: 20px; border: 1px solid #ccc; border-radius: 3px;
                background: #f5f5f5; cursor: pointer; font-size: 13px; line-height: 18px;
                display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                padding: 0; opacity: 0; transition: opacity 0.15s;
              }
              .qty-wrap:hover .qty-btn { opacity: 1; }

              /* ── CATEGORY HEADER ROW ── */
              .inv-cat-row td {
                padding: 7px 10px 5px;
              }
              /* blank SL cell keeps its right border */
              .inv-cat-row .td-sl {
                border-right: 1px solid #000;
              }
              /* category label: underline + bold, left-aligned */
              .inv-cat-label {
                font-weight: 700;
                font-size: 13px;
                text-transform: uppercase;
                text-decoration: underline;
                letter-spacing: 0.3px;
              }

              /* ── TOTALS (now rows inside inv-items) ── */
              .inv-totals-row td {
                padding: 6px 12px;
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
              /* OVERALL BUDGET row — bolder + slightly larger */
              .inv-overall td {
                font-weight: 900;
                font-size: 14.5px;
              }

              /* ── NOTES ── */
              .inv-notes {
                border-top: 1px solid #000;
                padding: 12px 16px 16px;
                font-size: 12px;
                line-height: 1.55;
              }
              .inv-notes-title {
                font-weight: 700;
                font-size: 12.5px;
                margin-bottom: 6px;
                text-transform: uppercase;
              }
              .inv-note-item {
                display: flex;
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
                        BILL NO :{" "}
                        {hideActions ? (
                          billNoValue
                        ) : (
                          <input
                            type="text"
                            className="print:hidden border-b border-dashed border-gray-400 bg-transparent outline-none w-[100px] text-right focus:border-blue-500"
                            value={billNoValue}
                            onChange={(e) => setBillNoValue(e.target.value)}
                            placeholder="Bill No"
                          />
                        )}
                        <span className="hidden print:inline">{billNoValue}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* LOGO + ADDRESS */}
              <div className="inv-logo">
                {isUnauthorizedDemoPortal() ? (
                  <div className="inv-logo-row" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: "6px 0" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                      <circle cx="12" cy="13" r="3"/>
                    </svg>
                    <span style={{ fontSize: "24px", fontWeight: "900", color: "#000000", letterSpacing: "2px", lineHeight: "1", fontFamily: "Arial, Helvetica, sans-serif" }}>
                      DEMO STUDIO
                    </span>
                  </div>
                ) : (
                  <div className="inv-logo-row" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "6px 0" }}>
                    <img
                      src={logoImage}
                      alt="Red Angle Studio"
                      style={{ width: "260px", objectFit: "contain" }}
                    />
                  </div>
                )}
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
                      <div className="inv-client-name">{invoice.name}</div>
                      <div style={{ marginTop: 4, fontWeight: 600 }}>{invoice.contact}</div>
                    </td>
                    <td style={{ padding: 0, verticalAlign: "top" }}>
                      <table className="inv-event-inner">
                        <tbody>
                          {dynamicEvents.map((row, index) => (
                            <tr key={index} className="group" style={{ position: "relative" }}>
                              <td className="inv-ev-label" style={{ position: "relative", width: "160px" }}>
                                <div style={{ minHeight: 20 }}>
                                  {row.title} :
                                </div>
                                <input
                                  type="text"
                                  data-html2canvas-ignore="true"
                                  value={row.title}
                                  onChange={(e) => {
                                    const newEvents = [...dynamicEvents];
                                    newEvents[index].title = e.target.value;
                                    setDynamicEvents(newEvents);
                                  }}
                                  style={{
                                    position: "absolute", inset: 0,
                                    width: "100%", height: "100%",
                                    background: "white", border: "none", outline: "none",
                                    padding: "6px 10px", fontSize: 13,
                                    fontFamily: "inherit", fontWeight: 700,
                                    textTransform: "uppercase",
                                  }}
                                />
                              </td>
                              <td className="inv-ev-value" style={{ textTransform: "uppercase", position: "relative" }}>
                                <div style={{ minHeight: 20 }}>
                                  {row.value || "-"}
                                </div>
                                <input
                                  type="text"
                                  data-html2canvas-ignore="true"
                                  value={row.value}
                                  onChange={(e) => {
                                    const newEvents = [...dynamicEvents];
                                    newEvents[index].value = e.target.value;
                                    setDynamicEvents(newEvents);
                                  }}
                                  style={{
                                    position: "absolute", inset: 0,
                                    width: "calc(100% - 24px)", height: "100%",
                                    background: "white", border: "none", outline: "none",
                                    padding: "6px 10px", fontSize: 13,
                                    fontFamily: "inherit", fontWeight: 600,
                                    textTransform: "uppercase",
                                  }}
                                />
                                {!hideActions && (
                                  <button
                                    className="absolute right-1 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    data-html2canvas-ignore="true"
                                    style={{ zIndex: 10, background: "white", padding: 2 }}
                                    onClick={() => {
                                      const newEvents = [...dynamicEvents];
                                      newEvents.splice(index, 1);
                                      setDynamicEvents(newEvents);
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                          {!hideActions && (
                            <tr data-html2canvas-ignore="true">
                              <td colSpan={2} className="text-center py-1">
                                <button
                                  className="text-xs text-blue-600 font-bold hover:underline"
                                  onClick={() => setDynamicEvents([...dynamicEvents, { title: "NEW EVENT", value: "" }])}
                                >
                                  + ADD EVENT ROW
                                </button>
                              </td>
                            </tr>
                          )}
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
                        const raw = { ...(invoice as any).itemsByCategory } as Record<string, any[]>;
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
                        return isUnauthorizedDemoPortal()
                          ? "DEMO STUDIO REGULAR PREMIUM PACKAGE DESCRIPTION"
                          : "RED ANGLE REGULAR PREMIUM PACKAGE DESCRIPTION";
                      })()}
                    </th>
                    <th className="th-qty">QTY./Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicItems.map((catObj, catIdx) => {
                    const category = catObj.category;
                    const items = catObj.items;
                    let slNo = 1;
                    return (
                      <React.Fragment key={catIdx}>
                        {/* â”€â”€ Category header row â”€â”€ */}
                        <tr className="inv-cat-row group/cat">
                          <td className="td-sl">
                            {!hideActions && (
                              <button
                                className="hidden group-hover/cat:inline-block text-red-500 hover:text-red-700"
                                data-html2canvas-ignore="true"
                                onClick={() => handleDeleteCategory(catIdx)}
                                title="Delete Category"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                          <td colSpan={2} style={{ borderRight: "none" }}>
                            {!hideActions ? (
                              <input
                                type="text"
                                className="inv-cat-label bg-transparent border-b border-dashed border-gray-400 focus:outline-none focus:border-blue-500 w-full"
                                value={category}
                                onChange={(e) => handleUpdateCategoryName(catIdx, e.target.value)}
                              />
                            ) : (
                              <span className="inv-cat-label">{category} :</span>
                            )}
                          </td>
                        </tr>

                        {/* â”€â”€ Items under this category â”€â”€ */}
                        {items.map((item: any, itemIdx: number) => {
                          const qty = Number(item.quantity ?? 1);
                          return (
                            <tr key={`${catIdx}-${itemIdx}`} className="group/item">
                              <td className="td-sl">{slNo++}.</td>
                              <td style={{ borderRight: "1px solid #000", textTransform: "uppercase" }}>
                                {!hideActions ? (
                                  <input
                                    type="text"
                                    className="bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-blue-500 w-full uppercase"
                                    value={item.name || ""}
                                    onChange={(e) => handleUpdateItemName(catIdx, itemIdx, e.target.value)}
                                  />
                                ) : (
                                  item.name
                                )}
                              </td>
                              <td className="td-qty">
                                <div className="qty-wrap">
                                  {!hideActions && (
                                    <button
                                      className="qty-btn"
                                      data-html2canvas-ignore="true"
                                      onClick={() => handleUpdateItemQty(catIdx, itemIdx, -1)}
                                    >
                                      -
                                    </button>
                                  )}
                                  <span style={{ minWidth: 22, textAlign: "center" }}>
                                    {!hideActions ? (
                                      <input
                                        type="text"
                                        className="w-12 text-center bg-transparent focus:outline-none"
                                        value={qty}
                                        onChange={(e) => handleSetItemQty(catIdx, itemIdx, parseInt(e.target.value) || 0)}
                                      />
                                    ) : (
                                      String(qty).padStart(2, "0")
                                    )}
                                  </span>
                                  {!hideActions && (
                                    <button
                                      className="qty-btn"
                                      data-html2canvas-ignore="true"
                                      onClick={() => handleUpdateItemQty(catIdx, itemIdx, 1)}
                                    >
                                      +
                                    </button>
                                  )}
                                  {!hideActions && (
                                    <button
                                      className="qty-btn hidden group-hover/item:inline-flex"
                                      data-html2canvas-ignore="true"
                                      style={{ marginLeft: 6, color: '#dc2626' }}
                                      onClick={() => handleDeleteItem(catIdx, itemIdx)}
                                      title="Delete Item"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {/* â”€â”€ Add Item Button for Category â”€â”€ */}
                        {!hideActions && (
                          <tr data-html2canvas-ignore="true">
                            <td className="td-sl border-none"></td>
                            <td colSpan={2} className="border-none py-1">
                              <button
                                onClick={() => handleAddItem(catIdx)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <Plus size={10} /> ADD ITEM TO {category}
                              </button>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* â”€â”€ Add Heading (Category) Button â”€â”€ */}
                  {!hideActions && (
                    <tr data-html2canvas-ignore="true">
                      <td colSpan={3} className="py-3 text-center border-b border-black">
                        <button
                          onClick={handleAddCategory}
                          className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md inline-flex items-center gap-1 shadow-sm mr-2"
                        >
                          <Plus size={12} /> ADD HEADING
                        </button>
                        {!isDiscountVisible && (
                          <button
                            onClick={() => setIsDiscountVisible(true)}
                            className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-md inline-flex items-center gap-1 shadow-sm"
                          >
                            <Plus size={12} /> ADD DISCOUNT
                          </button>
                        )}
                      </td>
                    </tr>
                  )}

                  {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ TOTALS SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}

                  {/* TOTAL */}
                  <tr className="inv-totals-row" style={{ borderTop: "1.5px solid #000" }}>
                    <td></td>
                    <td className="t-label">TOTAL</td>
                    <td className="t-amount">
                      <span style={{ visibility: totalFocused ? "hidden" : "visible" }}>
                        {formatCurrency(subtotal)}
                      </span>
                      <input
                        type="text"
                        data-html2canvas-ignore="true"
                        value={totalFocused ? (qtyOverrides["TOTAL_OVERRIDE"] !== undefined ? qtyOverrides["TOTAL_OVERRIDE"] : subtotal) : formatCurrency(subtotal)}
                        onFocus={(e) => {
                          setTotalFocused(true);
                          const raw = qtyOverrides["TOTAL_OVERRIDE"] !== undefined ? String(qtyOverrides["TOTAL_OVERRIDE"]) : String(subtotal);
                          e.target.value = raw;
                          setTimeout(() => e.target.select(), 0);
                        }}
                        onBlur={() => setTotalFocused(false)}
                        onChange={(e) => handleOverrideTotal("TOTAL_OVERRIDE", e.target.value)}
                        style={{
                          position: "absolute", inset: 0,
                          width: "100%", height: "100%",
                          background: totalFocused ? "white" : "transparent", border: "none", outline: "none",
                          textAlign: "center", padding: "6px 12px",
                          fontWeight: 700, fontSize: "13px", fontFamily: "inherit",
                          color: totalFocused ? "#000" : "transparent",
                          caretColor: "#000",
                        }}
                      />
                    </td>
                  </tr>

                  {/* DISCOUNT (editable) */}
                  {isDiscountVisible && (
                    <tr className="inv-totals-row group/discount">
                      <td></td>
                      <td className="t-label relative">
                        DISCOUNT
                        {!hideActions && (
                          <button
                            className="absolute -left-6 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover/discount:opacity-100 transition-opacity"
                            data-html2canvas-ignore="true"
                            onClick={() => {
                              setIsDiscountVisible(false);
                              setDiscountValue(0);
                            }}
                            title="Remove Discount"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                      <td className="t-amount">
                        <span style={{ visibility: discountFocused ? "hidden" : "visible" }}>
                          {formatCurrency(discountValue)}
                        </span>
                        <input
                          type="text"
                          data-html2canvas-ignore="true"
                          value={discountFocused ? discountValue || "" : formatCurrency(discountValue)}
                          onFocus={(e) => {
                            setDiscountFocused(true);
                            // Set raw value and select all on focus
                            const raw = String(discountValue || "");
                            e.target.value = raw;
                            setTimeout(() => e.target.select(), 0);
                          }}
                          onBlur={() => setDiscountFocused(false)}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, "");
                            setDiscountValue(Number(val || 0));
                          }}
                          style={{
                            position: "absolute", inset: 0,
                            width: "100%", height: "100%",
                            background: discountFocused ? "white" : "transparent", border: "none", outline: "none",
                            textAlign: "center", padding: "6px 12px",
                            fontWeight: 700, fontSize: "13px", fontFamily: "inherit",
                            color: discountFocused ? "#000" : "transparent",
                            caretColor: "#000",
                          }}
                        />
                      </td>
                    </tr>
                  )}

                  {/* OVERALL BUDGET — bold + large */}
                  <tr className="inv-totals-row inv-overall">
                    <td></td>
                    <td className="t-label">OVERALL BUDGET</td>
                    <td className="t-amount">
                      <span style={{ visibility: overallFocused ? "hidden" : "visible" }}>
                        {formatCurrency(overall)}
                      </span>
                      <input
                        type="text"
                        data-html2canvas-ignore="true"
                        value={overallFocused ? (qtyOverrides["OVERALL_OVERRIDE"] !== undefined ? qtyOverrides["OVERALL_OVERRIDE"] : overall) : formatCurrency(overall)}
                        onFocus={(e) => {
                          setOverallFocused(true);
                          const raw = qtyOverrides["OVERALL_OVERRIDE"] !== undefined ? String(qtyOverrides["OVERALL_OVERRIDE"]) : String(overall);
                          e.target.value = raw;
                          setTimeout(() => e.target.select(), 0);
                        }}
                        onBlur={() => setOverallFocused(false)}
                        onChange={(e) => handleOverrideTotal("OVERALL_OVERRIDE", e.target.value)}
                        style={{
                          position: "absolute", inset: 0,
                          width: "100%", height: "100%",
                          background: overallFocused ? "white" : "transparent", border: "none", outline: "none",
                          textAlign: "center", padding: "6px 12px",
                          fontWeight: 700, fontSize: "13px", fontFamily: "inherit",
                          color: overallFocused ? "#000" : "transparent",
                          caretColor: "#000",
                        }}
                      />
                    </td>
                  </tr>

                  {/* PAID (editable) */}
                  <tr className="inv-totals-row">
                    <td></td>
                    <td className="t-label">PAID</td>
                    <td className="t-amount">
                      <span style={{ visibility: paidFocused ? "hidden" : "visible" }}>
                        {formatCurrency(paidValue)}
                      </span>
                      <input
                        type="text"
                        data-html2canvas-ignore="true"
                        value={paidFocused ? paidValue || "" : formatCurrency(paidValue)}
                        onFocus={(e) => {
                          setPaidFocused(true);
                          const raw = String(paidValue || "");
                          e.target.value = raw;
                          setTimeout(() => e.target.select(), 0);
                        }}
                        onBlur={() => setPaidFocused(false)}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          setPaidValue(Number(val || 0));
                        }}
                        style={{
                          position: "absolute", inset: 0,
                          width: "100%", height: "100%",
                          background: paidFocused ? "white" : "transparent", border: "none", outline: "none",
                          textAlign: "center", padding: "6px 12px",
                          fontWeight: 700, fontSize: "13px", fontFamily: "inherit",
                          color: paidFocused ? "#000" : "transparent",
                          caretColor: "#000",
                        }}
                      />
                    </td>
                  </tr>

                  {/* BALANCE */}
                  <tr className="inv-totals-row">
                    <td></td>
                    <td className="t-label">BALANCE</td>
                    <td className="t-amount">
                      <span style={{ visibility: balanceFocused ? "hidden" : "visible" }}>
                        {formatCurrency(balance)}
                      </span>
                      <input
                        type="text"
                        data-html2canvas-ignore="true"
                        value={balanceFocused ? String(balance) : formatCurrency(balance)}
                        onFocus={(e) => {
                          setBalanceFocused(true);
                          const raw = String(balance);
                          e.target.value = raw;
                          setTimeout(() => e.target.select(), 0);
                        }}
                        onBlur={() => setBalanceFocused(false)}
                        onChange={(e) => handleOverrideTotal("BALANCE_OVERRIDE", e.target.value)}
                        style={{
                          position: "absolute", inset: 0,
                          width: "100%", height: "100%",
                          background: balanceFocused ? "white" : "transparent", border: "none", outline: "none",
                          textAlign: "center", padding: "6px 12px",
                          fontWeight: 700, fontSize: "13px", fontFamily: "inherit",
                          color: balanceFocused ? "#000" : "transparent",
                          caretColor: "#000",
                        }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* IMPORTANT NOTES */}
              <div className="inv-notes">
                <div className="inv-notes-title">IMPORTANT NOTES :</div>
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
                  "ONCE THE ENTIRE CONTENT COPIED FROM US THROUGH HARD DISK OR PENDRIVE, WHICH EXCEEDS THE TIME PERIOD OF 6 MONTHS, AFTER THAT YOU HAVE TO BRING THE COPIED CONTENT FOR THE COMPLETION OF DELIVERABLES. (INCLUDES BOTH PHOTOS AND VIDEOS).",
                ].map((note, idx) => (
                  <div className="inv-note-item" key={idx}>
                    <span className="inv-note-bullet">&#8226;</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>

            </div>{/* /inv */}
          </div>
        </div>

        {/* â”€â”€ Footer Actions â”€â”€ */}
        {!hideActions && (
          <div className="flex justify-end gap-3 p-4 border-t">
            <button
              onClick={() => handleSave(false)}
              className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => {
                handleSave(true);
              }}
              className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold"
            >
              Send to client page only
            </button>
            <button
              disabled={isSendingEmail}
              onClick={async () => {
                if (!onSendInvoice) return;

                setIsSendingEmail(true);

                try {
                  await onSendInvoice(
                    String(invoice.invoiceId),
                    discountValue,
                    paidValue,
                    getFormattedEvents(),
                    qtyOverrides
                  );
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsSendingEmail(false);
                }
              }}
              className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold disabled:opacity-50"
            >
              {isSendingEmail ? "Sending..." : "Send Email"}
            </button>
            <button
              disabled={isSendingWhatsApp}
              onClick={async () => {
                if (!onSendInvoiceWhatsApp) return;
                setIsSendingWhatsApp(true);
                try {
                  await onSendInvoiceWhatsApp(
                    invoice.token!,
                    String(invoice.invoiceId),
                    discountValue,
                    paidValue,
                    getFormattedEvents(),
                    qtyOverrides
                  );
                } finally {
                  setIsSendingWhatsApp(false);
                }
              }}
              className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-semibold disabled:opacity-50"
            >
              {isSendingWhatsApp ? "Sending..." : "Send WhatsApp"}
            </button>
          </div>
        )}
      </div>

      {/* â”€â”€ Add Event Modal â”€â”€ */}
      {showAddEvent && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add Events</h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {events.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Event Title"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...events];
                      updated[index].title = e.target.value;
                      setEvents(updated);
                    }}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Event Value / Date"
                    value={item.value}
                    onChange={(e) => {
                      const updated = [...events];
                      updated[index].value = e.target.value;
                      setEvents(updated);
                    }}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                  />
                  <button
                    onClick={() => setEvents(events.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Row"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 text-left">
              <button
                onClick={() => {
                  setEvents([...events, { title: "New Event", value: "" }]);
                }}
                className="inline-flex items-center gap-1 text-blue-600 text-sm font-semibold hover:text-blue-800"
              >
                <Plus size={16} /> Add Row
              </button>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowAddEvent(false)}
                className="px-4 py-2 rounded-full bg-red-100 text-red-700 font-semibold hover:bg-red-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const markings = events.map((e, idx) => ({
                      label: e.title,
                      value: e.value,
                      sortOrder: idx,
                    }));
                    await api.put(`/invoices/${invoice.invoiceId}/markings`, { markings });
                    toast.success("Markings saved successfully!");
                    setShowAddEvent(false);
                  } catch (err) {
                    console.error("Failed to save markings", err);
                    toast.error("Failed to save markings");
                  }
                }}
                className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Add Add-on Modal â”€â”€ */}
      {showAddAddon && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add Add-on</h3>
              <button onClick={() => setShowAddAddon(false)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Add-on</label>
                <select
                  value={selectedAddonId}
                  onChange={(e) => setSelectedAddonId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">-- Choose Add-on --</option>
                  {availableAddons.map(a => (
                    <option key={a.id} value={a.id}>{a.name} - â‚¹{a.price}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={addonQty}
                  onChange={(e) => setAddonQty(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={addonCategory}
                  onChange={(e) => setAddonCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">-- Choose Category --</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Reception">Reception</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Rituals">Rituals</option>
                  <option value="Extra Complementary">Extra Complementary</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddAddon(false)}
                className="px-4 py-2 rounded-full bg-red-100 text-red-700 font-semibold hover:bg-red-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedAddonId) return toast.error("Select an addon");
                  if (addonQty < 1) return toast.error("Invalid quantity");

                  const selected = availableAddons.find(a => String(a.id) === selectedAddonId);
                  if (!selected) return;

                  try {
                    const res = await api.post(`/invoices/${invoice.invoiceId}/addons`, {
                      addonServiceId: selected.id,
                      quantity: addonQty,
                      price: selected.price,
                      category: addonCategory || undefined
                    });

                    if (res.data.success) {
                      toast.success("Add-on added successfully");

                      // Manually push to invoice reference to avoid full reload
                      if (!invoice.itemsByCategory) {
                        invoice.itemsByCategory = {};
                      }
                      let targetCategory = addonCategory || "ADD-ONS";
                      let itemName = selected.name;

                      if (addonCategory === "Extra Complementary") {
                        targetCategory = "COMPLEMENTARY";
                        if (!itemName.toUpperCase().includes("(EXTRA COMPLEMENTARY)")) {
                          itemName = `${itemName} (EXTRA COMPLEMENTARY)`;
                        }
                      }

                      if (!invoice.itemsByCategory[targetCategory]) {
                        invoice.itemsByCategory[targetCategory] = [];
                      }
                      invoice.itemsByCategory[targetCategory].push({
                        name: itemName,
                        quantity: addonQty,
                        price: selected.price
                      });
                      if (invoice.totalAmount !== undefined) {
                        invoice.totalAmount += (addonQty * selected.price);
                      }

                      if (onAddAddon) {
                        onAddAddon();
                      }

                      setRefreshKey(k => k + 1);
                      setShowAddAddon(false);
                      setSelectedAddonId("");
                      setAddonQty(1);
                      setAddonCategory("");
                    }
                  } catch (err) {
                    console.error("Failed to add addon", err);
                    toast.error("Failed to add add-on");
                  }
                }}
                className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePreviewModal;