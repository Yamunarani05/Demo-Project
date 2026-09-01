import { Request, Response } from "express";
import prisma from "../config/prisma";
import { verifyClientToken } from "../util/auth";

// Identical to buildInvoiceViewModel in the main backend
function buildInvoiceViewModel(invoice: any) {
  const itemsByCategory: Record<string, any[]> = {};

  // PACKAGES + their sub-items
  invoice.packageInvoices.forEach((pi: any) => {
    if (!itemsByCategory["PACKAGES"]) itemsByCategory["PACKAGES"] = [];
    itemsByCategory["PACKAGES"].push({
      name: pi.package.packageTitle,
      quantity: pi.unit,
      price: Number(pi.package.price || 0),
    });

    (pi.package.items || []).forEach((item: any) => {
      const category = (item.category || "SERVICE").toUpperCase();
      if (!itemsByCategory[category]) itemsByCategory[category] = [];
      const exists = itemsByCategory[category].some((i) => i.name === item.name);
      if (!exists) {
        itemsByCategory[category].push({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price || 0),
        });
      }
    });
  });

  // ADDONS
  if (invoice.addons?.length) {
    itemsByCategory["ADD-ONS"] = invoice.addons.map((addon: any) => {
      const baseName = addon.addonService?.name || "";
      const category = addon.category ? addon.category.toUpperCase() : "";
      const displayName = category ? `${baseName} (${category})` : baseName;
      return {
        name: displayName,
        quantity: addon.quantity,
        price: Number(addon.price || 0),
      };
    });
  }

  // INVOICE ITEMS (deliverables, extra items, etc.)
  invoice.invoiceItems?.forEach((item: any) => {
    let originalCategory = (item.category || "SERVICE").toUpperCase();
    let category = originalCategory;
    let name = item.name;

    if (!["DELIVERABLE", "DELIVERABLES", "COMPLIMENTARY", "EXTRA_COMPLEMENTARY"].includes(originalCategory)) {
      category = "ADD-ONS";
      if (originalCategory !== "SERVICE" && originalCategory !== "ADD-ONS") {
        name = `${item.name} (${originalCategory})`;
      }
    }

    if (!itemsByCategory[category]) itemsByCategory[category] = [];
    const exists = itemsByCategory[category].some(
      (i: any) => i.name === name || i.name === item.name
    );
    if (!exists) {
      itemsByCategory[category].push({
        name,
        quantity: item.quantity,
        price: Number(item.price || 0),
      });
    }
  });

  return itemsByCategory;
}

export class ClientInvoiceController {

