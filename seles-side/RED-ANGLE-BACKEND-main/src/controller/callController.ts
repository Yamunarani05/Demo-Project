import { Request, Response } from "express";
import { CallService } from "../services/callService";

export class CallController {
  // --------------------------
  // CREATE CALL
  // --------------------------
  static async createCall(req: any, res: Response) {
    try {
      const { leadId, callTime, startTime, endTime, notes, isTaken } = req.body;

      if (!leadId) {
        return res.status(400).json({
          success: false,
          message: "leadId is required",
        });
      }

      const call = await CallService.createCall({
        leadId,
        callTime: callTime ? new Date(callTime) : undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        notes,
        isTaken,
      });

      res.status(201).json({
        success: true,
        data: call,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  static async getLatestRequirementForLead(req: Request, res: Response) {
  try {
    const leadId = Number(req.params.leadId);

    const call = await CallService.getLatestRequirementForLead(leadId);

    return res.status(200).json({
      success: true,
      data: call ? [call] : [],
      count: call ? 1 : 0,
    });
  } catch (error) {
    console.error("Failed to get latest requirement", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch latest requirement",
    });
  }
}

  // --------------------------
  // GET CALL BY ID
  // --------------------------
  static async getCallById(req: Request, res: Response) {
    try {
      const { callId } = req.params;

      if (!callId) {
        return res.status(400).json({
          success: false,
          message: "callId is required",
        });
      }

      const call = await CallService.getCallById(Number(callId));

      if (!call) {
        return res.status(404).json({
          success: false,
          message: "Call not found",
        });
      }

      res.status(200).json({
        success: true,
        data: call,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // --------------------------
  // GET ALL CALLS FOR SPECIFIC LEAD
  // --------------------------
  static async getCallsForLead(req: Request, res: Response) {
    try {
      const { leadId } = req.params;
      const { isTaken, skip, take, startDate, endDate } = req.query;

      if (!leadId) {
        return res.status(400).json({
          success: false,
          message: "leadId is required",
        });
      }

      const filters: any = {};

      if (isTaken !== undefined) {
        filters.isTaken = isTaken === "true";
      }

      if (skip) {
        filters.skip = Number(skip);
      }

      if (take) {
        filters.take = Number(take);
      }

      if (startDate) {
        filters.startDate = new Date(String(startDate));
      }

      if (endDate) {
        filters.endDate = new Date(String(endDate));
      }

      const calls = await CallService.getCallsForLead(Number(leadId), filters);

      res.status(200).json({
        success: true,
        data: calls,
        count: calls.length,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // --------------------------
  // GET ALL CALLS BY LEAD ID (Legacy)
  // --------------------------
  static async getCallsByLeadId(req: Request, res: Response) {
    try {
      const { leadId } = req.params;

      if (!leadId) {
        return res.status(400).json({
          success: false,
          message: "leadId is required",
        });
      }

      const calls = await CallService.getCallsByLeadId(Number(leadId));

      res.status(200).json({
        success: true,
        data: calls,
        count: calls.length,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // --------------------------
  // GET PENDING CALLS FOR LEAD
  // --------------------------
  static async getPendingCallsForLead(req: Request, res: Response) {
    try {
      const { leadId } = req.params;

      if (!leadId) {
        return res.status(400).json({
          success: false,
          message: "leadId is required",
        });
      }

      const calls = await CallService.getPendingCallsForLead(Number(leadId));

      res.status(200).json({
        success: true,
        data: calls,
        count: calls.length,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // --------------------------
  // GET COMPLETED CALLS FOR LEAD
  // --------------------------
  static async getCompletedCallsForLead(req: Request, res: Response) {
    try {
      const { leadId } = req.params;

      if (!leadId) {
        return res.status(400).json({
          success: false,
          message: "leadId is required",
        });
      }

      const calls = await CallService.getCompletedCallsForLead(Number(leadId));

      res.status(200).json({
        success: true,
        data: calls,
        count: calls.length,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // --------------------------
  // GET CALL COUNT FOR LEAD
  // --------------------------
  static async getCallCountForLead(req: Request, res: Response) {
    try {
      const { leadId } = req.params;
      const { isTaken } = req.query;

      if (!leadId) {
        return res.status(400).json({
          success: false,
          message: "leadId is required",
        });
      }

      const count = await CallService.getCallCountForLead(
        Number(leadId),
        isTaken ? isTaken === "true" : undefined
      );

      res.status(200).json({
        success: true,
        data: { leadId: Number(leadId), count },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // --------------------------
  // UPDATE CALL
  // --------------------------
  static async updateCall(req: Request, res: Response) {
    try {
      const { callId } = req.params;
      const { callTime, notes, isTaken } = req.body;

      if (!callId) {
        return res.status(400).json({
          success: false,
          message: "callId is required",
        });
      }

      const updateData: any = {};

      if (callTime !== undefined) {
        updateData.callTime = new Date(callTime);
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      if (isTaken !== undefined) {
        updateData.isTaken = isTaken;
      }

      const call = await CallService.updateCall(Number(callId), updateData);

      res.status(200).json({
        success: true,
        data: call,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // --------------------------
  // MARK CALL AS TAKEN
  // --------------------------
  static async markCallAsTaken(req: Request, res: Response) {
    try {
      const { callId } = req.params;

      if (!callId) {
        return res.status(400).json({
          success: false,
          message: "callId is required",
        });
      }

      const call = await CallService.markCallAsTaken(Number(callId));

      res.status(200).json({
        success: true,
        data: call,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }

  // --------------------------
  // DELETE CALL
  // --------------------------
  static async deleteCall(req: Request, res: Response) {
    try {
      const { callId } = req.params;

      if (!callId) {
        return res.status(400).json({
          success: false,
          message: "callId is required",
        });
      }

      await CallService.deleteCall(Number(callId));

      res.status(200).json({
        success: true,
        message: "Call deleted successfully",
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
}
