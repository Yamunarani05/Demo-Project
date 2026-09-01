import { Request, Response } from "express";
import prisma from "../config/prisma";
import { verifyClientToken } from "../util/auth";
import axios from "axios";
import { preprodPool } from "../config/db";

const normalizeStatus = (status?: string | null) => String(status || "").toLowerCase();

const toNumber = (value: any) => {
  if (value === null || value === undefined) return 0;
  const numeric = typeof value === "object" && typeof value.toNumber === "function" ? value.toNumber() : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const getClientLeadId = (req: Request) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("Unauthorized");

  const payload = verifyClientToken(token);
  if (!payload.id) throw new Error("Unauthorized");

  return Number(payload.id);
};

const buildTracking = ({
  hasAssignment,
  hasEvent,
  rawDeliveries,
  finalDeliveries,
}: {
  hasAssignment: boolean;
  hasEvent: boolean;
  rawDeliveries: any[];
  finalDeliveries: any[];
}) => {
  const rawApproved = rawDeliveries.some((delivery) => normalizeStatus(delivery.status) === "client_approved");
  const finalApproved = finalDeliveries.some((delivery) => normalizeStatus(delivery.status) === "client_approved");

  return [
    {
      label: "Work assigned",
      status: hasAssignment ? "completed" : "pending",
      detail: hasAssignment ? "Team member has been assigned to this work." : "Assignment is not available yet.",
    },
    {
      label: "Incoming data received",
      status: rawDeliveries.length > 0 ? "completed" : hasEvent ? "in_progress" : "pending",
      detail: rawDeliveries.length > 0 ? "Raw files are available for client review." : "No incoming data has been delivered yet.",
    },
    {
      label: "Incoming data approved",
      status: rawApproved ? "completed" : rawDeliveries.length > 0 ? "in_progress" : "pending",
      detail: rawApproved ? "Incoming data has been approved." : "Awaiting client approval.",
    },
    {
      label: "Final delivery ready",
      status: finalDeliveries.length > 0 ? "completed" : rawApproved ? "in_progress" : "pending",
      detail: finalDeliveries.length > 0 ? "Final delivery is available." : "Final delivery is not ready yet.",
    },
    {
      label: "Final delivery approved",
      status: finalApproved ? "completed" : finalDeliveries.length > 0 ? "in_progress" : "pending",
      detail: finalApproved ? "Final files have been approved." : "Awaiting final approval.",
    },
  ];
};

const resolveWorkStatus = (leadStatus: string, rawDeliveries: any[], finalDeliveries: any[]) => {
  const finalApproved = finalDeliveries.some((delivery) => normalizeStatus(delivery.status) === "client_approved");
  if (finalApproved) return "completed";
  if (finalDeliveries.length > 0) return "final_review";
  const rawApproved = rawDeliveries.some((delivery) => normalizeStatus(delivery.status) === "client_approved");
  if (rawApproved) return "post_production";
  if (rawDeliveries.length > 0) return "client_review";
  return leadStatus || "in_progress";
};

const resolveScheduledEventDate = (lead: any) => {
  if (lead.eventDate) return lead.eventDate;
  if (lead.weddingDate) return lead.weddingDate;
  if (lead.receptionDate) return lead.receptionDate;
  if (lead.events && lead.events.length > 0) {
    const validEvent = lead.events.find((e: any) => e.eventDatetime);
    if (validEvent) return validEvent.eventDatetime;
  }
  if (lead.invoices && lead.invoices.length > 0) {
    for (const inv of lead.invoices) {
      if (inv.previewEvents) {
        let previewEvents: any[] = [];
        try {
          previewEvents = Array.isArray(inv.previewEvents)
            ? inv.previewEvents
            : JSON.parse(inv.previewEvents);
        } catch { previewEvents = []; }

        const nonDateTitles = ["EVENT NAME", "LOCATION", "VENUE", "CLIENT", "NAME"];
        const found = previewEvents.find(
          (pe: any) => pe.value && String(pe.value).trim() !== "" && String(pe.value).trim() !== "-" && !nonDateTitles.includes(String(pe.title || "").toUpperCase())
        );
        if (found) {
          return String(found.value).trim();
        }
      }
    }
  }
  return null;
};

const normalizeKey = (str?: string | null): string => {
  if (!str) return "";
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
};

const isPreWedding = (str?: string | null): boolean => {
  if (!str) return false;
  const s = String(str).toLowerCase();
  return (
    s.includes("pre-wedding") ||
    s.includes("prewedding") ||
    s.includes("pre wedding") ||
    s.includes("pre-shoot") ||
    s.includes("preshoot") ||
    s.includes("pre shoot") ||
    s.includes("save the date") ||
    s.includes("save the video") ||
    s.includes("retouch")
  );
};

