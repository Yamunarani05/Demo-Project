import { LeadStage } from "@prisma/client";
import prisma from "../config/prisma";
import { PaymentStatus } from "@prisma/client";
import { notificationService } from "./notificationService";
import { buildInvoiceViewModel } from "../util/buildInvoiceViewModel";

interface packageInvoiceData {
  packageId: number;
  status: string;
  unit: number;
}

interface CreateInvoicePayload {
  leadId: number;
  billingDate: Date | string;
  plan: string;
  status?: string;
  packages: packageInvoiceData[];
  [key: string]: any;
}

interface UpdateInvoicePayload {
  [key: string]: any;
}
const WORKFLOW_STATUSES = ["Pending", "Sent", "Approved", "Rejected", "Cancelled"] as const;

type WorkflowStatus = typeof WORKFLOW_STATUSES[number];

function normalizeInvoiceStatus(status: string | null | undefined): WorkflowStatus {
  if (!status) return "Pending";

  // wrong values saved in DB
  if (status === "Partial" || status === "Paid") return "Approved";

  // unknown strings
  if (!WORKFLOW_STATUSES.includes(status as WorkflowStatus)) return "Pending";

  return status as WorkflowStatus;
}


class InvoiceService {
  // Create a new invoice
  async createInvoice(data: CreateInvoicePayload, userId: number) {
    console.log("CREATE INVOICE API HIT");

    try {
      if (!data || Object.keys(data).length === 0) {
        throw new Error("Invoice data is required");
      }

      if (!userId || userId <= 0) {
        throw new Error("Valid user ID is required");
      }

      if (!data.leadId || data.leadId <= 0) {
        throw new Error("Valid lead ID is required");
      }

      if (!data.billingDate) {
        throw new Error("Billing date is required");
      }

      if (!data.plan || typeof data.plan !== "string") {
        throw new Error("Plan is required and must be a string");
      }

      const result = await prisma.$transaction(async (tx) => {
        const ql = await tx.quotationLead.findFirst({
          where: { leadId: data.leadId },
          orderBy: { createdAt: "desc" },
        });

        const lead = await tx.leadsDetail.findUnique({
          where: { leadId: data.leadId }
        });

        const existingInvoicesCount = await tx.invoices.count({
          where: { leadId: data.leadId }
        });

        const invoice = await tx.invoices.create({
          data: {
            leadId: data.leadId,
            billNo: data.billNo || undefined,
            billingDate: new Date(data.billingDate),
            plan: data.plan || "Standard",
            status: data.status || "Pending",
            createdBy: userId,
            discount: ql?.discount ? Number(ql.discount) : Number(lead?.discount || 0),
            totalAmount: Number(lead?.budget || 0),
            paid: Number(lead?.paidAmount || 0),
          },
          include: {
            lead: true,
            createdByUser: true,
          },
        });

        if (!data.billNo) {
          const generatedBillNo = `INV${invoice.invoiceId}`;
          await tx.invoices.update({
            where: { invoiceId: invoice.invoiceId },
            data: { billNo: generatedBillNo },
          });
          invoice.billNo = generatedBillNo;
        }

        // 1️⃣ Fetch addons from LeadAddon
        const leadAddons = await tx.leadAddon.findMany({
          where: { leadId: data.leadId }
        });

        console.log("LEAD ADDONS FOUND:", leadAddons);

        // 2️⃣ Copy them to InvoiceAddon
        if (leadAddons.length > 0) {
          console.log("Copying addons:", leadAddons);
          await tx.invoiceAddon.createMany({
            data: leadAddons.map(a => ({
              invoiceId: invoice.invoiceId,
              addonServiceId: a.addonServiceId,
              quantity: a.quantity,
              price: a.price,
              total: a.total
            }))
          });

          // 3️⃣ Remove from LeadAddon to avoid duplication
          await tx.leadAddon.deleteMany({
            where: { leadId: data.leadId }
          });
        }

        const packageInvoiceData = data.packages || [];
        let packageInvoiceItems: any = [];

        // 🔹 Addons (from payload) — look up price from addonService
        const addonsData = data.addons || [];
        if (addonsData.length > 0) {
          const addonServiceIds = addonsData.map((a: any) => a.addonServiceId);
          const addonServices = await tx.addonService.findMany({
            where: { id: { in: addonServiceIds } },
            select: { id: true, price: true },
          });
          const priceMap: Record<number, number> = {};
          addonServices.forEach((s: any) => { priceMap[s.id] = Number(s.price ?? 0); });

          await tx.invoiceAddon.createMany({
            data: addonsData.map((a: any) => {
              const unitPrice = priceMap[a.addonServiceId] ?? 0;
              return {
                invoiceId: invoice.invoiceId,
                addonServiceId: a.addonServiceId,
                quantity: a.quantity,
                price: unitPrice,
                total: unitPrice * a.quantity,
              };
            }),
          });
        }

        // 🔹 Invoice Items
        const itemsData = data.items || [];
        if (itemsData.length > 0) {
          await tx.invoiceItem.createMany({
            data: itemsData.map((item: any) => ({
              invoiceId: invoice.invoiceId,
              name: item.name,
              category: item.category ?? "SERVICE",
              quantity: item.quantity,
              price: item.price ?? 0,
            })),
          });
        }

        if (packageInvoiceData.length > 0) {
          const createResult = await tx.packageInvoice.createMany({
            data: packageInvoiceData.map((pac: packageInvoiceData) => ({
              invoiceId: invoice.invoiceId,
              packageId: pac.packageId,
              status: pac.status,
              unit: pac.unit,
            })),
          });
          packageInvoiceItems = createResult.count;
        }

        return {
          invoice,
          packagesCreated: packageInvoiceItems,
        };
      });

      return result;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  }

  // Retrieve all invoices with pagination and search
  async getAllInvoices(
    page: number,
    limit: number,
    skip: number,
    search: string = ""
  ) {
    try {
      const whereCondition: any = {
        AND: [
          {
            OR: [
              { currentStage: { in: ["Lead", "Confirmation", "Finalised", "callUp"] } },
              { invoices: { some: {} } }
            ]
          }
        ]
      };

      if (search) {
        whereCondition.AND.push({
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { contactNumber: { contains: search, mode: "insensitive" } },
          ]
        });
      }

      const invoices = await prisma.leadsDetail.findMany({
        where: whereCondition,
        select: {
          leadId: true,
          firstName: true,
          lastName: true,
          contactNumber: true,
          leadSource: true,
          eventType: true,
          leadSerialNumber: true,
          leadType: true,
          leadEmployee: {
            select: {
              leadEmployeeId: true,
              taskName: true,
              employee: {
                select: {
                  employeeId: true,
                  firstName: true,
                  lastName: true,
                  contactNumber: true,
                },
              },
            },
          },
          invoices: {
            select: {
              status: true,
              plan: true,
              billingDate: true,
              invoiceId: true,
              billNo: true,
              totalAmount: true,
              paid: true,
              discount: true,
              issues: {
                select: {
                  issueId: true,
                  issueTitle: true,
                },
              },
            },
          },
        },
        orderBy: { leadId: "desc" },
        skip,
        take: limit,
      });

      const total = await prisma.leadsDetail.count({
        where: whereCondition,
      });

      return {
        data: invoices,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching all invoices:", error);
      throw error;
    }
  }

  // Get all packages
  async getAllPackages() {
    const packages = await prisma.packageServices.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        packageTitle: true,
        packageType: true,
        price: true,
        imageUrl: true,
      },
    });
    return packages;
  }


  // Invoice approval via public token
  async InvoiceApproved(token: string, status: string = "pending") {
    try {
      if (!token) {
        throw new Error("Valid invoice token is required");
      }

      if (!status || typeof status !== "string") {
        throw new Error("Valid status string is required");
      }

      const invoiceExists = await prisma.invoices.findUnique({
        where: { token },
        include: {
          lead: true,
        },
      });

      if (!invoiceExists) {
        throw new Error(`Invoice record with token ${token} not found`);
      }

      await prisma.leadsDetail.update({
        where: { leadId: invoiceExists.leadId },
        data: {
          // currentStage:
          //   status === "approved" ? LeadStage.Finalised : LeadStage.Confirmation,
          currentStage: LeadStage.Confirmation,
          status:
            status === "approved"
              ? "invoiceapproved"
              : status === "rejected"
                ? "invoicerejected"
                : "quotationapproved",
        },
      });

      const updatedinvoice = await prisma.invoices.update({
        where: { invoiceId: invoiceExists.invoiceId },
        data: {
          status: status === "approved" ? "Approved" : "Rejected",
        },
      });

      // 🔔 Notify all admins + assigned employees (non-blocking)
      notificationService
        .createInvoiceResponseNotification({
          invoiceId: invoiceExists.invoiceId,
          leadId: invoiceExists.leadId,
          leadName: invoiceExists.lead?.firstName
            ? `${invoiceExists.lead.firstName} ${invoiceExists.lead.lastName ?? ""}`.trim()
            : undefined,
          status: status === "approved" ? "approved" : "rejected",
        })
        .catch((err) =>
          console.error("[Notification] Failed to notify on invoice response:", err)
        );


      return updatedinvoice;
    } catch (error) {
      console.error(`Error updating invoice with token ${token}:`, error);
      throw error;
    }
  }

  // Send invoice to client and compute totals
  async sendInvoiceToClient(invoiceId: number) {
    console.log("sendInvoiceToClient called with invoiceId:", invoiceId);
    console.log("API HIT: sendInvoiceToClient", invoiceId);


    try {
      if (!invoiceId) throw new Error("Invoice ID required");

      await prisma.invoices.update({
        where: { invoiceId },
        data: { status: "Sent", sendAt: new Date() }
      });

      const invoice = await prisma.invoices.findUnique({
        where: { invoiceId },
        include: {
          lead: true,
          packageInvoices: {
            include: {
              package: { include: { items: true } }
            }
          },
          invoiceItems: true,
          addons: {
            include: { addonService: true }
          }


        }
      });


      if (!invoice) throw new Error("Invoice not found");
      if (!invoice.lead?.email) throw new Error("Client email missing");

      const itemsByCategory: Record<string, any[]> = buildInvoiceViewModel(invoice);


      const packageTotal = invoice.packageInvoices.reduce(
        (acc: number, pi: any) => acc + Number(pi.unit) * Number(pi.package.price),
        0
      );

      const addonTotal = invoice.addons.reduce(
        (acc: number, addon: any) => acc + Number(addon.total || 0),
        0
      );



      const previewEvents = invoice.previewEvents ?? [];
      const discount = Number(invoice.discount ?? 0);

      const itemsTotal = invoice.invoiceItems.reduce(
        (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );

      const totalPrice = packageTotal + addonTotal + itemsTotal;

      const snapshot = {
        ...invoice,
        previewEvents,
        itemsByCategory,
        packageTotal,
        addonTotal,
        itemsTotal,
        discount,
        totalPrice
      };






      await prisma.invoices.update({
        where: { invoiceId },
        data: {
          invoiceSnapshot: snapshot
        }
      });

      console.log("itemsByCategory built:", itemsByCategory);




      return {
        invoice,
        clientEmail: invoice.lead.email,
        clientName: `${invoice.lead.firstName} ${invoice.lead.lastName}`,
        itemsByCategory,
        packageTotal,
        addonTotal,
        itemsTotal,
        totalPrice
      };

    } catch (error) {
      console.error("Error sending invoice:", error);
      throw error;
    }
  }







  async getInvoiceById(invoiceId: number) {
    try {
      console.log("Fetching invoiceId:", invoiceId);
      const invoice = await prisma.invoices.findUnique({
        where: { invoiceId },
        include: {
          lead: {
            include: {
              leadEmployee: {
                select: {
                  leadEmployeeId: true,
                  taskName: true,
                  deadline: true,
                }
              },
              invoices: {
                select: {
                  invoiceId: true,
                },
                orderBy: {
                  invoiceId: "asc",
                }
              }
            }
          },
          packageInvoices: {
            include: {
              package: {
                include: { items: true }
              }
            }
          },
          invoiceItems: true,
          addons: {
            include: { addonService: true }
          },
          payments: true,
        }
      });

      if (!invoice) throw new Error("Invoice not found");

      const packageTotal = invoice.packageInvoices.reduce(
        (acc, pi) => acc + Number(pi.unit) * Number(pi.package.price),
        0
      );

      const addonTotal = invoice.addons.reduce(
        (acc, addon) => acc + Number(addon.total || 0),
        0
      );

      const discount = Number(invoice.discount ?? invoice.lead?.discount ?? 0);

      const itemsTotal = invoice.invoiceItems.reduce(
        (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );

      const itemsSum = packageTotal + addonTotal + itemsTotal;
      const totalPrice = Number(invoice.totalAmount || 0) > 0
        ? Number(invoice.totalAmount)
        : itemsSum > 0
          ? itemsSum
          : Number(invoice.lead?.budget || 0);

      const verifiedPayments = (invoice.payments || []).filter(
        (p: any) => p.status === "VERIFIED" || !p.status
      );
      const rawPaid = Number(invoice.paid || 0);
      const leadPaid = Number(invoice.lead?.paidAmount || 0);
      const advancePaid = rawPaid > 0 ? rawPaid : (verifiedPayments.length > 0 ? Number(verifiedPayments[0].paid || 0) : leadPaid);
      const totalPaid = verifiedPayments.length > 0
        ? verifiedPayments.reduce((sum: number, p: any) => sum + Number(p.paid || p.amount || 0), 0)
        : (rawPaid > 0 ? rawPaid : leadPaid);
      const balance = Math.max(0, (totalPrice - discount) - totalPaid);

      let previewEvents = (invoice.previewEvents as any[]) || [];
      if (!previewEvents || previewEvents.length === 0) {
        const lead = invoice.lead;
        const formattedEventDate = lead?.eventDate
          ? new Date(lead.eventDate).toLocaleDateString("en-IN")
          : "";
        const formattedWeddingDate = lead?.weddingDate
          ? new Date(lead.weddingDate).toLocaleDateString("en-IN")
          : "";
        const formattedReceptionDate = lead?.receptionDate
          ? new Date(lead.receptionDate).toLocaleDateString("en-IN")
          : "";

        const allLeadInvoices = lead?.invoices || [];
        const invIdx = allLeadInvoices.findIndex((x: any) => x.invoiceId === invoice.invoiceId);
        const leadTasks = lead?.leadEmployee || [];
        const taskForInvoice = (invIdx >= 0 && invIdx < leadTasks.length) ? leadTasks[invIdx] : leadTasks[0];
        const pkgTitle = invoice.packageInvoices?.[0]?.package?.packageTitle;

        const resolvedEventName =
          taskForInvoice?.taskName ||
          pkgTitle ||
          (invoice.plan && invoice.plan !== "Standard" ? invoice.plan : "") ||
          lead?.eventType ||
          "";

        previewEvents = [
          { title: "EVENT NAME", value: resolvedEventName },
          { title: "ENGAGEMENT", value: "" },
          { title: "WEDDING", value: formattedWeddingDate || formattedEventDate },
          { title: "RECEPTION", value: formattedReceptionDate || "" },
          { title: "RITUALS", value: "" },
          { title: "LOCATION", value: lead?.address || "" },
        ];
      }

      const itemsByCategory: Record<string, any[]> = buildInvoiceViewModel(invoice);

      return {
        ...invoice,
        discount,
        paid: advancePaid,
        advancePaid,
        totalPaid,
        packageTotal,
        addonTotal,
        itemsTotal,
        totalAmount: totalPrice,
        balance,
        previewEvents,
        itemsByCategory
      };

    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }
  }

  async getInvoiceByToken(token: string) {
    try {
      if (!token) {
        throw new Error("Valid invoice token is required");
      }

      const invoice = await prisma.invoices.findUnique({
        where: { token },
        include: {
          lead: true,
          packageInvoices: {
            include: {
              package: { include: { items: true } }
            }
          },
          invoiceItems: true,
          addons: {
            include: { addonService: true }
          },
          payments: true,
        }
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      const itemsByCategory: Record<string, any[]> = buildInvoiceViewModel(invoice);

      const packageTotal = invoice.packageInvoices.reduce(
        (acc, pi) => acc + Number(pi.unit) * Number(pi.package.price),
        0
      );

      const addonTotal = invoice.addons.reduce(
        (acc, addon) => acc + Number(addon.total || 0),
        0
      );

      const itemsTotal = invoice.invoiceItems.reduce(
        (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );

      const itemsSum = packageTotal + addonTotal + itemsTotal;
      const totalPrice = Number(invoice.totalAmount || 0) > 0
        ? Number(invoice.totalAmount)
        : itemsSum > 0
          ? itemsSum
          : Number(invoice.lead?.budget || 0);

      const discount = Number(invoice.discount ?? invoice.lead?.discount ?? 0);

      const verifiedPayments = (invoice.payments || []).filter(
        (p: any) => p.status === "VERIFIED" || !p.status
      );
      const rawPaid = Number(invoice.paid || 0);
      const leadPaid = Number(invoice.lead?.paidAmount || 0);
      const advancePaid = rawPaid > 0 ? rawPaid : (verifiedPayments.length > 0 ? Number(verifiedPayments[0].paid || 0) : leadPaid);
      const totalPaid = verifiedPayments.length > 0
        ? verifiedPayments.reduce((sum: number, p: any) => sum + Number(p.paid || p.amount || 0), 0)
        : (rawPaid > 0 ? rawPaid : leadPaid);
      const balance = Math.max(0, (totalPrice - discount) - totalPaid);

      let previewEvents = (invoice.previewEvents as any[]) || [];
      if (!previewEvents || previewEvents.length === 0) {
        const lead = invoice.lead;
        const formattedEventDate = lead?.eventDate
          ? new Date(lead.eventDate).toLocaleDateString("en-IN")
          : "";
        const formattedWeddingDate = lead?.weddingDate
          ? new Date(lead.weddingDate).toLocaleDateString("en-IN")
          : "";
        const formattedReceptionDate = lead?.receptionDate
          ? new Date(lead.receptionDate).toLocaleDateString("en-IN")
          : "";

        previewEvents = [
          { title: "EVENT NAME", value: lead?.eventType || "" },
          { title: "ENGAGEMENT", value: "" },
          { title: "WEDDING", value: formattedWeddingDate || formattedEventDate },
          { title: "RECEPTION", value: formattedReceptionDate || "" },
          { title: "RITUALS", value: "" },
          { title: "LOCATION", value: lead?.address || "" },
        ];
      }

      let parsedQtyOverrides: Record<string, number> = {};
      if (invoice.qtyOverrides) {
        try {
          parsedQtyOverrides = typeof invoice.qtyOverrides === 'string'
            ? JSON.parse(invoice.qtyOverrides)
            : invoice.qtyOverrides;
        } catch { parsedQtyOverrides = {}; }
      }

      const snapshotData = {
        ...invoice,
        previewEvents,
        itemsByCategory,
        qtyOverrides: parsedQtyOverrides,
        packageTotal,
        addonTotal,
        itemsTotal,
        discount,
        paid: advancePaid,
        advancePaid,
        totalPaid,
        totalPrice,
        totalAmount: totalPrice,
        balance
      };

      return snapshotData;

    } catch (error) {
      console.error("Error fetching invoice by token:", error);
      throw error;
    }
  }



  // Get all invoice issues with pagination and search
  async getAllIssues(
    page: number,
    limit: number,
    skip: number,
    search: string = ""
  ) {
    try {
      const whereCondition: any = {};

      if (search) {
        whereCondition.OR = [
          { issueTitle: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const invoicesIssue = await prisma.invoiceIssues.findMany({
        where: whereCondition,
        select: {
          issueId: true,
          issueTitle: true,
          description: true,
          status: true,
          invoice: {
            select: {
              lead: {
                select: {
                  firstName: true,
                  lastName: true,
                  contactNumber: true,
                  email: true,
                  eventType: true,
                  description: true,
                  address: true,
                },
              },
              invoiceId: true,
              billingDate: true,
              plan: true,
            },
          },
        },
        orderBy: { issueId: "desc" },
        skip,
        take: limit,
      });

      const total = await prisma.invoiceIssues.count({
        where: whereCondition,
      });

      const pending = await prisma.invoiceIssues.count({
        where: { status: "Open" },
      });
      const replied = await prisma.invoiceIssues.count({
        where: { status: "Replied" },
      });

      return {
        data: invoicesIssue,
        pending,
        replied,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching invoices by lead ID:", error);
      throw error;
    }
  }

  // CREATE ISSUE FOR INVOICE (public, from client link)
  async createissueForInvoice(
    invoiceId: number,
    issueTitle: string,
    description: string,
    userId: number
  ) {
    try {
      if (!invoiceId || invoiceId <= 0) {
        throw new Error("Valid invoice ID is required");
      }

      const invoice = await prisma.invoices.findUnique({
        where: { invoiceId },
        include: {
          lead: true,
        },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      const invoicesIssue = await prisma.invoiceIssues.create({
        data: {
          invoiceId,
          issueTitle,
          description,
          createdBy: userId ? parseInt(userId + "") : null,
        },
      });

      const clientName = `${invoice.lead.firstName ?? ""} ${invoice.lead.lastName ?? ""
        }`.trim();

      if (invoice.createdBy) {
        await notificationService.createUserNotification({
          userId: invoice.createdBy,
          issueType: "InvoiceIssue",
          invoiceIssueId: invoicesIssue.issueId,
          title: issueTitle,
          message: `Client ${clientName} raised an issue: ${description}`.trim(),
        });
      }



      return invoicesIssue;
    } catch (error) {
      console.error("Error fetching invoices by lead ID:", error);
      throw error;
    }
  }

  // Get issue by ID
  async getIssueById(issueId: number) {
    try {
      if (!issueId || issueId <= 0) {
        throw new Error("Valid issue ID is required");
      }

      const issue = await prisma.invoiceIssues.findUnique({
        where: { issueId },
        select: {
          issueId: true,
          issueTitle: true,
          description: true,
          status: true,
          createdAt: true,
          createdByUser: true,
          invoice: {
            select: {
              invoiceId: true,
              billingDate: true,
              plan: true,
              status: true,
              lead: {
                select: {
                  leadId: true,
                  firstName: true,
                  lastName: true,
                  contactNumber: true,
                  email: true,
                  eventType: true,
                  description: true,
                  address: true,
                },
              },
            },
          },
        },
      });

      if (!issue) {
        throw new Error("Issue not found");
      }

      return issue;
    } catch (error) {
      console.error("Error fetching issue by ID:", error);
      throw error;
    }
  }

  // Get invoices by lead ID
  async getInvoicesByLeadId(leadId: number) {
    try {
      if (!leadId || leadId <= 0) {
        throw new Error("Valid lead ID is required");
      }

      const invoices = await prisma.invoices.findMany({
        where: { leadId },
        orderBy: { invoiceId: "desc" },
        include: {
          lead: true,
          createdByUser: true,
          updatedByUser: true,
          issues: true,
        },
      });

      return invoices;
    } catch (error) {
      console.error("Error fetching invoices by lead ID:", error);
      throw error;
    }
  }

  // Update invoice
  async updateInvoice(
    invoiceId: number,
    data: UpdateInvoicePayload,
    userId: number
  ) {
    try {
      if (!invoiceId || invoiceId <= 0) {
        throw new Error("Valid invoice ID is required");
      }

      if (!userId || userId <= 0) {
        throw new Error("Valid user ID is required");
      }

      const { packages = [], addons = [], items = [], ...invoiceData } = data || {};

      const updatedInvoice = await prisma.$transaction(async (tx) => {

        const existingInvoice = await tx.invoices.findUnique({
          where: { invoiceId },
        });

        if (!existingInvoice) {
          throw new Error("Invoice not found");
        }

        const updateData: any = {
          ...invoiceData,
          updatedBy: userId,
          updatedAt: new Date(),
        };

        if (invoiceData.billingDate) {
          updateData.billingDate = new Date(invoiceData.billingDate);
        }

        await tx.invoices.update({
          where: { invoiceId },
          data: updateData,
        });

        // 🔹 Packages
        await tx.packageInvoice.deleteMany({
          where: { invoiceId }
        });

        if (packages.length > 0) {
          await tx.packageInvoice.createMany({
            data: packages.map((p: any) => ({
              invoiceId,
              packageId: p.packageId,
              status: p.status,
              unit: p.unit,
            })),
          });
        }

        // 🔹 Addons — look up price from addonService
        await tx.invoiceAddon.deleteMany({
          where: { invoiceId }
        });

        if (addons.length > 0) {
          const addonServiceIds = addons.map((a: any) => a.addonServiceId);
          const addonServices = await tx.addonService.findMany({
            where: { id: { in: addonServiceIds } },
            select: { id: true, price: true },
          });
          const priceMap: Record<number, number> = {};
          addonServices.forEach((s: any) => { priceMap[s.id] = Number(s.price ?? 0); });

          await tx.invoiceAddon.createMany({
            data: addons.map((a: any) => {
              const unitPrice = priceMap[a.addonServiceId] ?? 0;
              return {
                invoiceId,
                addonServiceId: a.addonServiceId,
                quantity: a.quantity,
                price: unitPrice,
                total: unitPrice * a.quantity,
              };
            }),
          });
        }


        // 🔹 Invoice Items (THIS WAS MISSING)
        await tx.invoiceItem.deleteMany({
          where: { invoiceId }
        });

        if (items.length > 0) {
          await tx.invoiceItem.createMany({
            data: items.map((item: any) => ({
              invoiceId,
              name: item.name,
              quantity: item.quantity,
              category: item.category ?? null,
            })),
          });
        }

        // 🔹 Return fresh invoice
        return tx.invoices.findUnique({
          where: { invoiceId },
          include: {
            lead: true,
            createdByUser: true,
            updatedByUser: true,
            packageInvoices: {
              include: { package: true }
            },
            invoiceItems: true,
          },
        });
      });

      return updatedInvoice;

    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  }


  // 6️⃣ Update invoice items (services, deliverables, complimentary)




  // Update invoice status
  async updateInvoiceStatus(invoiceId: number, status: string, userId: number) {
    try {
      if (!invoiceId || invoiceId <= 0) {
        throw new Error("Valid invoice ID is required");
      }

      if (!status || typeof status !== "string") {
        throw new Error("Valid status is required");
      }

      if (!userId || userId <= 0) {
        throw new Error("Valid user ID is required");
      }

      const validStatuses = ["Pending", "Sent", "Approved", "Rejected", "Cancelled"];

      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status. Allowed values: ${validStatuses.join(", ")}`
        );
      }

      const updatedInvoice = await prisma.invoices.update({
        where: { invoiceId },
        data: {
          status,
          updatedBy: userId,
          updatedAt: new Date(),
        },
        include: {
          lead: true,
          createdByUser: true,
          updatedByUser: true,
        },
      });

      return updatedInvoice;
    } catch (error) {
      console.error("Error updating invoice status:", error);
      throw error;
    }
  }



  // Delete invoice
  async deleteInvoice(invoiceId: number) {
    try {
      if (!invoiceId || invoiceId <= 0) {
        throw new Error("Valid invoice ID is required");
      }

      const deletedInvoice = await prisma.invoices.delete({
        where: { invoiceId },
        include: {
          lead: true,
        },
      });

      return deletedInvoice;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  }




  // Statistics
  async getInvoiceStatistics() {
    try {
      const totalInvoices = await prisma.invoices.count();
      const pendingInvoices = await prisma.invoices.count({
        where: { status: "Pending" },
      });
      const paidInvoices = await prisma.invoices.count({
        where: { status: "Paid" },
      });

      return {
        total: totalInvoices,
        pending: pendingInvoices,
        paid: paidInvoices,
      };
    } catch (error) {
      console.error("Error fetching invoice statistics:", error);
      throw error;
    }
  }

  // Admin invoice report
  async getAdminInvoiceReport() {
    const invoices = await prisma.invoices.findMany({
      select: {
        invoiceId: true,
        billingDate: true,
        status: true,
        lead: {
          select: {
            leadId: true,
            firstName: true,
            lastName: true,
            contactNumber: true,
            leadEmployee: {
              select: {
                employee: {
                  select: {
                    employeeId: true,
                    firstName: true,
                  },
                },
              },
            },
            events: {
              select: {
                payments: {
                  select: {
                    paymentId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalInvoices = invoices.length;
    let completedInvoices = 0;
    let pendingInvoices = 0;

    const report = invoices.map((inv) => {
      const hasPayment =
        inv.lead?.events?.some((e) => e.payments.length > 0) ?? false;
      if (hasPayment) completedInvoices++;
      else pendingInvoices++;

      return {
        leadId: inv.lead?.leadId ?? null,
        leadName: `${inv.lead?.firstName ?? ""} ${inv.lead?.lastName ?? ""
          }`.trim(),
        contact: inv.lead?.contactNumber ?? null,
        invoiceId: inv.invoiceId,
        billingDate: inv.billingDate,
        employeeAssigned:
          inv.lead?.leadEmployee?.length > 0
            ? inv.lead.leadEmployee.map((le) => ({
              employeeId: le.employee?.employeeId ?? null,
              employeeName: le.employee?.firstName ?? "Unknown",
            }))
            : [{ employeeId: null, employeeName: "Not Assigned" }],
        status: inv.status,
      };
    });

    return {
      totalInvoices,
      completedInvoices,
      pendingInvoices,
      invoices: report,
    };
  }

  // NEW: resolve an invoice issue when admin edits & resends
  async resolveInvoiceIssueOnResend(issueId: number, userId: number) {
    try {
      if (!issueId || issueId <= 0) {
        throw new Error("Valid issue ID is required");
      }
      if (!userId || userId <= 0) {
        throw new Error("Valid user ID is required");
      }

      await prisma.invoiceIssues.update({
        where: { issueId },
        data: {
          status: "Replied",
        },
      });

      await prisma.notification.deleteMany({
        where: { invoiceIssueId: issueId },
      });

      return { success: true };
    } catch (error) {
      console.error("Error resolving invoice issue on resend:", error);
      throw error;
    }
  }
  async upsertInvoiceAdditional(
    invoiceId: number,
    data: {
      events?: any[];
      discount?: number;
    }
  ) {
    try {

      // ✅ Extract properly from data
      const events = data.events ?? [];
      const discountValue = data.discount ?? 0;

      // ✅ Upsert correctly
      const additional = await prisma.invoiceAdditional.upsert({
        where: { invoiceId },
        update: {
          events,
          discount: discountValue,
        },
        create: {
          invoiceId,
          events,
          discount: discountValue,
        },
      });

      /* =============================
         RECALCULATE TOTAL
      ============================= */

      const invoice = await prisma.invoices.findUnique({
        where: { invoiceId },
        include: {
          packageInvoices: { include: { package: true } },
          addons: true,
        },
      });

      if (!invoice) throw new Error("Invoice not found");

      const packageTotal = invoice.packageInvoices.reduce(
        (acc, pi) => acc + Number(pi.unit) * Number(pi.package.price),
        0
      );

      const addonTotal = invoice.addons.reduce(
        (acc, addon) => acc + Number(addon.total || 0),
        0
      );

      const totalAmount = packageTotal + addonTotal - discountValue;

      await prisma.invoices.update({
        where: { invoiceId },
        data: {
          totalAmount,
          discount: discountValue,
        },
      });

      return {
        additional,
        totalAmount,
        packageTotal,
        addonTotal,
        discount: discountValue,
      };

    } catch (error) {
      console.error("Error upserting invoice additional:", error);
      throw error;
    }
  }



  async getInvoiceAdditional(invoiceId: number) {
    try {
      if (!invoiceId || invoiceId <= 0) {
        throw new Error("Valid invoice ID is required");
      }

      const additional = await prisma.invoiceAdditional.findUnique({
        where: { invoiceId }, // ✅ valid because invoiceId is UNIQUE
      });

      return additional; // can be null
    } catch (error) {
      console.error("Error fetching invoice additional:", error);
      throw error;
    }
  }

  async addInvoiceAddon(invoiceId: number, addonServiceId: number, quantity: number, price: number, category?: string) {
    try {
      const existingInvoice = await prisma.invoices.findUnique({
        where: { invoiceId },
      });
      if (!existingInvoice) throw new Error("Invoice not found");

      const newAddon = await prisma.invoiceAddon.create({
        data: {
          invoiceId,
          addonServiceId,
          quantity,
          price: price,
          total: quantity * price,
          category,
        },
        include: { addonService: true },
      });

      const currentTotal = Number(existingInvoice.totalAmount || 0);
      await prisma.invoices.update({
        where: { invoiceId },
        data: {
          totalAmount: currentTotal + (quantity * price),
        },
      });

      return newAddon;
    } catch (error) {
      console.error("Error adding invoice addon:", error);
      throw error;
    }
  }

}

export default new InvoiceService();