export interface INotification {
  notificationId: number;
  issueType: "InvoiceIssue" | "QuotationIssue";
  invoiceIssueId?: number | null;
  quotationIssueId?: number | null;
  recipientId: number;
  title: string;
  message?: string | null;
  isRead: boolean;
  createdAt?: Date | null;
  readAt?: Date | null;
}

export interface ICreateNotificationRequest {
  issueType: "InvoiceIssue" | "QuotationIssue";
  invoiceIssueId?: number;
  quotationIssueId?: number;
  recipientId: number;
  title: string;
  message?: string;
}

export interface INotificationResponse {
  success: boolean;
  data?: INotification | INotification[];
  count?: number;
  unreadCount?: number;
  message?: string;
  error?: string;
}

// Validators
export const validateCreateNotification = (
  data: any
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data.issueType || (data.issueType !== "InvoiceIssue" && data.issueType !== "QuotationIssue")) {
    errors.push("issueType must be 'InvoiceIssue' or 'QuotationIssue'");
  }

  if (!data.recipientId || typeof data.recipientId !== "number") {
    errors.push("recipientId must be a valid number");
  }

  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
    errors.push("title is required and must be a non-empty string");
  }

  if (data.title && data.title.length > 255) {
    errors.push("title must not exceed 255 characters");
  }

  if (data.message && typeof data.message !== "string") {
    errors.push("message must be a string");
  }

  if (data.issueType === "InvoiceIssue" && !data.invoiceIssueId) {
    errors.push("invoiceIssueId is required for InvoiceIssue type");
  }

  if (data.issueType === "QuotationIssue" && !data.quotationIssueId) {
    errors.push("quotationIssueId is required for QuotationIssue type");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateNotificationId = (id: any): boolean => {
  return id && !isNaN(parseInt(id)) && parseInt(id) > 0;
};
