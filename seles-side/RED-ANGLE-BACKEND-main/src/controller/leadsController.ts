// import { Request, Response } from "express";
// import leadsService from "../services/leadsService";
// import { AuthenticatedUserRequest } from "../middleware/auth";
// import { PaginationQuery } from "../types/request";
// import prisma from "../config/prisma";
// class LeadsController {
//   async create(req: AuthenticatedUserRequest, res: Response) {
//     try {
//       const createdBy = Number(req.admin?.id ?? req.partner?.id ?? req.employee?.id);
//       const lead = await leadsService.createLead(req.body, createdBy);
//       res.json({ success: true, data: lead });
//     } catch (err: any) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }
//   async bulkCreate(req: AuthenticatedUserRequest, res: Response) {
//     try {
//       const adminId = Number(req.admin?.id);
//       const leads = req.body.leads;

//       if (!Array.isArray(leads) || leads.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Leads must be a non-empty array",
//         });
//       }

//       const createdLeads = await leadsService.bulkCreate(leads, adminId);

//       return res.status(201).json({
//         success: true,
//         count: createdLeads.length,
//         leads: createdLeads,
//       });
//     } catch (err: any) {
//       return res.status(500).json({
//         success: false,
//         message: err.message,
//       });
//     }
//   }

//   async getAll(req: Request<{},{},{},PaginationQuery>, res: Response) {
//     try {
//       const page = parseInt(String(req.query.page || "1"));      // default page = 1
//       const limit = parseInt(String(req.query.limit || "10"))    // default limit = 10
//       const skip = (page - 1) * limit;
//       const search = String(req.query.search || "").trim();
//       const leads = await leadsService.getAllLeads(page, limit, skip, search);
//       res.json({ success: true, data: leads });
//     } catch (err: any) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async getLeadsByEmployee(req: Request, res: Response) {
//     const employeeId = Number(req.params.employeeId);

//     const leads = await leadsService.getLeadsByEmployeeId(employeeId);

//     res.status(200).json({
//       success: true,
//       data: leads,
//     });
//   }

//   async getOne(req: Request, res: Response) {
//     try {
//       const leadId = Number(req.params.leadId);
//       const lead = await leadsService.getLeadById(leadId);

//       if (!lead) {
//         return res.status(404).json({ success: false, message: "Lead not found" });
//       }

//       res.json({ success: true, data: lead });
//     } catch (err: any) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async update(req: AuthenticatedUserRequest, res: Response) {
//   try {
//     const leadId = Number(req.params.leadId);
//     const updatedBy = Number(req.admin?.id ?? req.partner?.id);
//     const updated = await leadsService.updateLead(leadId, req.body, updatedBy);

//     res.json({ success: true, data: updated });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// }

// async assignEmployeeToLead(req: Request, res: Response) {
//   try {
//     const leadId=req.body.leadId;
//     const employeeId=req.body.employeeId;
//     const adminId=Number((req as AuthenticatedUserRequest).admin?.id );
//     const updated = await leadsService.assignEmployeeToLead(leadId,employeeId,adminId,req.body);



//     res.json({ success: true, data: updated });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// }
//   async delete(req: Request, res: Response) {
//     try {
//       const leadId = Number(req.params.leadId);
//       const deleted = await leadsService.deleteLead(leadId);

//       res.json({ success: true, data: deleted });
//     } catch (err: any) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async countChannelLeads(req: Request, res: Response) {
//     try {
//       const employeeId = Number(req.params.employeeId);
//       const { startDate, endDate } = req.query;

//       const start = new Date(startDate as string);
//       const end = new Date(endDate as string);

//       const result = await leadsService.countLeadsByEmployeeWithInterval(
//         employeeId,
//         start,
//         end
//       );

//       res.json({ success: true, data: result });
//     } catch (err: any) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }

