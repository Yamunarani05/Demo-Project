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

  private async getNextLeadSerialNumber(leadType: string): Promise<string> {
    const cleanLeadType = (leadType || "LD").trim().toUpperCase();

    // Check highest numerical suffix among existing leads in leadsDetail
    const existingLeads = await prisma.leadsDetail.findMany({
      where: {
        leadSerialNumber: {
          startsWith: `${cleanLeadType}-`,
        },
      },
      select: { leadSerialNumber: true },
    });

    let maxSuffix = 0;
    for (const l of existingLeads) {
      if (l.leadSerialNumber) {
        const parts = l.leadSerialNumber.split("-");
        if (parts.length >= 2) {
          const num = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(num) && num > maxSuffix) {
            maxSuffix = num;
          }
        }
      }
    }

    const currentSeq = await prisma.leadSequence.findUnique({
      where: { id: cleanLeadType },
    });

    const seqFromTable = currentSeq?.seqValue ?? 0;
    const nextSeq = Math.max(seqFromTable, maxSuffix) + 1;

    await prisma.leadSequence.upsert({
      where: { id: cleanLeadType },
      update: { seqValue: nextSeq },
      create: { id: cleanLeadType, seqValue: nextSeq },
    });

    return `${cleanLeadType}-${nextSeq.toString().padStart(2, "0")}`;
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

    let validCreatedBy = Number(createdBy);
    let creatorRole = "admin";

    if (validCreatedBy && !isNaN(validCreatedBy)) {
      const creator = await prisma.user.findUnique({
        where: { userId: validCreatedBy },
        select: { role: true },
      });
      if (creator) {
        creatorRole = creator.role;
      } else {
        const defaultAdmin = await prisma.user.findFirst({
          where: { role: "admin" },
          select: { userId: true },
        });
        if (defaultAdmin) {
          validCreatedBy = defaultAdmin.userId;
        }
      }
    } else {
      const defaultAdmin = await prisma.user.findFirst({
        where: { role: "admin" },
        select: { userId: true },
      });
      if (defaultAdmin) {
        validCreatedBy = defaultAdmin.userId;
      }
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

    const cleanEmail = String(leadData.email || "").trim().toLowerCase();
    const rawPhone = String(leadData.contactNumber || "").trim();
    const cleanPhoneDigits = rawPhone.replace(/\D/g, "");

    if (cleanEmail || rawPhone) {
      const existingDuplicate = await prisma.leadsDetail.findFirst({
        where: {
          isDeleted: false,
          OR: [
            ...(cleanEmail ? [{ email: { equals: cleanEmail, mode: "insensitive" as const } }] : []),
            ...(rawPhone ? [{ contactNumber: { equals: rawPhone } }] : []),
            ...(cleanPhoneDigits && cleanPhoneDigits.length >= 10 && cleanPhoneDigits !== rawPhone ? [{ contactNumber: { contains: cleanPhoneDigits.slice(-10) } }] : []),
          ],
        },
        select: { leadId: true, email: true, contactNumber: true, leadSerialNumber: true },
      });

      if (existingDuplicate) {
        if (cleanEmail && existingDuplicate.email?.toLowerCase() === cleanEmail) {
          throw new Error(`A lead with email "${cleanEmail}" already exists (${existingDuplicate.leadSerialNumber || `ID ${existingDuplicate.leadId}`})`);
        }
        if (rawPhone && existingDuplicate.contactNumber) {
          throw new Error(`A lead with contact number "${rawPhone}" already exists (${existingDuplicate.leadSerialNumber || `ID ${existingDuplicate.leadId}`})`);
        }
      }
    }

    let leadSerialNumber = manualLeadSerialNumber;
    if (!leadSerialNumber) {
      leadSerialNumber = await this.getNextLeadSerialNumber(leadType);
    }

    const lead = await prisma.leadsDetail.create({
      data: {
        ...leadData,
        createdBy: validCreatedBy,
        currentStage: "Lead",
        status: leadData.status || stageToKanbanMap["Lead"] || "To Do",
        leadType,
        leadSerialNumber
      },
    });

    if (creatorRole === "partner") {
      await prisma.leadEmployee.create({
        data: {
          leadId: lead.leadId,
          employeeId: validCreatedBy,
          createdBy: validCreatedBy,
        },
      });
    }

    if (creatorRole === "admin" && assigneeId) {
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
          createdBy: validCreatedBy,
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
    if (!Array.isArray(leads) || leads.length === 0) return { createdLeads: [], errors: [] };

    // Verify the createdBy user exists, otherwise use default admin (ID 3)
    let validCreatedBy = createdBy;
    try {
      const userExists = await prisma.user.findUnique({
        where: { userId: createdBy },
      });

      // If user doesn't exist, try to use default admin
      if (!userExists) {
        console.warn(`User ${createdBy} not found, checking for default admin...`);
        const defaultAdmin = await prisma.user.findFirst({
          where: { role: 'admin' },
          select: { userId: true },
        });

        if (defaultAdmin) {
          validCreatedBy = defaultAdmin.userId;
          console.log(`Using default admin (ID: ${validCreatedBy}) for bulk create`);
        } else {
          throw new Error('No admin user found in database. Please run seed script first.');
        }
      }
    } catch (error: any) {
      console.error('Error verifying user:', error.message);
      throw new Error(`Failed to verify user: ${error.message}`);
    }

    const createdLeads = [];
    const errors: { rowIndex: number; error: string; data?: any }[] = [];
    const seenEmailsInBatch = new Set<string>();
    const seenPhonesInBatch = new Set<string>();

    for (let rowIndex = 0; rowIndex < leads.length; rowIndex++) {
      try {
        const lead = leads[rowIndex];

        // Validate required fields
        const missingFields = [];
        if (!lead.firstName) missingFields.push('firstName');
        if (!lead.email) missingFields.push('email');
        if (!lead.contactNumber) missingFields.push('contactNumber');

        if (missingFields.length > 0) {
          errors.push({
            rowIndex: rowIndex + 2, // +2 because row 1 is header, and 0-indexed
            error: `Missing required fields: ${missingFields.join(', ')}`,
            data: lead,
          });
          continue;
        }

        const cleanEmail = String(lead.email || "").trim().toLowerCase();
        const rawPhone = String(lead.contactNumber || "").trim();
        const cleanPhoneDigits = rawPhone.replace(/\D/g, "");

        // 1. Check duplicate within the same uploaded file
        if (cleanEmail && seenEmailsInBatch.has(cleanEmail)) {
          errors.push({
            rowIndex: rowIndex + 2,
            error: `Duplicate in file: Email "${cleanEmail}" was already processed in this batch`,
            data: lead,
          });
          continue;
        }
        if (rawPhone && seenPhonesInBatch.has(rawPhone)) {
          errors.push({
            rowIndex: rowIndex + 2,
            error: `Duplicate in file: Phone number "${rawPhone}" was already processed in this batch`,
            data: lead,
          });
          continue;
        }

        // 2. Check duplicate against existing leads in the database
        const existingDuplicate = await prisma.leadsDetail.findFirst({
          where: {
            isDeleted: false,
            OR: [
              ...(cleanEmail ? [{ email: { equals: cleanEmail, mode: "insensitive" as const } }] : []),
              ...(rawPhone ? [{ contactNumber: { equals: rawPhone } }] : []),
              ...(cleanPhoneDigits && cleanPhoneDigits.length >= 10 && cleanPhoneDigits !== rawPhone ? [{ contactNumber: { contains: cleanPhoneDigits.slice(-10) } }] : []),
            ],
          },
          select: { leadId: true, email: true, contactNumber: true, firstName: true, leadSerialNumber: true },
        });

        if (existingDuplicate) {
          let reason = "Email or Phone already exists";
          if (cleanEmail && existingDuplicate.email?.toLowerCase() === cleanEmail) {
            reason = `Email "${cleanEmail}" already exists in database (${existingDuplicate.leadSerialNumber || `ID ${existingDuplicate.leadId}`})`;
          } else if (rawPhone && existingDuplicate.contactNumber) {
            reason = `Phone number "${rawPhone}" already exists in database (${existingDuplicate.leadSerialNumber || `ID ${existingDuplicate.leadId}`})`;
          }

          errors.push({
            rowIndex: rowIndex + 2,
            error: `Duplicate: ${reason}`,
            data: lead,
          });
          continue;
        }

        // Mark as seen in this batch
        if (cleanEmail) seenEmailsInBatch.add(cleanEmail);
        if (rawPhone) seenPhonesInBatch.add(rawPhone);

        const {
          assigneeId,
          stages: rawStages,
          leadSerialNumber: requestedLeadSerialNumber,
          invoiceId,
          billNo,
          plan,
          invoiceStatus,
          totalAmount,
          stage,
          received80,
          packageDetails,
          weddingServices,
          deliverables,
          complementaryItems,
          addOns,
          engagement,
          wedding,
          reception,
          rituals,
          ...rawLeadData
        } = lead;

        let leadType = (rawLeadData.leadType || (requestedLeadSerialNumber && requestedLeadSerialNumber.includes('-') ? requestedLeadSerialNumber.split('-')[0] : "LD")).trim().toUpperCase();
        if (leadType !== "RAS" && leadType !== "LD") {
          leadType = "LD";
        }

        let manualLeadSerialNumber = "";
        try {
          manualLeadSerialNumber = this.normalizeLeadSerialNumber(requestedLeadSerialNumber);
        } catch {
          manualLeadSerialNumber = "";
        }

        let leadSerialNumber = "";
        if (manualLeadSerialNumber) {
          // Check if this serial number already exists in DB
          const alreadyExists = await prisma.leadsDetail.findFirst({
            where: {
              leadSerialNumber: manualLeadSerialNumber,
              isDeleted: false,
            },
            select: { leadId: true },
          });

          // If it exists or is just a pure number (like row number 1, 2, 3), allocate a new unique serial number
          if (alreadyExists || /^\d+$/.test(manualLeadSerialNumber)) {
            leadSerialNumber = await this.getNextLeadSerialNumber(leadType);
          } else {
            leadSerialNumber = manualLeadSerialNumber;
          }
        } else {
          leadSerialNumber = await this.getNextLeadSerialNumber(leadType);
        }

        // Stage mapping
        let currentStage: LeadStage = LeadStage.Lead;
        const inputStageStr = String(rawLeadData.currentStage || stage || '').trim().toLowerCase();
        if (inputStageStr === 'quotation') currentStage = LeadStage.Quotation;
        else if (inputStageStr === 'confirmation') currentStage = LeadStage.Confirmation;
        else if (inputStageStr === 'finalize' || inputStageStr === 'finalised') currentStage = LeadStage.Finalised;
        else if (inputStageStr === 'callup') currentStage = LeadStage.callUp;
        else if (inputStageStr === 'lead') currentStage = LeadStage.Lead;

        const status = stageToKanbanMap[currentStage] || "To Do";

        // Whitelist allowed fields for LeadsDetail model to prevent Prisma unknown argument errors
        const allowedFields = [
          'firstName', 'lastName', 'email', 'contactNumber', 'address',
          'eventType', 'leadSource', 'priority', 'budget', 'paidAmount',
          'discount', 'eventDate', 'weddingDate', 'receptionDate',
          'description', 'leadType', 'leadFollowedBy'
        ];

        const leadData: any = {};
        for (const field of allowedFields) {
          if (rawLeadData[field] !== undefined && rawLeadData[field] !== null) {
            leadData[field] = rawLeadData[field];
          }
        }

        // Convert string dates to Date objects if needed
        ['eventDate', 'weddingDate', 'receptionDate'].forEach((dateField) => {
          if (leadData[dateField]) {
            const parsedDate = new Date(leadData[dateField]);
            if (!isNaN(parsedDate.getTime())) {
              leadData[dateField] = parsedDate;
            } else {
              delete leadData[dateField];
            }
          }
        });

        // Always create a new lead to prevent erasing or overwriting existing leads!
        const createdLead = await prisma.leadsDetail.create({
          data: {
            ...leadData,
            createdBy: validCreatedBy,
            currentStage,
            status,
            leadType,
            leadSerialNumber,
          },
        });

        // Handle Invoice processing if invoice info provided
        const targetBillNo = billNo || invoiceId;
        if (targetBillNo || weddingServices || deliverables || complementaryItems || received80) {
          const invPlan = plan || packageDetails || 'Standard';
          const invTotal = totalAmount ? Number(totalAmount) : (leadData.budget ? Number(leadData.budget) : 0);
          const invPaid = leadData.paidAmount ? Number(leadData.paidAmount) : 0;
          const invDiscount = leadData.discount ? Number(leadData.discount) : 0;
          const invReceived80 = received80 ? Number(received80) : 0;
          const invBalance = invTotal - invPaid - invReceived80;

          // Split items into categories
          const parseList = (str: any) => {
            if (!str || str === '-' || str === 'None' || String(str).trim() === '') return [];
            return String(str)
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .map((name) => ({ name, quantity: 1 }));
          };

          const previewItems: { category: string; items: { name: string; quantity: number }[] }[] = [];
          const wedServices = parseList(weddingServices);
          if (wedServices.length > 0) previewItems.push({ category: 'WEDDING SERVICES', items: wedServices });
          const delivItems = parseList(deliverables);
          if (delivItems.length > 0) previewItems.push({ category: 'DELIVERABLES', items: delivItems });
          const compItems = parseList(complementaryItems);
          if (compItems.length > 0) previewItems.push({ category: 'COMPLEMENTARY', items: compItems });
          const addonItems = parseList(addOns);
          if (addonItems.length > 0) previewItems.push({ category: 'ADD-ONS', items: addonItems });

          const eventDateStr = leadData.eventDate ? new Date(leadData.eventDate).toLocaleDateString('en-GB') : '-';
          const previewEvents = [
            { title: 'EVENT NAME', value: leadData.eventType || 'Wedding' },
            { title: 'ENGAGEMENT', value: engagement || '-' },
            { title: 'WEDDING', value: wedding || eventDateStr },
            { title: 'RECEPTION', value: reception || eventDateStr },
            { title: 'RITUALS', value: rituals || '-' },
            { title: 'LOCATION', value: leadData.address || '-' },
          ];

          const qtyOverrides: Record<string, any> = {
            RECEIVED_80: invReceived80,
            OVERALL_OVERRIDE: invTotal,
            BALANCE_OVERRIDE: invBalance,
          };

          const totalPaid = invPaid + invReceived80;
          const finalBalance = Math.max(0, invTotal - invDiscount - totalPaid);
          const finalStatus = (invTotal > 0 && totalPaid >= invTotal - invDiscount) ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Pending');

          let safeBillNo = targetBillNo || undefined;
          if (targetBillNo) {
            const billExists = await prisma.invoices.findFirst({
              where: { billNo: targetBillNo },
            });
            if (billExists) {
              safeBillNo = undefined;
            }
          }

          const savedInvoice = await prisma.invoices.create({
            data: {
              leadId: createdLead.leadId,
              billNo: safeBillNo,
              billingDate: leadData.eventDate || new Date(),
              plan: invPlan,
              status: finalStatus,
              totalAmount: invTotal,
              paid: invPaid,
              discount: invDiscount,
              previewItems: previewItems.length > 0 ? previewItems : undefined,
              previewEvents,
              qtyOverrides,
              createdBy: validCreatedBy,
            },
          });

          if (!safeBillNo) {
            const generatedBillNo = `INV${savedInvoice.invoiceId}`;
            await prisma.invoices.update({
              where: { invoiceId: savedInvoice.invoiceId },
              data: { billNo: generatedBillNo },
            });
            savedInvoice.billNo = generatedBillNo;
          }

          // Automatically record Initial Advance and 80% Received as verified payments
          if (savedInvoice) {
            if (invPaid > 0) {
              await prisma.payments.create({
                data: {
                  leadId: createdLead.leadId,
                  invoiceId: savedInvoice.invoiceId,
                  amount: invTotal,
                  paid: invPaid,
                  balance: Math.max(0, invTotal - invDiscount - invPaid),
                  paymentType: 'UPI',
                  notes: 'Initial Advance Payment',
                  paymentDate: leadData.eventDate || new Date(),
                  status: 'VERIFIED' as any,
                }
              });
            }

            if (invReceived80 > 0) {
              await prisma.payments.create({
                data: {
                  leadId: createdLead.leadId,
                  invoiceId: savedInvoice.invoiceId,
                  amount: invTotal,
                  paid: invReceived80,
                  balance: finalBalance,
                  paymentType: 'UPI',
                  notes: '80% Payment Received',
                  paymentDate: leadData.eventDate || new Date(),
                  status: 'VERIFIED' as any,
                }
              });
            }
          }
        }

        // Handle stage tracking if provided
        const stages = rawStages || [];
        if (Array.isArray(stages) && stages.length > 0) {
          for (const stage of stages) {
            try {
              await prisma.leadStageTracker.create({
                data: {
                  leadId: createdLead.leadId,
                  stageName: stage.stageName,
                  status: stage.status || 'pending',
                  createdAt: new Date(),
                },
              });
            } catch (stageError) {
              console.warn(`Failed to create stage tracking for ${stage.stageName}:`, stageError);
            }
          }
        }

        let targetEmployeeId: number | null = assigneeId ? Number(assigneeId) : null;
        const empName = (
          leadData.leadFollowedBy ||
          lead.leadFollowedBy ||
          lead.assignedName ||
          lead.assigned_name ||
          lead.assignedEmployee ||
          lead.assignee ||
          ""
        ).trim();

        if (!targetEmployeeId && empName) {
          const parts = empName.split(" ");
          const fName = parts[0];
          const lName = parts.slice(1).join(" ");

          const matchedEmp = await prisma.employeesDetail.findFirst({
            where: {
              OR: [
                { firstName: { equals: fName, mode: "insensitive" } },
                { firstName: { contains: fName, mode: "insensitive" } },
                { lastName: { equals: lName || fName, mode: "insensitive" } },
              ],
              isDeleted: false,
            },
          });

          if (matchedEmp) {
            targetEmployeeId = matchedEmp.employeeId;
          } else {
            // Auto-create employee record if specified by name in bulk upload
            try {
              const newEmpUser = await prisma.user.create({
                data: {
                  uniqueId: `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  email: `${fName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}@redangle.com`,
                  passwordHash: 'dummy',
                  role: 'employee',
                },
              });
              const newEmp = await prisma.employeesDetail.create({
                data: {
                  userId: newEmpUser.userId,
                  firstName: fName,
                  lastName: lName || '',
                  position: 'Employee',
                  workLocation: 'Chennai',
                },
              });
              targetEmployeeId = newEmp.employeeId;
            } catch (e) {
              console.warn(`Could not auto-create employee for ${empName}:`, e);
            }
          }
        }

        if (targetEmployeeId) {
          const employeeExists = await prisma.employeesDetail.findUnique({
            where: { employeeId: targetEmployeeId },
          });
          if (employeeExists) {
            await prisma.leadEmployee.deleteMany({
              where: { leadId: createdLead.leadId },
            });
            await prisma.leadEmployee.create({
              data: {
                leadId: createdLead.leadId,
                employeeId: targetEmployeeId,
                createdBy: validCreatedBy,
                taskName: `Coverage for ${createdLead.firstName || ''} ${createdLead.lastName || ''}`.trim(),
                description: empName ? `Assigned to ${empName}` : undefined,
              },
            });
            await prisma.leadsDetail.update({
              where: { leadId: createdLead.leadId },
              data: { status: 'assigned', leadFollowedBy: empName || undefined },
            });
          }
        }

        await this.syncLead(createdLead);
        createdLeads.push(createdLead);
      } catch (error: any) {
        errors.push({
          rowIndex: rowIndex + 2,
          error: error?.message || 'Unknown error occurred',
          data: leads[rowIndex],
        });
      }
    }

    return { createdLeads, errors };
  }

  async assignEmployeeToLead(
    leadId: number,
    employeeId: number,
    adminId: number,
    data: any
  ) {
    await prisma.leadsDetail.update({
      where: { leadId },
      data: {
        status: "assigned",
      }
    });

    const parsedDeadline = data.deadline ? new Date(data.deadline) : null;

    return await prisma.leadEmployee.create({
      data: {
        leadId,
        employeeId,
        createdBy: adminId,
        taskName: data.taskName || "Assigned Task",
        priority: data.priority || "Medium",
        description: data.description || null,
        EstimatedDuration: data.EstimatedDuration
          ? Number(data.EstimatedDuration)
          : null,
        deadline: parsedDeadline && !isNaN(parsedDeadline.getTime()) ? parsedDeadline : null,
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
        leadFollowedBy: true,
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
        leadEmployee: {
          include: {
            employee: {
              select: {
                employeeId: true,
                firstName: true,
                lastName: true,
                contactNumber: true,
                position: true,
                user: {
                  select: {
                    email: true,
                    role: true,
                  },
                },
              },
            },
          },
          orderBy: {
            leadEmployeeId: "asc",
          },
        },
        events: true,
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
        status: true,
        stage: true,
        employee: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
          },
        },
        lead: {
          select: {
            leadId: true,
            currentStage: true,
            firstName: true,
            lastName: true,
            leadSerialNumber: true,
            leadType: true,
            eventDate: true,
            weddingDate: true,
            receptionDate: true,
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
      dueDate: task.deadline ?? task.lead?.eventDate ?? task.lead?.weddingDate ?? task.lead?.receptionDate ?? null,
      estimatedDuration: task.EstimatedDuration,
      priority: task.priority,
      status: task.status || (task.stage ? String(task.stage) : "assigned"),
      stage: task.stage || "Lead",
      lead: {
        leadId: task.lead.leadId,
        currentStage: task.lead.currentStage,
        firstName: task.lead.firstName,
        lastName: task.lead.lastName,
        leadSerialNumber: displaySerialMap.get(task.lead.leadId) ?? task.lead.leadSerialNumber,
        leadType: task.lead.leadType,
        eventDate: task.lead.eventDate ?? task.lead.weddingDate ?? task.lead.receptionDate ?? null,
        weddingDate: task.lead.weddingDate ?? null,
        receptionDate: task.lead.receptionDate ?? null,
      },
      assignee: {
        employeeId: task.employee.employeeId,
        firstName: task.employee.firstName,
        lastName: task.employee.lastName,
        fullName: `${task.employee.firstName} ${task.employee.lastName}`.trim(),
      },
      assignedBy: task.createdBy
        ? userMap[task.createdBy]
        : null,
    }));
  }

  async updateTaskStatus(
    taskId: number,
    data: { status?: string; stage?: any }
  ) {
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.stage !== undefined) updateData.stage = data.stage;

    return await prisma.leadEmployee.update({
      where: { leadEmployeeId: taskId },
      data: updateData,
      include: {
        lead: true,
        employee: true,
      },
    });
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

        const existingAssignment = await tx.leadEmployee.findFirst({
          where: { leadId, employeeId: assigneeId },
        });

        if (!existingAssignment) {
          await tx.leadEmployee.create({
            data: {
              leadId,
              employeeId: assigneeId,
              createdBy: isNaN(updatedBy) ? undefined : updatedBy,
            },
          });
        }
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
      return await prisma.leadEmployee.create({
        data: {
          leadId,
          employeeId,
          taskName: "Assigned Lead",
        },
      });
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
            eventDate: true,
            weddingDate: true,
            receptionDate: true,
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
      dueDate: task.deadline ?? task.lead?.eventDate ?? task.lead?.weddingDate ?? task.lead?.receptionDate ?? null,
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
