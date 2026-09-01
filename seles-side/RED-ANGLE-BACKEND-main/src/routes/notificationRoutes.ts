import { Router } from "express";
import { notificationController } from "../controller/notificationController";
import { authenticateAny } from "../middleware/auth";

const notificationRoutes = Router();

/* ================= USER NOTIFICATIONS ================= */

notificationRoutes.get(
  "/",
  authenticateAny,
  notificationController.getNotifications
);

notificationRoutes.post(
  "/raw-data-approved",
  notificationController.createRawDataApprovedNotification
);

notificationRoutes.get(
  "/unread-count",
  authenticateAny,
  notificationController.getUnreadCount
);

notificationRoutes.get(
  "/issue-type/:issueType",
  authenticateAny,
  notificationController.getNotificationsByIssueType
);

/* ================= SINGLE ================= */

notificationRoutes.get(
  "/:notificationId",
  authenticateAny,
  notificationController.getNotification
);

notificationRoutes.patch(
  "/:notificationId/mark-read",
  authenticateAny,
  notificationController.markAsRead
);

notificationRoutes.patch(
  "/mark-all-read",
  authenticateAny,
  notificationController.markAllAsRead
);

notificationRoutes.delete(
  "/:notificationId",
  authenticateAny,
  notificationController.deleteNotification
);

export default notificationRoutes;
