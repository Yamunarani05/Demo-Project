// src/components/notifications/IssueDetailModal.tsx
import React from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Notification } from "./NotificationsContext";
import { useNotifications } from "./NotificationsContext";

interface IssueDetailModalProps {
  notification: Notification;
  onClose: () => void;
}

const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  notification,
  onClose,
}) => {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();

  // Determine category (invoice vs quotation) and kind (issue vs status)
  const isInvoiceNotification =
    notification.issueType === "InvoiceIssue" ||
    notification.issueType === "InvoiceStatus" ||
    notification.invoiceIssueId != null;

  const isQuotationNotification =
    notification.issueType === "QuotationIssue" ||
    notification.issueType === "QuotationStatus" ||
    notification.issueType === "QuotationSent" ||
    notification.quotationIssueId != null;

  const isIssueType =
    notification.issueType === "InvoiceIssue" ||
    notification.issueType === "QuotationIssue";

  // Navigate to invoice
  const handleGoToInvoice = async () => {
    await markAsRead(notification.id);
    onClose();
    const id = notification.invoiceIssueId ?? ""; // fallback empty if API didn't provide
    navigate(`/admin/invoice?invoiceId=${id}`);
  };

  // Navigate to quotation
  const handleGoToQuotation = async () => {
    await markAsRead(notification.id);
    onClose();
    const id = notification.quotationIssueId ?? "";
    navigate(`/admin/quotation?quotationId=${id}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#f3e8ff] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-purple-100">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-gray-700">
              {isInvoiceNotification
                ? (isIssueType ? "INVOICE ISSUE" : "INVOICE STATUS")
                : isQuotationNotification
                  ? (isIssueType ? "QUOTATION ISSUE" : "QUOTATION STATUS")
                  : "NOTIFICATION"}
            </p>
            <p className="mt-0.5 text-[10px] text-gray-600">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* body */}
        <div className="px-4 py-3 space-y-3">
          <div>
            <div className="text-[11px] font-semibold text-gray-800 mb-0.5">
              Title
            </div>
            <div className="text-[11px] text-gray-900 bg-white/70 rounded-lg px-3 py-1.5">
              {notification.title}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-gray-800 mb-0.5">
              {isIssueType ? "Issue" : "Status"}
            </div>
            <div className="text-[11px] text-gray-800 bg-white/70 rounded-lg px-3 py-2 whitespace-pre-line">
              {notification.message}
            </div>
          </div>

          {notification.invoiceIssueId && (
            <div className="text-[11px] text-gray-700">
              Invoice ID:{" "}
              <span className="font-semibold">{notification.invoiceIssueId}</span>
            </div>
          )}

          {notification.quotationIssueId && (
            <div className="text-[11px] text-gray-700">
              Quotation ID:{" "}
              <span className="font-semibold">{notification.quotationIssueId}</span>
            </div>
          )}
        </div>

        {/* actions */}
        <div className="pt-1 flex flex-wrap gap-2 justify-end px-4 pb-3">
          {isInvoiceNotification && (
            <button
              onClick={handleGoToInvoice}
              className="px-3 py-1.5 rounded-full bg-white text-[11px] font-semibold text-purple-700 border border-purple-300 hover:bg-purple-50"
            >
              Go to Invoice
            </button>
          )}

          {isQuotationNotification && (
            <button
              onClick={handleGoToQuotation}
              className="px-3 py-1.5 rounded-full bg-white text-[11px] font-semibold text-purple-700 border border-purple-300 hover:bg-purple-50"
            >
              Go to Quotation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
