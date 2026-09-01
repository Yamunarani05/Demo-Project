import { LeadStage } from "@prisma/client";
import prisma from "../config/prisma";
import { sendEmail } from "../util/emailService";
import {
  createQuotationWelcomeEmailContent,
} from "../util/emailTemplates";
import { notificationService } from "../services/notificationService";
import { Prisma } from "@prisma/client";
import crypto from "crypto";


/* ================= TYPES ================= */

// interface CreateQuotationPayload {
//   packageId: number;
//   // serviceName: string;
//   serviceProvided?: string;
//   quantity?: number;
//   comboId?: number;
//   terms?: number;
//   description?: string;
//   //price?: number | string;
//   //imageUrl?: string;
//   [key: string]: any;
// }
interface CreateQuotationPayload {
  packageId: number;
  serviceProvided?: string;
  quantity?: number;
  comboId?: number;
  terms?: number | "";
  description?: string;
  items?: any;
}


interface SendQuotationPayload {
  notes?: string;
  [key: string]: any;
}

interface UpdateLeadPayload {
  [key: string]: any;
}

interface ComboTypeResponse {
  id: number;
  comboName: string;
  description: string | null;
}

/* ================= SERVICE ================= */

class QuotationService {
  /* ================= CREATE ================= */

  // async createQuotation(data: CreateQuotationPayload, userId: number) {
  //   if (!data?.serviceName) {
  //     throw new Error("Service name is required");
  //   }

  //   if (!userId) {
  //     throw new Error("Valid user ID required");
  //   }

  //   // ✅ ONLY VALIDATION NEEDED
  //   const user = await prisma.user.findUnique({
  //     where: { userId },
  //     select: { userId: true },
  //   });

  //   if (!user) {
  //     throw new Error("Authenticated user not found");
  //   }

  //   // ✅ ADMIN / EMPLOYEE / PARTNER → ALL ALLOWED
  //   return prisma.quotationPackages.create({
  //     data: {
  //       serviceName: data.serviceName,
  //       serviceProvided: data.serviceProvided,
  //       quantity: data.quantity ?? 1,
  //       comboId: data.comboId,
  //       terms: data.terms,
  //       description: data.description,
  //       price: Number(data.price) || 0,
  //       imageUrl: data.imageUrl || null,
  //       createdBy: userId, // 🔥 USER ID (NOT employeeId)
  //     },
  //   });
  // }
  // async createQuotation(data: CreateQuotationPayload, userId: number) {
  //   if (!userId) {
  //     throw new Error("Valid user ID required");
  //   }

  //   if (!data?.packageId) {
  //     throw new Error("packageId is required");
  //   }

  //   // 1️⃣ Fetch selected package
  //   const pkg = await prisma.packageServices.findUnique({
  //     where: { id: data.packageId },
  //   });

  //   if (!pkg) {
  //     throw new Error("Selected package not found");
  //   }

  //   // 2️⃣ Decide image
  //   const imageUrlToStore =
  //     data.imageUrl !== undefined
  //       ? data.imageUrl
  //       : pkg.imageUrl ?? null;

  //   // 3️⃣ Decide price
  //   const priceToStore =
  //     data.price !== undefined
  //       ? Number(data.price)
  //       : Number(pkg.price);

  //   // 4️⃣ Create quotation (IMPORTANT: store packageId)
  //   return prisma.quotationPackages.create({
  //     data: {
  //       packageId: pkg.id,                 // ✅ THIS WAS MISSING
  //       serviceName: pkg.packageTitle,
  //       serviceProvided: data.serviceProvided ?? pkg.packageTitle,
  //       quantity: data.quantity ?? 1,
  //       comboId: data.comboId ?? null,
  //       terms: data.terms ?? null,
  //       description: data.description ?? null,
  //       price: priceToStore,
  //       imageUrl: imageUrlToStore,
  //       createdBy: userId,
  //     },
  //   });
  async createQuotation(data: CreateQuotationPayload, userId: number) {
    if (!userId) {
      throw new Error("Valid user ID required");
    }

    if (!data.packageId) {
      throw new Error("packageId is required");
    }

    // 1️⃣ Fetch package (SOURCE OF TRUTH)
    const pkg = await prisma.packageServices.findUnique({
      where: { id: data.packageId },
    });

    if (!pkg) {
      throw new Error("Selected package not found");
    }

    // 2️⃣ Normalize values
    const quantity = data.quantity ? Number(data.quantity) : 1;
    const terms =
      data.terms !== undefined && data.terms !== null
        ? Number(data.terms)
        : null;

    const itemsTotal = Array.isArray(data.items)
      ? data.items.reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)
      : 0;

