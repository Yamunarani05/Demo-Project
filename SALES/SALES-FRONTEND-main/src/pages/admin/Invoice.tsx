// src/pages/admin/Invoice.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import InvoicePreviewModal from "../../components/InvoicePreviewModal";
import { ErrorBoundary } from "../../components/ErrorBoundary";

import CreateInvoiceModal, {
  type CreatedItem,
  type PackageOption,
  type AddonOption,
} from "../../components/CreateInvoiceModal";

import invoiceService from "../../Services/invoiceService";
import api from "../../Services/apiClient";
import type {
  InvoiceLeadRow,
  PackageItem,
  InvoiceDetail,
} from "../../types/invoice";
import { exportToExcel } from "../../utils/excelExport";

interface LeadRow {
  leadId: number;
  firstName: string;
  lastName: string;
  contactNumber: string;
  currentStage: string;
  leadEmployee: {
    employee: {
      firstName: string;
      lastName: string;
    };
  }[];
}

interface InvoiceRow {
  leadId: number;
  leadCode?: string;
  leadSerialNumber?: string;
  leadType?: string;
  name: string;
  contact: string;
  invoiceId: number | null;
  billingDate: string;
  assigned: string;
  plan: string;
  status: string;

  totalAmount?: number;
  discount?: number;
  paid?: number;
  hasUnverifiedPayment?: boolean;

}




