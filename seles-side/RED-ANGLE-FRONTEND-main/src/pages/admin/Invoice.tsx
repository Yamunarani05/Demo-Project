// src/pages/admin/Invoice.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
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
import { isUnauthorizedDemoPortal } from "../../utils/demoAuth";

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
  billNo?: string;
  billingDate: string;
  assigned: string;
  plan: string;
  status: string;

  totalAmount?: number;
  discount?: number;
  paid?: number;
  balance?: number;
  hasUnverifiedPayment?: boolean;

}

const cleanDisplay = (str?: string | null): string => {
  if (!str) return "";
  return str.replace(/\(?Channel\s*Partner\)?/gi, "").replace(/\s+/g, " ").trim();
};

const normalizePlan = (plan?: string | null): string => {
  if (!plan || plan === "-" || plan === "—") return "—";
  const p = plan.toLowerCase().trim();
  if (p === "premium plus" || p === "premiumplus" || p.includes("premium plus") || p.includes("premiumplus")) return "Premium Plus";
  if (p.includes("premium")) return "Premium";
  if (p.includes("basic")) return "Basic";
  if (p.includes("standard")) return "Standard";
  return "—";
};

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
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
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

    if (isUnauthorizedDemoPortal()) {
      setPaymentProofs([
        {
          id: 1,
          amount: row.paid || 20000,
          paymentMode: "UPI / Bank Transfer",
          status: "VERIFIED",
          transactionId: `TXN-DEMO-${row.invoiceId || 9001}`,
          createdAt: row.billingDate !== "-" ? row.billingDate : "2026-03-01",
          proofUrl: null,
        },
      ]);
      return;
    }

    if (row.invoiceId) {
      try {
        const res = await api.get(`/payments/invoice/${row.invoiceId}`);
        const summary = res.data;
        setPaymentProofs(summary.payments ?? []);

        const totalPaid = Number(summary.totalPaid ?? summary.paid ?? 0);
        const totalAmount = Number(summary.totalAmount ?? 0);
        const discount = Number(summary.discount ?? 0);
        const balance = Math.max(0, totalAmount - discount - totalPaid);

        setPaymentRow((prev) =>
          prev
            ? {
              ...prev,
              totalAmount,
              discount,
              paid: totalPaid,
              balance,
            }
            : prev
        );
      } catch (err) {
        console.error("Failed to fetch payment details:", err);
      }
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
      "Invoice Id": r.invoiceId ? `INV${r.invoiceId}` : (r.billNo || "-"),
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


  const DEMO_INVOICE_ROWS: InvoiceRow[] = [
    {
      leadId: 101,
      leadCode: "LD-2026-001",
      leadSerialNumber: "LD-2026-001",
      leadType: "LD",
      name: "Arun Kumar",
      contact: "+91 98765 43210",
      invoiceId: 9001,
      billNo: "INV-9001",
      billingDate: "2026-03-01",
      assigned: "Ramesh Sharma",
      plan: "Premium",
      status: "Paid",
      totalAmount: 75000,
      discount: 5000,
      paid: 70000,
      balance: 0,
      hasUnverifiedPayment: false,
    },
    {
      leadId: 102,
      leadCode: "LD-2026-002",
      leadSerialNumber: "LD-2026-002",
      leadType: "LD",
      name: "Priya Sundaram",
      contact: "+91 98765 43211",
      invoiceId: 9002,
      billNo: "INV-9002",
      billingDate: "2026-03-02",
      assigned: "Sneha Patel",
      plan: "Standard",
      status: "Partial",
      totalAmount: 45000,
      discount: 0,
      paid: 20000,
      balance: 25000,
      hasUnverifiedPayment: false,
    },
    {
      leadId: 103,
      leadCode: "LD-2026-003",
      leadSerialNumber: "LD-2026-003",
      leadType: "LD",
      name: "Vikram Malhotra",
      contact: "+91 98765 43212",
      invoiceId: 9003,
      billNo: "INV-9003",
      billingDate: "2026-03-03",
      assigned: "Ramesh Sharma",
      plan: "Premium Plus",
      status: "Approved",
      totalAmount: 120000,
      discount: 10000,
      paid: 110000,
      balance: 0,
      hasUnverifiedPayment: false,
    },
    {
      leadId: 104,
      leadCode: "LD-2026-004",
      leadSerialNumber: "LD-2026-004",
      leadType: "LD",
      name: "Ananya Deshmukh",
      contact: "+91 98765 43213",
      invoiceId: 9004,
      billNo: "INV-9004",
      billingDate: "2026-03-04",
      assigned: "Karthik Raja",
      plan: "Basic",
      status: "Not Approved",
      totalAmount: 30000,
      discount: 0,
      paid: 0,
      balance: 30000,
      hasUnverifiedPayment: false,
    },
    {
      leadId: 105,
      leadCode: "LD-2026-005",
      leadSerialNumber: "LD-2026-005",
      leadType: "LD",
      name: "Rajesh Kannan",
      contact: "+91 98765 43214",
      invoiceId: 9005,
      billNo: "INV-9005",
      billingDate: "2026-03-05",
      assigned: "Sneha Patel",
      plan: "Standard",
      status: "Paid",
      totalAmount: 55000,
      discount: 5000,
      paid: 50000,
      balance: 0,
      hasUnverifiedPayment: false,
    },
    {
      leadId: 106,
      leadCode: "LD-2026-006",
      leadSerialNumber: "LD-2026-006",
      leadType: "LD",
      name: "Kavitha Ranganathan",
      contact: "+91 98765 43215",
      invoiceId: null,
      billNo: undefined,
      billingDate: "-",
      assigned: "Karthik Raja",
      plan: "—",
      status: "Not Approved",
      totalAmount: 40000,
      discount: 0,
      paid: 0,
      balance: 40000,
      hasUnverifiedPayment: false,
    },
  ];

  // LOAD ALL INVOICES DIRECTLY (no lead-stage filter)
  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);

      if (isUnauthorizedDemoPortal()) {
        setRows(DEMO_INVOICE_ROWS);
        setPackages([
          { id: 1, packageTitle: "Basic Photography" },
          { id: 2, packageTitle: "Standard Candid & Traditional" },
          { id: 3, packageTitle: "Premium Cinematic Wedding" },
          { id: 4, packageTitle: "Premium Plus Luxury Coverage" },
        ]);
        setAddons([
          { id: 1, name: "Drone Aerial Shoots (4K)" },
          { id: 2, name: "Teaser Video 60s Reel" },
          { id: 3, name: "Traditional Photobook Album" },
        ]);
        setLoading(false);
        return;
      }

      // Fetch all invoices (grouped per lead) — no stage filter
      const invoiceRes = await invoiceService.getInvoices({
        page: 1,
        limit: 1000,
      });
      const invoicePayload = invoiceRes.data;
      const invoiceLeads: InvoiceLeadRow[] =
        invoicePayload.data ?? invoicePayload ?? [];

      // Flatten: one row per task / invoice across all leads
      const mapped: InvoiceRow[] = [];
      const seenInvoiceIds = new Set<number>();
      const seenLeadIdsWithoutInvoice = new Set<number>();

      for (const invLead of invoiceLeads) {
        const baseName =
          cleanDisplay(`${invLead.firstName ?? ""} ${invLead.lastName ?? ""}`) || "-";
        const contact = invLead.contactNumber ?? "-";
        const leadEmployees = invLead.leadEmployee || [];
        const leadInvoices = invLead.invoices || [];
        const leadEventType = invLead.eventType || "";

        const firstEmp = leadEmployees[0]?.employee;
        const defaultAssigned = firstEmp
          ? cleanDisplay(`${firstEmp.firstName ?? ""} ${firstEmp.lastName ?? ""}`) || "Not Assigned"
          : "Not Assigned";

        // Deduplicate distinct task assignments for this lead
        const distinctTasks: Array<{ taskName: string; assigned: string }> = [];
        const seenTaskKeys = new Set<string>();

        for (const le of leadEmployees) {
          const taskName = le.taskName || leadEventType || "Standard";
          const emp = le.employee;
          const empIdentifier = (emp as any)?.employeeId ?? `${emp?.firstName ?? ""}_${emp?.lastName ?? ""}`;
          const key = `${taskName.trim().toLowerCase()}_${empIdentifier}`;
          if (!seenTaskKeys.has(key)) {
            seenTaskKeys.add(key);
            distinctTasks.push({
              taskName,
              assigned: emp ? cleanDisplay(`${emp.firstName ?? ""} ${emp.lastName ?? ""}`) || "Not Assigned" : defaultAssigned,
            });
          }
        }

        if (distinctTasks.length > 0) {
          const matchedInvoiceIds = new Set<number>();
          const availableInvoices = [...leadInvoices].filter(inv => inv.invoiceId);

          for (let i = 0; i < distinctTasks.length; i++) {
            const dt = distinctTasks[i];
            const cleanTask = dt.taskName.toLowerCase().trim();

            // 1. Try to find an invoice matching by task plan name
            let matchingInv = availableInvoices.find((inv: any) => {
              if (!inv.invoiceId || matchedInvoiceIds.has(inv.invoiceId)) return false;
              const cleanPlan = (inv.plan || "").toLowerCase().trim();
              return cleanPlan.includes(cleanTask) || cleanTask.includes(cleanPlan);
            });

            // 2. If no explicit name match, pair with next available invoice for this lead
            if (!matchingInv) {
              matchingInv = availableInvoices.find((inv: any) => inv.invoiceId && !matchedInvoiceIds.has(inv.invoiceId));
            }

            if (matchingInv) {
              matchedInvoiceIds.add(matchingInv.invoiceId);
              seenInvoiceIds.add(matchingInv.invoiceId);

              const invStatusRaw = String(matchingInv.status || "").toLowerCase().trim();
              const isInvApproved =
                invStatusRaw === "approved" ||
                invStatusRaw === "paid" ||
                invStatusRaw === "finalised" ||
                invStatusRaw === "finalized";
              const currentStatus = isInvApproved ? "Approved" : "Not Approved";

              mapped.push({
                leadId: invLead.leadId,
                leadCode: (invLead as any).leadCode,
                leadSerialNumber: (invLead as any).leadSerialNumber,
                leadType: (invLead as any).leadType,
                name: baseName,
                contact,
                invoiceId: matchingInv.invoiceId,
                billNo: matchingInv.invoiceId ? `INV${matchingInv.invoiceId}` : ((matchingInv as any).billNo || undefined),
                billingDate: matchingInv.billingDate ? new Date(matchingInv.billingDate).toLocaleDateString() : "-",
                assigned: dt.assigned,
                plan: normalizePlan(matchingInv.plan),
                status: currentStatus,
              });
            } else {
              // Task assigned but invoice not generated yet -> plan is "—"
              mapped.push({
                leadId: invLead.leadId,
                leadSerialNumber: (invLead as any).leadSerialNumber,
                leadType: (invLead as any).leadType,
                name: baseName,
                contact,
                invoiceId: null,
                billNo: undefined,
                billingDate: "-",
                assigned: dt.assigned,
                plan: "—",
                status: "Not Approved",
              });
            }
          }

          // Any remaining invoices beyond the number of distinct tasks
          for (const inv of availableInvoices) {
            if (inv.invoiceId && !seenInvoiceIds.has(inv.invoiceId)) {
              seenInvoiceIds.add(inv.invoiceId);
              const invStatusRaw = String(inv.status || "").toLowerCase().trim();
              const isInvApproved =
                invStatusRaw === "approved" ||
                invStatusRaw === "paid" ||
                invStatusRaw === "finalised" ||
                invStatusRaw === "finalized";
              const currentStatus = isInvApproved ? "Approved" : "Not Approved";

              mapped.push({
                leadId: invLead.leadId,
                leadCode: (invLead as any).leadCode,
                leadSerialNumber: (invLead as any).leadSerialNumber,
                leadType: (invLead as any).leadType,
                name: baseName,
                contact,
                invoiceId: inv.invoiceId,
                billNo: inv.invoiceId ? `INV${inv.invoiceId}` : ((inv as any).billNo || undefined),
                billingDate: inv.billingDate ? new Date(inv.billingDate).toLocaleDateString() : "-",
                assigned: defaultAssigned,
                plan: normalizePlan(inv.plan),
                status: currentStatus,
              });
            }
          }
        } else if (leadInvoices.length > 0) {
          for (const inv of leadInvoices) {
            if (inv.invoiceId) {
              if (seenInvoiceIds.has(inv.invoiceId)) continue;
              seenInvoiceIds.add(inv.invoiceId);
            }

            const invStatusRaw = String(inv.status || "").toLowerCase().trim();
            const isInvApproved =
              invStatusRaw === "approved" ||
              invStatusRaw === "paid" ||
              invStatusRaw === "finalised" ||
              invStatusRaw === "finalized";
            const currentStatus = isInvApproved ? "Approved" : "Not Approved";

            mapped.push({
              leadId: invLead.leadId,
              leadCode: (invLead as any).leadCode,
              leadSerialNumber: (invLead as any).leadSerialNumber,
              leadType: (invLead as any).leadType,
              name: baseName,
              contact,
              invoiceId: inv.invoiceId,
              billNo: inv.invoiceId ? `INV${inv.invoiceId}` : ((inv as any).billNo || undefined),
              billingDate: inv.billingDate ? new Date(inv.billingDate).toLocaleDateString() : "-",
              assigned: defaultAssigned,
              plan: normalizePlan(inv.plan),
              status: currentStatus,
            });
          }
        } else {
          if (!seenLeadIdsWithoutInvoice.has(invLead.leadId)) {
            seenLeadIdsWithoutInvoice.add(invLead.leadId);
            mapped.push({
              leadId: invLead.leadId,
              leadSerialNumber: (invLead as any).leadSerialNumber,
              leadType: (invLead as any).leadType,
              name: baseName,
              contact,
              invoiceId: null,
              billNo: undefined,
              billingDate: "-",
              assigned: defaultAssigned,
              plan: "—",
              status: "Not Approved",
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

            const totalPaid = Number(summary.totalPaid ?? summary.paid ?? 0);
            const totalAmount = Number(summary.totalAmount ?? 0);
            const discount = Number(summary.discount ?? 0);
            const overall = Math.max(0, totalAmount - discount);
            const balance =
              summary.balance !== undefined
                ? Number(summary.balance)
                : Math.max(0, overall - totalPaid);
            const isPaid = overall > 0 && totalPaid >= overall;
            const isPartial = totalPaid > 0 && !isPaid;

            const hasUnverifiedPayment = (summary.payments ?? []).some(
              (p: any) => p.status !== "VERIFIED"
            );
            return {
              ...row,
              totalAmount,
              discount,
              paid: totalPaid,
              balance,
              status: isPaid ? "Paid" : (isPartial ? "Partial" : (row.status === "Paid" ? "Partial" : row.status)),
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
    } catch (err) {
      console.error("Failed to load invoices", err);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);




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
        ((r as any).leadSerialNumber && (r as any).leadSerialNumber.toLowerCase().includes(q)) ||
        r.name.toLowerCase().includes(q) ||
        r.contact.toLowerCase().includes(q) ||
        (r.invoiceId && `inv${r.invoiceId}`.includes(q)) ||
        (r.invoiceId && r.invoiceId.toString().includes(q)) ||
        (r.billNo && r.billNo.toLowerCase().includes(q))
      );
    });
  }, [rows, searchQuery, filterStatus, filterPlan]);

  const plans = ["Basic", "Standard", "Premium", "Premium Plus"];
  const statuses = Array.from(new Set(rows.map((r) => r.status)));

  // VIEW BY INVOICE ID
  const handleViewByInvoiceId = async (invoiceId: number) => {
    if (isUnauthorizedDemoPortal()) {
      const foundDemo = DEMO_INVOICE_ROWS.find((r) => r.invoiceId === invoiceId) || DEMO_INVOICE_ROWS[0];
      const demoInvoice = {
        invoiceId: foundDemo.invoiceId ?? 9001,
        token: "demo-invoice-token",
        status: foundDemo.status,
        billingDate: foundDemo.billingDate,
        billNo: foundDemo.billNo ?? `INV${foundDemo.invoiceId}`,
        name: foundDemo.name,
        contact: foundDemo.contact,
        eventDate: "2026-03-20",
        eventName: `${foundDemo.plan} Wedding Event`,
        engagementDetails: "Grand Palace, Hall A",
        weddingDetails: "Grand Palace, Main Mandap",
        receptionDetails: "Grand Palace, Lawn Banquet",
        ritualsDetails: "Pre-wedding ceremonies & Sangeet included",
        location: "Chennai / Bangalore",
        itemsByCategory: {
          SERVICE: [
            { name: `${foundDemo.plan} Coverage Package`, quantity: 1, price: 35000 },
            { name: "Candid & Traditional Photography", quantity: 1, price: 25000 },
            { name: "Traditional HD Video Coverage", quantity: 1, price: 15000 },
          ],
          "ADD-ONS": [
            { name: "Drone Aerial Shoots (4K UHD)", quantity: 1, price: 15000 },
            { name: "Instagram Reel (60 sec)", quantity: 1, price: 5000 },
          ],
          DELIVERABLES: [
            { name: "Premium Leather Photobook Album (40 Pages)", quantity: 2, price: 15000 },
            { name: "Edited Cinematic Highlight Film on USB", quantity: 1, price: 5000 },
          ],
          COMPLIMENTARY: [
            { name: "Mini Pocket Photobook for Parents", quantity: 1, price: 0 },
            { name: "Live Webcast Link for Family", quantity: 1, price: 0 },
          ],
        },
        totalAmount: foundDemo.totalAmount ?? 115000,
        paid: foundDemo.paid ?? 50000,
        discount: foundDemo.discount ?? 5000,
        qtyOverrides: {},
        previewEvents: [
          { title: "EVENT NAME", value: `${foundDemo.plan} Wedding Event` },
          { title: "ENGAGEMENT", value: "2026-03-18 • Grand Palace Banquet" },
          { title: "WEDDING", value: "2026-03-20 • Main Mandapam Hall" },
          { title: "RECEPTION", value: "2026-03-21 • Open Lawn Reception" },
          { title: "RITUALS", value: "Pre-wedding ceremonies, Haldi & Sangeet" },
          { title: "LOCATION", value: "Chennai / Bangalore" },
        ],
        previewItems: null,
        leadAddons: [],
        payments: [
          {
            id: 1,
            amount: foundDemo.paid ?? 50000,
            paymentMode: "Bank Transfer",
            status: "VERIFIED",
            date: foundDemo.billingDate,
          },
        ],
        lead: {
          leadId: foundDemo.leadId,
          firstName: foundDemo.name.split(" ")[0],
          lastName: foundDemo.name.split(" ").slice(1).join(" "),
          contactNumber: foundDemo.contact,
          email: `${foundDemo.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          address: "Chennai, Tamil Nadu",
        },
      };
      setPreviewInvoice(demoInvoice);
      setIsPreviewOpen(true);
      return;
    }

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

      const leadEventDate = inv.lead?.eventDate
        ? new Date(inv.lead.eventDate).toLocaleDateString("en-IN")
        : "";
      const leadWeddingDate = inv.lead?.weddingDate
        ? new Date(inv.lead.weddingDate).toLocaleDateString("en-IN")
        : "";
      const leadReceptionDate = inv.lead?.receptionDate
        ? new Date(inv.lead.receptionDate).toLocaleDateString("en-IN")
        : "";

      const leadInvoices = (inv.lead?.invoices ?? []);
      const invoiceIndex = leadInvoices.findIndex((x: any) => x.invoiceId === inv.invoiceId);
      const leadTasks = inv.lead?.leadEmployee ?? [];
      const taskForInvoice = (invoiceIndex >= 0 && invoiceIndex < leadTasks.length) ? leadTasks[invoiceIndex] : leadTasks[0];
      const pkgTitle = inv.packageInvoices?.[0]?.package?.packageTitle;
      const defaultEventName =
        taskForInvoice?.taskName ||
        pkgTitle ||
        (inv.plan && inv.plan !== "Standard" ? inv.plan : "") ||
        inv.lead?.eventType ||
        "";

      const previewEvents = (inv.previewEvents && inv.previewEvents.length > 0)
        ? inv.previewEvents
        : [
          { title: "EVENT NAME", value: defaultEventName },
          { title: "ENGAGEMENT", value: "" },
          { title: "WEDDING", value: leadWeddingDate || leadEventDate },
          { title: "RECEPTION", value: leadReceptionDate || "" },
          { title: "RITUALS", value: "" },
          { title: "LOCATION", value: inv.lead?.address || "" },
        ];

      const getValue = (title: string) => {
        const found = previewEvents.find(
          (e: any) => e.title?.toUpperCase() === title
        )?.value;
        if (title === "EVENT NAME" && (!found || found === inv.lead?.eventType)) {
          return defaultEventName;
        }
        return found ?? "";
      };

      const leadSerial = inv.lead?.leadSerialNumber || `${inv.lead?.leadType ?? "LD"}-${inv.lead?.leadId}`;
      const defaultBillNo = inv.invoiceId
        ? `INV${inv.invoiceId}`
        : (leadSerial.startsWith("INV") ? leadSerial : `INV${leadSerial}`);

      // ---------- Map invoice ----------
      const mappedInvoice = {
        invoiceId: inv.invoiceId,
        token: inv.token,
        status: inv.status,
        billingDate: inv.billingDate,
        billNo: inv.invoiceId ? `INV${inv.invoiceId}` : (inv.billNo || defaultBillNo),

        name: cleanDisplay(`${inv.lead?.firstName ?? ""} ${inv.lead?.lastName ?? ""}`),
        contact: inv.lead?.email || inv.lead?.contactNumber || "-",
        eventDate: inv.lead?.eventDate,
        eventName: getValue("EVENT NAME"),
        engagementDetails: getValue("ENGAGEMENT"),
        weddingDetails: getValue("WEDDING"),
        receptionDetails: getValue("RECEPTION"),
        ritualsDetails: getValue("RITUALS"),
        location: getValue("LOCATION"),

        itemsByCategory,

        totalAmount: Number(inv.totalAmount || inv.lead?.budget || 0),
        paid: Number(inv.paid ?? inv.lead?.paidAmount ?? 0),
        discount: Number(inv.discount ?? inv.lead?.discount ?? 0),
        qtyOverrides: inv.qtyOverrides ?? {},
        previewEvents: previewEvents,
        previewItems: inv.previewItems ?? null,

        leadAddons: inv.addons ?? [],
        payments: inv.payments ?? [],
        lead: inv.lead ?? null,
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
    } else {
      handleCreateAndPreview(r.leadId, r.plan !== "-" ? r.plan : undefined);
    }
  };

  // CREATE / UPDATE INVOICE
  const handleOpenCreate = async (leadId: number, invoiceIdToEdit?: number | null, taskPlan?: string) => {
    setCreateForLeadId(leadId);
    setEditingInvoiceId(invoiceIdToEdit || null);

    try {
      // 1️⃣ Load invoice detail if exists
      if (invoiceIdToEdit) {
        const res = await invoiceService.getInvoiceById(invoiceIdToEdit);
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

    try {
      const payload = {
        leadId: createForLeadId,
        billingDate: new Date().toISOString(),
        plan: "Standard",
        status: "Pending",

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
      if (editingInvoiceId) {
        apiRes = await invoiceService.updateInvoice(
          editingInvoiceId,
          payload
        );
      } else {
        apiRes = await invoiceService.createInvoice(payload);
      }

      const raw = apiRes.data?.data ?? apiRes.data;
      const updatedInvoice: InvoiceDetail = raw?.invoice ?? raw;

      if (!updatedInvoice) return null;

      const invoiceId = updatedInvoice.invoiceId;

      await loadInvoices();

      if (invoiceId) {
        await handleViewByInvoiceId(invoiceId);
      }

      return { id: invoiceId };

    } catch (e) {
      console.error("Error creating/updating invoice", e);
      return null;
    } finally {
      setCreateForLeadId(null);
      setEditingInvoiceId(null);
      setCreateInitialItems(undefined);
      setIsCreateOpen(false);
    }
  };


  const handleCreateAndPreview = async (leadId: number, taskPlan?: string) => {
    try {
      const quotationRes = await api.get(`/quotations/lead/${leadId}`);
      const quotation = quotationRes.data?.data;

      // create minimal invoice with no packages
      const payload = {
        leadId,
        billingDate: new Date().toISOString(),
        plan: taskPlan || "Standard",
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

      await loadInvoices();

      // open preview directly
      await handleViewByInvoiceId(invoice.invoiceId);
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
    qtyOverrides: Record<string, number>
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
    handleOpenCreate(row.leadId, Number(invoiceId));
  };

  const handleSendInvoice = async (
    invoiceId: string,
    discount: number,
    paid: number,
    events: { title: string; value: string }[],
    qtyOverrides: Record<string, number>
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

    if (!paidAmount || Number(paidAmount) <= 0) {
      toast.error("Valid payment amount is required");
      return;
    }
    const discount = Number(paymentRow.discount ?? 0);
    const totalAmount = Number(paymentRow.totalAmount ?? 0);
    const paid = Number(paymentRow.paid ?? 0);
    const overallBudget = Math.max(0, totalAmount - discount);
    const balance =
      paymentRow.balance !== undefined
        ? Number(paymentRow.balance)
        : Math.max(0, overallBudget - paid);

    if (overallBudget > 0 && Number(paidAmount) > balance) {
      toast.error(
        `Amount ₹${Number(paidAmount).toLocaleString("en-IN")} exceeds remaining balance ₹${balance.toLocaleString("en-IN")}`
      );
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

      // 🔁 Refresh invoice rows
      if (paymentRow.invoiceId) {
        await loadInvoices();
        await handleViewByInvoiceId(paymentRow.invoiceId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit payment");
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

      const newTotal = Number(summary.totalAmount ?? 0);
      const newDiscount = Number(summary.discount ?? discount);
      const newPaid = Number(paid);
      const newOverall = Math.max(0, newTotal - newDiscount);
      const newBalance = Math.max(0, newOverall - newPaid);
      const isPaid = newOverall > 0 && newPaid >= newOverall;
      const isPartial = newPaid > 0 && !isPaid;

      setRows(prev =>
        prev.map(r =>
          r.invoiceId === numericId
            ? {
              ...r,
              totalAmount: newTotal,
              discount: newDiscount,
              paid: newPaid,
              balance: newBalance,
              status: isPaid ? "Paid" : (isPartial ? "Partial" : r.status),
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Invoice</h1>

            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 pr-3 py-1.5 lg:py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 w-56 lg:w-64 text-xs lg:text-sm"
                  placeholder="Search id, name, contact, invoice..."
                />
                <Search className="absolute left-3 top-2 lg:top-2.5 w-4 h-4 text-gray-400" />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 lg:py-2 text-xs lg:text-sm"
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
                className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 lg:py-2 text-xs lg:text-sm"
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
                className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg border border-gray-300 bg-white text-xs lg:text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap shadow-sm"
              >
                Download Invoice Report
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-[7%] px-2 py-3.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Lead ID
                  </th>
                  <th className="w-[13%] px-2 py-3.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Lead Name
                  </th>
                  <th className="w-[11%] px-2 py-3.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Contact Id
                  </th>
                  <th className="w-[8%] px-2 py-3.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Invoice Id
                  </th>
                  <th className="w-[8%] px-2 py-3.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Billing Date
                  </th>
                  <th className="w-[13%] px-2 py-3.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Employee Assigned
                  </th>
                  <th className="w-[8%] px-2 py-3.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="w-[12%] px-2 py-3.5 text-left text-[11px] font-semibold text-gray-600 uppercase">
                    Payment
                  </th>
                  <th className="w-[11%] px-2 py-3.5 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-[9%] px-2 py-3.5 text-center text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {!loading &&
                  currentInvoices.map((r, idx) => (
                    <tr
                      key={r.invoiceId ? `inv-${r.invoiceId}` : `lead-${r.leadId}-${idx}`}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-2 py-3.5 text-xs font-medium truncate">
                        <span className="text-gray-900 font-semibold truncate" title={r.leadSerialNumber || String(r.leadId)}>
                          {r.leadSerialNumber || r.leadId}
                        </span>
                      </td>

                      <td className="px-2 py-3.5 text-xs text-gray-800 font-medium truncate">
                        <div className="truncate" title={r.name}>
                          {r.name}
                        </div>
                      </td>
                      <td className="px-2 py-3.5 text-xs text-gray-600 truncate">
                        <div className="truncate" title={r.contact}>
                          {r.contact}
                        </div>
                      </td>
                      <td className="px-2 py-3.5 text-xs font-semibold text-purple-700 truncate">
                        {r.invoiceId ? `INV${r.invoiceId}` : (r.billNo || "-")}
                      </td>
                      <td className="px-2 py-3.5 text-xs text-gray-600 truncate">
                        {r.billingDate}
                      </td>
                      <td className="px-2 py-3.5 text-xs truncate">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center text-purple-700 text-xs font-semibold">
                            {r.assigned[0] ?? "N"}
                          </span>
                          <span className="text-gray-700 truncate" title={r.assigned}>
                            {r.assigned}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3.5 text-xs text-gray-700 truncate">
                        <div className="truncate" title={r.plan}>
                          {r.plan}
                        </div>
                      </td>
                      <td className="px-2 py-3.5 text-xs truncate">
                        {(() => {
                          if (!r.invoiceId) {
                            return <span className="text-gray-400 text-xs">—</span>;
                          }
                          if (r.hasUnverifiedPayment) {
                            return (
                              <button
                                onClick={() => openPayment(r)}
                                className="px-2.5 py-1 rounded-md border border-orange-400 text-orange-700 hover:bg-orange-50 text-[11px] font-semibold truncate transition-colors max-w-full"
                              >
                                Verification Pending
                              </button>
                            );
                          }

                          const discount = Number(r.discount ?? 0);
                          const total = Number(r.totalAmount ?? 0);
                          const overall = Math.max(0, total - discount);
                          const paid = Number(r.paid ?? 0);

                          if (overall > 0 && paid >= overall) {
                            return (
                              <button
                                onClick={() => openPayment(r)}
                                className="px-2.5 py-1 rounded-md bg-green-100 hover:bg-green-200 text-green-700 text-[11px] font-semibold cursor-pointer truncate transition-colors"
                                title="View Payment History"
                              >
                                Paid
                              </button>
                            );
                          }

                          if (paid > 0) {
                            return (
                              <button
                                onClick={() => openPayment(r)}
                                className="px-2.5 py-1 rounded-md border border-yellow-400 text-yellow-700 hover:bg-yellow-50 text-[11px] font-semibold truncate transition-colors"
                              >
                                Partial Payment
                              </button>
                            );
                          }

                          return (
                            <button
                              onClick={() => openPayment(r)}
                              className="px-2.5 py-1 rounded-md border border-blue-400 text-blue-700 hover:bg-blue-50 text-[11px] font-semibold truncate transition-colors"
                            >
                              Add Payment
                            </button>
                          );
                        })()}
                      </td>

                      <td className="px-2 py-3.5 text-xs">
                        {(() => {
                          const hasInvoice = Boolean(r.invoiceId);
                          const statusLower = (r.status || "").toLowerCase();
                          const isApproved =
                            hasInvoice &&
                            statusLower !== "rejected" &&
                            statusLower !== "not approved";

                          return (
                            <span
                              className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-semibold select-none ${isApproved
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {isApproved ? "Approved" : "Not Approved"}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-2 py-3.5 text-xs text-center">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleView(r)}
                            className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white border border-[#6938ef]/40 text-[#6938ef] shadow-sm hover:bg-[#f3ecff] transition-colors whitespace-nowrap"
                          >
                            View
                          </button>
                        </div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsPaymentOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const curBalance =
                paymentRow.balance !== undefined
                  ? Number(paymentRow.balance)
                  : Math.max(
                    0,
                    Number(paymentRow.totalAmount ?? 0) -
                    Number(paymentRow.discount ?? 0) -
                    Number(paymentRow.paid ?? 0)
                  );
              const isFullyPaid = curBalance <= 0;

              return (
                <>
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-gray-800">
                      {isFullyPaid ? `Payment History (INV${paymentRow.invoiceId})` : `Payment for Invoice INV${paymentRow.invoiceId}`}
                    </h2>
                    {isFullyPaid ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span>✓</span> Paid
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                        Balance: ₹{curBalance.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* Summary Breakdown */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-center mb-4">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total</span>
                      <span className="text-xs font-bold text-gray-800">₹{Number(paymentRow.totalAmount ?? 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Paid</span>
                      <span className="text-xs font-bold text-emerald-600">₹{Number(paymentRow.paid ?? 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Balance</span>
                      <span className="text-xs font-bold text-blue-600">₹{curBalance.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Add Payment Form (only if NOT fully paid) */}
                  {!isFullyPaid && (() => {
                    const nextNum = (paymentProofs.length || 0) + 1;
                    const suffix = nextNum === 1 ? "st" : nextNum === 2 ? "nd" : nextNum === 3 ? "rd" : "th";
                    const nextMilestone = `${nextNum}${suffix} Payment`;

                    return (
                      <div className="space-y-4 mb-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Add {nextMilestone} (Balance: ₹{curBalance.toLocaleString("en-IN")})
                          </label>
                          <input
                            type="number"
                            placeholder={`Enter amount for ${nextMilestone}`}
                            value={paidAmount}
                            max={curBalance}
                            min="1"
                            onChange={(e) => setPaidAmount(e.target.value)}
                            className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <select
                          value={paymentType}
                          onChange={(e) => setPaymentType(e.target.value)}
                          className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                          className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors"
                        >
                          {submittingPayment ? "Submitting..." : `Submit ${nextMilestone}`}
                        </button>
                      </div>
                    );
                  })()}

                  {/* Payment History List */}
                  <div className="mt-4 space-y-2 text-left">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Payment History ({paymentProofs.length})
                    </p>

                    {paymentProofs.length === 0 ? (
                      <div className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        No payment records found.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {paymentProofs.map((p, idx) => {
                          const num = idx + 1;
                          const suffix = num === 1 ? "st" : num === 2 ? "nd" : num === 3 ? "rd" : "th";
                          const defaultLabel = `${num}${suffix} Payment`;
                          const payDate = p.paymentDate
                            ? new Date(p.paymentDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                            : "-";
                          return (
                            <div
                              key={p.paymentId || idx}
                              className="border rounded-lg p-2.5 text-xs bg-gray-50 flex items-center justify-between shadow-sm hover:bg-gray-100/60 transition-colors"
                            >
                              <div>
                                <div className="font-bold text-gray-800 flex items-center gap-1.5">
                                  <span>{defaultLabel}</span>
                                  {p.notes && p.notes !== defaultLabel && (
                                    <span className="text-[10.5px] text-gray-500 font-normal">
                                      ({p.notes.replace(/^\d+(?:st|nd|rd|th)\s+Payment\s*\(?/i, '').replace(/\)$/, '') || p.notes})
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-200 font-medium">
                                    {p.paymentType || "UPI"}
                                  </span>
                                </div>
                                <div className="text-gray-400 text-[10.5px] mt-0.5 font-medium">{payDate}</div>
                                {p.proofUrl && (
                                  <a
                                    href={`${import.meta.env.VITE_API_URL}${p.proofUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline text-[10px] mt-0.5 inline-block font-medium hover:text-blue-800"
                                  >
                                    View Proof
                                  </a>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-emerald-600 text-sm">
                                  ₹{Number(p.paid || 0).toLocaleString("en-IN")}
                                </div>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                                  {p.status || "VERIFIED"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Close / Cancel Button */}
                  <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => {
                        setIsPaymentOpen(false);
                        setPaidAmount("");
                        setProofFile(null);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );


};

export default Invoice;
