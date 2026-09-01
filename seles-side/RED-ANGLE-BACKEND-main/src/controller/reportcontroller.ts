import { Request, Response } from "express";
import prisma from "../config/prisma";
import { buildInvoiceViewModel } from "../util/buildInvoiceViewModel";

export const getLeadSummaryReport = async (req: Request, res: Response) => {
  try {

    const leads = await prisma.leadsDetail.findMany({
      include: {
        quotationLeads: {
          include: { quotation: true },
        },
        invoices: {
          include: {
            packageInvoices: {
              include: { package: { include: { items: true } } },
            },
            addons: { include: { addonService: true } },
            invoiceItems: true,
          },
        },
        payments: true,
        leadCalls: true,
      },
    });



    const mergedData = leads.map((lead) => {

      const totalQuotationValue = lead.quotationLeads.reduce(
        (sum, ql) => sum + Number(ql.quotation?.price || 0),
        0
      );

      // ✅ Always compute invoice totals from live relational data, including overrides
      const totalInvoiceValue = lead.invoices.reduce((sum, inv) => {
        const qtyOverrides = (inv.qtyOverrides as Record<string, number>) || {};
        const packageTotal = inv.packageInvoices.reduce((acc, pi) => acc + Number(pi.unit) * Number(pi.package?.price || 0), 0);
        const addonTotal = inv.addons.reduce((acc, addon) => acc + Number(addon.total || 0), 0);
        const itemsTotal = inv.invoiceItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
        
        let subtotal = packageTotal + addonTotal + itemsTotal;
        if (qtyOverrides["TOTAL_OVERRIDE"] !== undefined) {
            subtotal = qtyOverrides["TOTAL_OVERRIDE"];
        }

        let overall = subtotal; // Original logic did not subtract discount
        if (qtyOverrides["OVERALL_OVERRIDE"] !== undefined) {
            overall = qtyOverrides["OVERALL_OVERRIDE"];
        }

        return sum + overall;
      }, 0);

      // ✅ Sum actual paid amounts (pay.paid) instead of invoice totals (pay.amount)
      const totalPayments = lead.payments.reduce(
        (sum, pay) => sum + Number(pay.paid || 0),
        0
      );

      const followUps = lead.leadCalls
        .sort((a, b) => new Date(b.callTime).getTime() - new Date(a.callTime).getTime())
        .map(call => ({
          callTime: call.callTime,
          notes: call.notes,
          isTaken: call.isTaken,
        }));


      /* ================= INVOICE DETAILS ================= */

      const invoiceDetails = lead.invoices.map((inv) => {
        const snapshot = inv.invoiceSnapshot as any;

        // Extract named event details from previewEvents array
        const previewEvents: { title: string; value: string }[] = (inv.previewEvents as any) ?? [];
        const getEvent = (title: string) =>
          previewEvents.find((e) => e.title?.toUpperCase() === title)?.value ?? "";

          // ✅ Compute from live data + overrides
          const qtyOverrides = (inv.qtyOverrides as Record<string, number>) || {};
          const packageTotal = inv.packageInvoices.reduce((acc, pi) => acc + Number(pi.unit) * Number(pi.package?.price || 0), 0);
          const addonTotal = inv.addons.reduce((acc, addon) => acc + Number(addon.total || 0), 0);
          const itemsTotal = inv.invoiceItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
          
          let subtotal = packageTotal + addonTotal + itemsTotal;
          if (qtyOverrides["TOTAL_OVERRIDE"] !== undefined) {
              subtotal = qtyOverrides["TOTAL_OVERRIDE"];
          }
          
          let overall = subtotal; // Original logic did not subtract discount for totalAmount
          if (qtyOverrides["OVERALL_OVERRIDE"] !== undefined) {
              overall = qtyOverrides["OVERALL_OVERRIDE"];
          }

          const discount = Number(inv.discount ?? 0);

          // ✅ Use inv.paid directly
          const paidAmount = Number(inv.paid || 0);
          
          let balance = (overall - discount) - paidAmount; // Old logic for balance subtracted discount
          if (qtyOverrides["BALANCE_OVERRIDE"] !== undefined) {
              balance = qtyOverrides["BALANCE_OVERRIDE"];
          }

          return {
            invoiceId: inv.invoiceId,
            billingDate: inv.billingDate,
            billNo: (inv as any).billNo || undefined,
            plan: snapshot?.plan || inv.plan,
            status: inv.status,
            discount,

            totalAmount: overall,
            packageTotal,
            addonTotal,
            paid: paidAmount,
            balance: balance,

            // Event details from previewEvents
          eventName: getEvent("EVENT NAME"),
          engagement: getEvent("ENGAGEMENT"),
          wedding: getEvent("WEDDING"),
          reception: getEvent("RECEPTION"),
          rituals: getEvent("RITUALS"),
          location: getEvent("LOCATION"),

          itemsByCategory: buildInvoiceViewModel(inv),
          
          // ✅ Return the raw JSON overrides for exact modal reconstruction
          previewEvents: inv.previewEvents,
          previewItems: (inv as any).previewItems,
        };
      });

      return {
        id: lead.leadId,
        leadSerialNumber: lead.leadSerialNumber ?? `${lead.leadType ?? "LD"}-${lead.leadId}`,
        leadName: `${lead.firstName || ""} ${lead.lastName || ""}`.trim(),
        phone: lead.contactNumber,
        email: lead.email,

        eventType: lead.eventType,
        eventDate: lead.eventDate,
        location: lead.address,
        priority: lead.priority,

        // Include deleted status and the stage so the frontend can label deleted leads
        isDeleted: lead.isDeleted,
        currentStage: lead.currentStage,
        status: lead.status,
        createdAt: lead.createdTime,

        quotationCount: lead.quotationLeads.length,
        totalQuotationValue,

        invoiceCount: lead.invoices.length,
        totalInvoiceValue,

        totalPayments,
        balance: invoiceDetails.reduce((sum, inv) => sum + inv.balance, 0),

        followUpCount: lead.leadCalls.length,
        followUps,

        invoiceDetails, // ✅ merged invoice API data
      };
    });

    res.json({ success: true, data: mergedData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};
