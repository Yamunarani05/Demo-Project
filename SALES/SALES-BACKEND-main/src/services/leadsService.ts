// import { LeadStage } from "@prisma/client";
// import prisma from "../config/prisma";

// type LeadForStats = {
//   lead: {
//     currentStage: LeadStage;
//     updatedAt: Date | null;
//   };
// }; 

// const stageToKanbanMap: Record<LeadStage, string> = {
//   Lead: "To Do",
//   Quotation: "In Progress",
//   Confirmation: "In Review",
//   Finalised: "Done",
// };

// export type LeadKanbanStatus =
//   | "To Do"
//   | "In Progress"
//   | "In Review"
//   | "Done";

// class LeadsService {
//   async createLead(data: any, createdBy: number) {
//     const { assigneeId, ...leadData } = data;
//     const creator = await prisma.user.findUnique({
//       where: { userId: createdBy },
//       select: { role: true },
//     });

//     if (!creator) {
//       throw new Error("Creator user not found");
//     }

//     const lead = await prisma.leadsDetail.create({
//       data: {
//         ...leadData,
//         createdBy,
//         currentStage: "Lead",
//         status: stageToKanbanMap["Lead"],
//       },
//     });

//     if (creator.role === "partner") {
//       await prisma.leadEmployee.create({
//         data: {
//           leadId: lead.leadId,
//           employeeId: createdBy,
//           createdBy: createdBy,
//         },
//       });
//     }

//     if (creator.role === "admin" && assigneeId) {
//       const employeeExists = await prisma.employeesDetail.findUnique({
//         where: { employeeId: assigneeId },
//       });

//       if (!employeeExists) {
//         throw new Error("Assignee employee does not exist");
//       }

//       await prisma.leadEmployee.create({
//         data: {
//           leadId: lead.leadId,
//           employeeId: assigneeId,
//           createdBy: createdBy,
//         },
//       });
//       await prisma.leadsDetail.update({
//         where: { leadId: lead.leadId },
//         data: {
//           status: "assigned",
//         }})
//     }

//     return await prisma.leadsDetail.findUnique({
//       where: { leadId: lead.leadId },
//       include: {
//         leadEmployee: true,
//       },
//     });
//   }
//   async bulkCreate(leads: any[], createdBy: number) {
//     if (!Array.isArray(leads) || leads.length === 0) return [];

//     const createdLeads = [];

//     for (const lead of leads) {
//       const { assigneeId, ...leadData } = lead;

//       const createdLead = await prisma.leadsDetail.create({
//         data: {
//           ...leadData,
//           createdBy,
//           currentStage: "Lead",
//           status: stageToKanbanMap["Lead"], // use proper string mapping
//         },
//       });

//       if (assigneeId) {
//         const employeeExists = await prisma.employeesDetail.findUnique({
//           where: { employeeId: assigneeId },
//         });
//         if (employeeExists) {
//           await prisma.leadEmployee.create({
//             data: {
//               leadId: createdLead.leadId,
//               employeeId: assigneeId,
//               createdBy,
//             },
//           });
//         }
//       }

//       createdLeads.push(createdLead);
//     }

//     return createdLeads;
//   }

//   async assignEmployeeToLead(
//     leadId: number,
//     employeeId: number,
//     adminId: number,
//     data: any
//   ) {
//     console.log(adminId)
//     await prisma.leadsDetail.update({
//       where: { leadId },
//       data: {
//         status: "assigned",}
//       })
//     return await prisma.leadEmployee.create({
//       data: {
//         leadId,
//         employeeId,
//         createdBy: adminId,
//         ...data,
//         EstimatedDuration: data.EstimatedDuration
//           ? Number(data.EstimatedDuration)
//           : null
//       }
//     });
//   }

//   async getAllLeads(
//     page: number,
//     limit: number,
//     skip: number,
//     search: string = ""
//   ) {
//     const whereCondition: any = {
//       isDeleted: false,
//     };

//     if (search) {
//       whereCondition.OR = [
//         { firstName: { contains: search, mode: "insensitive" } },
//         { lastName: { contains: search, mode: "insensitive" } },
//         { email: { contains: search, mode: "insensitive" } },
//         { contactNumber: { contains: search, mode: "insensitive" } },
//       ];
//     }

//     return await prisma.leadsDetail.findMany({
//       where: whereCondition,
//       orderBy: { leadId: "desc" },
//       skip,
//       take: limit,

//       select: {
//         leadId: true,
//         firstName: true,
//         lastName: true,
//         email: true,
//         contactNumber: true,
//         eventType: true,
//         eventDate: true,
//         budget: true,
//         leadSource: true,
//         priority: true,
//         currentStage: true,
//         status: true,
//         createdTime: true,
//         address: true,
//         createdByUser: {
//           select: {
//             userId: true,
//             email: true,
//             role: true,
//           },
//         },
//         leadEmployee: {
//           select: {
//             leadEmployeeId: true,
//             taskName: true,
//             description: true,
//             EstimatedDuration: true,
//             priority: true,
//             deadline: true,
//             employee: {
//               select: {
//                 employeeId: true,
//                 firstName: true,
//                 lastName: true,
//                 user: {
//                   select: {
//                     role: true,
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });
//   }

//   async getLeadsByEmployeeId(employeeId: number) {
//   return await prisma.leadsDetail.findMany({
//     where: {
//       isDeleted: false,
//       leadEmployee: {
//         some: {
//           employeeId: employeeId,
//         },
//       },
//     },

//     select: {
//       leadId: true,
//       firstName: true,
//       lastName: true,
//       email: true,
//       contactNumber: true,
//       currentStage: true,
//       status: true,
//       createdTime: true,

//       createdByUser: {
//         select: {
//           userId: true,
//           role: true,
//         },
//       },

//       leadEmployee: {
//         where: {
//           employeeId: employeeId,
//         },
//         select: {
//           leadEmployeeId: true,
//           taskName: true,
//           deadline: true,
//           priority: true,
//         },
//       },
//     },
//   });
// }


//   async getLeadById(leadId: number) {
//     return await prisma.leadsDetail.findUnique({
//       where: { leadId },
//       include: {
//         leadEmployee: true,
//       },
//     });
//   }
// async getTasksByEmployee(employeeId: number) {
//   const tasks = await prisma.leadEmployee.findMany({
//     where: { employeeId },
//     select: {
//       leadEmployeeId: true,
//       taskName: true,
//       deadline: true,
//       EstimatedDuration: true,
//       priority: true,
//       createdBy: true,

//       lead: {
//         select: {
//           leadId: true,
//           currentStage: true,
//           firstName: true,
//           lastName: true,
//         },
//       },
//     },
//     orderBy: {
//       deadline: "asc",
//     },
//   });

//   // Collect unique creator userIds
//   const creatorIds = Array.from(
//     new Set(tasks.map(t => t.createdBy).filter(Boolean))
//   ) as number[];

//   const users = await prisma.user.findMany({
//     where: {
//       userId: { in: creatorIds },
//     },
//     select: {
//       userId: true,
//       email: true,
//       role: true,
//     },
//   });

//   const userMap = Object.fromEntries(
//     users.map(u => [u.userId, u])
//   );

