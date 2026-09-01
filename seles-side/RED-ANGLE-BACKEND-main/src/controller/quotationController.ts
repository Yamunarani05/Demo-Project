import { Request, Response } from "express";
import quotationService from "../services/quotationService";
import leadsService from "../services/leadsService";
import { sendEmail } from "../util/emailService";
import {
  createQuotationWelcomeEmailContent,
  quotationApprovalEmailTemplate,
} from "../util/emailTemplates";
import prisma from "../config/prisma";
import { PaginationQuery } from "../types/request";
import { notificationService } from "../services/notificationService";

class QuotationController {
  /**
   * Create a new quotation
   * POST /quotations
   */
//   async create(req: Request, res: Response) {
//   try {
//     const userId = Number((req as any).user?.userId);

//     if (!userId || Number.isNaN(userId)) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized - User ID not found",
//       });
//     }

//     // // ✅ Prepare payload with imageUrl if uploaded
//     // const payload = {
//     //   ...req.body,
//     //   imageUrl: req.body.imageUrl ?? null,
//     // };

//     // const quotation = await quotationService.createQuotation(payload, userId);

//     res.status(201).json({
//       success: true,
//       message: "Quotation created successfully",
//       data: quotation,
//     });
//   } catch (err: any) {
//     console.error("Error in create quotation:", err);
//     res.status(400).json({
//       success: false,
//       message: err.message || "Failed to create quotation",
//     });
//   }
// }
async create(req: Request, res: Response) {
  try {
    
    const userId = Number((req as any).user?.userId);
    

    if (!userId || Number.isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found",
      });
    }

    const quotation = await quotationService.createQuotation(
      {
        packageId: Number(req.body.packageId),
        
        serviceProvided: req.body.serviceProvided,
        quantity: req.body.quantity
          ? Number(req.body.quantity)
          : undefined,
        terms: req.body.terms
          ? Number(req.body.terms)
          : undefined,
        description: req.body.description,
        items: req.body.items,
      },
      userId
    );

    res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      data: quotation,
    });
  } catch (err: any) {
    console.error("Error in create quotation:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to create quotation",
    });
  }
}

  /**
   * Update a quotation and send email to client
   * PUT /quotations/:quotationId
   */
  async update(req: Request, res: Response) {
    try {
      const quotationId = Number(req.params.quotationId);
      const { sendEmailToClient, ...updateData } = req.body;

      if (!quotationId || quotationId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid Quotation ID is required",
        });
      }

      const updatedQuotation = await quotationService.updateQuotation(
        quotationId,
        updateData
      );

      
      res.status(200).json({
        success: true,
        message: "Quotation updated successfully",
        data: updatedQuotation,
      });
    } catch (err: any) {
      console.error("Error updating quotation:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Failed to update quotation",
      });
    }
  }

  async viewQuotation(req: Request, res: Response) {
  try {
    const token = req.params.token as string;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Quotation token is required",
      });
    }

    const quotationLead = await prisma.quotationLead.findUnique({
      where: { token },
      include: {
        quotation: true,
        lead: true,
      },
    });

    if (!quotationLead) {
      return res.status(404).json({
        success: false,
        message: "Quotation link is invalid or expired",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: quotationLead.status,
        quotation: quotationLead.quotation,
        lead: quotationLead.lead,
      },
    });
  } catch (error) {
    console.error("Error viewing quotation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load quotation",
    });
  }
}

  /**
   * Get all quotations
   * GET /quotations
   */