const isBirthday = (str?: string | null): boolean => {
  if (!str) return false;
  const s = String(str).toLowerCase();
  return (
    s.includes("birthday") ||
    s.includes("bday") ||
    s.includes("b'day") ||
    s.includes("birth day") ||
    s.includes("b-day") ||
    s.includes("1st year") ||
    s.includes("cradle") ||
    s.includes("naming") ||
    s.includes("ayush") ||
    s.includes("puberty")
  );
};

const isWedding = (str?: string | null): boolean => {
  if (!str) return false;
  const s = String(str).toLowerCase();
  return s.includes("wedding") && !isPreWedding(s);
};

const isReception = (str?: string | null): boolean => {
  if (!str) return false;
  const s = String(str).toLowerCase();
  return s.includes("reception");
};

const isEngagement = (str?: string | null): boolean => {
  if (!str) return false;
  const s = String(str).toLowerCase();
  return s.includes("engagement") || s.includes("ring ceremony");
};

const isBabyShower = (str?: string | null): boolean => {
  if (!str) return false;
  const s = String(str).toLowerCase();
  return s.includes("baby shower") || s.includes("seemantham") || s.includes("valaikappu");
};

const isMatchingEventType = (text1?: string | null, text2?: string | null): boolean => {
  if (!text1 || !text2) return false;
  const k1 = normalizeKey(text1);
  const k2 = normalizeKey(text2);
  if (!k1 || !k2) return false;
  if (k1 === k2 || k1.includes(k2) || k2.includes(k1)) return true;

  if (isPreWedding(text1) && isPreWedding(text2)) return true;
  if (isBirthday(text1) && isBirthday(text2)) return true;
  if (isWedding(text1) && isWedding(text2)) return true;
  if (isReception(text1) && isReception(text2)) return true;
  if (isEngagement(text1) && isEngagement(text2)) return true;
  if (isBabyShower(text1) && isBabyShower(text2)) return true;

  return false;
};

const resolveEventSpecificDate = (lead: any, candidateKeys: (string | undefined | null)[]): string | null => {
  const validKeys = candidateKeys.filter(Boolean).map((k) => String(k));
  if (validKeys.length === 0) return null;

  const isForPreWedding = validKeys.some((k) => isPreWedding(k));
  const isForBirthday = validKeys.some((k) => isBirthday(k));
  const isForWedding = validKeys.some((k) => isWedding(k));
  const isForReception = validKeys.some((k) => isReception(k));
  const isForEngagement = validKeys.some((k) => isEngagement(k));
  const isForBabyShower = validKeys.some((k) => isBabyShower(k));

  // 1. Check exact matching event in lead.events
  if (lead.events && lead.events.length > 0) {
    const matchedEvent = lead.events.find((e: any) => {
      if (!e.eventDatetime) return false;
      if (isForBirthday && isBirthday(e.eventName)) return true;
      if (isForPreWedding && isPreWedding(e.eventName)) return true;
      if (isForWedding && isWedding(e.eventName)) return true;
      if (isForReception && isReception(e.eventName)) return true;
      if (isForEngagement && isEngagement(e.eventName)) return true;
      if (isForBabyShower && isBabyShower(e.eventName)) return true;
      return validKeys.some((k) => isMatchingEventType(e.eventName, k));
    });
    if (matchedEvent?.eventDatetime) {
      return new Date(matchedEvent.eventDatetime).toISOString();
    }
  }

  // 2. Check previewEvents and invoiceSnapshot in invoices
  if (lead.invoices && lead.invoices.length > 0) {
    for (const inv of lead.invoices) {
      const invMatchesThisWork = matchesInvoice(inv, validKeys);
      let previewEvents: any[] = [];
      if (inv.previewEvents) {
        try {
          previewEvents = Array.isArray(inv.previewEvents) ? inv.previewEvents : JSON.parse(inv.previewEvents);
        } catch {
          previewEvents = [];
        }
      }

      const nonDateTitles = ["EVENT NAME", "LOCATION", "VENUE", "CLIENT", "NAME", "PHONE", "EMAIL", "ADDRESS"];

      // 2a. Check specifically titled entries in previewEvents
      for (const pe of previewEvents) {
        const tit = String(pe.title || "").trim();
        const val = String(pe.value || "").trim();
        if (!val || val === "-" || nonDateTitles.includes(tit.toUpperCase())) continue;

        if (isForBirthday && isBirthday(tit)) return val;
        if (isForPreWedding && isPreWedding(tit)) return val;
        if (isForWedding && isWedding(tit)) return val;
        if (isForReception && isReception(tit)) return val;
        if (isForEngagement && isEngagement(tit)) return val;
        if (isForBabyShower && isBabyShower(tit)) return val;

        if (validKeys.some((k) => isMatchingEventType(tit, k))) {
          return val;
        }
      }

      // 2b. If the invoice itself matches this work (e.g. Birthday invoice)
      if (invMatchesThisWork) {
        for (const pe of previewEvents) {
          const tit = String(pe.title || "").trim().toUpperCase();
          const val = String(pe.value || "").trim();
          if (!val || val === "-" || nonDateTitles.includes(tit)) continue;
          if (tit.includes("DATE") || tit.includes("EVENT") || tit.includes("FUNCTION") || tit.includes("TIME") || tit.includes("DAY")) {
            return val;
          }
          if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(val) || /^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(val)) {
            return val;
          }
        }

        if (inv.invoiceSnapshot) {
          try {
            const snap = typeof inv.invoiceSnapshot === "string" ? JSON.parse(inv.invoiceSnapshot) : inv.invoiceSnapshot;
            if (snap?.eventDate) return snap.eventDate;
            if (snap?.date) return snap.date;
          } catch {}
        }
      }
    }
  }

  // 3. Check weddingDate / receptionDate
  if (isForWedding && lead.weddingDate) {
    return new Date(lead.weddingDate).toISOString();
  }
  if (isForReception && lead.receptionDate) {
    return new Date(lead.receptionDate).toISOString();
  }

  // 4. Check lead.eventDate
  if (lead.eventDate) {
    if (isForBirthday && (isBirthday(lead.eventType) || !lead.weddingDate)) {
      return new Date(lead.eventDate).toISOString();
    }
    if (isForPreWedding && isPreWedding(lead.eventType)) {
      return new Date(lead.eventDate).toISOString();
    }
    if (!isForPreWedding && !isForBirthday) {
      return new Date(lead.eventDate).toISOString();
    }
  }

  return null;
};

