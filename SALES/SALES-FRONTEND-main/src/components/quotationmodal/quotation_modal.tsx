import { useEffect, useState, useCallback } from "react";
import * as LeadService from "../../Services/leadService";
import api from "../../api/api";

interface QuotationPackage {
  id: number;
  serviceName: string;
  description?: string;
  quantity?: number;
  price?: number;
}

interface LeadOption {
  id: string;
  name: string;
  email?: string;
}

interface SendQuotationModalProps {
  leadId: string; // String(leadId) from route
  quotation: QuotationPackage;
  onClose: () => void;
  onSuccess: () => void;
}

const SendQuotationModal = ({
  leadId,
  quotation,
  onClose,
  onSuccess,
}: SendQuotationModalProps) => {
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [selectedLead, setSelectedLead] = useState<string | undefined>(leadId);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const currentLead = leads.find((l) => l.id === selectedLead);

  const mapBackendToLeadOption = useCallback((l: any): LeadOption => {
    const firstName = l.firstName || "";
    const lastName = l.lastName || "";
    const fullName =
      `${firstName} ${lastName}`.trim() ||
      l.leadName ||
      "Unnamed Lead";

    return {
      id: String(l.leadId || l.id || l._id || ""),
      name: fullName,
      email: l.email,
    };
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoadingLeads(true);

        const res = await LeadService.listLeadsPaginated({
          page: 1,
          limit: 1000,
          search: "",
        });

        const items = Array.isArray(res.items) ? res.items : [];
        const mapped: LeadOption[] = items.map(mapBackendToLeadOption);
        setLeads(mapped);

        const idStr = String(leadId || "");
        if (idStr) {
          const exists = mapped.find((l) => l.id === idStr);
          if (exists) {
            setSelectedLead(exists.id);
          } else if (!selectedLead && mapped.length > 0) {
            setSelectedLead(mapped[0].id);
          }
        } else if (!selectedLead && mapped.length > 0) {
          setSelectedLead(mapped[0].id);
        }
      } catch (e) {
        console.error("Failed to load leads for quotation", e);
      } finally {
        setLoadingLeads(false);
      }
    };

    fetchLeads();
  }, [leadId, mapBackendToLeadOption, selectedLead]);

  const handleSubmit = async () => {
    if (!selectedLead) return;

    try {
      setSubmitting(true);

      const res = await api.post("/quotations/send", {
        leadId: Number(selectedLead),
        quotationId: Number(quotation.id),
        notes,
        // status: "Sent", // uncomment if backend expects a status field
      });

      if (res.status === 201) {
        alert("Quotation sent successfully.");
        onSuccess();
      } else {
        alert(`Quotation request completed with status ${res.status}.`);
      }
    } catch (e: any) {
      console.error(
        "Failed to send quotation to client",
        e?.response?.data || e
      );

      const backendMessage =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message;

      alert(
        backendMessage
          ? `Failed to send quotation: ${backendMessage}`
          : "Failed to send quotation, please check console."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Send Quotation to Client
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Package: {quotation.serviceName}
            </p>
          </div>
        </div>

        {/* body */}
        <div className="px-6 py-5 space-y-4">
          {/* package card */}
          <div className="rounded-xl bg-[#F8F7FF] px-4 py-3 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {quotation.serviceName || "Event Package"}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {quotation.description ||
                  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-purple-700">
                Rs. {quotation.price ?? 0}
              </p>
            </div>
          </div>

          {/* lead select */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Select Lead/Client
            </label>
            <select
              value={selectedLead ?? ""}
              onChange={(e) => setSelectedLead(e.target.value || undefined)}
              disabled={loadingLeads}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            >
              <option value="">
                {loadingLeads ? "Loading leads..." : "Select Lead"}
              </option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.id === String(leadId)
                    ? `Lead ${lead.id} - ${lead.name}`
                    : lead.name}
                </option>
              ))}
            </select>
          </div>

          {/* email display */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Lead Email (read only)
            </label>
            <input
              type="email"
              value={currentLead?.email || ""}
              readOnly
              placeholder="No email found for this lead"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800"
            />
          </div>

          {/* notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes for the client"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !selectedLead}
            className="inline-flex items-center rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Sending..." : "Send Quotation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendQuotationModal;
