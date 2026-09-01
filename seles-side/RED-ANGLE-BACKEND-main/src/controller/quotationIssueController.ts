import { Request, Response } from "express";
import quotationIssueService from "../services/quotationIssue";
import { PaginationQuery } from "../types/request";
import prisma from "../config/prisma";
import { notificationService } from "../services/notificationService";

class QuotationIssueController {
  /**
   * Create a new quotation issue
   * POST /quotation-issues
   */
  async create(req: Request, res: Response) {
    try {

      const issue = await quotationIssueService.quotationIssue(req.body);
      res.status(201).json({
        success: true,
        message: "Quotation issue created successfully",
        data: issue,
      });
    } catch (err: any) {
      console.error("Error creating quotation issue:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Failed to create quotation issue",
      });
    }
  }

  async createByToken(req: Request, res: Response) {
    try {
      const token = req.params.token as string;
      const { issueTitle, description } = req.body;

      const quotationLead = await prisma.quotationLead.findUnique({
        where: { token },
      });

      if (!quotationLead) {
        return res.status(404).json({
          success: false,
          message: "Invalid or expired quotation link",
        });
      }

      const issue = await quotationIssueService.quotationIssue({
        issueTitle,
        description,
        quotationLeadId: quotationLead.id,
        status: "Open",
      });

      // 🔔 Notify admin + assigned employees (non-blocking)
      notificationService
        .createQuotationQueryNotification({
          leadId: quotationLead.leadId,
          issueTitle,
          description,
        })
        .catch((err) =>
          console.error("[Notification] Failed to notify on client query:", err)
        );

      res.status(201).json({
        success: true,
        message: "Issue raised successfully",
        data: issue,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }


  /**
   * Get all issues for a quotation lead
   * GET /quotation-issues/lead/:quotationLeadId
   */
  async getIssuesByQuotationLead(req: Request, res: Response) {
    try {
      const quotationLeadId = Number(req.params.quotationLeadId);

      if (!quotationLeadId || quotationLeadId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid quotation lead ID is required",
        });
      }

      const issues = await quotationIssueService.getQuotationIssues(
        quotationLeadId
      );
      res.status(200).json({
        success: true,
        message: "Issues retrieved successfully",
        data: issues,
      });
    } catch (err: any) {
      console.error("Error fetching quotation issues:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to retrieve issues",
      });
    }
  }

  /**
   * Get a specific quotation issue by ID
   * GET /quotation-issues/:issueId
   */
  async getById(req: Request, res: Response) {
    try {
      const issueId = Number(req.params.issueId);

      if (!issueId || issueId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid issue ID is required",
        });
      }

      const issue = await quotationIssueService.getQuotationIssueById(issueId);
      res.status(200).json({
        success: true,
        message: "Issue retrieved successfully",
        data: issue,
      });
    } catch (err: any) {
      console.error("Error fetching quotation issue:", err);
      res.status(404).json({
        success: false,
        message: err.message || "Issue not found",
      });
    }
  }

  /**
   * Get all quotation issues with pagination and search
   * GET /quotation-issues
   */
  async getAll(
    req: Request<{}, {}, {}, PaginationQuery>,
    res: Response
  ) {
    try {
      const page = parseInt(String(req.query.page || "1"));
      const limit = parseInt(String(req.query.limit || "10"));
      const search = String(req.query.search || "");
      const skip = (page - 1) * limit;

      const result = await quotationIssueService.getQuotationIssuesWithPagination(
        limit,
        skip,
        search
      );

      res.status(200).json({
        success: true,
        message: "Quotation issues retrieved successfully",
        data: result,
      });
    } catch (err: any) {
      console.error("Error fetching quotation issues:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to retrieve quotation issues",
      });
    }
  }

  /**
   * Update a quotation issue
   * PUT /quotation-issues/:issueId
   */
  async update(req: Request, res: Response) {
    try {
      const issueId = Number(req.params.issueId);

      if (!issueId || issueId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid issue ID is required",
        });
      }

      const updatedIssue = await quotationIssueService.updateQuotationIssue(
        issueId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Issue updated successfully",
        data: updatedIssue,
      });
    } catch (err: any) {
      console.error("Error updating quotation issue:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Failed to update issue",
      });
    }
  }

  /**
   * Delete a quotation issue
   * DELETE /quotation-issues/:issueId
   */
  async delete(req: Request, res: Response) {
    try {
      const issueId = Number(req.params.issueId);

      if (!issueId || issueId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid issue ID is required",
        });
      }

      const deletedIssue = await quotationIssueService.deleteQuotationIssue(
        issueId
      );

      res.status(200).json({
        success: true,
        message: "Issue deleted successfully",
        data: deletedIssue,
      });
    } catch (err: any) {
      console.error("Error deleting quotation issue:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Failed to delete issue",
      });
    }
  }
}

export default new QuotationIssueController();