async getAll(
  req: Request<{}, {}, {}, PaginationQuery>,
  res: Response
) {
  try {
    const rawUserId =
      (req as any).admin?.id ||
      (req as any).partner?.id ||
      (req as any).employee?.id;

    const userId = Number(rawUserId);

    if (!userId || Number.isNaN(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID not found",
      });
    }

    const page = parseInt(String(req.query.page || "1"));
    const limit = parseInt(String(req.query.limit || "10"));
    const skip = (page - 1) * limit;
    const comboTType = parseInt(String(req.query.combo || "0"));

    const quotations = await quotationService.getAllQuotations(
      userId,          // 🔒 ownership enforced
      page,
      limit,
      skip,
      comboTType
    );

    res.status(200).json({
      success: true,
      message: "Quotations retrieved successfully",
      data: quotations,
    });
  } catch (err: any) {
    console.error("Error fetching all quotations:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve quotations",
    });
  }
}

  /**
   * Get quotation IDs with combos
   * GET /quotations/ids
   */
  async getQuotationIds(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const quotations = await quotationService.getQuotationIds(id);
      res.status(200).json({
        success: true,
        message: "Quotation IDs retrieved successfully",
        data: quotations,
      });
    } catch (err: any) {
      console.error("Error fetching quotation IDs:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to retrieve quotation IDs",
      });
    }
  }

  /**
   * Get combo types
   * GET /quotations/combos
   */
  async getComboTypes(req: Request, res: Response) {
    try {
      const combos = await quotationService.getComboTypes();
      res.status(200).json({
        success: true,
        message: "Combo types retrieved successfully",
        data: combos,
      });
    } catch (err: any) {
      console.error("Error fetching combo types:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to retrieve combo types",
      });
    }
  }

  /**
   * Send quotation to client
   * POST /quotations/:quotationId/send
   */
  async sendToClient(req: Request, res: Response) {
    try {
      const { leadId, quotationId, notes } = req.body;

      if (!leadId || !quotationId) {
        return res.status(400).json({
          success: false,
          message: "Lead ID and Quotation ID are required",
        });
      }

      console.log('📧 [SEND-QUOTATION] Starting quotation send to client:', { leadId, quotationId });

      const quotationLead = await quotationService.sendQuotationToClient(
        leadId,
        quotationId,
        req.body.data
      );
      console.log("✅ [SEND-QUOTATION] Quotation Lead created:", quotationLead);

      const customer = await quotationService.getLeadById(leadId);

      // 🔔 Notify all admins — fire immediately after lead fetch, regardless of email
      const leadName = customer?.firstName
        ? `${customer.firstName} ${customer.lastName ?? ""}`
        : undefined;
      const sentByName =
        (req as any).employee?.name ?? (req as any).admin?.name ?? undefined;

      notificationService
        .createQuotationSentNotification({
          leadId: Number(leadId),
          leadName: leadName?.trim(),
          quotationId: Number(quotationId),
          sentByName,
        })
        .catch((err) =>
          console.error("❌ [Notification] Failed to notify admin on quotation sent:", err)
        );

      // Respond with success
      res.status(201).json({
        success: true,
        message: "Quotation sent to client successfully",
        data: quotationLead,
      });

    } catch (err: any) {
      console.error("❌ [SEND-QUOTATION] Error sending quotation to client:", err?.message || err);
      res.status(400).json({
        success: false,
        message: err.message || "Failed to send quotation to client",
      });
    }
  }

  /**
   * Upload quotation image
   * POST /quotations/upload-image
   */
  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required",
        });
      }

      const imageUrl = `/uploads/quotations/${req.file.filename}`;

      return res.status(201).json({
        success: true,
        message: "Image uploaded successfully",
        data: { imageUrl },
      });
    } catch (error: any) {
      console.error("Error uploading quotation image:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to upload image",
      });
    }
  }

  /**
   * Update lead information
   * PUT /leads/:leadId
   */
  async updateLead(req: Request, res: Response) {
    try {
      const leadId = Number(req.params.leadId);

      if (!leadId || leadId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid Lead ID is required",
        });
      }

      const updateData = { ...req.body };
      const isFinalisedNow = updateData.currentStage === "Finalised";

    // ✅ AUTO CHANGE STATUS WHEN FINALIZED
    if (isFinalisedNow) {
      updateData.status = "completed";
    }

      const updatedLead = await quotationService.updateLead(
        leadId,
        updateData
      );

      // 🔔 Notify all admins when employee marks lead as Finalised (non-blocking)
      if (isFinalisedNow) {
        const leadName = updatedLead.firstName
          ? `${updatedLead.firstName} ${updatedLead.lastName ?? ""}`.trim()
          : undefined;
        const employeeName =
          (req as any).employee?.name ??
          (req as any).admin?.name ??
          undefined;

        notificationService
          .createLeadFinalisedNotification({
            leadId,
            leadName,
            employeeName,
          })
          .catch((err) =>
            console.error("[Notification] Failed to notify on lead finalised:", err)
          );
      }

      res.status(200).json({
        success: true,
        message: "Lead updated successfully",
        data: updatedLead,
      });
    } catch (err: any) {
      console.error("Error updating lead:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Failed to update lead",
      });
    }
  }

  /**
   * Update quotation approval status
   * PUT /quotations/:quotationLeadId/status
   */
  async updateApprovalStatus(req: Request, res: Response) {
    try {
      const token = req.params.token as string;
      const { status, addons } = req.body;

if (!["pending", "approved", "rejected"].includes(status)) {
  return res.status(400).json({
    success: false,
    message: "Invalid status value",
  });
}

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Valid Quotation Lead token is required",
        });
      }

      if (!status || typeof status !== "string") {
        return res.status(400).json({
          success: false,
          message: "Valid status is required",
        });
      }

      const updatedQuotationLead =
       await quotationService.updateQuotationLeadStatus(
  token,
  status as "pending" | "approved" | "rejected",
  addons
);

      // 🔔 Notify admin + assigned employees when client responds (non-blocking)
      if (status === "approved" || status === "rejected") {
        (async () => {
          try {
            const ql = await prisma.quotationLead.findUnique({
              where: { token },
              include: { lead: { select: { leadId: true, firstName: true, lastName: true } } },
            });
            if (ql) {
              const leadName = ql.lead.firstName
                ? `${ql.lead.firstName} ${ql.lead.lastName ?? ""}`.trim()
                : undefined;

              // Notify admin + employees: "client accepted/rejected"
              await notificationService.createQuotationResponseNotification({
                quotationLeadId: ql.id,
                leadId: ql.lead.leadId,
                leadName,
                status: status as "approved" | "rejected",
              });

              // 🔔 Extra notification to admin only: "invoice is ready" (only on approval)
              if (status === "approved") {
                await notificationService.createInvoiceReadyNotification({
                  leadId: ql.lead.leadId,
                  leadName,
                });
              }
            }
          } catch (err) {
            console.error("[Notification] Failed to notify on quotation response:", err);
          }
        })();
      }

      res.status(200).json({
        success: true,
        message: "Quotation approval status updated successfully",
        data: updatedQuotationLead,
      });
    } catch (err: any) {
      console.error("Error updating quotation approval status:", err);
      res.status(400).json({
        success: false,
        message:
          err.message || "Failed to update quotation approval status",
      });
    }
  }

  /**
   * Delete quotation (soft delete)
   * DELETE /quotations/:quotationId
   */
  async deleteQuotation(req: Request, res: Response) {
    try {
      const quotationId = Number(req.params.quotationId);

      if (!quotationId || quotationId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid Quotation ID is required",
        });
      }

      const deletedQuotation =
        await quotationService.deleteQuotation(quotationId);

      res.status(200).json({
        success: true,
        message: "Quotation deleted successfully",
        data: deletedQuotation,
      });
    } catch (err: any) {
      console.error("Error deleting quotation:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Failed to delete quotation",
      });
    }
  }

  /**
   * Delete lead (soft delete)
   * DELETE /leads/:leadId
   */
  async deleteLead(req: Request, res: Response) {
    try {
      const leadId = Number(req.params.leadId);

      if (!leadId || leadId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid Lead ID is required",
        });
      }

      const deletedLead = await quotationService.deleteLead(leadId);

      res.status(200).json({
        success: true,
        message: "Lead deleted successfully",
        data: deletedLead,
      });
    } catch (err: any) {
      console.error("Error deleting lead:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Failed to delete lead",
      });
    }
  }
  async listAddons(req: Request, res: Response) {
  try {
    const addons = await quotationService.list();
    res.status(200).json({
      success: true,
      message: "Addon services retrieved successfully",
      data: addons,
    });
  } catch (err: any) {
    console.error("Error fetching addon services:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve addon services",
    });
  }
}

