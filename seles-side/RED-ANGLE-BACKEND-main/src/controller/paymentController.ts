import { Request, Response } from "express";
import * as paymentService from "../services/paymentService";
import { PaymentStatus } from "@prisma/client";
import ExcelJS from "exceljs";
import prisma from "../config/prisma";


// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: { userId: number };
}

class PaymentController {
  /* ---------------- ADD PAYMENT ---------------- */
  async addPayment(req: AuthRequest, res: Response) {
    try {
      const { leadId, invoiceId, paid, paymentType, notes } = req.body;



      const proofUrl = req.file ? `/uploads/payment_proof/${req.file.filename}` : undefined;

      const payment = await paymentService.createPayment({
        leadId: Number(leadId),
        invoiceId: Number(invoiceId),
        paid: Number(paid),
        paymentType,
        proofUrl,
        notes,
      });

      res.status(201).json({
        success: true,
        message: "Payment submitted, awaiting verification",
        data: payment,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  // async getPaymentsByInvoice(req: Request, res: Response) {
  //   try {
  //     const invoiceId = Number(req.params.invoiceId);
  //      const invoice = await prisma.invoices.findUnique({
  //   where: { invoiceId },
  //   include: {
  //     packageInvoices: {
  //       include: { package: true },
  //     },
  //   },
  // });

  // if (!invoice) {
  //   return res.status(404).json({
  //     success: false,
  //     message: "Invoice not found",
  //   });
  // }const totalAmount = invoice.packageInvoices.reduce(
  //   (sum, item) =>
  //     sum +
  //     Number(item.unit || 0) *
  //     Number(item.package?.price || 0),
  //   0
  // );



  //     const payments = await prisma.payments.findMany({
  //       where: { invoiceId },
  //       orderBy: { paymentDate: "desc" },
  //       select: {
  //         paymentId: true,
  //         paid: true,
  //         paymentType: true,
  //         status: true,
  //         proofUrl: true,
  //         paymentDate: true,
  //         verifiedAt: true,
  //         verifiedBy: true,
  //       },
  //     });

  //     const totalPaid = payments
  //       .filter((p) => p.status === "VERIFIED")
  //       .reduce((sum, p) => sum + Number(p.paid), 0);

  //     return res.json({
  //       success: true,
  //       totalAmount,
  //       totalPaid,
  //       payments,
  //     });
  //   } catch (error) {
  //     console.error("getPaymentsByInvoice error:", error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Failed to fetch payments",
  //     });
  //   }
  // }
  async getPaymentsByInvoice(req: Request, res: Response) {
    try {
      const invoiceId = Number(req.params.invoiceId);

      const invoice = await prisma.invoices.findUnique({
        where: { invoiceId },
        include: {
          lead: true,
          invoiceItems: true,
          packageInvoices: {
            include: {
              package: true,
            },
          },
          addons: {
            include: {
              addonService: true,
            },
          },
          payments: true,
        },
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      // ✅ package total
      const packageTotal = invoice.packageInvoices.reduce(
        (sum, item) => sum + Number(item.unit) * Number(item.package.price),
        0
      );

      // ✅ addon total (by leadId or invoice addons)
      const leadAddons = await prisma.leadAddon.findMany({
        where: { leadId: invoice.leadId },
        select: { total: true },
      });

      const addonTotal =
        invoice.addons.length > 0
          ? invoice.addons.reduce((sum, addon) => sum + Number(addon.total || 0), 0)
          : leadAddons.reduce((sum, addon) => sum + Number(addon.total ?? 0), 0);

      const itemsTotal = invoice.invoiceItems.reduce(
        (acc, item) =>
          acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );

      const itemsSum = packageTotal + addonTotal + itemsTotal;
      const totalAmount =
        Number(invoice.totalAmount || 0) > 0
          ? Number(invoice.totalAmount)
          : itemsSum > 0
            ? itemsSum
            : Number(invoice.lead?.budget || 0);

      const discount = Number(invoice.discount ?? invoice.lead?.discount ?? 0);

      const overallBudget = Math.max(0, totalAmount - discount);

      // Fetch all payments in ascending creation order
      const payments = await prisma.payments.findMany({
        where: { invoiceId },
        orderBy: { paymentId: "asc" },
        select: {
          paymentId: true,
          paid: true,
          paymentType: true,
          status: true,
          proofUrl: true,
          notes: true,
          paymentDate: true,
          verifiedAt: true,
          verifiedBy: true,
        },
      });

      const rawPaid = Number(invoice.paid || invoice.lead?.paidAmount || 0);
      const verifiedPayments = payments.filter((p) => p.status === "VERIFIED" || !p.status);
      const totalPaid = verifiedPayments.length > 0
        ? verifiedPayments.reduce((sum, p) => sum + Number(p.paid || 0), 0)
        : rawPaid;
      const balance = Math.max(0, overallBudget - totalPaid);

      const isFullyPaid = overallBudget > 0 && totalPaid >= overallBudget;
      const isPartiallyPaid = totalPaid > 0 && !isFullyPaid;
      const calculatedStatus = isFullyPaid ? "Paid" : (isPartiallyPaid ? "Partial" : (invoice.status === "Paid" ? "Partial" : (invoice.status || "Pending")));

      if (invoice.status !== calculatedStatus && (calculatedStatus === "Paid" || calculatedStatus === "Partial")) {
        await prisma.invoices.update({
          where: { invoiceId },
          data: { status: calculatedStatus },
        });
      }

      return res.json({
        success: true,
        totalAmount,
        packageTotal,
        addonTotal,
        discount,
        overallBudget,
        totalPaid,
        balance,
        payments,
        status: calculatedStatus,
      });
    } catch (error) {
      console.error("getPaymentsByInvoice error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payments",
      });
    }
  }



  /* ---------------- VERIFY PAYMENT ---------------- */
  async verifyPayment(req: AuthRequest, res: Response) {
    try {
      const { paymentId, status } = req.body;
      const adminId = req.user?.userId;

      if (!paymentId || !status || !adminId) {
        return res.status(400).json({ message: "Missing fields" });
      }

      const updated = await paymentService.verifyPayment(
        Number(paymentId),
        status as PaymentStatus,
        adminId
      );

      res.json({
        success: true,
        message: `Payment ${status.toLowerCase()}`,
        data: updated,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  /* ---------------- MONTHLY EARNINGS ---------------- */
  async getMonthlyEarnings(req: Request, res: Response) {
    try {
      const earnings = await paymentService.fetchMonthlyEarnings();
      res.json({ success: true, data: earnings });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  /* ---------------- PAYMENTS BY MONTH ---------------- */
  async getPaymentsByMonth(req: Request, res: Response) {
    try {
      const { year, month } = req.params;

      if (!year || !month) {
        return res.status(400).json({ message: "Missing year or month" });
      }

      const payments = await paymentService.fetchPaymentsByMonth(
        Number(year),
        Number(month)
      );

      res.json({ success: true, data: payments });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  /* ---------------- DOWNLOAD PAYMENTS EXCEL ---------------- */
  async downloadPaymentsExcel(req: Request, res: Response) {
    try {
      const { year, month } = req.query as { year?: string; month?: string };

      if (!year || !month) {
        return res.status(400).json({ message: "Missing year or month" });
      }

      const payments = await paymentService.fetchPaymentsByMonth(
        Number(year),
        Number(month)
      );

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Payments Report");

      // Header
      sheet.mergeCells("A1:G1");
      sheet.getCell("A1").value = "RED ANGLE STUDIO";
      sheet.getCell("A1").font = { size: 16, bold: true };
      sheet.getCell("A1").alignment = { horizontal: "center" };

      sheet.mergeCells("A2:G2");
      sheet.getCell("A2").value = `PAYMENTS REPORT - ${month}/${year}`;
      sheet.getCell("A2").font = { size: 12, bold: true };
      sheet.getCell("A2").alignment = { horizontal: "center" };

      const header = sheet.addRow([
        "Payment ID",
        "Invoice ID",
        "Lead ID",
        "Amount",
        "Paid",
        "Balance",
        "Payment Type",
        "Status",
      ]);

      header.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
        cell.alignment = { horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Data rows
      payments.forEach((p) => {
        const row = sheet.addRow([
          p.paymentId,
          p.invoiceId ?? "-",
          p.leadId,
          Number(p.amount),
          Number(p.paid),
          Number(p.balance),
          p.paymentType,
          p.status,
        ]);

        row.eachCell((cell) => {
          cell.alignment = { horizontal: "center" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      sheet.columns = [
        { width: 12 },
        { width: 10 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 15 },
        { width: 12 },
      ];

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=payments-report-${month}-${year}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
  /* -------- INVOICE AMOUNT SUMMARY -------- */
  async getInvoiceAmountSummary(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;

      if (!invoiceId) {
        return res.status(400).json({ message: "Invoice ID is required" });
      }

      const summary = await paymentService.getInvoiceAmountSummary(
        Number(invoiceId)
      );

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

}

export default new PaymentController();