//   async adminStats(req: Request, res: Response) {
//     try {
//       const stats = await leadsService.getAdminLeadStats();
//       res.json({ success: true, data: stats });
//     } catch (err: any) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }
// async employeeStats(req: AuthenticatedUserRequest, res: Response) {
//   try {
//     // 1️⃣ Get userId from employee token
//     const userId = Number(req.employee?.id);

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     // 2️⃣ Find employee by userId
//     const employee = await prisma.employeesDetail.findUnique({
//       where: { userId },
//     });

//     if (!employee) {
//       return res.status(403).json({
//         success: false,
//         message: "Employee record not found",
//       });
//     }

//     // 3️⃣ Get stats using employeeId
//     const stats = await leadsService.getAdminLeadStats(employee.employeeId);

//     res.json({ success: true, data: stats });
//   } catch (err: any) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// }

// async getMyTasks(req: AuthenticatedUserRequest, res: Response) {
//   try {
//     // 1️⃣ userId from token
//     const userId = Number(req.employee?.id);

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     // 2️⃣ Map user → employee
//     const employee = await prisma.employeesDetail.findUnique({
//       where: { userId },
//     });

//     if (!employee) {
//       return res.status(403).json({
//         success: false,
//         message: "Employee record not found",
//       });
//     }

//     // 3️⃣ Fetch tasks
//     const tasks = await leadsService.getTasksByEmployee(
//       employee.employeeId
//     );

//     res.json({
//       success: true,
//       data: tasks,
//     });
//   } catch (err: any) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// }



//   async countChannelLeadsMonthWise(
//     req: Request,
//     res: Response
//   ) {
//     try {
//       const userId = Number(req.params.employeeId);

//       if (!Number.isInteger(userId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid user id",
//         });
//       }

//       const start = req.query.startDate
//         ? new Date(req.query.startDate as string)
//         : undefined;

//       const end = req.query.endDate
//         ? new Date(req.query.endDate as string)
//         : undefined;

//       const result =
//         await leadsService.countLeadsByUserMonthWise(
//           userId,
//           start,
//           end
//         );

//       res.json({
//         success: true,
//         data: result,
//       });
//     } catch (err: any) {
//       res.status(500).json({
//         success: false,
//         message: err.message,
//       });
//     }
//   }
// // GET /api/partner/earnings
// // GET /api/partner/earnings
// async getPartnerEarnings(req: AuthenticatedUserRequest, res: Response) {
//   try {
//     if (!req.partner) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const userId = Number(req.partner.id);
//     if (isNaN(userId)) {
//       return res.status(400).json({ success: false, message: "Invalid partner id" });
//     }

//     const { results, totalEarnings } = await leadsService.getLeadEarningsForPartner(userId);

//     return res.status(200).json({
//       success: true,
//       results,
//       totalEarnings,
//     });

//   } catch (err: any) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// }


// async updateEmployeeAssignment(req: Request, res: Response) {
//   try {
//     const { leadId, employeeId } = req.body;

//     if (!leadId || !employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: "leadId and employeeId are required",
//       });
//     }

//     const updated = await leadsService.updateEmployeeOnly(
//       Number(leadId),
//       Number(employeeId)
//     );

//     res.json({
//       success: true,
//       message: "Employee reassigned successfully",
//       data: updated,
//     });
//   } catch (err: any) {
//     res.status(500).json({
//       success: false,
//       message: err.message || "Failed to reassign employee",
//     });
//   }
// }
// }

// export default new LeadsController();


import { Request, Response } from "express";
import leadsService from "../services/leadsService";
import { AuthenticatedRequest } from "../middleware/auth";
import { notificationService } from "../services/notificationService";
import { PaginationQuery } from "../types/request";
import prisma from "../config/prisma";
import { buildWhatsappLink } from "../util/whatsapp";
class LeadsController {
  // getLeadWhatsappLink: any;
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const createdBy = Number(req.admin?.id ?? req.partner?.id ?? req.employee?.id);
      const lead = await leadsService.createLead(req.body, createdBy);