//   return tasks.map(task => ({
//     taskId: task.leadEmployeeId,
//     taskName: task.taskName,
//     dueDate: task.deadline,
//     estimatedDuration: task.EstimatedDuration,
//     priority: task.priority,
//     status: task.lead.currentStage,
//     lead: {
//       leadId: task.lead.leadId,
//       currentStage: task.lead.currentStage,
//       firstName: task.lead.firstName,
//       lastName: task.lead.lastName,
//     },
//     assignedBy: task.createdBy
//       ? userMap[task.createdBy]
//       : null,
//   }));
// }

//   async updateLead(
//     leadId: number,
//     data: any,
//     updatedBy: number
//   ) {
//     const { assigneeId, currentStage, ...leadData } = data;

//     return await prisma.$transaction(async (tx) => {

//       const existingLead = await tx.leadsDetail.findFirst({
//         where: {
//           leadId,
//           isDeleted: false,
//         },
//       });

//       if (!existingLead) {
//         throw new Error(`Lead with ID ${leadId} not found or deleted`);
//       }

//       if (assigneeId) {
//         const employeeExists = await tx.employeesDetail.findUnique({
//           where: { employeeId: assigneeId },
//         });

//         if (!employeeExists) {
//           throw new Error("Assignee employee does not exist");
//         }

//         await tx.leadEmployee.upsert({
//           where: {
//             leadId_employeeId: {
//               leadId,
//               employeeId: assigneeId,
//             },
//           },
//           update: {
//             employeeId: assigneeId,
//           },
//           create: {
//             leadId,
//             employeeId: assigneeId,
//             createdBy: updatedBy,
//           },
//         });
//       }

//       const updateData: any = {
//         ...leadData,
//         updatedBy,
//         updatedAt: new Date(),
//       };

//       if (currentStage) {
//         updateData.currentStage = currentStage as LeadStage;
//         updateData.status =
//           stageToKanbanMap[currentStage as LeadStage];
//       }

//       return await tx.leadsDetail.update({
//         where: { leadId },
//         data: updateData,
//       });
//     });
//   }



//   async deleteLead(leadId: number) {
//     return await prisma.leadsDetail.update({
//       where: { leadId },
//       data: {
//         isDeleted: true,
//         isActive: false,
//       },
//     });
//   }

//   async countLeadsByEmployeeWithInterval(employeeId: number, start: Date, end: Date) {
//     const totalLeads = await prisma.leadEmployee.count({
//       where: {
//         employeeId,
//         lead: {
//           updatedAt: {
//             gte: start,
//             lte: end,
//           },
//           isDeleted: false,
//         },
//       },
//     });
//     const finalizedLeads = await prisma.leadEmployee.count({
//       where: {
//         employeeId,
//         lead: {
//           currentStage: "Finalised",
//           isDeleted: false,
//         },
//       },
//     });
//     return { totalLeads, finalizedLeads };
//   }

//   async getAdminLeadStats(employeeId?: number) {
//     const total = await prisma.leadsDetail.count({
//       where: { isDeleted: false },
//     });
//     const completed = await prisma.leadsDetail.count({
//       where: { currentStage: "Finalised", isDeleted: false },
//     });
//     const ongoing = await prisma.leadsDetail.count({
//       where: { currentStage: { not: "Finalised" }, isDeleted: false },
//     });
//     //overdue leads
//     const today = new Date();
//   const overdue = await prisma.leadEmployee.count({
//     where: {
//       deadline: { lt: today },
//       lead: {
//         isDeleted: false,
//         currentStage: { not: "Finalised" },
//       },
//       ...(employeeId && { employeeId }),
//     },
//   });
//   //total task
//   const totalTasks = await prisma.leadEmployee.count({
//   where: {
//     lead: { isDeleted: false },
//     ...(employeeId && { employeeId }),
//   },
// });
// //completed task
// const completedTasks = await prisma.leadEmployee.count({
//   where: {
//     lead: {
//       currentStage: "Finalised",
//       isDeleted: false,
//     },
//     ...(employeeId && { employeeId }),
//   },
// });




//     let totalEarnings = 0;
//     if (employeeId) {
//       const invoices = await prisma.invoices.findMany({
//         where: {
//           lead: {
//             leadEmployee: {
//               some: { employeeId },
//             },
//           },
//           status: "Paid",
//         },
//         select: {
//           plan: true,
//           lead: {
//             select: {
//               leadEmployee: {
//                 where: { employeeId },
//                 select: {
//                   employee: { select: { commission: true } },
//                 },
//               },
//               budget: true,
//             },
//           },
//         },
//       });
//       invoices.forEach(inv => {
//         const commission =
//           inv.lead.leadEmployee[0]?.employee?.commission ?? 0;
//         const budget = Number(inv.lead.budget ?? 0);
//         totalEarnings += (budget * Number(commission)) / 100;
//       });
//     }

//     return { total, completed, ongoing, totalEarnings, overdue, totalTasks, completedTasks };
//   }

//   async countLeadsByUserMonthWise(
//     userId: number,
//     start?: Date,
//     end?: Date
//   ) {
//     const now = new Date();
//     const startDate = start ?? new Date(now.getFullYear(), 0, 1);
//     const endDate = end ?? new Date(now.getFullYear(), 11, 31, 23, 59, 59,999);
//     const user = await prisma.user.findUnique({
//       where: { userId },
//       select: { role: true },
//     });
//     if (!user) {
//       throw new Error("User not found");
//     }
//     let leads: LeadForStats[] = [];
//     if (user.role === "employee") {
//       leads = await prisma.leadEmployee.findMany({
//         where: {
//           employeeId: userId,
//           lead: {
//             isDeleted: false,
//             updatedAt: {
//               gte: startDate,
//               lte: endDate,
//             },
//             createdTime: {
//               gte: startDate,
//               lte: endDate,
//             },
//           },
//         },
//         select: {
//           lead: {
//             select: {
//               currentStage: true,
//               updatedAt: true,
//             },
//           },
//         },
//       });
//     }
//     if (user.role === "partner") {
//       const partnerLeads =
//         await prisma.leadsDetail.findMany({
//           where: {
//             createdBy: userId,
//             isDeleted: false,
//             updatedAt: {
//               gte: startDate,
//               lte: endDate,
//             },
//             createdTime: {
//               gte: startDate,
//               lte: endDate,
//             },
//           },
//           select: {
//             currentStage: true,
//             updatedAt: true,
//           },
//         });
//       leads = partnerLeads.map(lead => ({ lead }));
//     }
//     const monthStats: Record<
//       string,
//       { totalLeads: number; finalizedLeads: number }
//     > = {};
//     leads
//       .filter(l => l.lead.updatedAt !== null)
//       .forEach(l => {
//         const date = l.lead.updatedAt!;
//         const monthKey = `${date.getFullYear()}-${String(
//           date.getMonth() + 1
//         ).padStart(2, "0")}`;
//         if (!monthStats[monthKey]) {
//           monthStats[monthKey] = {
//             totalLeads: 0,
//             finalizedLeads: 0,
//           };
//         }
//         monthStats[monthKey].totalLeads += 1;
//         if (l.lead.currentStage === "Finalised") {
//           monthStats[monthKey].finalizedLeads += 1;
//         }
//       });
//     return Object.entries(monthStats).map(
//       ([month, stats]) => ({
//         month,
//         totalLeads: stats.totalLeads,
//         finalizedLeads: stats.finalizedLeads,
//       })
//     );
//   }
// async getLeadEarningsForPartner(userId: number) {
//   const leads = await prisma.leadsDetail.findMany({
//     where: { createdBy: userId, isDeleted: false },
//     select: {
//       leadId: true,
//       firstName: true,
//       lastName: true,
//       createdTime: true,
//       budget: true,
//       invoices: {
//         where: { status: "Paid" }, // only paid invoices
//         select: { status: true },
//         orderBy: { createdAt: "desc" },
//       },
//       leadEmployee: {
//         select: {
//           employee: { select: { commission: true } }
//         }
//       },
//     },
//   });

