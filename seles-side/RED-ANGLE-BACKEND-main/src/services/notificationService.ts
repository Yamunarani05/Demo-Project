import prisma from "../config/prisma";

/* ================= TYPES ================= */

export interface CreateUserNotificationInput {
  issueType:
  | "InvoiceIssue"
  | "QuotationIssue"
  | "InvoiceStatus"
  | "QuotationStatus";
  invoiceIssueId?: number;
  quotationIssueId?: number;
  userId: number;
  title: string;
  message?: string;
}

export interface CreateEmployeeNotificationInput {
  issueType: "InvoiceIssue" | "QuotationIssue";
  invoiceIssueId?: number;
  quotationIssueId?: number;
  employeeId: number;
  title: string;
  message?: string;
}

export interface NotificationFilter {
  isRead?: boolean;
}

/* ================= SERVICE ================= */

export interface CreateLeadAssignmentNotificationInput {
  employeeId: number;
  leadId: number;
  leadName?: string;
  taskName?: string;
}

export const notificationService = {
  /* ========= CREATE ========= */

  // 🔔 LEAD ASSIGNMENT notification (sent to the assigned employee)
  async createLeadAssignmentNotification(
    data: CreateLeadAssignmentNotificationInput
  ) {
    try {
      // We need the employee's userId so the getNotifications query (which filters by userId) picks it up
      const employee = await prisma.employeesDetail.findUnique({
        where: { employeeId: data.employeeId },
        select: { userId: true, firstName: true, lastName: true },
      });

      if (!employee?.userId) {
        console.warn(
          `[Notification] Employee ${data.employeeId} has no linked userId — skipping notification`
        );
        return;
      }

      const leadLabel = data.leadName ? `"${data.leadName}"` : `#${data.leadId}`;
      const taskLabel = data.taskName ? ` (Task: ${data.taskName})` : "";

      await prisma.notification.create({
        data: {
          userId: employee.userId,
          issueType: "LeadAssignment",
          title: `New lead assigned to you`,
          message: `You have been assigned to lead ${leadLabel}${taskLabel}. Check your tasks for details.`,
          isRead: false,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating lead assignment notification:", error);
      // Don't re-throw — notification failure should not break the assignment
    }
  },

  // 🔔 USER notification (Admin / Partner / Employee)
  async createUserNotification(data: CreateUserNotificationInput) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          issueType: data.issueType,
          invoiceIssueId: data.invoiceIssueId ?? null,
          quotationIssueId: data.quotationIssueId ?? null,
          title: data.title,
          message: data.message ?? null,
        },
      });

      return { success: true, data: notification };
    } catch (error) {
      console.error("Error creating user notification:", error);
      throw error;
    }
  },

  // 🔔 NEW LEAD notification (sent to all admins when a lead is created)
  async createNewLeadNotification(data: {
    leadId: number;
    leadName?: string;
    source?: string;
  }) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: "admin" },
        select: { userId: true },
      });

      if (admins.length === 0) return;

      const leadLabel = data.leadName ? `"${data.leadName}"` : `#${data.leadId}`;
      const sourceLabel = data.source ? ` via ${data.source}` : "";

      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.userId,
          issueType: "LeadAssignment",
          title: "New lead added",
          message: `A new lead ${leadLabel} has been added${sourceLabel}. Assign an employee to get started.`,
          isRead: false,
        })),
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating new lead notification:", error);
    }
  },

  // 🔔 QUOTATION SENT notification (sent to all admins)
  async createQuotationSentNotification(data: {
    leadId: number;
    leadName?: string;
    quotationId: number;
    sentByName?: string;
  }) {
    try {
      // Find all admin user IDs
      const admins = await prisma.user.findMany({
        where: { role: "admin" },
        select: { userId: true },
      });

      if (admins.length === 0) {
        console.warn("[Notification] No admin users found — skipping quotation sent notification");
        return;
      }
      console.log("[DEBUG QuotationSent] admin userIds:", admins.map(a => a.userId));

      const leadLabel = data.leadName ? `"${data.leadName}"` : `#${data.leadId}`;
      const sentBy = data.sentByName ? ` by ${data.sentByName}` : "";

      const result = await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.userId,
          issueType: "QuotationSent",
          title: "Quotation sent to client",
          message: `A quotation has been sent to lead ${leadLabel}${sentBy}. Review it in the quotations section.`,
          isRead: false,
        })),
      });
      console.log("[DEBUG QuotationSent] notifications created:", result);

      return { success: true };
    } catch (error) {
      console.error("Error creating quotation sent notification:", error);
      // Don't re-throw — notification failure should not break the send flow
    }
  },

  // 🔔 QUOTATION RESPONSE notification (client accepted or rejected)
  async createQuotationResponseNotification(data: {
    quotationLeadId: number;
    leadId: number;
    leadName?: string;
    status: "approved" | "rejected";
  }) {
    try {
      const actionLabel = data.status === "approved" ? "accepted" : "rejected";
      const leadLabel = data.leadName ? `"${data.leadName}"` : `#${data.leadId}`;
      const title = `Client ${actionLabel} the quotation`;
      const message = `The client for lead ${leadLabel} has ${actionLabel} the quotation. Please review and take next steps.`;

      // Collect all admin userIds
      const admins = await prisma.user.findMany({
        where: { role: "admin" },
        select: { userId: true },
      });

      // Collect assigned employee userIds for this lead
      const assignments = await prisma.leadEmployee.findMany({
        where: { leadId: data.leadId },
        include: { employee: { select: { userId: true } } },
      });
      const employeeUserIds = assignments
        .map((a) => a.employee.userId)
        .filter((uid): uid is number => uid !== null);

      // Merge unique userIds (admin + employee)
      const allAdminIds = admins.map((a) => a.userId);
      const uniqueUserIds = [...new Set([...allAdminIds, ...employeeUserIds])];

      if (uniqueUserIds.length === 0) return;

      await prisma.notification.createMany({
        data: uniqueUserIds.map((userId) => ({
          userId,
          issueType: "QuotationStatus",
          title,
          message,
          isRead: false,
        })),
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating quotation response notification:", error);
    }
  },

  // 🔔 QUOTATION QUERY notification (client raised an issue/query)
  async createQuotationQueryNotification(data: {
    leadId: number;
    leadName?: string;
    issueTitle: string;
    description?: string;
  }) {
    try {
      const leadLabel = data.leadName ? `"${data.leadName}"` : `#${data.leadId}`;
      const title = `Client raised a quotation issue`;
      const descPart = data.description ? `\nDetails: ${data.description}` : "";
      const message = `The client for lead ${leadLabel} raised an issue.\n\nIssue: "${data.issueTitle}"${descPart}\n\nPlease review and respond.`;

      // All admins
      const admins = await prisma.user.findMany({
        where: { role: "admin" },
        select: { userId: true },
      });

      // Assigned employees for this lead
      const assignments = await prisma.leadEmployee.findMany({
        where: { leadId: data.leadId },
        include: { employee: { select: { userId: true } } },
      });
      const employeeUserIds = assignments
        .map((a) => a.employee.userId)
        .filter((uid): uid is number => uid !== null);

      const allAdminIds = admins.map((a) => a.userId);
      const uniqueUserIds = [...new Set([...allAdminIds, ...employeeUserIds])];

      if (uniqueUserIds.length === 0) return;

      await prisma.notification.createMany({
        data: uniqueUserIds.map((userId) => ({
          userId,
          issueType: "QuotationIssue",
          title,
          message,
          isRead: false,
        })),
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating quotation query notification:", error);
    }
  },

  // 🔔 INVOICE READY notification (sent to all admins after client approves quotation)
  async createInvoiceReadyNotification(data: {
    leadId: number;
    leadName?: string;
  }) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: "admin" },
        select: { userId: true },
      });

      if (admins.length === 0) return;

      const leadLabel = data.leadName ? `"${data.leadName}"` : `#${data.leadId}`;

      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.userId,
          issueType: "InvoiceStatus",
          title: "Invoice is ready",
          message: `The client for lead ${leadLabel} has accepted the quotation. The invoice is ready to be issued.`,
          isRead: false,
        })),
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating invoice ready notification:", error);
    }
  },

  // 🔔 INVOICE SENT notification (sent to assigned employees when admin sends invoice to client)
  async createInvoiceSentNotification(data: {
    invoiceId: number;
    clientName?: string;
  }) {
    try {
      // Fetch the invoice to get the leadId
      const invoice = await prisma.invoices.findUnique({
        where: { invoiceId: data.invoiceId },
        select: { leadId: true },
      });

      if (!invoice) return;

      // Get assigned employees for this lead
      const assignments = await prisma.leadEmployee.findMany({
        where: { leadId: invoice.leadId },
        include: { employee: { select: { userId: true } } },
      });

      const employeeUserIds = assignments
        .map((a) => a.employee.userId)
        .filter((uid): uid is number => uid !== null);

      if (employeeUserIds.length === 0) return;

      const clientLabel = data.clientName ? `"${data.clientName}"` : "the client";

      await prisma.notification.createMany({
        data: employeeUserIds.map((userId) => ({
          userId,
          issueType: "InvoiceStatus",
          title: "Invoice sent to client",
          message: `An invoice has been sent to ${clientLabel}. Please follow up and track payment status.`,
          isRead: false,
        })),
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating invoice sent notification:", error);
    }
  },

  // 🔔 INVOICE RESPONSE notification (client accepted or rejected the invoice)
  async createInvoiceResponseNotification(data: {
    invoiceId: number;
    leadId: number;
    leadName?: string;
    status: "approved" | "rejected";
  }) {
    try {
      const actionLabel = data.status === "approved" ? "accepted" : "rejected";
      const leadLabel = data.leadName ? `"${data.leadName}"` : `#${data.leadId}`;
      const title = `Client ${actionLabel} the invoice`;
      const message = `The client for lead ${leadLabel} has ${actionLabel} the invoice. Please review and take next steps.`;

      const admins = await prisma.user.findMany({
        where: { role: "admin" },
        select: { userId: true },
      });

      const assignments = await prisma.leadEmployee.findMany({
        where: { leadId: data.leadId },
        include: { employee: { select: { userId: true } } },
      });
      const employeeUserIds = assignments
        .map((a) => a.employee.userId)
        .filter((uid): uid is number => uid !== null);

      const uniqueUserIds = [...new Set([...admins.map((a) => a.userId), ...employeeUserIds])];
      if (uniqueUserIds.length === 0) return;

      await prisma.notification.createMany({
        data: uniqueUserIds.map((userId) => ({
          userId,
          issueType: "InvoiceStatus",
          title,
          message,
          isRead: false,
        })),
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating invoice response notification:", error);
    }
  },

  // 🔔 INVOICE QUERY notification (client raised an issue on the invoice)
  async createInvoiceQueryNotification(data: {
    invoiceId: number;
    leadId: number;
    leadName?: string;
    issueTitle: string;
    description?: string;
  }) {
    try {
      const leadLabel = data.leadName ? `"${data.leadName}"` : `#${data.leadId}`;
      const title = `Client raised an invoice issue`;
      const descPart = data.description ? `\nDetails: ${data.description}` : "";
      const message = `The client for lead ${leadLabel} raised an issue.\n\nIssue: "${data.issueTitle}"${descPart}\n\nPlease review and respond.`;

      const admins = await prisma.user.findMany({
        where: { role: "admin" },
        select: { userId: true },
      });

      const assignments = await prisma.leadEmployee.findMany({
        where: { leadId: data.leadId },
        include: { employee: { select: { userId: true } } },
      });
      const employeeUserIds = assignments
        .map((a) => a.employee.userId)
        .filter((uid): uid is number => uid !== null);

      const uniqueUserIds = [...new Set([...admins.map((a) => a.userId), ...employeeUserIds])];
      if (uniqueUserIds.length === 0) return;

      await prisma.notification.createMany({
        data: uniqueUserIds.map((userId) => ({
          userId,
          issueType: "InvoiceIssue",
          title,
          message,
          isRead: false,
        })),
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating invoice query notification:", error);
    }
  },

  // 🔔 LEAD FINALISED notification (sent to all admins when employee completes lead → pre-production)
  async createLeadFinalisedNotification(data: {
    leadId: number;
    leadName?: string;
    employeeName?: string;
  }) {
    try {
      const admins = await prisma.user.findMany({
        where: { role: "admin" },
        select: { userId: true },
      });

      if (admins.length === 0) return;

      const leadLabel = data.leadName ? `"${data.leadName}"` : `#${data.leadId}`;
      const byLabel = data.employeeName ? ` by ${data.employeeName}` : "";

      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.userId,
          issueType: "LeadAssignment",
          title: "Project sent to pre-production",
          message: `Lead ${leadLabel} has been completed and sent to pre-production${byLabel}. Please review and proceed.`,
          isRead: false,
        })),
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating lead finalised notification:", error);
    }
  },

  // 🔔 RAW DATA APPROVED notification (sent to editors, CRM, media team, and admins)
  async createRawDataApprovedNotification(data: {
    leadId: number;
    leadName?: string;
    deliveryType?: string;
  }) {
    try {
      const employees = await prisma.employeesDetail.findMany({
        where: {
          OR: [
            { position: { contains: "editor", mode: "insensitive" } },
            { position: { contains: "crm", mode: "insensitive" } },
            { position: { contains: "media", mode: "insensitive" } },
          ],
          userId: { not: null },
        },
        select: { userId: true },
      });

      const admins = await prisma.user.findMany({
        where: { role: "admin" },
        select: { userId: true },
      });

      const userIds = [
        ...employees.map(e => e.userId as number),
        ...admins.map(a => a.userId)
      ];

      const uniqueUserIds = [...new Set(userIds)];
      if (uniqueUserIds.length === 0) return;

      const leadLabel = data.leadName ? `"${data.leadName}"` : `#${data.leadId}`;
      const typeLabel = data.deliveryType === 'EVENT_RAW_DATA' ? 'Event Raw Data' : 'Pre-production Raw Data';
      const title = `${typeLabel} Approved`;
      const message = `client id ${leadLabel} approved the raw data ready to assign editors`;

      await prisma.notification.createMany({
        data: uniqueUserIds.map((userId) => ({
          userId,
          issueType: "RawDataStatus",
          title,
          message,
          isRead: false,
        })),
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating raw data approved notification:", error);
    }
  },

  // 🔔 EMPLOYEE notification (optional / legacy support)
  async createEmployeeNotification(data: CreateEmployeeNotificationInput) {
    try {
      const notification = await prisma.notification.create({
        data: {
          employeeId: data.employeeId,
          issueType: data.issueType,
          invoiceIssueId: data.invoiceIssueId ?? null,
          quotationIssueId: data.quotationIssueId ?? null,
          title: data.title,
          message: data.message ?? null,
        },
      });

      return { success: true, data: notification };
    } catch (error) {
      console.error("Error creating employee notification:", error);
      throw error;
    }
  },

  /* ========= READ ========= */

  // 📥 Get notifications for logged-in user
  async getNotifications(userId: number, filters?: NotificationFilter) {
    try {
      const where: any = { userId };

      if (filters?.isRead !== undefined) {
        where.isRead = filters.isRead;
      }

      const notifications = await prisma.notification.findMany({
        where,
        include: {
          invoiceIssue: true,
          quotationIssue: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        count: notifications.length,
        data: notifications,
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  // 🔢 Get unread notification count
  async getUnreadCount(userId: number) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return { success: true, unreadCount: count };
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }
  },

  // 📄 Get single notification
  async getNotificationById(notificationId: number) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { notificationId },
        include: {
          invoiceIssue: true,
          quotationIssue: true,
        },
      });

      if (!notification) {
        return { success: false, message: "Notification not found" };
      }

      return { success: true, data: notification };
    } catch (error) {
      console.error("Error fetching notification:", error);
      throw error;
    }
  },

  /* ========= UPDATE ========= */

  // ✔ Mark one notification as read
  async markAsRead(notificationId: number) {
    try {
      const notification = await prisma.notification.update({
        where: { notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return { success: true, data: notification };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // ✔ Mark all notifications as read (user)
  async markAllAsRead(userId: number) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return {
        success: true,
        message: "All notifications marked as read",
      };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  /* ========= DELETE ========= */

  async deleteNotification(notificationId: number) {
    try {
      await prisma.notification.delete({
        where: { notificationId },
      });

      return {
        success: true,
        message: "Notification deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  /* ========= FILTER ========= */

  async getNotificationsByIssueType(
    userId: number,
    issueType: "InvoiceIssue" | "QuotationIssue"
  ) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          issueType,
        },
        include: {
          invoiceIssue: true,
          quotationIssue: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        count: notifications.length,
        data: notifications,
      };
    } catch (error) {
      console.error("Error fetching notifications by type:", error);
      throw error;
    }
  },
};