      // 🔔 Notify all admins about the new lead (non-blocking)
      if (lead) {
        notificationService
          .createNewLeadNotification({
            leadId: lead.leadId,
            leadName: lead.firstName
              ? `${lead.firstName} ${lead.lastName ?? ""}`.trim()
              : undefined,
            source: req.body.leadSource ?? undefined,
          })
          .catch((err) =>
            console.error("[Notification] Failed to notify on new lead:", err)
          );
      }

      res.json({ success: true, data: lead });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
  async bulkCreate(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = Number(req.user?.userId ?? req.admin?.id ?? req.employee?.id ?? req.partner?.id);
      const leads = req.body.leads;

      if (!Array.isArray(leads) || leads.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Leads must be a non-empty array",
        });
      }

      const { createdLeads, errors } = await leadsService.bulkCreate(leads, adminId);

      // If no leads were created, return error
      if (createdLeads.length === 0) {
        const errorMessages = errors
          .map((e) => `Row ${e.rowIndex}: ${e.error}`)
          .join('\n');

        return res.status(400).json({
          success: false,
          message: `No leads were created. Errors:\n${errorMessages}`,
          errors,
        });
      }

      // If some leads failed, return partial success
      if (errors.length > 0) {
        const errorMessages = errors
          .map((e) => `Row ${e.rowIndex}: ${e.error}`)
          .join('\n');

        return res.status(207).json({
          success: true,
          partialSuccess: true,
          count: createdLeads.length,
          failedCount: errors.length,
          message: `Bulk upload partially successful. ${createdLeads.length} leads created, ${errors.length} failed.\n\nErrors:\n${errorMessages}`,
          leads: createdLeads,
          errors,
        });
      }

      return res.status(201).json({
        success: true,
        count: createdLeads.length,
        message: `Successfully created ${createdLeads.length} leads`,
        leads: createdLeads,
      });
    } catch (err: any) {
      console.error('Bulk create error:', err);
      return res.status(500).json({
        success: false,
        message: err?.message || 'Bulk upload failed',
        error: err?.message,
      });
    }
  }



  async getAll(req: Request<{}, {}, {}, PaginationQuery>, res: Response) {
    try {
      const page = parseInt(String(req.query.page || "1"));
      const limit = parseInt(String(req.query.limit || "10"));
      const skip = (page - 1) * limit;
      const search = String(req.query.search || "").trim();

      const result = await leadsService.getAllLeads(page, limit, skip, search);

      res.json({
        success: true,
        data: result.leads,
        total: result.total
      });

    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getLeadsByEmployee(req: Request, res: Response) {
    const employeeId = Number(req.params.employeeId);

    const leads = await leadsService.getLeadsByEmployeeId(employeeId);

    res.status(200).json({
      success: true,
      data: leads,
    });
  }

  async getOne(req: Request, res: Response) {
    try {
      const leadId = Number(req.params.leadId);
      const lead = await leadsService.getLeadById(leadId);

      if (!lead) {
        return res.status(404).json({ success: false, message: "Lead not found" });
      }

      res.json({
        success: true,
        data: {
          leadId: lead?.leadId,
          leadSerialNumber: lead?.leadSerialNumber ?? null,
          firstName: lead?.firstName,
          lastName: lead?.lastName,
          email: lead?.email,
          contactNumber: lead?.contactNumber,
          address: lead?.address,
          eventType: lead?.eventType,
          eventDate: lead?.eventDate,
          weddingDate: lead?.weddingDate,
          receptionDate: lead?.receptionDate,
          budget: lead?.budget,
          leadSource: lead?.leadSource,
          leadFollowedBy: lead?.leadFollowedBy ?? null,
          currentStage: lead?.currentStage ?? "Lead",
          createdTime: lead?.createdTime,
          leadEmployee: lead?.leadEmployee ?? [],
        },
      });
      console.log("🔥 GET ONE CALLED");
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const leadId = Number(req.params.leadId);
      const updatedBy = Number(
        req.admin?.id ?? req.partner?.id ?? req.employee?.id
      );
      const updated = await leadsService.updateLead(leadId, req.body, updatedBy);

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async assignEmployeeToLead(req: Request, res: Response) {
    try {
      const leadId = Number(req.body.leadId);
      const employeeId = Number(req.body.employeeId);
      const adminId = Number(
        (req as AuthenticatedRequest).admin?.id
      );

      if (!leadId || !employeeId || !adminId) {
        return res.status(400).json({
          success: false,
          message: "leadId, employeeId and adminId are required",
        });
      }

      const updated = await leadsService.assignEmployeeToLead(
        leadId,
        employeeId,
        adminId,
        req.body
      );

      // 🔔 Fire notification to the assigned employee (non-blocking)
      notificationService.createLeadAssignmentNotification({
        employeeId,
        leadId,
        taskName: req.body.taskName,
      }).catch((err) =>
        console.error("[Notification] Failed to notify employee on assign:", err)
      );

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, message: err.message });
    }
  }


  async delete(req: Request, res: Response) {
    try {
      const leadId = Number(req.params.leadId);
      const deleted = await leadsService.deleteLead(leadId);

      res.json({ success: true, data: deleted });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async permanentDeleteLead(req: Request, res: Response) {
    try {
      const leadId = parseInt(req.params.leadId as string);
      if (isNaN(leadId)) {
        return res.status(400).json({ success: false, message: "Invalid lead ID" });
      }

      const deleted = await leadsService.permanentDeleteLead(leadId);

      res.json({ success: true, data: deleted });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async countChannelLeads(req: Request, res: Response) {
    try {
      const employeeId = Number(req.params.employeeId);
      const { startDate, endDate } = req.query;

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const result = await leadsService.countLeadsByEmployeeWithInterval(
        employeeId,
        start,
        end
      );

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async adminStats(req: Request, res: Response) {
    try {
      const stats = await leadsService.getAdminLeadStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
  async employeeStats(req: AuthenticatedRequest, res: Response) {
    try {
      // 1️⃣ Get userId from employee token
      const userId = Number(req.employee?.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // 2️⃣ Find employee by userId
      const employee = await prisma.employeesDetail.findUnique({
        where: { userId },
      });

      if (!employee) {
        return res.status(403).json({
          success: false,
          message: "Employee record not found",
        });
      }

      // 3️⃣ Get stats using employeeId
      const stats = await leadsService.getAdminLeadStats(employee.employeeId);

      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  async getMyTasks(req: AuthenticatedRequest, res: Response) {
    try {
      // 1️⃣ userId from token
      const userId = Number(req.employee?.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // 2️⃣ Map user → employee
      let employee = await prisma.employeesDetail.findUnique({
        where: { userId },
      });

      // If not found by userId, try finding by user email as fallback
      if (!employee) {
        const user = await prisma.user.findUnique({
          where: { userId },
          select: { email: true },
        });

        if (user?.email) {
          employee = await prisma.employeesDetail.findFirst({
            where: {
              user: {
                email: user.email,
              },
            },
          });
        }
      }

      if (!employee) {
        return res.status(403).json({
          success: false,
          message: "Employee record not found",
        });
      }

      // 3️⃣ Fetch tasks
      const tasks = await leadsService.getTasksByEmployee(
        employee.employeeId
      );

      res.json({
        success: true,
        data: tasks,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  async updateTaskStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const taskId = Number(req.params.taskId);
      if (!taskId || isNaN(taskId)) {
        return res.status(400).json({
          success: false,
          message: "Valid taskId is required",
        });
      }

      const { status, stage } = req.body;
      const updated = await leadsService.updateTaskStatus(taskId, { status, stage });

      return res.json({
        success: true,
        data: updated,
        message: "Task status updated successfully",
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }



  async countChannelLeadsMonthWise(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = Number(
        req.employee?.id ?? req.partner?.id ?? req.admin?.id
      );

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const start = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;

      const end = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      const result = await leadsService.countLeadsByUserMonthWise(
        userId,
        start,
        end
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // GET /api/partner/earnings
  // GET /api/partner/earnings
  async getPartnerEarnings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.partner) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const userId = Number(req.partner.id);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Invalid partner id" });
      }

      const { results, totalEarnings } = await leadsService.getLeadEarningsForPartner(userId);

      return res.status(200).json({
        success: true,
        results,
        totalEarnings,
      });

    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getMyAssignedLeads(req: AuthenticatedRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;

      if (!partnerId) {
        return res.status(403).json({
          success: false,
          message: "Only partners can access this resource",
        });
      }

      // const data = await leadsService.getLeadsAssignedToPartner(Number(partnerId));
      const data = await leadsService.getMyAssignedPartnerLeads(
        Number(partnerId)
      );

      res.json({
        success: true,
        data,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }





  async getPartnerAssignedLeads(req: AuthenticatedRequest, res: Response) {
    try {
      const partnerId = Number(req.partner?.id);

      if (!partnerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const leads = await leadsService.getPartnerAssignedLeads(partnerId);

      res.json({
        success: true,
        data: leads,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }



  async updateEmployeeAssignment(req: Request, res: Response) {
    try {
      const leadId = req.body.leadId || req.query.leadId;
      const employeeId = req.body.employeeId;

      if (!leadId || !employeeId) {
        return res.status(400).json({
          success: false,
          message: "leadId and employeeId are required",
        });
      }

      const updated = await leadsService.updateEmployeeOnly(
        Number(leadId),
        Number(employeeId)
      );

      // 🔔 Notify the newly assigned employee (non-blocking)
      notificationService.createLeadAssignmentNotification({
        employeeId: Number(employeeId),
        leadId: Number(leadId),
      }).catch((err) =>
        console.error("[Notification] Failed to notify employee on reassign:", err)
      );

      res.json({
        success: true,
        message: "Employee reassigned successfully",
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || "Failed to reassign employee",
      });
    }
  }

  async getLeadsByStage(req: Request<{ stage: string }, {}, {}, PaginationQuery>, res: Response) {
    try {
      const stage = req.params.stage;
      const page = parseInt(String(req.query.page || "1"));
      const limit = parseInt(String(req.query.limit || "10"));
      const skip = (page - 1) * limit;

      const result = await leadsService.getLeadsByStage(stage, page, limit, skip);

      res.json({
        success: true,
        data: result.leads,
        pagination: result.pagination,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  async getLeadsByStages(req: Request<{}, {}, { stages: string[]; page?: number; limit?: number }>, res: Response) {
    try {
      const { stages, page = 1, limit = 10 } = req.body;
      const pageNum = parseInt(String(page));
      const limitNum = parseInt(String(limit));
      const skip = (pageNum - 1) * limitNum;

      const result = await leadsService.getLeadsByStages(stages, pageNum, limitNum, skip);

      res.json({
        success: true,
        data: result.leads,
        pagination: result.pagination,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
  async getMyPartnerTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const partnerId = Number(req.partner?.id);

      if (!partnerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = await leadsService.getPartnerMyTasks(partnerId);

      return res.json({
        success: true,
        data,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
  async getLeadWhatsappLink(req: Request, res: Response) {
    const leadId = Number(req.params.leadId);

    const lead = await prisma.leadsDetail.findUnique({
      where: { leadId },
      select: {
        leadId: true,
        firstName: true,
        lastName: true,
        contactNumber: true,
      },
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({
      leadId: lead.leadId,
      name: `${lead.firstName} ${lead.lastName}`.trim(),
      contactNumber: lead.contactNumber,
      whatsappLink: buildWhatsappLink(lead.contactNumber),
    });
  }


}

export default new LeadsController();// Trigger restart