  // GET /api/invoices  – all invoices for the authenticated client
  static async getInvoices(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer "))
        return res.status(401).json({ success: false, message: "Missing token" });

      const token = authHeader.split(" ")[1];
      const payload = verifyClientToken(token);
      const leadId = Number(payload.id);

      const invoices = await prisma.invoices.findMany({
        where: {
          leadId,
          status: { notIn: ["Draft"] },
        },
        include: {
          lead: true,
          packageInvoices: {
            where: { isRemoved: false },
            include: { package: { include: { items: true } } },
          },
          invoiceItems: true,
          addons: { include: { addonService: true } },
          payments: { orderBy: { paymentDate: "desc" } },
          invoiceAdditionals: true,
          issues: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      });

      const result = await Promise.all(invoices.map(async (inv) => {
        // Fetch previewItems and invoiceSnapshot using a raw query if needed
        let rawPreviewItems: any = null;
        let rawSnapshot: any = null;
        try {
          const rawRes: any[] = await prisma.$queryRaw`SELECT "previewItems", "invoiceSnapshot" FROM invoices WHERE invoice_id = ${inv.invoiceId}`;
          if (rawRes && rawRes.length > 0) {
            rawPreviewItems = rawRes[0].previewItems;
            rawSnapshot = rawRes[0].invoiceSnapshot;
          }
        } catch {}

        let previewItems = rawPreviewItems || inv.previewItems || null;
        if (typeof previewItems === "string") {
          try { previewItems = JSON.parse(previewItems); } catch {}
        }

        let invoiceSnapshot = rawSnapshot || inv.invoiceSnapshot || null;
        if (typeof invoiceSnapshot === "string") {
          try { invoiceSnapshot = JSON.parse(invoiceSnapshot); } catch {}
        }

        if (!previewItems && invoiceSnapshot) {
          if (invoiceSnapshot.previewItems) {
            previewItems = invoiceSnapshot.previewItems;
          } else if (invoiceSnapshot.itemsByCategory) {
            previewItems = Object.entries(invoiceSnapshot.itemsByCategory).map(([category, items]) => ({
              category,
              items,
            }));
          }
        }

        let itemsByCategory = buildInvoiceViewModel(inv);

        // Fallback: populate itemsByCategory from previewItems if empty
        if (Object.keys(itemsByCategory).length === 0 && Array.isArray(previewItems)) {
          previewItems.forEach((catGroup: any) => {
            const catName = String(catGroup.category || "SERVICE").toUpperCase();
            if (!itemsByCategory[catName]) itemsByCategory[catName] = [];
            (catGroup.items || []).forEach((item: any) => {
              itemsByCategory[catName].push({
                name: item.name || item.title || "",
                quantity: Number(item.quantity || item.unit || 1),
                price: Number(item.price || 0),
              });
            });
          });
        }

        const packageTotal = inv.packageInvoices.reduce(
          (acc: number, pi: any) => acc + (Number(pi.unit) || 1) * Number(pi.package?.price || 0),
          0
        );
        const addonTotal = inv.addons.reduce(
          (acc: number, a: any) => acc + Number(a.total || 0),
          0
        );
        const itemsTotal = inv.invoiceItems.reduce(
          (acc: number, item: any) =>
            acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
          0
        );

        const itemsSum = packageTotal + addonTotal + itemsTotal;

        // Base total: prioritize explicit totalAmount on invoice, then computed itemsSum, then snapshot/budget
        let baseTotal = Number(inv.totalAmount || 0);
        if (baseTotal === 0 && itemsSum > 0) {
          baseTotal = itemsSum;
        }
        if (baseTotal === 0 && invoiceSnapshot) {
          if (invoiceSnapshot.totalPrice) baseTotal = Number(invoiceSnapshot.totalPrice);
          else if (invoiceSnapshot.totalAmount) baseTotal = Number(invoiceSnapshot.totalAmount);
        }
        if (baseTotal === 0 && inv.lead?.budget) {
          baseTotal = Number(inv.lead.budget);
        }

        let parsedQtyOverrides: Record<string, any> = {};
        if (inv.qtyOverrides) {
          try {
            parsedQtyOverrides = typeof inv.qtyOverrides === 'string'
              ? JSON.parse(inv.qtyOverrides)
              : inv.qtyOverrides;
          } catch { parsedQtyOverrides = {}; }
        }

        let subtotal = baseTotal;
        if (parsedQtyOverrides.TOTAL_OVERRIDE !== undefined) {
          subtotal = Number(parsedQtyOverrides.TOTAL_OVERRIDE);
        }

        let discount = Number(inv.discount ?? 0);
        if (discount === 0 && inv.lead?.discount) {
          discount = Number(inv.lead.discount);
        }

        const verifiedPayments = (inv.payments || []).filter(
          (p: any) => p.status === "VERIFIED" || !p.status
        );
        const rawPaid = Number(inv.paid ?? 0);
        const leadPaid = Number(inv.lead?.paidAmount ?? 0);
        const advancePaid = rawPaid > 0 ? rawPaid : (verifiedPayments.length > 0 ? Number(verifiedPayments[0].paid || 0) : leadPaid);

        let overall = subtotal - discount;
        if (parsedQtyOverrides.OVERALL_OVERRIDE !== undefined) {
          overall = Number(parsedQtyOverrides.OVERALL_OVERRIDE);
        }

        const invoiceManualPaid = Number(inv.paid ?? 0);
        const totalPaid = invoiceManualPaid > 0
          ? invoiceManualPaid
          : (verifiedPayments.length > 0
              ? verifiedPayments.reduce(
                  (acc: number, p: any) => acc + Number(p.paid || p.amount || 0),
                  0
                )
              : leadPaid);

        const balance = Math.max(0, overall - totalPaid);

        let previewEvents: any[] = [];
        if (inv.previewEvents) {
          try {
            previewEvents = Array.isArray(inv.previewEvents)
              ? inv.previewEvents
              : JSON.parse(inv.previewEvents as string);
          } catch { previewEvents = []; }
        } else if (invoiceSnapshot?.previewEvents) {
          previewEvents = Array.isArray(invoiceSnapshot.previewEvents)
            ? invoiceSnapshot.previewEvents
            : [];
        }

        return {
          invoiceId: inv.invoiceId,
          billNo: inv.billNo,
          status: balance <= 0 ? "Paid" : inv.status,
          plan: inv.plan,
          billingDate: inv.billingDate,
          sentAt: inv.sendAt,
          token: inv.token,
          totalAmount: subtotal,
          totalPrice: subtotal,
          discount,
          overall,
          paid: advancePaid,
          advancePaid,
          totalPaid,
          balance,
          received80: Number(parsedQtyOverrides.RECEIVED_80 ?? (inv as any).received80 ?? 0),
          payments: verifiedPayments,
          previewEvents,
          previewItems,
          qtyOverrides: parsedQtyOverrides,
          itemsByCategory,
          packageInvoices: inv.packageInvoices.map((pi: any) => ({
            unit: pi.unit,
            package: { packageTitle: pi.package?.packageTitle || "Package" },
          })),
          lead: {
            leadId: inv.lead.leadId,
            firstName: inv.lead.firstName ?? "",
            lastName: inv.lead.lastName ?? "",
            email: inv.lead.email ?? null,
            contactNumber: inv.lead.contactNumber ?? null,
            address: inv.lead.address ?? null,
            eventType: inv.lead.eventType ?? null,
            eventDate: inv.lead.eventDate ?? null,
            description: inv.lead.description ?? null,
            leadSerialNumber: inv.lead.leadSerialNumber ?? null,
            leadType: inv.lead.leadType ?? "LD",
            budget: inv.lead.budget ?? null,
            discount: inv.lead.discount ?? null,
            paidAmount: inv.lead.paidAmount ?? null,
          },
          latestIssue: inv.issues[0]
            ? { issueId: inv.issues[0].issueId, issueTitle: inv.issues[0].issueTitle, status: inv.issues[0].status }
            : null,
        };
      }));

      return res.status(200).json({ success: true, data: result });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // GET /api/invoices/lead/:leadId – get invoices by lead ID
  static async getInvoicesByLead(req: Request, res: Response) {
    try {
      const leadId = Number(req.params.leadId);
      if (!leadId || isNaN(leadId)) {
        return res.status(400).json({ success: false, message: "Invalid lead ID" });
      }

      const invoices = await prisma.invoices.findMany({
        where: { leadId, status: { notIn: ["Draft"] } },
        include: {
          lead: true,
          packageInvoices: {
            where: { isRemoved: false },
            include: { package: { include: { items: true } } },
          },
          invoiceItems: true,
          addons: { include: { addonService: true } },
          payments: { orderBy: { paymentDate: "desc" } },
          issues: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ success: true, data: invoices });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // PATCH /api/invoices/:id/approve  – approve/accept invoice by client
  static async approveInvoice(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer "))
        return res.status(401).json({ success: false, message: "Missing token" });

      const token = authHeader.split(" ")[1];
      const payload = verifyClientToken(token);
      const leadId = Number(payload.id);
      const invoiceId = Number(req.params.id);

      const invoice = await prisma.invoices.findFirst({
        where: { invoiceId, leadId },
        include: { lead: true }
      });

      if (!invoice)
        return res.status(404).json({ success: false, message: "Invoice not found" });

      const updated = await prisma.invoices.update({
        where: { invoiceId },
        data: { status: "Approved" },
      });

      // 🔔 Notify admin + assigned employees (non-blocking)
      try {
        const lead = invoice.lead;
        const leadName = lead?.firstName ? `${lead.firstName} ${lead.lastName || ''}`.trim() : null;
        const leadLabel = leadName ? `"${leadName}"` : `#${leadId}`;
        const title = `Client accepted invoice #${invoiceId}`;
        const message = `The client for lead ${leadLabel} has accepted/approved invoice #${invoiceId}.`;

        const admins = await prisma.user.findMany({
          where: { role: "admin" },
          select: { userId: true },
        });

        const assignments = await prisma.leadEmployee.findMany({
          where: { leadId },
          include: { employee: { select: { userId: true } } },
        });

        const employeeUserIds = assignments
          .map((a) => a.employee.userId)
          .filter((uid) => uid !== null) as number[];

        const allAdminIds = admins.map((a) => a.userId);
        const uniqueUserIds = [...new Set([...allAdminIds, ...employeeUserIds])];

        if (uniqueUserIds.length > 0) {
          await prisma.notification.createMany({
            data: uniqueUserIds.map((userId) => ({
              userId,
              issueType: "InvoiceApproval",
              title,
              message,
              isRead: false,
            })),
          });
        }
      } catch (notificationError) {
        console.error("Failed to create notification on invoice approval:", notificationError);
      }

      return res.status(200).json({ success: true, message: "Invoice accepted successfully", data: updated });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // PUT /api/invoices/public/:token/status
  static async updatePublicInvoiceStatus(req: Request, res: Response) {
    try {
      const invoiceToken = String(req.params.token);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
      }

      const invoice = await prisma.invoices.findFirst({
        where: { token: invoiceToken },
        include: { lead: true }
      });

      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }

      const formattedStatus = status.toLowerCase() === "approved" ? "Approved" : status;

      const updated = await prisma.invoices.update({
        where: { invoiceId: invoice.invoiceId },
        data: { status: formattedStatus },
      });

      return res.status(200).json({ success: true, message: "Invoice status updated", data: updated });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // POST /api/invoices/:id/issue  – raise a billing issue
  static async raiseIssue(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer "))
        return res.status(401).json({ success: false, message: "Missing token" });

      const token = authHeader.split(" ")[1];
      const payload = verifyClientToken(token);
      const leadId = Number(payload.id);
      const invoiceId = Number(req.params.id);

      const { issueTitle, description } = req.body;
      if (!issueTitle)
        return res.status(400).json({ success: false, message: "Issue title is required" });

      const invoice = await prisma.invoices.findFirst({ 
        where: { invoiceId, leadId },
        include: { lead: true, payments: true, packageInvoices: { include: { package: true } }, addons: { include: { addonService: true } }, invoiceItems: true },
      });
      
      if (!invoice)
        return res.status(404).json({ success: false, message: "Invoice not found" });

      const issue = await prisma.invoiceIssues.create({
        data: { invoiceId, issueTitle, description: description || null, status: "Open" },
      });

      // 🔔 Notify admin + assigned employees (non-blocking)
      try {
        const lead = await prisma.leadsDetail.findUnique({ where: { leadId } });
        const leadName = lead?.firstName ? `${lead.firstName} ${lead.lastName || ''}`.trim() : null;
        const leadLabel = leadName ? `"${leadName}"` : `#${leadId}`;
        const title = `Client raised an invoice issue`;
        const descPart = description ? `\nDetails: ${description}` : "";
        const message = `The client for lead ${leadLabel} raised an issue.\n\nIssue: "${issueTitle}"${descPart}\n\nPlease review and respond.`;

        const admins = await prisma.user.findMany({
          where: { role: "admin" },
          select: { userId: true },
        });

        const assignments = await prisma.leadEmployee.findMany({
          where: { leadId },
          include: { employee: { select: { userId: true } } },
        });
        
        const employeeUserIds = assignments
          .map((a) => a.employee.userId)
          .filter((uid) => uid !== null) as number[];

        const allAdminIds = admins.map((a) => a.userId);
        const uniqueUserIds = [...new Set([...allAdminIds, ...employeeUserIds])];

        if (uniqueUserIds.length > 0) {
          await prisma.notification.createMany({
            data: uniqueUserIds.map((userId) => ({
              userId,
              issueType: "InvoiceIssue",
              title,
              message,
              isRead: false,
            })),
          });
        }
      } catch (notificationError) {
        console.error("Failed to create notification on invoice query:", notificationError);
      }

      return res.status(201).json({ success: true, data: issue, message: "Query raised successfully" });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
}

export default ClientInvoiceController;
