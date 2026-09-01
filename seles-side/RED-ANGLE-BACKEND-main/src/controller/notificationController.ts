import { Request, Response } from "express";
import { notificationService } from "../services/notificationService";
import { AuthenticatedRequest } from "../middleware/auth";


const getUserIdFromRequest = (req: AuthenticatedRequest): number | null => {
  return Number(req.admin?.id ?? req.partner?.id ?? req.employee?.id ?? null);
};

export const notificationController = {
  /* ================= GET ALL ================= */

  async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserIdFromRequest(req);
      const { isRead } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const filters: any = {};
      if (isRead !== undefined) {
        filters.isRead = isRead === "true";
      }

      const result = await notificationService.getNotifications(
        userId,
        filters
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getNotifications:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }
  },

  /* ================= UNREAD COUNT ================= */

  async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await notificationService.getUnreadCount(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getUnreadCount:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch unread count",
      });
    }
  },

  /* ================= GET SINGLE ================= */

  async getNotification(req: Request, res: Response) {
    try {
      const notificationId = Number(req.params.notificationId);

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "notificationId is required",
        });
      }

      const result = await notificationService.getNotificationById(
        notificationId
      );

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getNotification:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notification",
      });
    }
  },

  /* ================= MARK READ ================= */

  async markAsRead(req: Request, res: Response) {
    try {
      const notificationId = Number(req.params.notificationId);

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "notificationId is required",
        });
      }

      const result = await notificationService.markAsRead(notificationId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in markAsRead:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
      });
    }
  },

  /* ================= MARK ALL READ ================= */

  async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await notificationService.markAllAsRead(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in markAllAsRead:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
      });
    }
  },

  // 🔔 Create Raw Data Approved Notification (Triggered by client backend)
  async createRawDataApprovedNotification(req: Request, res: Response) {
    try {
      const { leadId, leadName, deliveryType } = req.body;
      if (!leadId) {
        return res.status(400).json({ success: false, message: "Missing leadId" });
      }

      await notificationService.createRawDataApprovedNotification({
        leadId: Number(leadId),
        leadName,
        deliveryType
      });

      res.status(200).json({ success: true, message: "Raw data approved notification created" });
    } catch (error) {
      console.error("Error in createRawDataApprovedNotification:", error);
      res.status(500).json({ success: false, message: "Failed to create notification" });
    }
  },

  /* ================= DELETE ================= */

  async deleteNotification(req: Request, res: Response) {
    try {
      const notificationId = Number(req.params.notificationId);

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "notificationId is required",
        });
      }

      const result = await notificationService.deleteNotification(
        notificationId
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in deleteNotification:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
      });
    }
  },

  /* ================= BY ISSUE TYPE ================= */

  async getNotificationsByIssueType(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const userId = getUserIdFromRequest(req);
      const { issueType } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (
        issueType !== "InvoiceIssue" &&
        issueType !== "QuotationIssue"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid issue type",
        });
      }

      const result =
        await notificationService.getNotificationsByIssueType(
          userId,
          issueType
        );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getNotificationsByIssueType:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }
  },
};