//   const results = leads.map(lead => {
//     const commission = Number(lead.leadEmployee[0]?.employee?.commission ?? 0);
//     const projectValue = Number(lead.budget ?? 0);
//     const earning = (projectValue * commission) / 100;

//     const status = lead.invoices.length > 0 ? "Paid" : "Unpaid";

//     return {
//       leadId: lead.leadId,
//       leadName: `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim(),
//       createdDate: lead.createdTime,
//       projectValue,
//       earning,
//       status,
//     };
//   });

//   const totalEarnings = results.reduce((sum, r) => sum + r.earning, 0);

//   return { results, totalEarnings };
// }

// async updateEmployeeOnly(leadId: number, employeeId: number) {
//   const assignment = await prisma.leadEmployee.findFirst({
//     where: { leadId },
//   });

//   if (!assignment) {
//     throw new Error("No assignment found for this lead");
//   }

//   return await prisma.leadEmployee.update({
//     where: { leadEmployeeId: assignment.leadEmployeeId },
//     data: { employeeId },
//   });
// }
// }
// export default new LeadsService();


import { LeadStage, PaymentStatus } from "@prisma/client";
import prisma from "../config/prisma";
import crypto from "crypto";
import { sendEmail } from "../util/emailService";
import { syncLeadToPrePostDb } from "./prePostLeadSyncService";

type LeadForStats = {
  lead: {
    currentStage: LeadStage;
    updatedAt: Date | null;
  };
};

type LeadForStatsNonNull = {
  lead: {
    currentStage: LeadStage;
    updatedAt: Date;
  };
};

/**
 * Computes gap-free sequential serial numbers per leadType for a set of leads.
 *
 * Uses a SQL window function (ROW_NUMBER PARTITION BY leadType ORDER BY leadId)
 * over ALL non-deleted leads so that if e.g. RAS-02 is deleted the next lead
 * correctly displays as RAS-02, not RAS-03.
 *
 * Returns a Map<leadId, displaySerialNumber> e.g. { 11 => "RAS-01", 36 => "LD-01" }
 */
async function computeDisplaySerials(leadIds: number[]): Promise<Map<number, string>> {
  if (leadIds.length === 0) return new Map();

  // Use a window function to rank ALL non-deleted leads by type, then filter to
  // only the ones we care about.  Works on PostgreSQL (Prisma default).
  const rows = await prisma.$queryRaw<{ lead_id: number; display_serial: string }[]>`
    SELECT
      sub.lead_id,
      CONCAT(
        COALESCE(sub."leadType", 'LD'),
        '-',
        LPAD(
          CAST(
            ROW_NUMBER() OVER (
              PARTITION BY COALESCE(sub."leadType", 'LD')
              ORDER BY sub.lead_id
            ) AS TEXT
          ),
          2,
          '0'
        )
      ) AS display_serial
    FROM leads_detail sub
    WHERE sub.is_deleted = false
  `;

  const map = new Map<number, string>();
  for (const row of rows) {
    // Only return entries for the leadIds we actually need
    if (leadIds.includes(Number(row.lead_id))) {
      map.set(Number(row.lead_id), row.display_serial);
    }
  }
  return map;
}


const stageToKanbanMap: Record<LeadStage, string> = {
  Lead: "To Do",
  callUp: "In Progress",
  Quotation: "In Progress",
  Confirmation: "In Review",
  Finalised: "Done",
};

export type LeadKanbanStatus =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Done";



class LeadsService {
  private normalizeLeadSerialNumber(value: unknown) {
    const serial = String(value || "").trim().toUpperCase();
    if (!serial) return "";
    if (serial.length > 20) {
      throw new Error("Lead ID must be 20 characters or fewer");
    }
    if (!/^[A-Z0-9][A-Z0-9/_-]*$/.test(serial)) {
      throw new Error("Lead ID can contain only letters, numbers, hyphen, underscore, or slash");
    }
    return serial;
  }

  private async syncLead(lead: any) {
    try {
      await syncLeadToPrePostDb(lead);
    } catch (error: any) {
      console.error("Pre/post lead sync failed:", error?.message || error);
    }
  }

  async createLead(data: any, createdBy: number) {
    const leadType = data.leadType || "LD";
    const { assigneeId, leadSerialNumber: requestedLeadSerialNumber, ...leadData } = data;
    const manualLeadSerialNumber = this.normalizeLeadSerialNumber(requestedLeadSerialNumber);

    const creator = await prisma.user.findUnique({
      where: { userId: createdBy },
      select: { role: true },
    });

    if (!creator) {
      throw new Error("Creator user not found");
    }

    if (manualLeadSerialNumber) {
      const duplicate = await prisma.leadsDetail.findFirst({
        where: {
          leadSerialNumber: manualLeadSerialNumber,
          isDeleted: false,
        },
        select: { leadId: true },
      });

      if (duplicate) {
        throw new Error(`Lead ID ${manualLeadSerialNumber} already exists`);
      }
    }

    let leadSerialNumber = manualLeadSerialNumber;
    if (!leadSerialNumber) {
      // Atomic auto-increment string sequence per leadType
      const sequence = await prisma.leadSequence.upsert({
        where: { id: leadType },
        update: { seqValue: { increment: 1 } },
        create: { id: leadType, seqValue: 1 },
      });
      leadSerialNumber = `${leadType}-${sequence.seqValue.toString().padStart(2, "0")}`;
    }

    const lead = await prisma.leadsDetail.create({
      data: {
        ...leadData,
        createdBy,
        currentStage: "Lead",
        status: stageToKanbanMap["Lead"],
        leadType,
        leadSerialNumber
      },
    });

    if (creator.role === "partner") {
      await prisma.leadEmployee.create({
        data: {
          leadId: lead.leadId,
          employeeId: createdBy,
          createdBy: createdBy,
        },
      });
    }

    if (creator.role === "admin" && assigneeId) {
      const employeeExists = await prisma.employeesDetail.findUnique({
        where: { employeeId: assigneeId },
      });

      if (!employeeExists) {
        throw new Error("Assignee employee does not exist");
      }

      await prisma.leadEmployee.create({
        data: {
          leadId: lead.leadId,
          employeeId: assigneeId,
          createdBy: createdBy,
        },
      });
      await prisma.leadsDetail.update({
        where: { leadId: lead.leadId },
        data: {
          status: "assigned",
        }
      })
    }

    const finalLead = await prisma.leadsDetail.findUnique({
      where: { leadId: lead.leadId },
      select: {
        leadId: true,
        firstName: true,
        lastName: true,
        email: true,
        contactNumber: true,
        address: true,
        eventType: true,
        leadSource: true,
        currentStage: true,
        createdTime: true,
        eventDate: true,
        priority: true,
        status: true,
        leadSerialNumber: true,
        leadEmployee: true,
      },
    });

    await this.syncLead(finalLead);

    return finalLead;
  }
  async bulkCreate(leads: any[], createdBy: number) {
    if (!Array.isArray(leads) || leads.length === 0) return [];

    const createdLeads = [];

    for (const lead of leads) {
      const { assigneeId, leadSerialNumber: requestedLeadSerialNumber, ...leadData } = lead;
      const leadType = leadData.leadType || "LD";
      const manualLeadSerialNumber = this.normalizeLeadSerialNumber(requestedLeadSerialNumber);

      if (manualLeadSerialNumber) {
        const duplicate = await prisma.leadsDetail.findFirst({
          where: {
            leadSerialNumber: manualLeadSerialNumber,
            isDeleted: false,
          },
          select: { leadId: true },
        });

        if (duplicate) {
          throw new Error(`Lead ID ${manualLeadSerialNumber} already exists`);
        }
      }

      let leadSerialNumber = manualLeadSerialNumber;
      if (!leadSerialNumber) {
        const sequence = await prisma.leadSequence.upsert({
          where: { id: leadType },
          update: { seqValue: { increment: 1 } },
          create: { id: leadType, seqValue: 1 },
        });
        leadSerialNumber = `${leadType}-${sequence.seqValue.toString().padStart(2, "0")}`;
      }

      const createdLead = await prisma.leadsDetail.create({
        data: {
          ...leadData,
          createdBy,
          currentStage: "Lead",
          status: stageToKanbanMap["Lead"],
          leadType,
          leadSerialNumber
        },
      });

      if (assigneeId) {
        const employeeExists = await prisma.employeesDetail.findUnique({
          where: { employeeId: assigneeId },
        });
        if (employeeExists) {
          await prisma.leadEmployee.create({
            data: {
              leadId: createdLead.leadId,
              employeeId: assigneeId,
              createdBy,
            },
          });
        }
      }

      await this.syncLead(createdLead);
      createdLeads.push(createdLead);
    }

    return createdLeads;
  }