    // 3️⃣ Create quotation
    return prisma.quotationPackages.create({
      data: {
        packageId: pkg.id,
        serviceName: pkg.packageTitle,
        serviceProvided: data.serviceProvided ?? pkg.packageTitle,
        quantity,
        comboId: data.comboId ?? null,
        terms,
        description: data.description ?? null,
        price: Number(pkg.price) + itemsTotal, // ✅ Package Price + Extra Items Price
        imageUrl: pkg.imageUrl ?? null,    // ✅ ONLY FROM SEED
        items: data.items ? data.items : Prisma.JsonNull,
        createdBy: userId,
      },
    });
  }



  /* ================= UPDATE ================= */

  // async updateQuotation(
  //   quotationId: number,
  //   data: Partial<CreateQuotationPayload>
  // ) {
  //   if (!quotationId || quotationId <= 0) {
  //     throw new Error("Valid quotation ID is required");
  //   }

  //   const existingQuotation = await prisma.quotationPackages.findUnique({
  //     where: { id: quotationId },
  //   });

  //   if (!existingQuotation || existingQuotation.isDeleted) {
  //     throw new Error("Quotation not found or deleted");
  //   }

  //   return prisma.quotationPackages.update({
  //     where: { id: quotationId },
  //     data: {
  //       ...data,
  //       price:
  //         data.price !== undefined ? Number(data.price) : undefined,
  //     },
  //   });
  // }
  async updateQuotation(
    quotationId: number,
    data: Partial<CreateQuotationPayload>
  ) {
    if (!quotationId || quotationId <= 0) {
      throw new Error("Valid quotation ID is required");
    }

    const existingQuotation = await prisma.quotationPackages.findUnique({
      where: { id: quotationId },
    });

    if (!existingQuotation || existingQuotation.isDeleted) {
      throw new Error("Quotation not found or deleted");
    }

    return prisma.quotationPackages.update({
      where: { id: quotationId },
      data: {
        serviceProvided: data.serviceProvided,
        quantity:
          data.quantity !== undefined
            ? Number(data.quantity)
            : undefined,
        comboId: data.comboId ?? undefined,
        terms:
          data.terms !== undefined
            ? Number(data.terms)
            : undefined,
        description: data.description ?? undefined,

        // 🚫 NO price
        // 🚫 NO imageUrl
        // 🚫 NO packageId
      },
    });
  }


  /* ================= GET ================= */

  async getAllQuotations(
    userId: number,
    page: number,
    limit: number,
    skip: number,
    comboTType?: number
  ) {
    if (!userId) throw new Error("Valid user ID required");

    const where: any = { createdBy: userId, isDeleted: false };
    if (comboTType) where.comboId = comboTType;

    return prisma.quotationPackages.findMany({
      where,
      orderBy: { id: "desc" },
      skip,
      take: limit,
    });
  }

  async getQuotationIds(id: number) {
    return prisma.quotationPackages.findMany({
      where: id ? { id } : {},
    });
  }

  async getComboTypes(): Promise<ComboTypeResponse[]> {
    return prisma.comboEvent.findMany({
      orderBy: { id: "asc" },
    });
  }

  async getLeadById(leadId: number) {
    return prisma.leadsDetail.findUnique({ where: { leadId } });
  }

  /* ================= SEND QUOTATION ================= */

  async sendQuotationToClient(
    leadId: number,
    quotationId: number,
    data?: SendQuotationPayload
  ) {
    const lead = await prisma.leadsDetail.findUnique({
      where: { leadId },
    });
    if (!lead || !lead.email) {
      throw new Error("Lead or email not found");
    }

    let quotationLead = await prisma.quotationLead.findFirst({
      where: { leadId, quotationId },
    });

    const providedDiscount = (data as any)?.discount;
    const parsedDiscount = providedDiscount === "" || providedDiscount === null || providedDiscount === undefined
      ? 0
      : Number(providedDiscount);

    if (!quotationLead) {
      quotationLead = await prisma.quotationLead.create({
        data: {
          leadId,
          quotationId,
          status: "pending",
          notes: (data as any)?.notes ?? null,
          discount: parsedDiscount,
          sentAt: new Date(),
        },
      });
    } else {
      quotationLead = await prisma.quotationLead.update({
        where: { id: quotationLead.id },
        data: {
          status: "pending",
          notes: (data as any)?.notes ?? quotationLead.notes,
          discount: providedDiscount !== undefined ? parsedDiscount : quotationLead.discount,
          sentAt: new Date(),
        },
      });
    }

    const targetTaskId = (data as any)?.taskId;
    if (targetTaskId) {
      try {
        await prisma.leadEmployee.update({
          where: { leadEmployeeId: Number(targetTaskId) },
          data: { status: "InProgress", stage: LeadStage.Quotation },
        });
      } catch (err) {
        console.warn("Could not update task status for taskId:", targetTaskId, err);
      }
    } else {
      try {
        const pkg = await prisma.quotationPackages.findUnique({
          where: { id: quotationId },
          select: { serviceName: true },
        });
        const serviceNameLower = (pkg?.serviceName || "").toLowerCase().trim();
        const matchingTask = await prisma.leadEmployee.findFirst({
          where: {
            leadId,
            OR: [
              { taskName: { contains: serviceNameLower, mode: "insensitive" } },
              { status: { in: ["assigned", "ToDo"] } },
            ],
          },
          orderBy: { leadEmployeeId: "asc" },
        });
        if (matchingTask) {
          await prisma.leadEmployee.update({
            where: { leadEmployeeId: matchingTask.leadEmployeeId },
            data: { status: "InProgress", stage: LeadStage.Quotation },
          });
        }
      } catch (e) {
        console.warn("Could not find matching task on quotation send:", e);
      }
    }

    await prisma.leadsDetail.update({
      where: { leadId },
      data: { currentStage: LeadStage.Quotation },
    });

    const quotation = await prisma.quotationPackages.findUnique({
      where: { id: quotationId },
    });

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    let clientSetupUrl: string | undefined = undefined;

    if (!lead.passwordHash) {
      let clientToken = lead.clientToken;
      if (!clientToken) {
        clientToken = crypto.randomBytes(32).toString('hex');
        await prisma.leadsDetail.update({
          where: { leadId },
          data: { clientToken },
        });
      }
      clientSetupUrl = `${process.env.CLIENT_FRONTEND_URL || "http://localhost:5174"}/set-password?token=${clientToken}`;
    } else {
      clientSetupUrl = `${process.env.CLIENT_FRONTEND_URL || "http://localhost:5174"}/login`;
    }

    const emailBody = createQuotationWelcomeEmailContent(
      lead,
      quotation,
      quotationLead.token!,
      data?.notes,
      clientSetupUrl
    );

    console.log('📧 [QUOTATION] Creating quotation email for lead:', lead.email);

    try {
      await sendEmail({
        to: lead.email,
        subject: "Your Quotation from Red Angle",
        body: emailBody,
        isHTML: true,
      });
      console.log('✅ [QUOTATION] Email sent successfully to:', lead.email);
    } catch (emailError: any) {
      console.error('❌ [QUOTATION] Email sending failed:', emailError?.message || emailError);
      // ✅ Still return the quotationLead but log the error
      // The admin should still be able to see the quotation was created
      // but they need to know the email failed
      console.error('⚠️ [QUOTATION] WARNING: Quotation created but email failed to send for lead:', lead.email);
    }

    return quotationLead;
  }

  /* ================= STATUS UPDATE + NOTIFICATION ================= */

  async updateQuotationLeadStatus(
    token: string,
    status: "pending" | "approved" | "rejected",
    addons?: any[]
  ) {
    const quotationLead = await prisma.quotationLead.findUnique({
      where: { token },
    });

    if (!quotationLead) {
      throw new Error("Invalid quotation token");
    }

    let fullAddonData: any[] = [];

    if (addons && Array.isArray(addons) && addons.length > 0) {
      const addonIds = addons.map((a: any) => a.addonServiceId);
      const addonServices = await prisma.addonService.findMany({
        where: { id: { in: addonIds } }
      });

      const addonServiceMap = new Map(addonServices.map((a: any) => [a.id, a]));

      fullAddonData = addons.map((a: any) => {
        const service = addonServiceMap.get(a.addonServiceId);
        const price = service ? Number(service.price) : 0;
        const qty = a.quantity || 1;
        return {
          leadId: quotationLead.leadId,
          addonServiceId: a.addonServiceId,
          quantity: qty,
          price: price,
          total: price * qty,
          category: a.category || "Unknown",
        };
      });

      await prisma.leadAddon.createMany({
        data: fullAddonData,
        skipDuplicates: true
      });
    }

    if (status === "approved") {

      // 1. Check open issues FIRST
      const openIssues = await prisma.quotationLeadIssues.count({
        where: {
          quotationLeadId: quotationLead.id,
          status: "Open",
        },
      });

      if (openIssues > 0) {
        throw new Error("Cannot approve quotation with open issues");
      }

      const quotation = await prisma.quotationPackages.findUnique({
        where: { id: quotationLead.quotationId }
      });

      if (!quotation) {
        throw new Error("Quotation not found");
      }

      const planName = quotation.serviceName || "Standard";
      const packagePrice = quotation.price ? Number(quotation.price) : 0;
      const discount = quotationLead.discount ? Number(quotationLead.discount) : 0;
      const addonsTotal = fullAddonData.reduce((sum: number, addon: any) => sum + Number(addon.total || 0), 0);
      const totalAmount = packagePrice + addonsTotal - discount;

      const invoice = await prisma.invoices.create({
        data: {
          leadId: quotationLead.leadId,
          billingDate: new Date(),
          plan: planName,
          status: "Pending",
          discount,
          totalAmount: totalAmount > 0 ? totalAmount : undefined,
          packageInvoices: quotation.packageId ? {
            create: [
              {
                packageId: quotation.packageId,
                unit: quotation.quantity ?? 1,
                status: "Active"
              }
            ]
          } : undefined,
          invoiceItems: Array.isArray(quotation.items) && quotation.items.length > 0 ? {
            create: (quotation.items as any[]).map((it: any) => ({
              name: it.name,
              category: it.category ?? "SERVICE",
              quantity: it.quantity,
              price: it.price ? Number(it.price) : 0
            }))
          } : undefined
        }
      });

      if (fullAddonData.length > 0) {
        await prisma.invoiceAddon.createMany({
          data: fullAddonData.map((a: any) => ({
            invoiceId: invoice.invoiceId,
            addonServiceId: a.addonServiceId,
            quantity: a.quantity,
            price: a.price,
            total: a.total,
            category: a.category ?? null
          }))
        });
      }
    }



    await prisma.leadsDetail.update({
      where: { leadId: quotationLead.leadId },
      data: {
        currentStage:
          status === "approved"
            ? LeadStage.Confirmation
            : LeadStage.Quotation,
        status:
          status === "approved"
            ? "quotationapproved"
            : status === "rejected"
              ? "quotationrejected"
              : "assigned",
      },
    });

    if (status === "approved") {
      try {
        const quotationPkg = await prisma.quotationPackages.findUnique({
          where: { id: quotationLead.quotationId },
          select: { serviceName: true },
        });

        const serviceNameLower = (quotationPkg?.serviceName || "").toLowerCase().trim();

        // 1. Try to find the specific matching task for this quotation package
        const matchingTask = await prisma.leadEmployee.findFirst({
          where: {
            leadId: quotationLead.leadId,
            OR: [
              { taskName: { contains: serviceNameLower, mode: "insensitive" } },
              { status: "InProgress" },
              { stage: LeadStage.Quotation },
              { status: { in: ["assigned", "ToDo"] } },
            ],
          },
          orderBy: { leadEmployeeId: "asc" },
        });

        if (matchingTask) {
          await prisma.leadEmployee.update({
            where: { leadEmployeeId: matchingTask.leadEmployeeId },
            data: {
              status: "InReview",
              stage: LeadStage.Confirmation,
            },
          });
        }
      } catch (e) {
        console.warn("Could not update leadEmployee task status on approval:", e);
      }
    }

    const updatedQuotationLead =
      await prisma.quotationLead.update({
        where: { id: quotationLead.id },
        data: { status },
      });


    /* 🔔 NOTIFICATION (ONLY HERE) */
    const quotation = await prisma.quotationPackages.findUnique({
      where: { id: quotationLead.quotationId }
    });


    if (quotation?.createdBy) {
      const lead = await prisma.leadsDetail.findUnique({
        where: { leadId: quotationLead.leadId },
        select: {
          leadId: true,
          firstName: true,
          lastName: true,
        },
      });

      // 1️⃣ Find employee linked to the user who created quotation
      await notificationService.createUserNotification({
        userId: quotation.createdBy,
        issueType: "QuotationStatus",
        title:
          status === "approved"
            ? "Quotation Approved"
            : "Quotation Rejected",
        message: `Quotation for lead ${lead?.firstName ?? ""} ${lead?.lastName ?? ""
          } (Lead #${lead?.leadId}) was ${status} by the client.`,
      });

    }

    return updatedQuotationLead;
  }

  /* ================= DELETE ================= */

  async updateLead(leadId: number, data: UpdateLeadPayload) {
    return prisma.leadsDetail.update({
      where: { leadId },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async deleteQuotation(quotationId: number) {
    return prisma.quotationPackages.update({
      where: { id: quotationId },
      data: { isDeleted: true },
    });
  }

  async deleteLead(leadId: number) {
    return prisma.leadsDetail.update({
      where: { leadId },
      data: {
        isDeleted: true,
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }
  async list() {
    return prisma.addonService.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
    });
  }

  async create(data: {
    name: string;
    price: number;
    unitLabel?: string;
    defaultQty?: number;
  }) {
    return prisma.addonService.create({
      data: {
        name: data.name,
        price: data.price,
        unitLabel: data.unitLabel ?? "Session",
        defaultQty: data.defaultQty ?? 1,
      },
    });
  }

  async update(id: number, data: Partial<any>) {
    return prisma.addonService.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.addonService.update({
      where: { id },
      data: { isActive: false },
    });
  }
  async addAddonToLead(
    leadId: number,
    addons: {
      addonServiceId: number;
      quantity?: number;
      category?: string;
    }[]
  ) {
    if (!leadId || leadId <= 0) {
      throw new Error("Valid lead ID is required");
    }

    if (!Array.isArray(addons) || addons.length === 0) {
      throw new Error("At least one addon is required");
    }

    return prisma.$transaction(async (tx) => {
      const results = [];

      for (const item of addons) {
        const addon = await tx.addonService.findUnique({
          where: { id: item.addonServiceId },
        });

        if (!addon) {
          throw new Error(`Addon ${item.addonServiceId} not found`);
        }

        const qty = item.quantity ?? addon.defaultQty;
        const price = addon.price; // Decimal
        const total = price.mul(qty);

        const leadAddon = await tx.leadAddon.upsert({
          where: {
            leadId_addonServiceId: {
              leadId,
              addonServiceId: item.addonServiceId,
            },
          },
          update: {
            quantity: qty,
            price,
            total,
            category: item.category ?? null,
          },
          create: {
            leadId,
            addonServiceId: item.addonServiceId,
            quantity: qty,
            price,
            total,
            category: item.category ?? null,
          },
        });

        results.push(leadAddon);
      }

      return results;
    });
  }

  async listLeadAddons(leadId: number) {
    return prisma.leadAddon.findMany({
      where: { leadId },
      include: {
        addonService: true,
      },
    });
  }

  async updateLeadAddon(
    leadId: number,
    addonServiceId: number,
    quantity: number
  ) {
    const addon = await prisma.leadAddon.findUnique({
      where: {
        leadId_addonServiceId: { leadId, addonServiceId },
      },
    });

    if (!addon) throw new Error("Lead addon not found");

    const total = addon.price.mul(quantity);

    return prisma.leadAddon.update({
      where: {
        leadId_addonServiceId: { leadId, addonServiceId },
      },
      data: {
        quantity,
        total,
      },
    });
  }

  async removeAddon(leadId: number, addonServiceId: number) {
    return prisma.leadAddon.delete({
      where: {
        leadId_addonServiceId: { leadId, addonServiceId },
      },
    });
  }
}
export default new QuotationService();