/**
 * Create a new addon service
 * POST /quotations/addons
 */
async createAddon(req: Request, res: Response) {
  try {
    const { name, price, unitLabel, defaultQty } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Addon name and price are required",
      });
    }

    const addon = await quotationService.create({
      name,
      price,
      unitLabel,
      defaultQty,
    });

    res.status(201).json({
      success: true,
      message: "Addon service created successfully",
      data: addon,
    });
  } catch (err: any) {
    console.error("Error creating addon service:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to create addon service",
    });
  }
}

/**
 * Update an addon service
 * PUT /quotations/addons/:id
 */
async updateAddon(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid Addon ID is required",
      });
    }

    const updatedAddon = await quotationService.update(id, req.body);

    res.status(200).json({
      success: true,
      message: "Addon service updated successfully",
      data: updatedAddon,
    });
  } catch (err: any) {
    console.error("Error updating addon service:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to update addon service",
    });
  }
}

/**
 * Soft delete an addon service
 * DELETE /quotations/addons/:id
 */
async deleteAddon(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid Addon ID is required",
      });
    }

    const deletedAddon = await quotationService.delete(id);

    res.status(200).json({
      success: true,
      message: "Addon service deleted successfully",
      data: deletedAddon,
    });
  } catch (err: any) {
    console.error("Error deleting addon service:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to delete addon service",
    });
  }
}

