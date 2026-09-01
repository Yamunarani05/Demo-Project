import { Request, Response } from "express";
import invoiceService from "../services/invoiceService";
import prisma from "../config/prisma";
import {
  createEmailTemplate,
  createAdminInvoiceEmailContent,
} from "../util/emailTemplates";
import { sendEmail } from "../util/emailService";
import { ENV } from "../config/env";
import ExcelJS from "exceljs";
import { notificationService } from "../services/notificationService";



class InvoiceController {

  async create(req: any, res: Response) {



    try {
      const userId = req.admin?.id || req.partner?.id || req.employee?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - User ID not found",
        });
      }

      const result = await invoiceService.createInvoice(
        req.body,
        parseInt(userId, 10)
      );

      return res.status(201).json({
        success: true,
        message: "Invoice created successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Error in create invoice", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create invoice",
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(String(req.query.page || "1"), 10);
      const limit = parseInt(String(req.query.limit || "10"), 10);
      const skip = (page - 1) * limit;
      const search = String(req.query.search || "");

      const result = await invoiceService.getAllInvoices(
        page,
        limit,
        skip,
        search
      );

      return res.status(200).json({
        success: true,
        message: "Invoices retrieved successfully",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error("Error fetching all invoices", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve invoices",
      });
    }
  }

  async getAllPackages(req: Request, res: Response) {
    try {
      const packages = await invoiceService.getAllPackages();
      return res.status(200).json({
        success: true,
        message: "Packages retrieved successfully",
        data: packages,
      });
    } catch (error: any) {
      console.error("Error fetching all packages", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve invoices",
      });
    }
  }

  async getAllIssues(req: Request, res: Response) {
    try {
      const page = parseInt(String(req.query.page || "1"), 10);
      const limit = parseInt(String(req.query.limit || "10"), 10);
      const skip = (page - 1) * limit;
      const search = String(req.query.search || "");

      const result = await invoiceService.getAllIssues(
        page,
        limit,
        skip,
        search
      );

      return res.status(200).json({
        success: true,
        message: "Invoice issues retrieved successfully",
        data: result.data,
        pending: result.pending,
        replied: result.replied,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error("Error fetching invoice issues", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve invoice issues",
      });
    }
  }

  async getIssueById(req: Request, res: Response) {
    try {
      const issueId = Number(req.params.issueId);
      if (!issueId || issueId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid issue ID is required",
        });
      }

      const issue = await invoiceService.getIssueById(issueId);

      return res.status(200).json({
        success: true,
        message: "Issue retrieved successfully",
        data: issue,
      });
    } catch (error: any) {
      console.error("Error fetching issue by ID", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve issue",
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const invoiceId = Number(req.params.invoiceId);


      if (!invoiceId || invoiceId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid invoice ID is required",
        });
      }

      const invoice = await invoiceService.getInvoiceById(invoiceId);

      return res.status(200).json({
        success: true,
        message: "Invoice retrieved successfully",
        data: invoice,
      });
    } catch (error: any) {
      console.error("Error fetching invoice by ID", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve invoice",
      });
    }
  }

  async getInvoiceByToken(req: Request, res: Response) {
    try {
      const token = String(req.params.token || "");
      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Valid invoice token is required",
        });
      }

      const invoice = await invoiceService.getInvoiceByToken(token);

      return res.status(200).json({
        success: true,
        message: "Invoice retrieved successfully",
        data: invoice,
      });
    } catch (error: any) {
      console.error("Error fetching invoice by token", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve invoice",
      });
    }
  }

  async InvoiceApproved(req: Request, res: Response) {
    try {
      const token = req.params.token as string;
      const { status } = req.body;

      const result = await invoiceService.InvoiceApproved(token, status);

      // 🔔 Notify admin + assigned employees when client responds (non-blocking)
      if (status === "approved" || status === "rejected") {
        (async () => {
          try {
            const inv = await prisma.invoices.findUnique({
              where: { token },
              include: { lead: { select: { leadId: true, firstName: true, lastName: true } } },
            });
            if (inv) {
              const leadName = inv.lead.firstName
                ? `${inv.lead.firstName} ${inv.lead.lastName ?? ""}`.trim()
                : undefined;
              await notificationService.createInvoiceResponseNotification({
                invoiceId: inv.invoiceId,
                leadId: inv.lead.leadId,
                leadName,
                status: status as "approved" | "rejected",
              });
            }
          } catch (err) {
            console.error("[Notification] Failed to notify on invoice response:", err);
          }
        })();
      }

      return res.status(200).json({
        success: true,
        message: "Invoice status updated successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Error in approving invoice:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async createIssueForInvoiceByToken(req: Request, res: Response) {
    try {
      const token = req.params.token as string;
      const { issueTitle, description } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Invoice token is required",
        });
      }

      if (!issueTitle || !description) {
        return res.status(400).json({
          success: false,
          message: "issueTitle and description are required",
        });
      }

      const invoice = await prisma.invoices.findUnique({
        where: { token },
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      const issue = await invoiceService.createissueForInvoice(
        invoice.invoiceId,
        issueTitle,
        description,
        0 // public user
      );

      return res.status(201).json({
        success: true,
        message: "Issue created successfully",
        data: issue,
      });
    } catch (error: any) {
      console.error("Error creating public invoice issue", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create invoice issue",
      });
    }
  }



  // NORMAL SEND: no issue side effects
  async sendInvoiceToClient(req: Request, res: Response) {




    try {
      const token = req.params.token as string;
      let invoiceId: number;


      if (token) {
        const invoice = await prisma.invoices.findUnique({
          where: { token },
        });

        if (!invoice) {
          return res.status(404).json({
            success: false,
            message: "Invoice not found for this token",
          });
        }

        invoiceId = invoice.invoiceId;
      } else {
        invoiceId = Number(req.params.invoiceId);
      }


      if (!invoiceId || invoiceId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid invoice ID is required",
        });
      }



      const result = await invoiceService.sendInvoiceToClient(invoiceId);

      const invoiceNumber = `INV${invoiceId}`;

      if (!result.invoice.token) {
        return res.status(500).json({
          success: false,
          message: "Invoice token is missing",
        });
      }

      const markingsRaw = await prisma.invoiceMarking.findMany({
        where: { invoiceId },
        orderBy: { sortOrder: 'asc' },
      });
      const markings = markingsRaw.map((m: any) => ({ label: m.label, value: m.value }));

      const emailContent = createAdminInvoiceEmailContent(
        result.clientName,
        invoiceNumber,
        result.invoice.token,
        markings
      );




      const htmlBody = createEmailTemplate(
        emailContent,
        `Invoice ${invoiceNumber}`
      );




      // ✅ Send email with attachment
      await sendEmail({
        to: result.clientEmail,
        subject: `Invoice ${invoiceNumber}`,
        body: htmlBody,
        isHTML: true,

      });

      return res.status(200).json({
        success: true,
        message: "Invoice sent successfully to client",
        data: {
          invoiceId,
          clientEmail: result.clientEmail,
          invoiceNumber,
        },
      });

      // 🔔 Notify assigned employees (non-blocking — fire after response)
      notificationService
        .createInvoiceSentNotification({
          invoiceId,
          clientName: result.clientName,
        })
        .catch((err) =>
          console.error("[Notification] Failed to notify employees on invoice sent:", err)
        );

    } catch (error: any) {
      console.error("Error sending invoice to client", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to send invoice",
      });
    }
  }


  // NEW: SEND SPECIFICALLY FOR AN ISSUE (marks issue replied + deletes its notifications)
  async sendInvoiceForIssue(req: any, res: Response) {
    try {
      const invoiceId = Number(req.params.invoiceId);
      const issueId = req.query.issueId
        ? Number(req.query.issueId)
        : undefined;

      if (!invoiceId || invoiceId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid invoice ID is required",
        });
      }

      const userId = req.admin?.id || req.partner?.id || req.employee?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - User ID not found",
        });
      }

      const result = await invoiceService.sendInvoiceToClient(invoiceId);

      const invoiceNumber = `INV${invoiceId}`;

      if (!result.invoice.token) {
        return res.status(500).json({
          success: false,
          message: "Invoice token is missing",
        });
      }

      const markingsRaw = await prisma.invoiceMarking.findMany({
        where: { invoiceId },
        orderBy: { sortOrder: 'asc' },
      });
      const markings = markingsRaw.map((m: any) => ({ label: m.label, value: m.value }));

      const emailContent = createAdminInvoiceEmailContent(
        result.clientName,
        invoiceNumber,
        result.invoice.token,
        markings
      );





      const htmlBody = createEmailTemplate(
        emailContent,
        `Invoice ${invoiceNumber}`
      );

      const emailSent = await sendEmail({
        to: result.clientEmail,
        subject: `Invoice ${invoiceNumber} from ${ENV.COMPANY_NAME}`,
        body: htmlBody,
        isHTML: true,
      });

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to send invoice email",
        });
      }

      if (issueId && issueId > 0) {
        await invoiceService.resolveInvoiceIssueOnResend(
          issueId,
          parseInt(userId, 10)
        );
      }

      return res.status(200).json({
        success: true,
        message: "Invoice sent successfully to client",
        data: {
          invoiceId,
          issueId: issueId ?? null,
          clientEmail: result.clientEmail,
          invoiceNumber,
        },
      });
    } catch (error: any) {
      console.error("Error sending invoice for issue", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to send invoice",
      });
    }
  }

  async createIssueForInvoice(req: any, res: Response) {
    try {
      let invoiceId: number;

      /* ===============================
         CASE 1: PUBLIC (TOKEN)
         =============================== */
      if (req.params.token) {
        const invoice = await prisma.invoices.findUnique({
          where: { token: req.params.token as string },
        });

        if (!invoice) {
          return res.status(404).json({
            success: false,
            message: "Invoice not found for this token",
          });
        }

        invoiceId = invoice.invoiceId;
      }

      /* ===============================
         CASE 2: AUTHENTICATED (ID)
         =============================== */
      else {
        invoiceId = Number(req.params.invoiceId);

        if (!invoiceId || invoiceId <= 0) {
          return res.status(400).json({
            success: false,
            message: "Valid invoice ID is required",
          });
        }
      }

      const { issueTitle, description } = req.body;

      if (!issueTitle || typeof issueTitle !== "string") {
        return res.status(400).json({
          success: false,
          message: "issueTitle is required",
        });
      }

      if (!description || typeof description !== "string") {
        return res.status(400).json({
          success: false,
          message: "description is required",
        });
      }

      const createdBy =
        req.admin?.id || req.partner?.id || req.employee?.id || null;

      const issue = await invoiceService.createissueForInvoice(
        invoiceId,
        issueTitle.trim(),
        description.trim(),
        createdBy ? Number(createdBy) : 0
      );

      // 🔔 Notify admin + assigned employees when client raises a query (non-blocking)
      if (!createdBy) {
        // Only notify when it's a public (client) submission — createdBy would be null
        prisma.invoices.findUnique({
          where: { invoiceId },
          include: { lead: { select: { leadId: true, firstName: true, lastName: true } } },
        }).then((inv) => {
          if (inv) {
            const leadName = inv.lead.firstName
              ? `${inv.lead.firstName} ${inv.lead.lastName ?? ""}`.trim()
              : undefined;
            notificationService.createInvoiceQueryNotification({
              invoiceId,
              leadId: inv.lead.leadId,
              leadName,
              issueTitle: issueTitle.trim(),
              description: description.trim(),
            }).catch((err) =>
              console.error("[Notification] Failed to notify on invoice query:", err)
            );
          }
        }).catch(() => { });
      }

      return res.status(201).json({
        success: true,
        message: "Invoice issue created successfully",
        data: issue,
      });
    } catch (error: any) {
      console.error("Error creating invoice issue:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create invoice issue",
      });
    }
  }

  async update(req: any, res: Response) {
    try {
      const userId = req.admin?.id || req.partner?.id || req.employee?.id;
      const invoiceId = Number(req.params.invoiceId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - User ID not found",
        });
      }

      if (!invoiceId || invoiceId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid invoice ID is required",
        });
      }

      const updatedInvoice = await invoiceService.updateInvoice(
        invoiceId,
        req.body,
        parseInt(userId, 10)
      );

      return res.status(200).json({
        success: true,
        message: "Invoice updated successfully",
        data: updatedInvoice,
      });
    } catch (error: any) {
      console.error("Error updating invoice", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update invoice",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const invoiceId = Number(req.params.invoiceId);
      if (!invoiceId || invoiceId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid invoice ID is required",
        });
      }

      const deletedInvoice = await invoiceService.deleteInvoice(invoiceId);

      return res.status(200).json({
        success: true,
        message: "Invoice deleted successfully",
        data: deletedInvoice,
      });
    } catch (error: any) {
      console.error("Error deleting invoice", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete invoice",
      });
    }
  }

  async downloadInvoiceReportExcel(req: Request, res: Response) {
    try {
      const { from, to } = req.query as { from?: string; to?: string };

      let dateFilter = {};
      if (from && to) {
        const startDate = new Date(from);
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);

        dateFilter = {
          billingDate: {
            gte: startDate,
            lte: endDate,
          },
        };
      }

      const invoices = await prisma.invoices.findMany({
        where: {
          status: "Approved",
          ...dateFilter,
        },
        include: {
          lead: true, // client
          invoiceItems: true,
        },
        orderBy: {
          billingDate: "desc",
        },
      });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Invoice Report");

      /* ================= TITLE ================= */
      sheet.mergeCells("A1:G1");
      sheet.getCell("A1").value = "RED ANGLE STUDIO";
      sheet.getCell("A1").font = { size: 16, bold: true };
      sheet.getCell("A1").alignment = { horizontal: "center" };

      sheet.mergeCells("A2:G2");
      sheet.getCell("A2").value = "APPROVED INVOICE REPORT";
      sheet.getCell("A2").font = { size: 12, bold: true };
      sheet.getCell("A2").alignment = { horizontal: "center" };

      sheet.mergeCells("A4:G4");
      sheet.getCell("A4").value = `Generated On: ${new Date().toLocaleString(
        "en-IN"
      )}`;

      /* ================= HEADER ================= */
      const headerRow = sheet.addRow([
        "Invoice No",
        "Client Name",
        "Client Email",
        "Contact Number",
        "Event Date",
        "Billing Date",
        "Status",
      ]);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF16A34A" },
        };
        cell.alignment = { horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      /* ================= DATA ================= */
      invoices.forEach((inv) => {
        const row = sheet.addRow([
          inv.invoiceId ? `INV${inv.invoiceId}` : (inv.billNo || "-"),
          `${inv.lead.firstName ?? ""} ${inv.lead.lastName ?? ""}`.trim() || "-",
          inv.lead.email ?? "-",
          inv.lead.contactNumber ?? "-",
          inv.lead.eventDate
            ? new Date(inv.lead.eventDate).toLocaleDateString("en-IN")
            : "-",
          inv.billingDate
            ? new Date(inv.billingDate).toLocaleDateString("en-IN")
            : "-",
          inv.status,
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

      /* ================= COLUMN WIDTH ================= */
      sheet.columns = [
        { width: 18 },
        { width: 22 },
        { width: 30 },
        { width: 18 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
      ];

      /* ================= DOWNLOAD ================= */
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=approved-invoice-report.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      console.error("Invoice Excel download error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  async upsertInvoiceAdditional(req: Request, res: Response) {
    try {
      const invoiceId = Number(req.params.invoiceId);

      const result = await invoiceService.upsertInvoiceAdditional(
        invoiceId,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Invoice additional details saved successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /* ===============================
     GET INVOICE ADDITIONAL
     =============================== */
  async getInvoiceAdditional(req: Request, res: Response) {
    try {
      const invoiceId = Number(req.params.invoiceId);

      const result = await invoiceService.getInvoiceAdditional(invoiceId);

      return res.status(200).json({
        success: true,
        data: result, // can be null
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllAddons(req: Request, res: Response) {
    try {
      const addons = await prisma.addonService.findMany({
        orderBy: { name: "asc" }
      });

      return res.status(200).json({
        success: true,
        message: "Addons retrieved successfully",
        data: addons,
      });
    } catch (error: any) {
      console.error("Error fetching addons", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve addons",
      });
    }
  }

  async addAddon(req: Request, res: Response) {
    try {
      const invoiceId = Number(req.params.invoiceId);
      const { addonServiceId, quantity, price, category } = req.body;
      if (!invoiceId || !addonServiceId || quantity === undefined || price === undefined) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
      const result = await invoiceService.addInvoiceAddon(invoiceId, addonServiceId, quantity, price, category);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      console.error("Error adding addon to invoice", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }



  async updatePreview(req: Request, res: Response) {
    try {
      const invoiceId = Number(req.params.invoiceId);
      const { discount, paid, events, qtyOverrides, isSendToClient, previewItems, billNo } = req.body;

      const updated = await prisma.invoices.update({
        where: { invoiceId },
        data: {
          discount: discount ?? 0,
          paid: paid ?? 0,
          previewEvents: events ?? [],
          qtyOverrides: qtyOverrides ?? {},
          billNo: billNo !== undefined ? billNo : undefined,
          previewItems: previewItems !== undefined ? previewItems : undefined,
        },
      });

      if (previewItems !== undefined) {
        // Ensure raw JSONB is also updated if needed
        try {
          await prisma.$executeRaw`UPDATE invoices SET "previewItems" = ${JSON.stringify(previewItems)}::jsonb WHERE invoice_id = ${invoiceId}`;
        } catch {}
      }

      if (isSendToClient) {
        // Resolve any open issues
        await prisma.invoiceIssues.updateMany({
          where: { invoiceId, status: "Open" },
          data: { status: "Resolved" },
        });

        // Determine if invoice is fully paid
        const currentPayments = await prisma.payments.findMany({
          where: { invoiceId, status: "VERIFIED" },
        });
        const currentTotalPaid = currentPayments.reduce((sum, p) => sum + Number(p.paid), 0);
        const currentTotal = Number(updated.totalAmount || 0);
        const currentDiscount = Number(updated.discount || 0);
        const currentOverall = Math.max(0, currentTotal - currentDiscount);
        const isFullyPaid = currentOverall > 0 && currentTotalPaid >= currentOverall;

        // Update invoice status to Sent or Paid
        await prisma.invoices.update({
          where: { invoiceId },
          data: {
            status: isFullyPaid ? "Paid" : "Sent",
            sendAt: new Date(),
          },
        });
      }

      console.log("UPDATED OBJECT:", updated);
      console.log("Updating invoiceId:", invoiceId);

      return res.json({
        success: true,
        message: isSendToClient ? "Invoice sent to client page successfully" : "Preview updated successfully",
        data: updated,
      });

    } catch (error) {
      console.error("Update preview error:", error);
      return res.status(500).json({ success: false });
    }
  }

  /* ===============================
     SAVE INVOICE MARKINGS
     =============================== */
  async saveMarkings(req: Request, res: Response) {
    try {
      const invoiceId = Number(req.params.invoiceId);
      if (!invoiceId || invoiceId <= 0) {
        return res.status(400).json({ success: false, message: "Valid invoice ID is required" });
      }

      const { markings } = req.body;
      if (!Array.isArray(markings)) {
        return res.status(400).json({ success: false, message: "markings must be an array" });
      }

      // Atomic: delete old rows + insert new set
      await prisma.$transaction([
        prisma.invoiceMarking.deleteMany({ where: { invoiceId } }),
        prisma.invoiceMarking.createMany({
          data: markings.map((m: any, idx: number) => ({
            invoiceId,
            label: String(m.label ?? ""),
            value: String(m.value ?? ""),
            sortOrder: m.sortOrder ?? idx,
          })),
        }),
      ]);

      const saved = await prisma.invoiceMarking.findMany({
        where: { invoiceId },
        orderBy: { sortOrder: "asc" },
      });

      return res.status(200).json({
        success: true,
        message: "Markings saved successfully",
        data: saved,
      });
    } catch (error: any) {
      console.error("Error saving markings:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /* ===============================
     GET INVOICE MARKINGS
     =============================== */
  async getMarkings(req: Request, res: Response) {
    try {
      const invoiceId = Number(req.params.invoiceId);
      if (!invoiceId || invoiceId <= 0) {
        return res.status(400).json({ success: false, message: "Valid invoice ID is required" });
      }

      const markings = await prisma.invoiceMarking.findMany({
        where: { invoiceId },
        orderBy: { sortOrder: "asc" },
      });

      return res.status(200).json({
        success: true,
        data: markings,
      });
    } catch (error: any) {
      console.error("Error fetching markings:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

}




export default new InvoiceController();