  async assignEmployeeToLead(
    leadId: number,
    employeeId: number,
    adminId: number,
    data: any
  ) {
    console.log(adminId)
    await prisma.leadsDetail.update({
      where: { leadId },
      data: {
        status: "assigned",
      }
    })
    return await prisma.leadEmployee.create({
      data: {
        leadId,
        employeeId,
        createdBy: adminId,
        ...data,
        EstimatedDuration: data.EstimatedDuration
          ? Number(data.EstimatedDuration)
          : null
      }
    });
  }

  // async getAllLeads(
  //   page: number,
  //   limit: number,
  //   skip: number,
  //   search: string = ""
  // ) {
  //   const whereCondition: any = {
  //     isDeleted: false,
  //   };

  //   if (search) {
  //     whereCondition.OR = [
  //       { firstName: { contains: search, mode: "insensitive" } },
  //       { lastName: { contains: search, mode: "insensitive" } },
  //       { email: { contains: search, mode: "insensitive" } },
  //       { contactNumber: { contains: search, mode: "insensitive" } },
  //     ];
  //   }

  //   return await prisma.leadsDetail.findMany({
  //     where: whereCondition,
  //     orderBy: { leadId: "desc" },
  //     skip,
  //     take: limit,

  //     select: {
  //       leadId: true,
  //       firstName: true,
  //       lastName: true,
  //       email: true,
  //       contactNumber: true,
  //       eventType: true,
  //       eventDate: true,
  //       budget: true,
  //       leadSource: true,
  //       priority: true,
  //       currentStage: true,
  //       status: true,
  //       createdTime: true,
  //       address: true,
  //       createdByUser: {
  //         select: {
  //           userId: true,
  //           email: true,
  //           role: true,
  //         },
  //       },
  //       leadEmployee: {
  //         select: {
  //           leadEmployeeId: true,
  //           taskName: true,
  //           description: true,
  //           EstimatedDuration: true,
  //           priority: true,
  //           deadline: true,
  //           employee: {
  //             select: {
  //               employeeId: true,
  //               firstName: true,
  //               lastName: true,
  //               user: {
  //                 select: {
  //                   role: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  // }
  async getAllLeads(
    page: number,
    limit: number,
    skip: number,
    search: string = ""
  ): Promise<{ leads: any[]; total: number }> {
    const whereCondition: any = { isDeleted: false };

    if (search) {
      whereCondition.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { contactNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.leadsDetail.count({
      where: whereCondition,
    });

    const leads = await prisma.leadsDetail.findMany({
      where: whereCondition,
      orderBy: { leadId: "desc" },
      skip,
      take: limit,
      select: {
        leadId: true,
        firstName: true,
        lastName: true,
        email: true,
        contactNumber: true,
        leadSerialNumber: true,
        eventType: true,
        eventDate: true,
        budget: true,
        leadSource: true,
        priority: true,
        currentStage: true,
        status: true,
        createdTime: true,
        address: true,
        createdByUser: {
          select: { userId: true, email: true, role: true },
        },
        leadEmployee: {
          select: {
            leadEmployeeId: true,
            taskName: true,
            description: true,
            EstimatedDuration: true,
            priority: true,
            deadline: true,
            employee: {
              select: {
                employeeId: true,
                firstName: true,
                lastName: true,
                user: { select: { role: true } },
              },
            },
          },
        },
      },
    });

    const leadIds = leads.map(l => l.leadId);

    // invoices
    const invoices = await prisma.invoices.findMany({
      where: { leadId: { in: leadIds } },
      select: {
        leadId: true,
        packageInvoices: {
          select: {
            unit: true,
            package: { select: { price: true } },
          },
        },
        payments: {
          where: { status: PaymentStatus.VERIFIED },
          select: { paid: true },
        },
      },
    });

    // addons
    const addons = await prisma.leadAddon.findMany({
      where: { leadId: { in: leadIds } },
      select: { leadId: true, total: true },
    });

    // maps
    const paymentMap = new Map<number, { total: number; paid: number }>();

    invoices.forEach(inv => {
      const pkgTotal = inv.packageInvoices.reduce(
        (s, p) => s + Number(p.unit) * Number(p.package.price),
        0
      );

      const paid = inv.payments.reduce(
        (s, p) => s + Number(p.paid),
        0
      );

      const prev = paymentMap.get(inv.leadId) ?? { total: 0, paid: 0 };
      paymentMap.set(inv.leadId, {
        total: prev.total + pkgTotal,
        paid: prev.paid + paid,
      });
    });

    addons.forEach(a => {
      const prev = paymentMap.get(a.leadId) ?? { total: 0, paid: 0 };
      paymentMap.set(a.leadId, {
        total: prev.total + Number(a.total ?? 0),
        paid: prev.paid,
      });
    });

    const formattedLeads = leads.map(lead => {
      const p = paymentMap.get(lead.leadId);
      let paymentStatus: "Pending" | "Partial" | "Paid" | "N/A" = "N/A";

      if (p) {
        if (p.paid <= 0) paymentStatus = "Pending";
        else if (p.paid < p.total) paymentStatus = "Partial";
        else paymentStatus = "Paid";
      }

      return {
        ...lead,
        // Use the stored leadSerialNumber — kept up to date by deleteLead()
        paymentStatus,
      };
    });

    return {
      leads: formattedLeads,
      total
    };
  }



  async getLeadsByEmployeeId(employeeId: number) {
    return await prisma.leadsDetail.findMany({
      where: {
        isDeleted: false,
        leadEmployee: {
          some: {
            employeeId: employeeId,
          },
        },
      },

      select: {
        leadId: true,
        firstName: true,
        lastName: true,
        email: true,
        contactNumber: true,
        leadSerialNumber: true,
        currentStage: true,
        status: true,
        createdTime: true,

        createdByUser: {
          select: {
            userId: true,
            role: true,
          },
        },

        leadEmployee: {
          where: {
            employeeId: employeeId,
          },
          select: {
            leadEmployeeId: true,
            taskName: true,
            deadline: true,
            priority: true,
          },
        },
      },
    });
  }


  // async getLeadById(leadId: number) {
  //   return await prisma.leadsDetail.findUnique({
  //     where: { leadId },
  //     include: {
  //       leadEmployee: true,
  //     },
  //   });
  // }

  async getLeadById(leadId: number) {
    return await prisma.leadsDetail.findUnique({
      where: { leadId },
      include: {
        leadEmployee: true,
      },
    });
  }
  async getTasksByEmployee(employeeId: number) {
    const tasks = await prisma.leadEmployee.findMany({
      where: { employeeId },
      select: {
        leadEmployeeId: true,
        taskName: true,
        deadline: true,
        EstimatedDuration: true,
        priority: true,
        createdBy: true,

        lead: {
          select: {
            leadId: true,
            currentStage: true,
            firstName: true,
            lastName: true,
            leadSerialNumber: true,
            leadType: true,
            eventDate: true,
          },
        },
      },
      orderBy: {
        leadEmployeeId: "desc",
      },
    });

    // Collect unique creator userIds
    const creatorIds = Array.from(
      new Set(tasks.map(t => t.createdBy).filter(Boolean))
    ) as number[];

    const users = await prisma.user.findMany({
      where: {
        userId: { in: creatorIds },
      },
      select: {
        userId: true,
        email: true,
        role: true,
      },
    });

    const userMap = Object.fromEntries(
      users.map(u => [u.userId, u])
    );

    const taskLeadIds = tasks.map(t => t.lead.leadId).filter(Boolean) as number[];
    const displaySerialMap = await computeDisplaySerials(taskLeadIds);

    return tasks.map(task => ({
      taskId: task.leadEmployeeId,
      taskName: task.taskName,
      dueDate: task.deadline,
      estimatedDuration: task.EstimatedDuration,
      priority: task.priority,
      status: task.lead.currentStage,
      lead: {
        leadId: task.lead.leadId,
        currentStage: task.lead.currentStage,
        firstName: task.lead.firstName,
        lastName: task.lead.lastName,
        leadSerialNumber: displaySerialMap.get(task.lead.leadId) ?? task.lead.leadSerialNumber,
        leadType: task.lead.leadType,
        eventDate: task.lead.eventDate,
      },
      assignedBy: task.createdBy
        ? userMap[task.createdBy]
        : null,
    }));
  }

  async updateLead(
    leadId: number,
    data: any,
    updatedBy: number
  ) {
    // explicitly extract every allowed field — never blindly spread unknown body fields
    const {
      assigneeId,
      currentStage,
      budget,
      eventDate,
      firstName,
      lastName,
      email,
      contactNumber,
      address,
      eventType,
      leadSource,
      priority,
      description,
      leadFollowedBy,
      weddingDate,
      receptionDate,
    } = data;

    const updatedLead = await prisma.$transaction(async (tx) => {
      const existingLead = await tx.leadsDetail.findFirst({
        where: { leadId, isDeleted: false },
      });

      if (!existingLead) {
        throw new Error(`Lead with ID ${leadId} not found or deleted`);
      }

      if (assigneeId) {
        const employeeExists = await tx.employeesDetail.findUnique({
          where: { employeeId: assigneeId },
        });
        if (!employeeExists) {
          throw new Error("Assignee employee does not exist");
        }

        await tx.leadEmployee.upsert({
          where: {
            leadId_employeeId: { leadId, employeeId: assigneeId },
          },
          update: { employeeId: assigneeId },
          create: {
            leadId,
            employeeId: assigneeId,
            createdBy: isNaN(updatedBy) ? undefined : updatedBy,
          },
        });
      }

      // Build update payload with only known-valid Prisma fields
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Only include fields that were actually provided (not undefined)
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
      if (address !== undefined) updateData.address = address;
      if (eventType !== undefined) updateData.eventType = eventType;
      if (leadSource !== undefined) updateData.leadSource = leadSource;
      if (priority !== undefined) updateData.priority = priority;
      if (description !== undefined) updateData.description = description;
      if (leadFollowedBy !== undefined) updateData.leadFollowedBy = leadFollowedBy;

      // Safe updatedBy (must be a valid existing userId or omitted)
      if (!isNaN(updatedBy) && updatedBy > 0) {
        updateData.updatedBy = updatedBy;
      }

      // ✅ Coerce budget string → number for Prisma Decimal field
      if (budget !== undefined && budget !== null && budget !== '') {
        const parsedBudget = parseFloat(String(budget));
        if (!isNaN(parsedBudget)) {
          updateData.budget = parsedBudget;
        }
      }

      // ✅ Coerce eventDate string → Date for Prisma @db.Date field
      if (eventDate !== undefined && eventDate !== null && eventDate !== '') {
        const parsedDate = new Date(eventDate);
        if (!isNaN(parsedDate.getTime())) {
          updateData.eventDate = parsedDate;
        }
      }

      // ✅ Coerce weddingDate string → Date for Prisma @db.Date field
      if (weddingDate !== undefined && weddingDate !== null && weddingDate !== '') {
        const parsedDate = new Date(weddingDate);
        if (!isNaN(parsedDate.getTime())) {
          updateData.weddingDate = parsedDate;
        }
      }

      // ✅ Coerce receptionDate string → Date for Prisma @db.Date field
      if (receptionDate !== undefined && receptionDate !== null && receptionDate !== '') {
        const parsedDate = new Date(receptionDate);
        if (!isNaN(parsedDate.getTime())) {
          updateData.receptionDate = parsedDate;
        }
      }

      // ✅ stage update ONLY when provided
      if (currentStage !== undefined) {
        if (!Object.keys(stageToKanbanMap).includes(currentStage)) {
          throw new Error(`Invalid stage: ${currentStage}`);
        }
        updateData.currentStage = currentStage as LeadStage;
        updateData.status = stageToKanbanMap[currentStage as LeadStage];
      }

      return tx.leadsDetail.update({
        where: { leadId },
        data: updateData,
      });
    });

    await this.syncLead(updatedLead);
    return updatedLead;
  }
  async permanentDeleteLead(leadId: number) {
    // Fetch lead details before deletion to check its serial number
    const lead = await prisma.leadsDetail.findUnique({
      where: { leadId },
      select: { leadSerialNumber: true, leadType: true }
    });

    // Delete related events first because the schema doesn't have onDelete: Cascade for Events.leadId
    await prisma.events.deleteMany({
      where: { leadId }
    });

    const deleted = await prisma.leadsDetail.delete({
      where: { leadId },
    });

    // If this was the latest lead, decrement the sequence so the next one reuses the ID
    if (lead?.leadSerialNumber && lead?.leadType) {
      const parts = lead.leadSerialNumber.split('-');
      if (parts.length === 2) {
        const serialNum = parseInt(parts[1], 10);
        if (!isNaN(serialNum)) {
          const currentSeq = await prisma.leadSequence.findUnique({
            where: { id: lead.leadType }
          });
          if (currentSeq && currentSeq.seqValue === serialNum) {
            await prisma.leadSequence.update({
              where: { id: lead.leadType },
              data: { seqValue: { decrement: 1 } }
            });
          }
        }
      }
    }

    return deleted;
  }


  async deleteLead(leadId: number) {
    // Step 1: Fetch the lead's type AND current serial number before deleting
    const lead = await prisma.leadsDetail.findUnique({
      where: { leadId },
      select: { leadType: true, leadSerialNumber: true },
    });

    // Step 2: Soft-delete the lead and mark its serial as "(deleted)"
    const currentSerial = lead?.leadSerialNumber ?? `LD-${leadId}`;
    const deletedSerial = currentSerial.endsWith("(deleted)")
      ? currentSerial
      : `${currentSerial}(deleted)`;

    const deleted = await prisma.leadsDetail.update({
      where: { leadId },
      data: {
        isDeleted: true,
        isActive: false,
        leadSerialNumber: deletedSerial,
      },
    });

    // Step 3: Re-number all remaining leads of the same leadType in the DB
    if (lead?.leadType) {
      const leadType = lead.leadType;

      // Fetch remaining non-deleted leads ordered by leadId (creation order)
      const remainingLeads = await prisma.leadsDetail.findMany({
        where: {
          leadType,
          isDeleted: false,
        },
        select: { leadId: true },
        orderBy: { leadId: "asc" },
      });

      // Persist fresh sequential serial numbers
      for (let i = 0; i < remainingLeads.length; i++) {
        const newSerial = `${leadType}-${String(i + 1).padStart(2, "0")}`;
        await prisma.leadsDetail.update({
          where: { leadId: remainingLeads[i].leadId },
          data: { leadSerialNumber: newSerial },
        });
      }

      // Sync the sequence counter so the next new lead gets the right number
      await prisma.leadSequence.update({
        where: { id: leadType },
        data: { seqValue: remainingLeads.length },
      });
    }

    return deleted;
  }

  async countLeadsByEmployeeWithInterval(employeeId: number, start: Date, end: Date) {
    const totalLeads = await prisma.leadEmployee.count({
      where: {
        employeeId,
        lead: {
          updatedAt: {
            gte: start,
            lte: end,
          },
          isDeleted: false,
        },
      },
    });
    const finalizedLeads = await prisma.leadEmployee.count({
      where: {
        employeeId,
        lead: {
          currentStage: "Finalised",
          isDeleted: false,
        },
      },
    });
    return { totalLeads, finalizedLeads };
  }

  async getAdminLeadStats(employeeId?: number) {
    const total = await prisma.leadsDetail.count({
      where: { isDeleted: false },
    });
    const completed = await prisma.leadsDetail.count({
      where: { currentStage: "Finalised", isDeleted: false },
    });
    const ongoing = await prisma.leadsDetail.count({
      where: { currentStage: { not: "Finalised" }, isDeleted: false },
    });
    //overdue leads
    const today = new Date();
    const overdue = await prisma.leadEmployee.count({
      where: {
        deadline: { lt: today },
        lead: {
          isDeleted: false,
          currentStage: { not: "Finalised" },
        },
        ...(employeeId && { employeeId }),
      },
    });
    //total task
    const totalTasks = await prisma.leadEmployee.count({
      where: {
        lead: { isDeleted: false },
        ...(employeeId && { employeeId }),
      },
    });
    //completed task
    const completedTasks = await prisma.leadEmployee.count({
      where: {
        lead: {
          currentStage: "Finalised",
          isDeleted: false,
        },
        ...(employeeId && { employeeId }),
      },
    });




    let totalEarnings = 0;
    if (employeeId) {
      const invoices = await prisma.invoices.findMany({
        where: {
          lead: {
            leadEmployee: {
              some: { employeeId },
            },
          },
          status: "Paid",
        },
        select: {
          plan: true,
          lead: {
            select: {
              leadEmployee: {
                where: { employeeId },
                select: {
                  employee: { select: { commission: true } },
                },
              },
              budget: true,
            },
          },
        },
      });
      invoices.forEach(inv => {
        const commission =
          inv.lead.leadEmployee[0]?.employee?.commission ?? 0;
        const budget = Number(inv.lead.budget ?? 0);
        totalEarnings += (budget * Number(commission)) / 100;
      });
    }

    return { total, completed, ongoing, totalEarnings, overdue, totalTasks, completedTasks };
  }

  async countLeadsByUserMonthWise(
    userId: number,
    start?: Date,
    end?: Date
  ) {
    const now = new Date();
    const startDate = start ?? new Date(now.getFullYear(), 0, 1);
    const endDate =
      end ?? new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    // 1️⃣ Get user
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { role: true },
    });

    if (!user) throw new Error("User not found");

    type LeadStat = {
      createdAt: Date;
      currentStage: string;
    };

    let leads: LeadStat[] = [];

    // 2️⃣ EMPLOYEE / PARTNER (mapped as employee)
    if (user.role === "employee" || user.role === "partner") {
      const employee = await prisma.employeesDetail.findFirst({
        where: { userId, isDeleted: false },
        select: { employeeId: true },
      });

      if (employee) {
        const assignedLeads = await prisma.leadEmployee.findMany({
          where: {
            employeeId: employee.employeeId,
            lead: {
              isDeleted: false,
              createdTime: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          select: {
            lead: {
              select: {
                createdTime: true,
                currentStage: true,
              },
            },
          },
        });

        leads.push(
          ...assignedLeads.map(l => ({
            createdAt: l.lead.createdTime!,
            currentStage: l.lead.currentStage,
          }))
        );
      }
    }

    // 3️⃣ PARTNER CREATED LEADS
    if (user.role === "partner") {
      const createdLeads = await prisma.leadsDetail.findMany({
        where: {
          createdBy: userId,
          isDeleted: false,
          createdTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          createdTime: true,
          currentStage: true,
        },
      });

      leads.push(
        ...createdLeads.map(l => ({
          createdAt: l.createdTime!,
          currentStage: l.currentStage,
        }))
      );
    }

    // 4️⃣ Month bucket
    const monthStats: Record<
      string,
      { totalLeads: number; finalizedLeads: number }
    > = {};

    leads.forEach(lead => {
      const d = lead.createdAt;
      const monthKey = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthStats[monthKey]) {
        monthStats[monthKey] = {
          totalLeads: 0,
          finalizedLeads: 0,
        };
      }

      monthStats[monthKey].totalLeads += 1;

      if (lead.currentStage === "Finalised") {
        monthStats[monthKey].finalizedLeads += 1;
      }
    });

    // 5️⃣ Ensure all months exist
    const result: {
      month: string;
      totalLeads: number;
      finalizedLeads: number;
    }[] = [];

    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (cursor <= endDate) {
      const key = `${cursor.getFullYear()}-${String(
        cursor.getMonth() + 1
      ).padStart(2, "0")}`;

      result.push({
        month: key,
        totalLeads: monthStats[key]?.totalLeads ?? 0,
        finalizedLeads: monthStats[key]?.finalizedLeads ?? 0,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    return result;
  }

  async getLeadsAssignedToPartner(userId: number) {
    return prisma.$queryRawUnsafe(`
    (
      SELECT
        ld.lead_id,
        COALESCE(ld.first_name,'') || ' ' || COALESCE(ld.last_name,'') AS lead_name,
        ld.created_time AS created_at,
        'CREATED' AS source
      FROM leads_detail ld
      WHERE ld.created_by = $1
    )

    UNION

    (
      SELECT
        ld.lead_id,
        COALESCE(ld.first_name,'') || ' ' || COALESCE(ld.last_name,'') AS lead_name,
        le.created_at AS created_at,
        'ASSIGNED' AS source
      FROM lead_employee le
      JOIN employees_detail ed ON ed.employee_id = le.employee_id
      JOIN users u ON u.user_id = ed.user_id
      JOIN leads_detail ld ON ld.lead_id = le.lead_id
      WHERE u.role = 'partner'
        AND u.user_id = $1
    )

    ORDER BY created_at DESC
  `, userId);
  }

  async getPartnerAssignedLeads(partnerId: number) {
    return prisma.leadsDetail.findMany({
      where: {
        createdBy: partnerId,        // partner created
        isDeleted: false,
        leadEmployee: {
          some: {},                  // admin assigned
        },
      },
      orderBy: { leadId: "desc" },
      select: {
        leadId: true,
        leadSerialNumber: true,
        leadType: true,
        firstName: true,
        lastName: true,
        email: true,
        contactNumber: true,
        currentStage: true,
        status: true,
        createdTime: true,

        leadEmployee: {
          select: {
            leadEmployeeId: true,
            employee: {
              select: {
                employeeId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }



  async getLeadEarningsForPartner(userId: number) {
    // 1️⃣ Partner → employee
    const employee = await prisma.employeesDetail.findFirst({
      where: { userId, isDeleted: false },
      select: {
        employeeId: true,
        commission: true,
      },
    });

    if (!employee) {
      return { results: [], totalEarnings: 0 };
    }

    const commissionPercent = Number(employee.commission ?? 2);

    // 2️⃣ Admin users
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { userId: true },
    });
    const adminIds = admins.map(a => a.userId);

    if (!adminIds.length) {
      return { results: [], totalEarnings: 0 };
    }

    // 3️⃣ Fetch partner leads (admin assigned)
    const leads = await prisma.leadsDetail.findMany({
      where: {
        isDeleted: false,
        leadEmployee: {
          some: {
            employeeId: employee.employeeId,
            createdBy: { in: adminIds },
          },
        },
      },
      select: {
        leadId: true,
        leadSerialNumber: true,
        firstName: true,
        lastName: true,
        createdTime: true,
        budget: true,
        currentStage: true,
        eventType: true,
      },
    });

    const leadIds = leads.map(l => l.leadId);

    // 4️⃣ Fetch invoices (if any)
    const invoices = await prisma.invoices.findMany({
      where: { leadId: { in: leadIds } },
      select: {
        leadId: true,
        packageInvoices: {
          select: {
            unit: true,
            package: { select: { price: true } },
          },
        },
      },
    });

    // 5️⃣ Fetch addons
    const addons = await prisma.leadAddon.findMany({
      where: { leadId: { in: leadIds } },
      select: { leadId: true, total: true },
    });

    // 6️⃣ Build invoice total map
    const invoiceTotalMap = new Map<number, number>();

    invoices.forEach(inv => {
      const pkgTotal = inv.packageInvoices.reduce(
        (s, p) => s + Number(p.unit) * Number(p.package.price),
        0
      );
      invoiceTotalMap.set(inv.leadId, pkgTotal);
    });

    addons.forEach(a => {
      const prev = invoiceTotalMap.get(a.leadId) ?? 0;
      invoiceTotalMap.set(
        a.leadId,
        prev + Number(a.total ?? 0)
      );
    });

    // 7️⃣ Calculate earnings
    const results = leads.map(lead => {
      const invoiceTotal = invoiceTotalMap.get(lead.leadId);

      const projectValue =
        invoiceTotal !== undefined
          ? invoiceTotal
          : Number(lead.budget ?? 0);

      const earning =
        (projectValue * commissionPercent) / 100;

      return {
        leadId: lead.leadId,
        leadSerialNumber: lead.leadSerialNumber,
        leadName: `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim(),
        eventType: lead.eventType ?? null,
        createdDate: lead.createdTime,
        projectValue,
        commissionPercent,
        earning,
        status:
          lead.currentStage === "Finalised"
            ? "Paid"
            : "Pending",
        stage: lead.currentStage,
        assignedBy: "Admin",
      };
    });

    const totalEarnings = results.reduce(
      (sum, r) => sum + r.earning,
      0
    );

    return { results, totalEarnings };
  }

  async updateEmployeeOnly(leadId: number, employeeId: number) {
    const assignment = await prisma.leadEmployee.findFirst({
      where: { leadId },
    });

    if (!assignment) {
      throw new Error("No assignment found for this lead");
    }

    return await prisma.leadEmployee.update({
      where: { leadEmployeeId: assignment.leadEmployeeId },
      data: { employeeId },
    });
  }

  async getLeadsByStage(stage: any, page: number, limit: number, skip: number) {
    const whereCondition: any = {
      isDeleted: false,
      currentStage: stage,
    };

    const leads = await prisma.leadsDetail.findMany({
      where: whereCondition,
      orderBy: { leadId: "desc" },
      skip,
      take: limit,
      select: {
        leadId: true,
        firstName: true,
        lastName: true,
        email: true,
        contactNumber: true,
        eventType: true,
        eventDate: true,
        budget: true,
        leadSource: true,
        priority: true,
        currentStage: true,
        status: true,
        createdTime: true,
        address: true,
        createdByUser: {
          select: {
            userId: true,
            email: true,
            role: true,
          },
        },
        leadEmployee: {
          select: {
            leadEmployeeId: true,
            taskName: true,
            description: true,
            EstimatedDuration: true,
            priority: true,
            deadline: true,
            employee: {
              select: {
                employeeId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const total = await prisma.leadsDetail.count({
      where: whereCondition,
    });

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
  // async getTasksForPartner(partnerUserId: number) {
  //   const tasks = await prisma.leadEmployee.findMany({
  //     where: {
  //       lead: {
  //         createdBy: partnerUserId,
  //         isDeleted: false,
  //       },
  //     },
  //     select: {
  //       leadEmployeeId: true,
  //       taskName: true,
  //       description: true,
  //       deadline: true,
  //       EstimatedDuration: true,
  //       priority: true,
  //       createdBy: true,

  //       lead: {
  //         select: {
  //           leadId: true,
  //           currentStage: true,
  //           firstName: true,
  //           lastName: true,
  //         },
  //       },
  //     },
  //     orderBy: { deadline: "asc" },
  //   });

  //   // fetch users who assigned tasks
  //   const creatorIds = [...new Set(tasks.map(t => t.createdBy).filter(Boolean))] as number[];

  //   const users = await prisma.user.findMany({
  //     where: { userId: { in: creatorIds } },
  //     select: { userId: true, email: true, role: true },
  //   });

  //   const userMap = Object.fromEntries(users.map(u => [u.userId, u]));

  //   return tasks.map(task => ({
  //     taskId: task.leadEmployeeId,
  //     taskName: task.taskName,
  //     description: task.description,
  //     dueDate: task.deadline,
  //     estimatedDuration: task.EstimatedDuration,
  //     priority: task.priority,
  //     status: task.lead.currentStage,
  //     lead: {
  //       leadId: task.lead.leadId,
  //       firstName: task.lead.firstName,
  //       lastName: task.lead.lastName,
  //     },
  //     assignedBy: task.createdBy ? userMap[task.createdBy] : null,
  //   }));
  // }
  async getPartnerMyTasks(partnerUserId: number) {
    // 1️⃣ Partner → employee
    const employee = await prisma.employeesDetail.findFirst({
      where: {
        userId: partnerUserId,
        isDeleted: false,
      },
      select: { employeeId: true },
    });

    const getStatusFromStage = (currentStage?: string) => {
      switch (currentStage) {
        case "Lead":
          return "To Do";
        case "Quotation":
          return "In Progress";
        case "Confirmation":
          return "In Review";
        case "Finalised":
          return "Done";
        default:
          return "In Progress";
      }
    };

    if (!employee) return [];

    // 2️⃣ Admin users
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { userId: true, email: true, role: true },
    });

    const adminIds = admins.map(a => a.userId);
    const adminMap = Object.fromEntries(
      admins.map(a => [a.userId, a])
    );

    // 3️⃣ Fetch ONLY admin-assigned tasks to this partner
    const tasks = await prisma.leadEmployee.findMany({
      where: {
        employeeId: employee.employeeId,
        createdBy: { in: adminIds }, // ✅ ADMIN ASSIGNED ONLY
        lead: {
          isDeleted: false,
        },
      },
      select: {
        leadEmployeeId: true,
        taskName: true,
        description: true,
        deadline: true,
        EstimatedDuration: true,
        priority: true,
        createdBy: true,

        lead: {
          select: {
            leadId: true,
            firstName: true,
            lastName: true,
            email: true,
            contactNumber: true,
            budget: true,
            currentStage: true,
            status: true,
            createdTime: true,
          },
        },
      },
      orderBy: { deadline: "asc" },
    });

    // 4️⃣ Final formatted response
    return tasks.map(task => ({
      taskId: task.leadEmployeeId,
      taskName: task.taskName,
      description: task.description,
      dueDate: task.deadline,
      estimatedDuration: task.EstimatedDuration,
      priority: task.priority,

      lead: {
        leadId: task.lead.leadId,
        leadName: `${task.lead.firstName ?? ""} ${task.lead.lastName ?? ""}`.trim(),
        email: task.lead.email,
        contactNumber: task.lead.contactNumber,
        budget: task.lead.budget,
        currentStage: task.lead.currentStage,
        status: getStatusFromStage(task.lead.currentStage),
        createdAt: task.lead.createdTime,
      },

      assignedBy: adminMap[task.createdBy!] ?? null,
    }));
  }

  async getMyAssignedPartnerLeads(userId: number) {
    // helper: stage → status
    const getStatusFromStage = (currentStage?: string) => {
      switch (currentStage) {
        case "Lead":
          return "To Do";
        case "Quotation":
          return "In Progress";
        case "Confirmation":
          return "In Review";
        case "Finalised":
          return "Done";
        default:
          return "In Progress";
      }
    };

    // 1️⃣ map partner → employee
    const employee = await prisma.employeesDetail.findFirst({
      where: { userId, isDeleted: false },
      select: { employeeId: true },
    });

    if (!employee) return [];

    // 2️⃣ admin users
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { userId: true, email: true, role: true },
    });

    const adminIds = admins.map((a) => a.userId);

    const adminMap: Record<number, any> = Object.fromEntries(
      admins.map((a) => [a.userId, a])
    );

    // 3️⃣ FETCH LEADS
    const leads = await prisma.leadsDetail.findMany({
      where: {
        isDeleted: false,
        OR: [
          // ✔ Case 1 & 3 — Partner created (always visible)
          { createdBy: userId },

          // ✔ Case 2 — Admin created & assigned to this partner
          {
            createdBy: { in: adminIds },
            leadEmployee: {
              some: {
                employeeId: employee.employeeId,
                createdBy: { in: adminIds },
              },
            },
          },
        ],
      },
      select: {
        leadId: true,
        leadSerialNumber: true,
        firstName: true,
        lastName: true,
        createdTime: true,
        currentStage: true,
        status: true, // keep if needed, but we will override output
        createdBy: true,

        createdByUser: {
          select: {
            userId: true,
            email: true,
            role: true,
          },
        },

        leadEmployee: {
          where: {
            employeeId: employee.employeeId,
          },
          select: {
            leadEmployeeId: true,
            taskName: true,
            description: true,
            deadline: true,
            EstimatedDuration: true,
            priority: true,
            createdBy: true,
          },
        },
      },
      orderBy: { createdTime: "desc" },
    });

    // 4️⃣ FORMAT RESPONSE
    return leads.map((lead) => {
      const source = lead.createdBy === userId ? "CREATED" : "ASSIGNED";

      // ✅ derived status
      const derivedStatus = getStatusFromStage(lead.currentStage);

      return {
        leadId: lead.leadId,
        leadSerialNumber: lead.leadSerialNumber,
        leadName: `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim(),
        currentStage: lead.currentStage,

        // ✅ status shown based on stage
        status: derivedStatus,

        // REQUIRED FIELDS
        lead_id: lead.leadId,
        lead_serial_number: lead.leadSerialNumber,
        lead_name: `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim(),
        created_at: lead.createdTime,
        source,

        createdBy: lead.createdByUser,

        tasks: lead.leadEmployee.map((task) => ({
          taskId: task.leadEmployeeId,
          taskName: task.taskName,
          description: task.description,
          dueDate: task.deadline,
          estimatedDuration: task.EstimatedDuration,
          priority: task.priority,

          assignedBy:
            task.createdBy && adminMap[task.createdBy]
              ? adminMap[task.createdBy]
              : null,
        })),
      };
    });
  }

  async getLeadsByStages(stages: any[], page: number, limit: number, skip: number) {
    const whereCondition: any = {
      isDeleted: false,
      status: {
        in: stages,
      },
    };

    const leads = await prisma.leadsDetail.findMany({
      where: whereCondition,
      orderBy: { leadId: "desc" },
      skip,
      take: limit,
      select: {
        leadId: true,
        firstName: true,
        lastName: true,
        email: true,
        contactNumber: true,
        eventType: true,
        eventDate: true,
        budget: true,
        leadSource: true,
        priority: true,
        currentStage: true,
        status: true,
        createdTime: true,
        address: true,
        createdByUser: {
          select: {
            userId: true,
            email: true,
            role: true,
          },
        },
        leadEmployee: {
          select: {
            leadEmployeeId: true,
            taskName: true,
            description: true,
            EstimatedDuration: true,
            priority: true,
            deadline: true,
            employee: {
              select: {
                employeeId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const total = await prisma.leadsDetail.count({
      where: whereCondition,
    });

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
export default new LeadsService();