const resolveWorkCurrentStage = (
  workContext: { title?: string; event?: any; assignment?: any },
  lead: any,
  rawDeliveries: any[],
  finalDeliveries: any[]
): string => {
  if (workContext.event) {
    const ev = workContext.event;
    const evStatus = String(ev.status || "").toLowerCase();
    if (["completed", "approved"].includes(evStatus)) return "Completed";
    if (["inprogress", "in_progress"].includes(evStatus)) return "In Progress";
    if (ev.eventDatetime) {
      const evDate = new Date(ev.eventDatetime);
      const now = new Date();
      if (evDate < now) return "Shoot Completed";
      return "Scheduled";
    }
    return ev.status || "Scheduled";
  }

  if (workContext.assignment) {
    const a = workContext.assignment;
    const aStatus = String(a.status || "").toLowerCase();
    if (["completed", "approved"].includes(aStatus)) return "Completed";
    if (["inprogress", "in_progress", "active"].includes(aStatus)) return "In Progress";
    if (["assigned"].includes(aStatus)) return "Assigned";
    if (a.stage && a.stage !== "Lead") return String(a.stage);
    return a.status || "In Progress";
  }

  const rawApproved = rawDeliveries.some((d) => normalizeStatus(d.status) === "client_approved");
  const finalApproved = finalDeliveries.some((d) => normalizeStatus(d.status) === "client_approved");
  if (finalApproved) return "Delivered";
  if (finalDeliveries.length > 0) return "Final Review";
  if (rawApproved) return "Post-production";
  if (rawDeliveries.length > 0) return "Raw Data Review";

  return lead.currentStage || "In Progress";
};

