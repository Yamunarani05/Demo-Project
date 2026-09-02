import { useState } from "react";
import api from "../../api/api";

interface Props {
  leadId: number;
  taskId?: number;
  quotation: {
    id: number;
    serviceName: string;
    description?: string;
    price?: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const SendQuotationModal = ({
  leadId,
  taskId,
  quotation,
  onClose,
  onSuccess,
}: Props) => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendQuotation = async () => {
    try {
      setSending(true);

      if (taskId) {
        await api.patch(`/leads/tasks/${taskId}/status`, {
          status: "InProgress",
          stage: "Quotation",
        }).catch((e) => console.warn("Failed to update task status:", e));
      }

      await api.put(`/leads/${leadId}`, {
        currentStage: "Quotation",
      });

      setSent(true);
    } catch (err) {
      console.error("Failed to move lead to quotation stage", err);
    } finally {
      setSending(false);
    }
  };

  const moveToConfirmation = async () => {
    try {
      if (taskId) {
        await api.patch(`/leads/tasks/${taskId}/status`, {
          status: "InReview",
          stage: "Confirmation",
        }).catch((e) => console.warn("Failed to update task status:", e));
      }

      await api.put(`/leads/${leadId}`, {
        currentStage: "Confirmation",
      });

      onSuccess();
    } catch (err) {
      console.error("Failed to move lead to confirmation", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[520px] rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Send Quotation</h2>
          <p className="text-sm text-gray-500">
            Package: {quotation.serviceName?.replace(/RedAngle/gi, "Demo").replace(/Red Angle/gi, "Demo")}
          </p>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between">
            <h3 className="font-semibold">{quotation.serviceName?.replace(/RedAngle/gi, "Demo").replace(/Red Angle/gi, "Demo")}</h3>
            <span className="text-purple-600 font-semibold">
              ₹ {quotation.price}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {quotation.description || "—"}
          </p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          {!sent ? (
            <button
              onClick={sendQuotation}
              disabled={sending}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send Quotation"}
            </button>
          ) : (
            <button
              onClick={moveToConfirmation}
              className="px-6 py-2 bg-green-600 text-white rounded-lg"
            >
              Move to Confirmation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendQuotationModal;