const Invoice: React.FC = () => {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [addons, setAddons] = useState<AddonOption[]>([]);

  const [page, setPage] = useState(1);
  const [paginationTotal, setPaginationTotal] = useState(0);
  const [paginationLimit, setPaginationLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  const [previewInvoice, setPreviewInvoice] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [createForLeadId, setCreateForLeadId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialItems, setCreateInitialItems] = useState<
    CreatedItem[] | undefined
  >(undefined);
  const [paymentProofs, setPaymentProofs] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentRow, setPaymentRow] = useState<InvoiceRow | null>(null);

  const openPayment = async (row: InvoiceRow) => {
    setPaymentRow(row);
    setIsPaymentOpen(true);

    if (row.invoiceId) {
      const res = await api.get(`/payments/invoice/${row.invoiceId}`);
      setPaymentProofs(res.data.payments ?? []);
    }
  };
  const [searchParams] = useSearchParams();
  const invoiceIdFromQuery = searchParams.get("invoiceId");
  const invoiceHeaders = [
    "Lead Id",
    "Lead Name",
    "Contact",
    "Invoice Id",
    "Billing Date",
    "Employee Assigned",
    "Plan",
    "Status",
  ];

  const downloadInvoiceExcel = async () => {
    if (!filteredRows || filteredRows.length === 0) {
      toast.error("Invoice content not found");
      return;
    }
    toast.success("Invoice download started");
    const dataForExcel = filteredRows.map((r) => ({
      "Lead Id": r.leadId,
      "Lead Name": r.name,
      "Contact": r.contact,
      "Invoice Id": r.invoiceId ?? "-",
      "Billing Date": r.billingDate,
      "Employee Assigned": r.assigned,
      "Plan": r.plan,
      "Status": r.status,
    }));

    await exportToExcel(
      dataForExcel,
      `invoice-report-${new Date().toISOString().split("T")[0]}`,
      invoiceHeaders,
      "Invoice Report"
    );
  };


  // LOAD ALL INVOICES DIRECTLY (no lead-stage filter)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // Fetch all invoices (grouped per lead) — no stage filter
        const invoiceRes = await invoiceService.getInvoices({
          page: 1,
          limit: 1000,
        });
        const invoicePayload = invoiceRes.data;
        const invoiceLeads: InvoiceLeadRow[] =
          invoicePayload.data ?? invoicePayload ?? [];

        // Flatten: one row per invoice across all leads
        const mapped: InvoiceRow[] = [];
        for (const invLead of invoiceLeads) {
          const name =
            `${invLead.firstName ?? ""} ${invLead.lastName ?? ""}`.trim() || "-";
          const contact = invLead.contactNumber ?? "-";
          const emp = invLead.leadEmployee[0]?.employee ?? null;
          const assigned = emp
            ? `${emp.firstName} ${emp.lastName}`.trim()
            : "Not Assigned";

          if (!invLead.invoices || invLead.invoices.length === 0) {
            // Lead with no invoices — show placeholder row
            mapped.push({
              leadId: invLead.leadId,
              leadSerialNumber: (invLead as any).leadSerialNumber,
              leadType: (invLead as any).leadType,
              name,
              contact,
              invoiceId: null,
              billingDate: "-",
              assigned,
              plan: "-",
              status: "Pending",
            });
          } else {
            // One row per invoice (newest first)
            const sorted = [...invLead.invoices].sort(
              (a, b) =>
                new Date(b.billingDate).getTime() -
                new Date(a.billingDate).getTime()
            );
            for (const inv of sorted) {
              mapped.push({
                leadId: invLead.leadId,
                leadCode: (invLead as any).leadCode,
                leadSerialNumber: (invLead as any).leadSerialNumber,
                leadType: (invLead as any).leadType,
                name,
                contact,
                invoiceId: inv.invoiceId,
                billingDate: new Date(inv.billingDate).toLocaleDateString(),
                assigned,
                plan: inv.plan ?? "-",
                status: inv.status ?? "Pending",
              });
            }
          }
        }

        const enrichedRows: InvoiceRow[] = await Promise.all(
          mapped.map(async (row) => {
            if (!row.invoiceId) return row;

            try {
              const res = await api.get(`/payments/invoice/${row.invoiceId}`);
              const summary = res.data;

              const verifiedPaid = (summary.payments ?? [])
                .filter((p: any) => p.status === "VERIFIED")
                .reduce((sum: number, p: any) => sum + Number(p.paid), 0);

              const hasUnverifiedPayment = (summary.payments ?? []).some(
                (p: any) => p.status !== "VERIFIED"
              );
              return {
                ...row,
                totalAmount: summary.totalAmount ?? 0,
                discount: summary.discount ?? 0,
                paid: verifiedPaid,
                hasUnverifiedPayment,
              };
            } catch {
              return row;
            }
          })
        );

        setRows(enrichedRows);

        // Packages
        const packageRes = await invoiceService.getPackages();
        const payload = packageRes.data;
        const rawPackages: PackageItem[] = Array.isArray(payload.data)
          ? (payload.data as PackageItem[])
          : [];
        const normalized: PackageOption[] = rawPackages.map((p) => ({
          id: p.id,
          packageTitle: p.packageTitle,
        }));
        setPackages(normalized);

      } catch (e) {
        console.error("Error loading invoices", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);




  // open preview if invoiceId in query
  useEffect(() => {
    const id = Number(invoiceIdFromQuery);
    if (!id || isNaN(id)) return;

    handleViewByInvoiceId(id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceIdFromQuery, rows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const finalisedSet = new Set(["Sent", "Approved", "Paid"]);

    return rows.filter((r) => {
      // status filter, including "finalised" virtual option
      if (filterStatus === "finalised") {
        if (!finalisedSet.has(r.status)) return false;
      } else if (filterStatus !== "all" && r.status !== filterStatus) {
        return false;
      }

      if (filterPlan !== "all" && r.plan !== filterPlan) return false;
      if (!q) return true;

      return (
        r.leadId.toString().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.contact.toLowerCase().includes(q) ||
        (r.invoiceId && r.invoiceId.toString().includes(q))
      );
    });
  }, [rows, searchQuery, filterStatus, filterPlan]);

  const plans = Array.from(
    new Set(rows.map((r) => r.plan).filter((p) => p && p !== "-"))
  );
  const statuses = Array.from(new Set(rows.map((r) => r.status)));

  // VIEW BY INVOICE ID
  const handleViewByInvoiceId = async (invoiceId: number) => {


    try {


      const res = await invoiceService.getInvoiceById(invoiceId);
      const inv = res.data?.data ?? res.data;



      const itemsByCategory: any = {};
      console.log("FULL INVOICE FROM API:", inv);

      // Packages (only show package name) — include price for qty recalc
      (inv.packageInvoices ?? []).forEach((pi: any) => {

        if (!itemsByCategory["SERVICE"]) itemsByCategory["SERVICE"] = [];

        itemsByCategory["SERVICE"].push({
          name: pi.package.packageTitle,
          quantity: pi.unit,
          price: Number(pi.package.price ?? 0),
        });
      });

      // We rely completely on the backend's buildInvoiceViewModel for ADD-ONS, 
      // Deliverables, Complimentary, Wedding, Shoot, etc.
      Object.entries(inv.itemsByCategory ?? {}).forEach(
        ([category, items]: any) => {
          if (category === "PACKAGES") return; // already handled above (we just pushed to SERVICE)
          if (!itemsByCategory[category]) itemsByCategory[category] = [];
          itemsByCategory[category].push(...items);
        }
      );

      const previewEvents = inv.previewEvents ?? [];

      const getValue = (title: string) => {
        return previewEvents.find(
          (e: any) => e.title?.toUpperCase() === title
        )?.value ?? "";
      };

      // ---------- Map invoice ----------
      const mappedInvoice = {
        invoiceId: inv.invoiceId,
        token: inv.token,
        status: inv.status,
        billingDate: inv.billingDate,
        billNo: inv.billNo || inv.lead?.leadSerialNumber || `${inv.lead?.leadType ?? "LD"}-${inv.lead?.leadId}`,

        name: `${inv.lead?.firstName ?? ""} ${inv.lead?.lastName ?? ""}`,
        contact: inv.lead?.email,
        eventDate: inv.lead?.eventDate,
        eventName: getValue("EVENT NAME"),
        engagementDetails: getValue("ENGAGEMENT"),
        weddingDetails: getValue("WEDDING"),
        receptionDetails: getValue("RECEPTION"),
        ritualsDetails: getValue("RITUALS"),
        location: getValue("LOCATION"),


        itemsByCategory,

        totalAmount: inv.totalAmount,

        paid: inv.paid ?? 0,
        discount: inv.discount ?? 0,   // ✅ ADD THIS
        qtyOverrides: inv.qtyOverrides ?? {}, // ✅ NEW
        previewEvents: inv.previewEvents ?? [], // ✅ PASSED FOR CRUD
        previewItems: inv.previewItems ?? null, // ✅ PASSED FOR ITEMS CRUD

        leadAddons: inv.addons ?? [],
      };

      setPreviewInvoice(mappedInvoice);
      setIsPreviewOpen(true);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load invoice");
    }
  };


  const handleView = (r: InvoiceRow) => {
    if (r.invoiceId) {
      handleViewByInvoiceId(r.invoiceId);
    }
  };

  // CREATE / UPDATE INVOICE
  const handleOpenCreate = async (leadId: number) => {
    const row = rows.find((r) => r.leadId === leadId);
    if (!row) return;

    setCreateForLeadId(leadId);

    try {
      // 1️⃣ Load invoice detail if exists
      if (row.invoiceId) {
        const res = await invoiceService.getInvoiceById(row.invoiceId);
        const detail: InvoiceDetail = res.data?.data ?? res.data;

        const existingItems: CreatedItem[] = [];

        // Packages
        (detail.packageInvoices ?? []).forEach((pi: any) => {
          existingItems.push({
            id: `pkg-${pi.package.id}`,
            description: pi.package.packageTitle,
            qty: pi.unit,
            category: "SERVICE",
          });
        });

        // Addons
        (detail.addons ?? []).forEach((addon: any) => {
          existingItems.push({
            id: `addon-${addon.addonServiceId}`,
            description: addon.addonService?.name ?? "Addon",
            qty: addon.quantity,
            category: "ADD-ONS",
          });
        });

        // Deliverables / Complimentary
        Object.entries(detail.itemsByCategory ?? {}).forEach(
          ([category, items]: any) => {
            if (category === "ADD-ONS" || category === "PACKAGES") return; // already handled above
            items.forEach((item: any, idx: number) => {
              existingItems.push({
                id: `item-${item.id ?? `${Date.now()}-${idx}-${Math.random()}`}`,
                description: item.name,
                qty: item.quantity,
                category,
              });
            });
          }
        );

        setCreateInitialItems(existingItems);
      } else {
        setCreateInitialItems([]);
      }

      // 2️⃣ Load addons list for dropdown
      const addonsRes = await api.get("/invoices/addons");
      const normalizedAddons = (addonsRes.data?.data ?? []).map((a: any) => ({
        id: a.id,
        name: a.name,
      }));

      setAddons(normalizedAddons);

    } catch (err) {
      console.error("Failed to load invoice for edit", err);
      setCreateInitialItems([]);
    }

    setIsCreateOpen(true);
  };




  const handleCreateSubmit = async (data: {
    packages: CreatedItem[];
    addons: CreatedItem[];
    items: CreatedItem[];
  }) => {

    if (!createForLeadId) return null;

    const row = rows.find((r) => r.leadId === createForLeadId);
    const hasExistingInvoice = !!row?.invoiceId;

    try {
      const payload = {
        leadId: createForLeadId,
        billingDate: new Date().toISOString(),
        plan: "Standard",
        status: hasExistingInvoice ? row!.status : "Pending",

        packages: data.packages.map(it => ({
          packageId: Number(String(it.id).replace('pkg-', '')),
          status: "Active",
          unit: it.qty,
        })),

        addons: data.addons.map(it => ({
          addonServiceId: Number(String(it.id).replace('addon-', '')),
          quantity: it.qty
        })),

        items: data.items.map(it => ({
          name: it.description,
          quantity: it.qty,
          category: it.category ?? "SERVICE"
        }))
      };


      let apiRes;
      if (!hasExistingInvoice) {
        apiRes = await invoiceService.createInvoice(payload);
      } else {
        apiRes = await invoiceService.updateInvoice(
          row!.invoiceId as number,
          payload
        );
      }

      const raw = apiRes.data?.data ?? apiRes.data;
      const updatedInvoice: InvoiceDetail = raw?.invoice ?? raw;

      if (!updatedInvoice) return null;

      const invoiceId = updatedInvoice.invoiceId;

      setRows(prev =>
        prev.map(r =>
          r.leadId === createForLeadId
            ? {
              ...r,
              invoiceId,
              billingDate: new Date(updatedInvoice.billingDate).toLocaleDateString(),
              plan: updatedInvoice.plan ?? r.plan,
              status: updatedInvoice.status ?? r.status ?? "Inprogress",
            }
            : r
        )
      );

      if (invoiceId) {
        await handleViewByInvoiceId(invoiceId);

      }

      return { id: invoiceId };

    } catch (e) {
      console.error("Error creating/updating invoice", e);
      return null;
    } finally {
      setCreateForLeadId(null);
      setCreateInitialItems(undefined);
      setIsCreateOpen(false);
    }
  };


  const handleCreateAndPreview = async (leadId: number) => {
    try {
      const quotationRes = await api.get(`/quotations/lead/${leadId}`);
      const quotation = quotationRes.data?.data;

      // create minimal invoice with no packages
      const payload = {
        leadId,
        billingDate: new Date().toISOString(),
        plan: "Standard",
        status: "Pending",

        packages: quotation?.packageId
          ? [
            {
              packageId: quotation.packageId,
              unit: quotation.quantity || 1,
              status: "Active",
            },
          ]
          : [],
        items: Array.isArray(quotation?.items)
          ? quotation.items.map((it: any) => ({
            name: it.name,
            quantity: it.quantity,
            price: it.price || 0,
            category: "ADD-ONS",
          }))
          : [],
      };


      const res = await invoiceService.createInvoice(payload);

      const raw = res.data?.data ?? res.data;
      const invoice = raw?.invoice ?? raw;

      if (!invoice?.invoiceId) {
        toast.error("Failed to create invoice");
        return;
      }

      // open preview directly
      await handleViewByInvoiceId(invoice.invoiceId);

      // update table row so Create button becomes View
      setRows((prev) =>
        prev.map((r) =>
          r.leadId === leadId
            ? {
              ...r,
              invoiceId: invoice.invoiceId,
              billingDate: new Date(invoice.billingDate).toLocaleDateString(),
              status: invoice.status ?? "Pending",
              plan: invoice.plan ?? "Standard",
            }
            : r
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to create invoice");
    }
  };

  const handleSendInvoiceWhatsApp = async (
    token: string,
    invoiceId: string,
    discount: number,
    paid: number,
    events: { title: string; value: string }[],
    qtyOverrides: Record<string, number>,
    billNo?: string
  ) => {
    try {
      const id = Number(invoiceId);
      if (id) {
        // Save discount, paid, and event details before sending
        await api.put(`/invoices/${id}/update-preview`, {
          discount,
          paid,
          events: events || [],
          qtyOverrides,
          billNo,
        });
        
        // Refresh preview with persisted data
        await handleViewByInvoiceId(id);
      }

      const clientUrl = `${window.location.origin}/invoice/${token}`;
      const message = `Hello, here is your invoice link:\n${clientUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    } catch (e) {
      console.error("Error saving before WhatsApp", e);
      toast.error("Failed to save changes before sending WhatsApp");
    }
  };



  const handleEditFromPreview = (invoiceId: string) => {
    const row = rows.find((r) => r.invoiceId?.toString() === invoiceId);
    if (!row) return;

    setIsPreviewOpen(false);
    handleOpenCreate(row.leadId);
  };

  const handleSendInvoice = async (
    invoiceId: string,
    discount: number,
    paid: number,
    events: { title: string; value: string }[],
    qtyOverrides: Record<string, number>,
    billNo?: string
  ) => {
    const id = Number(invoiceId);
    if (!id) return;

    const toastId = toast.loading("Sending invoice to email...");

    try {
      // 1️⃣ Save discount, paid, and event details before sending
      await api.put(`/invoices/${id}/update-preview`, {
        discount,
        paid,
        events: events || [],
        qtyOverrides,
        billNo,
      });

      // 2️⃣ Send invoice
      await invoiceService.sendInvoiceById(id);

      // 3️⃣ Reload preview
      await handleViewByInvoiceId(id);

      // 4️⃣ IMPORTANT: refresh payment summary in admin table
      const paymentRes = await api.get(`/payments/invoice/${id}`);
      const summary = paymentRes.data;

      setRows((prev) =>
        prev.map((r) =>
          r.invoiceId === id
            ? {
                ...r,
                totalAmount: summary.totalAmount ?? r.totalAmount,
                discount: summary.discount ?? r.discount,
                paid: summary.totalPaid ?? r.paid,
              }
            : r
        )
      );

      toast.success("Invoice sent successfully", { id: toastId });
    } catch (e) {
      console.error("Error sending invoice", e);
      toast.error("Failed to send invoice", { id: toastId });
      throw e;
    }
  };



  const itemsPerPage = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / itemsPerPage)
  );
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredRows.slice(startIndex, endIndex);
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentType, setPaymentType] = useState("UPI");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const submitPayment = async () => {
    if (!paymentRow) return;

    if (!paidAmount) {
      toast.error("Amount is required");
      return;
    }
    const discount = paymentRow.discount ?? 0;
    const overallBudget = (paymentRow.totalAmount ?? 0) - discount;
    const balance = overallBudget - (paymentRow.paid ?? 0);

    if (Number(paidAmount) > balance) {
      toast.error(`Amount exceeds remaining balance ₹${balance}`);
      return;
    }


    const formData = new FormData();
    formData.append("leadId", String(paymentRow.leadId));
    formData.append("invoiceId", String(paymentRow.invoiceId));
    formData.append("paid", paidAmount);
    formData.append("paymentType", paymentType);
    if (proofFile) {
      formData.append("proof", proofFile);
    }

    try {
      setSubmittingPayment(true);

      await api.post("/payments/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Payment submitted. Awaiting verification.");
      setIsPaymentOpen(false);

      // 🔁 Refresh invoice row
      if (paymentRow.invoiceId) {
        const res = await api.get(`/payments/invoice/${paymentRow.invoiceId}`);
        const summary = res.data;

        setRows((prev) =>
          prev.map((r) =>
            r.invoiceId === paymentRow.invoiceId
              ? {
                ...r,
                totalAmount: summary.totalAmount ?? r.totalAmount,
                discount: summary.discount ?? r.discount,
                paid: summary.totalPaid ?? r.paid,
              }
              : r
          )
        );

        await handleViewByInvoiceId(paymentRow.invoiceId);
      }

    } catch (err) {
      toast.error("Failed to submit payment");
    } finally {
      setSubmittingPayment(false);
      setPaidAmount("");
      setProofFile(null);
    }
  };

  // PLACE THIS ABOVE return()

  const handleSaveInvoice = async (
    id: string,
    discount: number,
    paid: number,
    events: { title: string; value: string }[],
    qtyOverrides: Record<string, number>,
    isSendToClient?: boolean,
    previewItems?: { category: string; items: any[] }[],
    billNo?: string
  ) => {
    try {
      await api.put(`/invoices/${id}/update-preview`, {
        discount: Number(discount) || 0,
        paid: Number(paid) || 0,
        events,
        qtyOverrides,
        isSendToClient,
        previewItems,
        billNo,
      });

      if (isSendToClient) {
        toast.success("Sent to client page successfully");
      } else {
        toast.success("Invoice saved successfully");
      }
      console.log("SAVING:", { discount, paid, events });

      // Refresh preview with persisted data
      await handleViewByInvoiceId(Number(id));

      // Also refresh payment summary in admin table so row stays in sync
      const numericId = Number(id);
      const paymentRes = await api.get(`/payments/invoice/${numericId}`);
      const summary = paymentRes.data;

      setRows(prev =>
        prev.map(r =>
          r.invoiceId === numericId
            ? {
              ...r,
              totalAmount: summary.totalAmount ?? r.totalAmount,
              discount: summary.discount ?? discount,
              paid: summary.totalPaid ?? paid,
            }
            : r
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to save invoice");
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 w-72 text-sm"
                  placeholder="Search by id, name, contact or invoice id"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="finalised">Finalised</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={filterPlan}
                onChange={(e) => {
                  setFilterPlan(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option value="all">All Plans</option>
                {plans.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                onClick={downloadInvoiceExcel}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium hover:bg-gray-100"
              >
                Download Invoice Report
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Lead ID
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Lead Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact Id
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Invoice Id
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Billing Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employee Assigned
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {!loading &&
                  currentInvoices.map((r) => (
                    <tr
                      key={r.leadId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm font-medium">
                        <span className="text-gray-900">
                          {r.leadSerialNumber || r.leadId}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700">
                        {r.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {r.contact}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {r.invoiceId ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {r.billingDate}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-semibold">
                            {r.assigned[0] ?? "N"}
                          </span>
                          <span className="text-gray-700">{r.assigned}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {r.plan}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {!r.invoiceId ? (
                          <span className="text-gray-400 text-xs">—</span>
                        ) : r.hasUnverifiedPayment ? (
                          <button
                            onClick={() => openPayment(r)}
                            className="px-3 py-1 rounded-lg border border-orange-400 text-orange-700 hover:bg-orange-50 text-xs font-semibold"
                          >
                            Verification Pending
                          </button>
                        ) : r.paid && r.totalAmount && r.paid >= r.totalAmount ? (
                          <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold">
                            Paid
                          </span>
                        ) : r.paid && r.paid > 0 ? (
                          <button
                            onClick={() => openPayment(r)}
                            className="px-3 py-1 rounded-lg border border-yellow-400 text-yellow-700 hover:bg-yellow-50 text-xs font-semibold"
                          >
                            Partial Payment
                          </button>
                        ) : (
                          <button
                            onClick={() => openPayment(r)}
                            className="px-3 py-1 rounded-lg border border-blue-400 text-blue-700 hover:bg-blue-50 text-xs font-semibold"
                          >
                            Add Payment
                          </button>
                        )}
                      </td>



                      <td className="px-4 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${r.status === "Paid" || r.status === "Done"
                            ? "bg-green-100 text-green-700"
                            : r.status === "Inprogress" ||
                              r.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : r.status === "Sent" || r.status === "Approved"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-right">
                        {!r.invoiceId ? (
                          <button
                            onClick={() => handleCreateAndPreview(r.leadId)}

                            className="px-3 py-1 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-semibold transition-colors"
                          >
                            Create
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleView(r)}
                              className="px-3 py-1 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-semibold transition-colors"
                            >
                              View
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRows.length)} of {filteredRows.length} invoices
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create / Edit Modal */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setCreateForLeadId(null);
          setCreateInitialItems(undefined);
        }}
        onSubmit={handleCreateSubmit}
        initialItems={createInitialItems}
        packages={packages}
        addons={addons}
      />

      {/* Preview Modal */}
      <ErrorBoundary>
        {isPreviewOpen && previewInvoice && (
          <InvoicePreviewModal
            key={previewInvoice.invoiceId}
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            invoice={previewInvoice as any}
            onEditInvoice={handleEditFromPreview}
            onSaveInvoice={handleSaveInvoice}
            onSendInvoice={handleSendInvoice}
            onSendInvoiceWhatsApp={handleSendInvoiceWhatsApp}
            onAddAddon={() => {
                if (previewInvoice.invoiceId) {
                    handleViewByInvoiceId(previewInvoice.invoiceId);
                }
            }}
          />
        )}
      </ErrorBoundary>
      {isPaymentOpen && paymentRow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              Payment for Invoice #{paymentRow.invoiceId}
            </h2>

            <div className="space-y-4">
              <input
                type="number"
                placeholder="Amount Paid"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
              />

              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
              >
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank Transfer</option>
              </select>

              <input
                type="file"
                onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                className="w-full border rounded-lg p-2 text-sm"
              />

              <button
                onClick={submitPayment}
                disabled={submittingPayment}
                className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {submittingPayment ? "Submitting..." : "Submit Payment"}
              </button>
            </div>
            {paymentProofs.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold">Uploaded Proofs</p>

                {paymentProofs.map((p) => (
                  <div key={p.paymentId} className="border rounded-lg p-2 text-sm">
                    <div>Status: {p.status}</div>
                    <div>Amount: ₹{p.paid}</div>

                    {p.proofUrl && (
                      <a
                        href={`${import.meta.env.VITE_API_URL}${p.proofUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View Proof
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}



            <div className="mt-4 text-right">
              <button
                onClick={() => {
                  setIsPaymentOpen(false);
                  setPaidAmount("");
                  setProofFile(null);
                }}
                className="text-sm text-gray-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );


};

export default Invoice;