/**
 * Add an addon to a lead
 * POST /quotations/leads/:leadId/addons
 */
async addAddonToLead(req: Request, res: Response) {
  try {
    const leadId = Number(req.params.leadId);
    const { addons } = req.body;

     console.log("LeadId:", leadId);
    console.log("Addons received:", addons);

    const result = await quotationService.addAddonToLead(leadId, addons);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


/**
 * List all addons for a lead
 * GET /quotations/leads/:leadId/addons
 */
async listLeadAddons(req: Request, res: Response) {
  try {
    const leadId = Number(req.params.leadId);
    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "Valid Lead ID is required",
      });
    }

    const addons = await quotationService.listLeadAddons(leadId);

    res.status(200).json({
      success: true,
      message: "Lead addons retrieved successfully",
      data: addons,
    });
  } catch (err: any) {
    console.error("Error fetching lead addons:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve lead addons",
    });
  }
}

/**
 * Update a lead's addon
 * PUT /quotations/leads/:leadId/addons/:addonServiceId
 */
async updateLeadAddon(req: Request, res: Response) {
  try {
    const leadId = Number(req.params.leadId);
    const addonServiceId = Number(req.params.addonServiceId);
    const { quantity } = req.body;

    if (!leadId || !addonServiceId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Lead ID, Addon Service ID, and quantity are required",
      });
    }

    const updatedLeadAddon = await quotationService.updateLeadAddon(
      leadId,
      addonServiceId,
      Number(quantity)
    );

    res.status(200).json({
      success: true,
      message: "Lead addon updated successfully",
      data: updatedLeadAddon,
    });
  } catch (err: any) {
    console.error("Error updating lead addon:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to update lead addon",
    });
  }
}

/**
 * Remove an addon from a lead
 * DELETE /quotations/leads/:leadId/addons/:addonServiceId
 */
async removeLeadAddon(req: Request, res: Response) {
  try {
    const leadId = Number(req.params.leadId);
    const addonServiceId = Number(req.params.addonServiceId);

    if (!leadId || !addonServiceId) {
      return res.status(400).json({
        success: false,
        message: "Lead ID and Addon Service ID are required",
      });
    }

    await quotationService.removeAddon(leadId, addonServiceId);

    res.status(200).json({
      success: true,
      message: "Addon removed from lead successfully",
    });
  } catch (err: any) {
    console.error("Error removing addon from lead:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Failed to remove addon from lead",
    });
  }
}
}

export default new QuotationController();