const resolveInvoiceFinancials = (inv: any, lead?: any) => {
  if (!inv) {
    const budget = toNumber(lead?.budget);
    const paidAmount = toNumber(lead?.paidAmount);
    const discount = toNumber(lead?.discount);
    const balance = Math.max(0, budget - discount - paidAmount);
    return { budget, paidAmount, discount, balance };
  }

  const packageTotal = (inv.packageInvoices || [])
    .filter((pi: any) => !pi.isRemoved)
    .reduce(
      (acc: number, pi: any) => acc + (Number(pi.unit) || 1) * Number(pi.package?.price || 0),
      0
    );

  const addonTotal = (inv.addons || []).reduce(
    (acc: number, a: any) => acc + Number(a.total || (Number(a.price || 0) * Number(a.quantity || 1)) || 0),
    0
  );

  const itemsTotal = (inv.invoiceItems || []).reduce(
    (acc: number, item: any) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  let totalPrice = packageTotal + addonTotal + itemsTotal;

  if (totalPrice === 0 && inv.totalAmount) {
    totalPrice = Number(inv.totalAmount);
  }

  let invoiceSnapshot: any = inv.invoiceSnapshot;
  if (typeof invoiceSnapshot === "string") {
    try {
      invoiceSnapshot = JSON.parse(invoiceSnapshot);
    } catch {
      invoiceSnapshot = null;
    }
  }

  if (totalPrice === 0 && invoiceSnapshot) {
    if (invoiceSnapshot.totalPrice) totalPrice = Number(invoiceSnapshot.totalPrice);
    else if (invoiceSnapshot.totalAmount) totalPrice = Number(invoiceSnapshot.totalAmount);
  }

  if (totalPrice === 0 && lead?.budget) {
    totalPrice = Number(lead.budget);
  }

  let qtyOverrides: Record<string, any> = {};
  if (inv.qtyOverrides) {
    try {
      qtyOverrides = typeof inv.qtyOverrides === "string" ? JSON.parse(inv.qtyOverrides) : inv.qtyOverrides;
    } catch {
      qtyOverrides = {};
    }
  }

  if (qtyOverrides.TOTAL_OVERRIDE !== undefined) {
    totalPrice = Number(qtyOverrides.TOTAL_OVERRIDE);
  }

  let discount = Number(inv.discount ?? 0);
  if (discount === 0 && lead?.discount) {
    discount = Number(lead.discount);
  }

  const verifiedPayments = (inv.payments || []).filter(
    (p: any) => p.status === "VERIFIED" || !p.status || String(p.status).toUpperCase() !== "REJECTED"
  );
  const rawPaid = Number(inv.paid ?? 0);
  const leadPaid = Number(lead?.paidAmount ?? 0);
  const advancePaid = rawPaid > 0 ? rawPaid : (verifiedPayments.length > 0 ? Number(verifiedPayments[0].paid || 0) : leadPaid);
  const totalPaid = verifiedPayments.length > 0
    ? verifiedPayments.reduce((sum: number, p: any) => sum + Number(p.paid || p.amount || 0), 0)
    : (rawPaid > 0 ? rawPaid : leadPaid);

  let overall = totalPrice - discount;
  if (qtyOverrides.OVERALL_OVERRIDE !== undefined) {
    overall = Number(qtyOverrides.OVERALL_OVERRIDE);
  }

  let balance = Math.max(0, overall - totalPaid);

  if (normalizeStatus(inv.status) === "paid" || (overall > 0 && totalPaid >= overall)) {
    balance = 0;
  }

  return {
    budget: totalPrice,
    paidAmount: advancePaid,
    totalPaid,
    discount,
    balance: Math.max(0, balance),
  };
};

const matchesInvoice = (inv: any, contextKeys: (string | undefined | null)[]): boolean => {
  const validKeys = contextKeys.filter(Boolean).map((k) => String(k));
  if (validKeys.length === 0) return false;

  // 1. Check plan
  if (inv.plan && validKeys.some((k) => isMatchingEventType(inv.plan, k))) {
    return true;
  }

  // 2. Check previewEvents
  let previewEvents: any[] = [];
  if (inv.previewEvents) {
    try {
      previewEvents = Array.isArray(inv.previewEvents) ? inv.previewEvents : JSON.parse(inv.previewEvents);
    } catch {
      previewEvents = [];
    }
  }
  if (previewEvents.length > 0) {
    const hasEventMatch = previewEvents.some((pe: any) => {
      const val = String(pe.value || "");
      const tit = String(pe.title || "");
      return validKeys.some((k) => isMatchingEventType(val, k) || isMatchingEventType(tit, k));
    });
    if (hasEventMatch) return true;
  }

  // 3. Check packageInvoices
  if (inv.packageInvoices && inv.packageInvoices.length > 0) {
    const hasPkgMatch = inv.packageInvoices.some((pi: any) => {
      const pTitle = pi.package?.packageTitle || "";
      const pType = pi.package?.packageType || "";
      return validKeys.some((k) => isMatchingEventType(pTitle, k) || isMatchingEventType(pType, k));
    });
    if (hasPkgMatch) return true;
  }

  // 4. Check addons
  if (inv.addons && inv.addons.length > 0) {
    const hasAddonMatch = inv.addons.some((a: any) => {
      const cat = a.category || "";
      const aName = a.addonService?.name || "";
      return validKeys.some((k) => isMatchingEventType(cat, k) || isMatchingEventType(aName, k));
    });
    if (hasAddonMatch) return true;
  }

  // 5. Check invoiceItems
  if (inv.invoiceItems && inv.invoiceItems.length > 0) {
    const hasItemMatch = inv.invoiceItems.some((ii: any) => {
      const iName = ii.name || "";
      const cat = ii.category || "";
      return validKeys.some((k) => isMatchingEventType(iName, k) || isMatchingEventType(cat, k));
    });
    if (hasItemMatch) return true;
  }

  // 6. Check invoiceSnapshot
  if (inv.invoiceSnapshot) {
    try {
      const snap = typeof inv.invoiceSnapshot === "string" ? JSON.parse(inv.invoiceSnapshot) : inv.invoiceSnapshot;
      if (snap) {
        if (snap.previewEvents && Array.isArray(snap.previewEvents)) {
          if (
            snap.previewEvents.some((pe: any) =>
              validKeys.some((k) => isMatchingEventType(pe.value, k) || isMatchingEventType(pe.title, k))
            )
          ) {
            return true;
          }
        }
        if (snap.itemsByCategory) {
          const keys = Object.keys(snap.itemsByCategory);
          if (keys.some((cat) => validKeys.some((k) => isMatchingEventType(cat, k)))) {
            return true;
          }
        }
      }
    } catch {}
  }

  return false;
};

const resolveFinancials = (lead: any) => {
  let budget = toNumber(lead.budget);
  let paidAmount = toNumber(lead.paidAmount);
  let discount = toNumber(lead.discount);

  // Check lead-level payments
  if (lead.payments && lead.payments.length > 0) {
    const leadPaymentsPaid = lead.payments
      .filter((p: any) => !p.status || String(p.status).toUpperCase() !== "REJECTED")
      .reduce((acc: number, p: any) => acc + Number(p.paid || p.amount || 0), 0);
    if (leadPaymentsPaid > paidAmount) {
      paidAmount = leadPaymentsPaid;
    }
  }

  if (lead.invoices && lead.invoices.length > 0) {
    const sortedInvoices = [...lead.invoices].sort((a: any, b: any) => {
      const aHasValues =
        Number(a.totalAmount || 0) > 0 ||
        Number(a.paid || 0) > 0 ||
        (a.packageInvoices?.length > 0 && a.packageInvoices.some((pi: any) => Number(pi.package?.price || 0) > 0))
          ? 1
          : 0;
      const bHasValues =
        Number(b.totalAmount || 0) > 0 ||
        Number(b.paid || 0) > 0 ||
        (b.packageInvoices?.length > 0 && b.packageInvoices.some((pi: any) => Number(pi.package?.price || 0) > 0))
          ? 1
          : 0;
      if (aHasValues !== bHasValues) return bHasValues - aHasValues;

      const aApproved = ["approved", "paid"].includes(normalizeStatus(a.status)) ? 1 : 0;
      const bApproved = ["approved", "paid"].includes(normalizeStatus(b.status)) ? 1 : 0;
      if (aApproved !== bApproved) return bApproved - aApproved;

      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return bDate - aDate;
    });

    const inv = sortedInvoices[0];
    if (inv) {
      return resolveInvoiceFinancials(inv, lead);
    }
  }

  const overall = budget - discount;
  const balance = Math.max(0, overall - paidAmount);
  return { budget, paidAmount, discount, balance };
};

const buildProjectMeta = (lead: any, rawDeliveries: any[], finalDeliveries: any[]) => {
  const { budget, paidAmount, discount, balance } = resolveFinancials(lead);
  const eventDate = resolveScheduledEventDate(lead);

  return {
    clientName: `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.email || "Client",
    email: lead.email || null,
    phone: lead.contactNumber || null,
    address: lead.address || null,
    eventType: lead.eventType || null,
    eventDate: eventDate,
    leadSource: lead.leadSource || null,
    leadStatus: lead.status || null,
    currentStage: lead.currentStage || null,
    budget,
    paidAmount,
    discount,
    balance,
    deliveryStatus: {
      incomingTotal: rawDeliveries.length,
      incomingPending: rawDeliveries.filter((delivery) =>
        ["pending", "query_raised"].includes(normalizeStatus(delivery.status))
      ).length,
      incomingApproved: rawDeliveries.filter((delivery) => normalizeStatus(delivery.status) === "client_approved").length,
      finalTotal: finalDeliveries.length,
      finalPending: finalDeliveries.filter((delivery) =>
        ["pending", "query_raised"].includes(normalizeStatus(delivery.status))
      ).length,
      finalApproved: finalDeliveries.filter((delivery) => normalizeStatus(delivery.status) === "client_approved").length,
    },
  };
};

const buildWorkProjectMeta = (
  lead: any,
  rawDeliveries: any[],
  finalDeliveries: any[],
  workContext: { title?: string; event?: any; assignment?: any }
) => {
  const baseMeta = buildProjectMeta(lead, rawDeliveries, finalDeliveries);

  const candidateKeys = [
    workContext.title,
    workContext.event?.eventName,
    workContext.assignment?.taskName,
    workContext.assignment?.description,
  ].filter(Boolean);

  const specificDate = resolveEventSpecificDate(lead, candidateKeys);

  const eventType =
    workContext.event?.eventName ||
    workContext.assignment?.taskName ||
    (candidateKeys.find((k) => isPreWedding(k)) ? "Pre-wedding" : null) ||
    (candidateKeys.find((k) => isBirthday(k)) ? "Birthday" : null) ||
    (candidateKeys.find((k) => isWedding(k)) ? "Wedding" : null) ||
    (candidateKeys.find((k) => isReception(k)) ? "Reception" : null) ||
    lead.eventType;

  let eventDate = workContext.event?.eventDatetime
    ? new Date(workContext.event.eventDatetime).toISOString()
    : specificDate;

  if (!eventDate && candidateKeys.some((k) => isBirthday(k))) {
    if (lead.eventDate) {
      eventDate = new Date(lead.eventDate).toISOString();
    }
  }

  if (!eventDate && !candidateKeys.some((k) => isPreWedding(k) || isBirthday(k))) {
    eventDate = baseMeta.eventDate;
  }

  const currentStage = resolveWorkCurrentStage(workContext, lead, rawDeliveries, finalDeliveries);

  const isForPreWedding = candidateKeys.some((k) => isPreWedding(k));
  const isForBirthday = candidateKeys.some((k) => isBirthday(k));

  // 1. Match specific invoice for this work/event (Pre-wedding, Birthday, Wedding, etc.)
  if (lead.invoices && lead.invoices.length > 0) {
    // 1a. Pre-wedding specific invoice matching
    if (isForPreWedding) {
      const preWedInvoice = lead.invoices.find((inv: any) =>
        isPreWedding(inv.plan) ||
        isPreWedding(inv.lead?.eventType) ||
        (inv.previewEvents && String(JSON.stringify(inv.previewEvents)).toLowerCase().includes("pre")) ||
        (inv.packageInvoices && inv.packageInvoices.some((pi: any) => isPreWedding(pi.package?.packageTitle) || isPreWedding(pi.package?.packageType))) ||
        (inv.invoiceItems && inv.invoiceItems.some((ii: any) => isPreWedding(ii.name) || isPreWedding(ii.category))) ||
        (inv.addons && inv.addons.some((a: any) => isPreWedding(a.addonService?.name) || isPreWedding(a.category)))
      );
      if (preWedInvoice) {
        const financials = resolveInvoiceFinancials(preWedInvoice, lead);
        return {
          ...baseMeta,
          eventType,
          eventDate,
          currentStage,
          budget: financials.budget,
          paidAmount: financials.paidAmount,
          discount: financials.discount,
          balance: financials.balance,
        };
      }
    }

    // 1b. Birthday specific invoice matching
    if (isForBirthday) {
      const bdayInvoice = lead.invoices.find((inv: any) =>
        isBirthday(inv.plan) ||
        isBirthday(inv.lead?.eventType) ||
        (inv.previewEvents && String(JSON.stringify(inv.previewEvents)).toLowerCase().includes("birthday")) ||
        (inv.packageInvoices && inv.packageInvoices.some((pi: any) => isBirthday(pi.package?.packageTitle) || isBirthday(pi.package?.packageType)))
      );
      if (bdayInvoice) {
        const financials = resolveInvoiceFinancials(bdayInvoice, lead);
        return {
          ...baseMeta,
          eventType,
          eventDate,
          currentStage,
          budget: financials.budget,
          paidAmount: financials.paidAmount,
          discount: financials.discount,
          balance: financials.balance,
        };
      }
    }

    // 1c. General invoice matching by candidate keys
    const matchedInvoice = lead.invoices.find((inv: any) => matchesInvoice(inv, candidateKeys));
    if (matchedInvoice) {
      const financials = resolveInvoiceFinancials(matchedInvoice, lead);
      return {
        ...baseMeta,
        eventType,
        eventDate,
        currentStage,
        budget: financials.budget,
        paidAmount: financials.paidAmount,
        discount: financials.discount,
        balance: financials.balance,
      };
    }
  }

  // 2. If no matched invoice, check if event has its own dedicated budget (> 0)
  if (workContext.event) {
    const evBudget = toNumber(workContext.event.budget);
    const evPayments = workContext.event.payments || [];
    const evPaid = evPayments
      .filter((p: any) => !p.status || String(p.status).toUpperCase() !== "REJECTED")
      .reduce((acc: number, p: any) => acc + Number(p.paid || p.amount || 0), 0);

    if (evBudget > 0) {
      const evBalance = Math.max(0, evBudget - evPaid);
      return {
        ...baseMeta,
        eventType,
        eventDate,
        currentStage,
        budget: evBudget,
        paidAmount: evPaid > 0 ? evPaid : baseMeta.paidAmount,
        balance: evBalance,
      };
    }
  }

  // 3. If lead has invoices, use the primary invoice financials from baseMeta
  return {
    ...baseMeta,
    eventType,
    eventDate,
    currentStage,
  };
};

export const getClientWorks = async (req: Request, res: Response) => {
  try {
    const leadId = getClientLeadId(req);

    const lead = await prisma.leadsDetail.findUnique({
      where: { leadId },
      include: {
        leadEmployee: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                contactNumber: true,
                position: true,
                workLocation: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        events: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                position: true,
                contactNumber: true,
                workLocation: true,
              },
            },
            payments: {
              orderBy: { paymentDate: "desc" },
            },
          },
          orderBy: { eventDatetime: "asc" },
        },
        clientDeliveries: {
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          include: {
            packageInvoices: { include: { package: true } },
            addons: { include: { addonService: true } },
            invoiceItems: true,
            payments: { orderBy: { paymentDate: "desc" } },
          },
          orderBy: { createdAt: "desc" },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Client lead not found" });
    }

    let allPhotographersUploaded = false;
    let dataManagerVerified = false;
    try {
      if (lead.leadSerialNumber || lead.leadId) {
        const { rows } = await preprodPool.query(`
          SELECT 
            photo_first_clip, 
            video_first_clip, 
            drone_first_clip, 
            secondary_photo_first_clip, 
            secondary_video_first_clip,
            media_status
          FROM event_details 
          WHERE external_lead_id = $1 OR external_lead_id = $2
          LIMIT 1
        `, [lead.leadSerialNumber, String(lead.leadId)]);

        if (rows.length > 0) {
          const ed = rows[0];
          if (ed.photo_first_clip || ed.video_first_clip || ed.drone_first_clip || ed.secondary_photo_first_clip || ed.secondary_video_first_clip) {
            allPhotographersUploaded = true;
          }
          if (ed.media_status === 'Verified') {
            dataManagerVerified = true;
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch preprod raw data for client tracking", e);
    }

    const rawDeliveries = lead.clientDeliveries.filter((delivery) =>
      ["RAW_DATA", "EVENT_RAW_DATA"].includes(delivery.deliveryType)
    );
    const finalDeliveries = lead.clientDeliveries.filter((delivery) => delivery.deliveryType === "FINAL_DELIVERABLES");
    const projectMeta = buildProjectMeta(lead, rawDeliveries, finalDeliveries);
    const projectStatus = resolveWorkStatus(lead.status, rawDeliveries, finalDeliveries);

    const clientName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.email || "Client";
    const resolvedEventDate = resolveScheduledEventDate(lead);

    const works = [
      ...lead.leadEmployee.map((assignment) => {
        const employeeName = `${assignment.employee?.firstName || ""} ${assignment.employee?.lastName || ""}`.trim();
        const matchingEvents = lead.events.filter((event) =>
          isMatchingEventType(assignment.taskName, event.eventName)
        );
        const finalEvents = matchingEvents.length > 0
          ? matchingEvents
          : lead.events.filter((event) => event.employeeId && event.employeeId === assignment.employeeId);

        const workTitle = assignment.taskName || assignment.employee?.position || "Assigned Work";
        
        let deadline = assignment.deadline ? new Date(assignment.deadline).toISOString() : null;
        if (!deadline && assignment.EstimatedDuration && assignment.createdAt) {
          const created = new Date(assignment.createdAt);
          created.setDate(created.getDate() + Number(assignment.EstimatedDuration));
          deadline = created.toISOString();
        }

        const workProjectMeta = buildWorkProjectMeta(lead, rawDeliveries, finalDeliveries, {
          title: workTitle,
          assignment,
          event: finalEvents[0],
        });

        return {
          id: `assignment-${assignment.leadEmployeeId}`,
          type: "assignment",
          title: workTitle,
          status: assignment.status || workProjectMeta.currentStage || "assigned",
          priority: assignment.priority || "Normal",
          createdAt: assignment.createdAt,
          deadline: deadline,
          estimatedDuration: assignment.EstimatedDuration,
          description: assignment.description || (finalEvents[0]?.notes ? finalEvents[0].notes : "Work assigned by the production team."),
          assignedTo: {
            name: employeeName || lead.leadFollowedBy || "Assigned team member",
            role: assignment.employee?.position || "Team Member",
            email: null,
            phone: assignment.employee?.contactNumber || null,
            location: assignment.employee?.workLocation || null,
          },
          events: finalEvents,
          tracking: buildTracking({
            hasAssignment: true,
            hasEvent: finalEvents.length > 0 || lead.events.length > 0,
            rawDeliveries,
            finalDeliveries,
          }),
          incomingData: rawDeliveries,
          finalDelivery: finalDeliveries,
          project: workProjectMeta,
        };
      }),
      ...lead.events.map((event) => {
        const matchingAssignments = lead.leadEmployee.filter((assignment) =>
          isMatchingEventType(assignment.taskName, event.eventName)
        );
        const finalAssignments = matchingAssignments.length > 0
          ? matchingAssignments
          : lead.leadEmployee.filter((assignment) => event.employeeId && assignment.employeeId === event.employeeId);

        const assignedEmp = event.employee || finalAssignments[0]?.employee;
        const employeeName = assignedEmp
          ? `${assignedEmp.firstName || ""} ${assignedEmp.lastName || ""}`.trim()
          : "";

        const taskDeadline = finalAssignments[0]?.deadline
          ? new Date(finalAssignments[0].deadline).toISOString()
          : null;

        const workProjectMeta = buildWorkProjectMeta(lead, rawDeliveries, finalDeliveries, {
          title: event.eventName,
          event,
          assignment: finalAssignments[0],
        });

        return {
          id: `event-${event.eventId}`,
          type: "event",
          title: event.eventName,
          status: event.status || workProjectMeta.currentStage || "scheduled",
          priority: "Event",
          createdAt: event.createdAt,
          deadline: taskDeadline,
          estimatedDuration: null,
          description: event.notes || "Scheduled production event.",
          assignedTo: {
            name: employeeName || lead.leadFollowedBy || "Production team",
            role: assignedEmp?.position || "Event Team",
            email: null,
            phone: assignedEmp?.contactNumber || null,
            location: assignedEmp?.workLocation || null,
          },
          events: [event],
          tracking: buildTracking({
            hasAssignment: Boolean(assignedEmp || event.employeeId),
            hasEvent: true,
            rawDeliveries,
            finalDeliveries,
          }),
          incomingData: rawDeliveries,
          finalDelivery: finalDeliveries,
          project: workProjectMeta,
        };
      }),
    ];

    if (works.length === 0) {
      works.push({
        id: `project-${lead.leadId}`,
        type: "project",
        title: `${lead.eventType || "Project"} Project`,
        status: projectStatus,
        priority: lead.priority || "Normal",
        createdAt: lead.createdTime,
        deadline: null,
        estimatedDuration: null,
        description: lead.description || "Current project work is being tracked by the Red Angle production team.",
        assignedTo: {
          name: lead.leadFollowedBy || "Red Angle team",
          role: "Project coordinator",
          email: null,
          phone: null,
          location: null,
        },
        events: lead.events,
        tracking: buildTracking({
          hasAssignment: true,
          hasEvent: lead.events.length > 0,
          rawDeliveries,
          finalDeliveries,
        }),
        incomingData: rawDeliveries,
        finalDelivery: finalDeliveries,
        project: projectMeta,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        allPhotographersUploaded,
        dataManagerVerified,
        client: {
          leadId: lead.leadId,
          leadSerialNumber: lead.leadSerialNumber,
          name: clientName,
          email: lead.email,
          phone: lead.contactNumber,
          address: lead.address,
          eventType: lead.eventType,
          eventDate: resolvedEventDate,
          status: lead.status,
          currentStage: lead.currentStage,
          createdAt: lead.createdTime,
        },
        summary: {
          totalWorks: works.length,
          incomingPending: rawDeliveries.filter((delivery) => normalizeStatus(delivery.status) === "pending").length,
          finalPending: finalDeliveries.filter((delivery) =>
            ["pending", "query_raised"].includes(normalizeStatus(delivery.status))
          ).length,
        },
        works,
      },
    });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    return res.status(status).json({ success: false, message: error.message || "Failed to fetch client works" });
  }
};

