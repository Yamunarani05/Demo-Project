// src/components/SendQuotationModal.tsx
import { useState, useEffect, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { X, Plus, Trash2 } from "lucide-react";
import type { QuotationPackage, SendQuotationForm } from "../api/quotations.api";
import { QuotationsAPI } from "../api/quotations.api";
import { LeadsAPI } from "../api/leads.api";
import toast from "react-hot-toast";

interface NormalizedLead {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
}

interface SendQuotationModalProps {
  package: QuotationPackage;
  onClose: () => void;
  onSend?: (formData: SendQuotationForm & { leadEmail?: string }) => void;
  taskName?: string;
  taskId?: number;
}

type SendVia = "email" | "whatsapp";



const API_BASE_URL = import.meta.env.VITE_API_URL;

const resolveImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("data:")) return imageUrl;

  const normalizedUrl = imageUrl.replace(/\\/g, "/");
  const base = API_BASE_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || "http://localhost:9000";
  return `${base.replace(/\/$/, "")}/${normalizedUrl.replace(/^\/+/, "")}`;
};

const SendQuotationModal = ({
  package: pkg,
  onClose,
  onSend,
  taskName,
  taskId,
}: SendQuotationModalProps) => {
  const location = useLocation();
  const { leadId: routeLeadId } = useParams<{ leadId?: string }>();
  const [sendVia, setSendVia] = useState<SendVia>("email");
  const [sendToClientOnly, setSendToClientOnly] = useState(false);
  /* ================= ROLE DETECTION ================= */
  const isAdmin = location.pathname.startsWith("/admin");
  const isEmployee = location.pathname.startsWith("/employee");
  const isPartner = location.pathname.startsWith("/partner");
  const [errors, setErrors] = useState<{ leadId?: string }>({});
  const RequiredStar = () => (
    <span className="text-red-500 ml-1">*</span>
  );


  /* ================= EFFECTIVE LEAD ID ================= */
  const effectiveLeadId =
    !isAdmin && routeLeadId ? Number(routeLeadId) : undefined;

  /* ================= STATE ================= */
  const [formData, setFormData] = useState<SendQuotationForm & { discount?: number | "" }>({
    leadId: effectiveLeadId ?? "",
    eventId: pkg.eventId ?? "",
    status: "Pending",
    notes: taskName ? `Quotation for ${taskName}` : "",
    discount: "",
    taskId: taskId,
  });

  const [leads, setLeads] = useState<NormalizedLead[]>([]);
  const [sending, setSending] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [isDiscountVisible, setIsDiscountVisible] = useState(false);


  /* ================= SELECTED LEAD ================= */
  const selectedLead = useMemo(() => {
    if (!formData.leadId) return undefined;
    return leads.find((l) => l.id === Number(formData.leadId));
  }, [leads, formData.leadId]);

  /* ================= LOAD LEADS ================= */
  useEffect(() => {
    const fetchLeads = async () => {
      // ADMIN → ALL LEADS
      if (isAdmin) {
        const res = await LeadsAPI.getLeads(1, 100, "");
        const raw = res.data?.data ?? [];

        setLeads(
          raw.map((l: any) => ({
            id: l.leadId,
            name:
              `${l.firstName ?? ""} ${l.lastName ?? ""}`.trim() ||
              `Lead #${l.leadId}`,
            email: l.email,
            phone: l.contactNumber,
            status: l.status,
          }))
        );
        return;
      }

      // EMPLOYEE / PARTNER → ROUTE LEAD ONLY
      if (effectiveLeadId) {
        const res = await LeadsAPI.getLeadById(effectiveLeadId);
        const l = res.data?.data;
        if (!l) return;

        const normalized: NormalizedLead = {
          id: l.leadId,
          name:
            `${l.firstName ?? ""} ${l.lastName ?? ""}`.trim() ||
            `Lead #${l.leadId}`,
          email: l.email,
          phone: l.contactNumber,
          status: l.status,
        };

        setLeads([normalized]);
        setFormData((p) => ({ ...p, leadId: normalized.id }));
      }
    };

    fetchLeads();
  }, [isAdmin, effectiveLeadId]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leadId) {
      setErrors({ leadId: "Client is required" });
      toast.error("Please select a client");
      return;
    }

    setErrors({});
    setSending(true);

    try {
      // SEND TO CLIENT PAGE ONLY or EMAIL FLOW
      if (sendToClientOnly || sendVia === "email") {
        await QuotationsAPI.sendQuotation(
          { ...formData, leadId: Number(formData.leadId) },
          pkg.id
        );

        toast.success("Quotation sent successfully");
        onSend?.({ ...formData, leadEmail: selectedLead?.email });
        onClose();
        return;
      }

      // WHATSAPP FLOW
      const phone = selectedLead?.phone?.replace(/\D/g, "");
      if (!phone) {
        toast.error("This lead does not have a phone number for WhatsApp");
        return;
      }

      const res = await QuotationsAPI.sendQuotation(
        { ...formData, leadId: Number(formData.leadId) },
        pkg.id
      );

      const quotationToken = res?.token;
      if (!quotationToken) {
        toast.error("Failed to generate quotation link");
        return;
      }

      const quotationViewUrl = `${window.location.origin}/quotation/view?token=${quotationToken}`;

      const message = encodeURIComponent(
        `Hi ${selectedLead?.name},

Please view your quotation for *${pkg.serviceName}* using the secure link below:

${quotationViewUrl}

Price: ₹${pkg.price}

Let us know if you would like to proceed.`
      );

      const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
      window.open(whatsappUrl, "_blank");

      onClose();
    } catch (err) {
      toast.error("Failed to send quotation");
    } finally {
      setSending(false);
    }
  };




  /* ================= UI ================= */
  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">Send Quotation</h2>
              <p className="text-sm text-gray-500">{pkg.serviceName}</p>
            </div>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-400 hover:text-black" />
            </button>
          </div>

          {/* TASK / EVENT BADGE */}
          {taskName && (
            <div className="mx-5 mt-3 bg-purple-50 border border-purple-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-purple-900">
              <span className="font-medium">🎯 Target Task / Event:</span>
              <span className="font-bold bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                {taskName}
              </span>
            </div>
          )}

          {/* IMAGE */}
          <div className="px-5 pt-4">
            <div
              className="border rounded-lg bg-gray-100 h-36 flex items-center justify-center cursor-pointer"
              onClick={() => pkg.imageUrl && setShowImage(true)}
            >
              {pkg.imageUrl ? (
                <img
                  src={resolveImageUrl(pkg.imageUrl)}
                  className="max-h-full object-contain"
                />
              ) : (
                <span className="text-4xl text-gray-400">📸</span>
              )}
            </div>
          </div>

          {/* DETAILS */}
          <div className="px-5 py-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Price</span>
              <span className="font-semibold text-[#6938ef]">
                ₹ {pkg.price.toLocaleString("en-IN")}
              </span>
            </div>
            {pkg.description && (
              <p className="text-xs text-gray-600">{pkg.description}</p>
            )}
          </div>

          {/* FORM */}
          <form className="px-5 pb-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Client <RequiredStar />
              </label>
              {/* ADMIN */}
              {isAdmin ? (
                <>
                  <select
                    value={formData.leadId ? String(formData.leadId) : ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        leadId: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select lead</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} {l.phone ? `- ${l.phone}` : ""}
                      </option>
                    ))}
                  </select>

                  {errors.leadId && (
                    <p className="text-red-500 text-xs mt-1">{errors.leadId}</p>
                  )}
                </>
              ) : (
                /* EMPLOYEE / PARTNER */
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="font-medium">{selectedLead?.name}</div>
                  {selectedLead?.email && <div>Email: {selectedLead.email}</div>}
                  {selectedLead?.phone && <div>Phone: {selectedLead.phone}</div>}
                </div>
              )}


            </div>

            <div className="flex flex-col gap-2 mb-4">
              {!isDiscountVisible ? (
                <button
                  type="button"
                  onClick={() => setIsDiscountVisible(true)}
                  className="w-max flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded transition-colors"
                >
                  <Plus size={14} /> Add Discount
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Discount (₹)</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDiscountVisible(false);
                        setFormData((prev) => ({ ...prev, discount: "" }));
                      }}
                      className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="w-full border rounded p-2 text-sm focus:ring-[#6938ef] focus:border-[#6938ef] outline-none"
                    placeholder="0.00"
                    value={formData.discount ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discount: e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                  />
                </>
              )}
            </div>

            {!sendToClientOnly && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Send Quotation Via
                </label>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendVia"
                      value="email"
                      checked={sendVia === "email"}
                      onChange={() => setSendVia("email")}
                    />
                    <span>Email</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendVia"
                      value="whatsapp"
                      checked={sendVia === "whatsapp"}
                      onChange={() => setSendVia("whatsapp")}
                    />
                    <span>WhatsApp</span>
                  </label>
                </div>
              </div>
            )}


            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-3 pt-3">
              <button
                type="button"
                onClick={(e) => {
                  setSendToClientOnly(true);
                  handleSubmit(e);
                }}
                disabled={sending}
                className="w-full bg-white border-2 border-[#6938ef] text-[#6938ef] hover:bg-purple-50 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                Send to Client Page Only
              </button>

              <button
                type="button"
                onClick={(e) => {
                  setSendToClientOnly(false);
                  handleSubmit(e);
                }}
                disabled={sending}
                className="w-full bg-[#6938ef] hover:bg-[#5b30d1] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-md shadow-purple-500/20"
              >
                {sending ? "Sending..." : `Send Quotation via ${sendVia === "email" ? "Email" : "WhatsApp"}`}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FULL IMAGE */}
      {showImage && pkg.imageUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center"
          onClick={() => setShowImage(false)}
        >
          <img
            src={resolveImageUrl(pkg.imageUrl)}
            className="max-h-full object-contain"
          />

        </div>
      )}
    </>
  );
};

export default SendQuotationModal;