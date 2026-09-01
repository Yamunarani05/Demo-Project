import prisma from "../config/prisma";
import { notificationService } from "./notificationService";

class QuotationIssueService {
  /**
   * Create a new quotation issue
   * @param data - Issue data with issueTitle, description, quotationLeadId, and status
   * @param userId - User ID of the person creating the issue
   */
  async quotationIssue(data: any) {
    try {
      const { issueTitle, description, quotationLeadId, status } = data;

      if (!issueTitle || !quotationLeadId) {
        throw new Error("Issue title and quotation lead ID are required");
      }

      // Verify quotation lead exists
      const quotationLead = await prisma.quotationLead.findUnique({
        where: { id: quotationLeadId },
        include: {
          quotation: true,
        },
      });

      if (!quotationLead) {
        throw new Error("Quotation lead not found");
      }
    
      const issue = await prisma.quotationLeadIssues.create({
  data: {
    issueTitle,
    description: description || null,
    quotationLeadId,
    status: status || "Open",
  },
});
if (quotationLead.quotation?.createdBy) {
        await notificationService.createUserNotification({
          issueType: "QuotationIssue",
          quotationIssueId: issue.id,
          userId: quotationLead.quotation.createdBy, // ✅ correct
          title: issueTitle,
          message: description || "",
        });
      }

      return issue;
    } catch (error) {
      console.error("Error creating quotation issue:", error);
      throw error;
    }
  }

  /**
   * Get all issues for a quotation lead
   * @param quotationLeadId - The quotation lead ID
   */
  async getQuotationIssues(quotationLeadId: number) {
    try {
      const issues = await prisma.quotationLeadIssues.findMany({
        where: { quotationLeadId },
        orderBy: { createdAt: "desc" },
      });
      return issues;
    } catch (error) {
      console.error("Error fetching quotation issues:", error);
      throw error;
    }
  }

  /**
   * Get a specific quotation issue by ID
   * @param issueId - The issue ID
   */
  async getQuotationIssueById(issueId: number) {
    try {
      const issue = await prisma.quotationLeadIssues.findUnique({
        where: { id: issueId },
        include: {
          quotationLead: {
            include: {
              lead: true,
              quotation: true,
            },
          },
        },
      });

      if (!issue) {
        throw new Error("Issue not found");
      }

      return issue;
    } catch (error) {
      console.error("Error fetching quotation issue:", error);
      throw error;
    }
  }

  /**
   * Update a quotation issue
   * @param issueId - The issue ID
   * @param data - Updated issue data
   */
  async updateQuotationIssue(issueId: number, data: any) {
    try {
      const { issueTitle, description, status } = data;

      const issue = await prisma.quotationLeadIssues.update({
        where: { id: issueId },
        data: {
          ...(issueTitle && { issueTitle }),
          ...(description && { description }),
          ...(status && { status }),
        },
      });

      return issue;
    } catch (error) {
      console.error("Error updating quotation issue:", error);
      throw error;
    }
  }

  /**
   * Delete a quotation issue
   * @param issueId - The issue ID
   */
  async deleteQuotationIssue(issueId: number) {
    try {
      const issue = await prisma.quotationLeadIssues.delete({
        where: { id: issueId },
      });

      return issue;
    } catch (error) {
      console.error("Error deleting quotation issue:", error);
      throw error;
    }
  }

  /**
   * Get issues with pagination and search
   * @param limit - Number of records per page
   * @param skip - Number of records to skip
   * @param search - Search term for issue title or description
   */
  async getQuotationIssuesWithPagination(
    limit: number,
    skip: number,
    search?: string
  ) {
    try {
      const whereCondition: any = {};

      if (search && search.trim()) {
        whereCondition.OR = [
          {
            issueTitle: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            status: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      const issues = await prisma.quotationLeadIssues.findMany({
        where: whereCondition,
        include: {
          quotationLead: {
            include: {
              lead: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  eventType: true,
                },
              },
              quotation: {
                select: {
                  serviceName: true,
                  price: true,
                },
              },
            },
          },
        },
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
      });

      const totalCount = await prisma.quotationLeadIssues.count({
        where: whereCondition,
      });

      return {
        issues,
        pagination: {
          total: totalCount,
          limit,
          skip,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching quotation issues with pagination:", error);
      throw error;
    }
  }
}

export default new QuotationIssueService();
