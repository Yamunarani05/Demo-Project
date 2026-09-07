import { LeadStage } from "@prisma/client";
import prisma from "../config/prisma";

export interface CallData {
  leadId: number;
  callTime?: Date;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  isTaken?: boolean;
}

export interface CallResponse {
  id: number;
  leadId: number;
  callTime: Date;
  startTime?: Date | null;
  endTime?: Date | null;
  notes?: string | null;
  isTaken: boolean;
  createdAt?: Date | null;
}

export class CallService {

  // --------------------------
  // CREATE CALL
  // --------------------------
  static async createCall(callData: any): Promise<CallResponse> {
    const { leadId, callTime, startTime, endTime, notes, isTaken } = callData;
    const lead=await prisma.leadsDetail.findUnique({ where: { leadId } });
    if(!lead){
      throw new Error("Lead not found");
    }
  
    await prisma.leadsDetail.update({
      where: { leadId },
      data: { status: LeadStage.callUp },
    });
    const call = await prisma.leadCall.create({
      data: {
        leadId,
        callTime: callTime || new Date(),
        startTime,
        endTime,
        notes,
        isTaken: isTaken || false,
      },
    });

    return {
      id: call.id,
      leadId: call.leadId,
      callTime: call.callTime,
      startTime: call.startTime,
      endTime: call.endTime,
      notes: call.notes,
      isTaken: call.isTaken,
      createdAt: call.createdAt,
    };
  }

  // --------------------------
  // GET CALL BY ID
  // --------------------------
  static async getCallById(callId: number): Promise<CallResponse | null> {
    const call = await prisma.leadCall.findUnique({
      where: { id: callId },
    });

    if (!call) return null;

    return {
      id: call.id,
      leadId: call.leadId,
      callTime: call.callTime,
      startTime: call.startTime,
      endTime: call.endTime,
      notes: call.notes,
      isTaken: call.isTaken,
      createdAt: call.createdAt,
    };
  }

  // --------------------------
  // GET CALLS BY LEAD ID
  // --------------------------
  static async getCallsByLeadId(leadId: number): Promise<CallResponse[]> {
    const calls = await prisma.leadCall.findMany({
      where: { leadId },
      orderBy: { callTime: "desc" },
    });

    return calls.map((call: any) => ({
      id: call.id,
      leadId: call.leadId,
      callTime: call.callTime,
      startTime: call.startTime,
      endTime: call.endTime,
      notes: call.notes,
      isTaken: call.isTaken,
      createdAt: call.createdAt,
    }));
  }

  // --------------------------
  // UPDATE CALL
  // --------------------------
  static async updateCall(
    callId: number,
    updateData: Partial<CallData>
  ): Promise<CallResponse> {
    const call = await prisma.leadCall.update({
      where: { id: callId },
      data: updateData,
    });

    return {
      id: call.id,
      leadId: call.leadId,
      callTime: call.callTime,
      startTime: call.startTime,
      endTime: call.endTime,
      notes: call.notes,
      isTaken: call.isTaken,
      createdAt: call.createdAt,
    };
  }

  // --------------------------
  // DELETE CALL
  // --------------------------
  static async deleteCall(callId: number): Promise<boolean> {
    await prisma.leadCall.delete({
      where: { id: callId },
    });
    return true;
  }

  // --------------------------
  // GET ALL CALLS FOR SPECIFIC LEAD WITH FILTERS
  // --------------------------
  static async getCallsForLead(
    leadId: number,
    filters?: {
      isTaken?: boolean;
      skip?: number;
      take?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<CallResponse[]> {
    const where: any = { leadId };

    if (filters?.isTaken !== undefined) {
      where.isTaken = filters.isTaken;
    }

    if (filters?.startDate || filters?.endDate) {
      where.callTime = {};
      if (filters.startDate) {
        where.callTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.callTime.lte = filters.endDate;
      }
    }

    const calls = await prisma.leadCall.findMany({
      where,
      orderBy: { callTime: "desc" },
      skip: filters?.skip || 0,
      take: filters?.take || undefined,
    });

    return calls.map((call: any) => ({
      id: call.id,
      leadId: call.leadId,
      callTime: call.callTime,
      startTime: call.startTime,
      endTime: call.endTime,
      notes: call.notes,
      isTaken: call.isTaken,
      createdAt: call.createdAt,
    }));
  }

  // --------------------------
  // GET CALL COUNT FOR SPECIFIC LEAD
  // --------------------------
  static async getCallCountForLead(
    leadId: number,
    isTaken?: boolean
  ): Promise<number> {
    const count = await prisma.leadCall.count({
      where: {
        leadId,
        ...(isTaken !== undefined && { isTaken }),
      },
    });

    return count;
  }

  // --------------------------
// GET LATEST REQUIREMENT NOTE FOR LEAD
// --------------------------
static async getLatestRequirementForLead(
  leadId: number
): Promise<CallResponse | null> {
  const call = await prisma.leadCall.findFirst({
    where: {
      leadId,
      isTaken: true,
      notes: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc", // ✅ THIS IS THE FIX
    },
  });

  if (!call) return null;

  return {
    id: call.id,
    leadId: call.leadId,
    callTime: call.callTime,
    startTime: call.startTime,
    endTime: call.endTime,
    notes: call.notes,
    isTaken: call.isTaken,
    createdAt: call.createdAt,
  };
}

  // --------------------------
  // GET PENDING CALLS FOR LEAD (Not taken)
  // --------------------------
  static async getPendingCallsForLead(leadId: number): Promise<CallResponse[]> {
    const calls = await prisma.leadCall.findMany({
      where: {
        leadId,
        isTaken: false,
      },
      orderBy: { callTime: "asc" },
    });

    return calls.map((call: any) => ({
      id: call.id,
      leadId: call.leadId,
      callTime: call.callTime,
      startTime: call.startTime,
      endTime: call.endTime,
      notes: call.notes,
      isTaken: call.isTaken,
      createdAt: call.createdAt,
    }));
  }

  // --------------------------
  // GET COMPLETED CALLS FOR LEAD (Taken)
  // --------------------------
  static async getCompletedCallsForLead(leadId: number): Promise<CallResponse[]> {
    const calls = await prisma.leadCall.findMany({
      where: {
        leadId,
        isTaken: true,
      },
      orderBy: { callTime: "desc" },
    });

    return calls.map((call: any) => ({
      id: call.id,
      leadId: call.leadId,
      callTime: call.callTime,
      startTime: call.startTime,
      endTime: call.endTime,
      notes: call.notes,
      isTaken: call.isTaken,
      createdAt: call.createdAt,
    }));
  }

  // --------------------------
  // MARK CALL AS TAKEN
  // --------------------------
  static async markCallAsTaken(callId: number): Promise<CallResponse> {
    const call = await prisma.leadCall.update({
      where: { id: callId },
      data: { isTaken: true },
    });

    return {
      id: call.id,
      leadId: call.leadId,
      callTime: call.callTime,
      startTime: call.startTime,
      endTime: call.endTime,
      notes: call.notes,
      isTaken: call.isTaken,
      createdAt: call.createdAt,
    };
  }
}
