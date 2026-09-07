import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import apiClient from "../../Services/apiClient";
import { Phone, Mail } from "lucide-react";
import { exportToExcel } from "../../utils/excelExport";
import whatsappIcon from "../../assets/whatsapp.png";
import { addReminder } from "../../components/GlobalReminder";

/* ================= TYPES ================= */

type Stage = "Lead" | "callUp" | "Quotation" | "Confirmation" | "Finalised";


interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: string;
  eventType: string;
  location: string;
  stage: Stage;
  createdAt: string;
  leadSerialNumber?: string;
  eventDate?: string;
  weddingDate?: string;
  receptionDate?: string;
}

interface Call {
  id: number;
  callTime: string;
  notes?: string;
  isTaken: boolean;
}

/* ================= CONSTANTS ================= */

const STAGES: Stage[] = [
  "Lead",
  "Quotation",
  "Confirmation",
  "Finalised",
];

const normalizeStage = (stage?: string): Stage => {
  if (!stage) return "Lead";

  switch (stage) {
    case "Lead":
    case "Quotation":
    case "Confirmation":
    case "Finalised":
      return stage;
    default:
      return "Lead";
  }
};

/* ================= COMPONENT ================= */

const Lead: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const numericLeadId = leadId?.includes("-")
    ? leadId.split("-")[1]
    : leadId;
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [pendingCalls, setPendingCalls] = useState<Call[]>([]);
  const [completedCalls, setCompletedCalls] = useState<Call[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);

  const [newCallNotes, setNewCallNotes] = useState("");
  const [moveToQuotationChecked, setMoveToQuotationChecked] = useState(false);

  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  /* ---------- FETCH LEAD ---------- */
  const fetchLead = useCallback(async () => {
    if (!leadId) return;

    try {
      const res = await apiClient.get(`/leads/${numericLeadId}`);
      const d = res.data?.data ?? res.data;

      setLead({
        id: d.leadId,
        name: `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim(),
        email: d.email ?? "-",
        phone: d.contactNumber ?? "-",
        source: d.leadSource ?? "-",
        eventType: d.eventType ?? "-",
        location: d.address ?? "-",
        stage: normalizeStage(d.currentStage),
        createdAt: d.createdTime,
        leadSerialNumber: d.leadSerialNumber || d.lead_serial_number || `${d.leadType === "LD" ? "LD" : "RAS"}-${d.leadId}`,
        eventDate: d.eventDate,
        weddingDate: d.weddingDate,
        receptionDate: d.receptionDate,
      });
    } catch (err) {
      console.error("Failed to load lead", err);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  /* ---------- FETCH CALLS ---------- */
  const fetchCalls = useCallback(async () => {
    if (!leadId) return;

    try {
      setLoadingCalls(true);
      const [pendingRes, completedRes] = await Promise.all([
        apiClient.get(`/calls/lead/${leadId}/pending`),
        apiClient.get(`/calls/lead/${leadId}/completed`),
      ]);

      setPendingCalls(pendingRes.data.data ?? []);
      setCompletedCalls(completedRes.data.data ?? []);
    } catch (err) {
      console.error("Failed to load calls", err);
    } finally {
      setLoadingCalls(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLead();
    fetchCalls();
  }, [fetchLead, fetchCalls]);

  /* ---------- CREATE CALL ---------- */
  const createCall = async () => {
    if (!leadId || !newCallNotes.trim()) return;

    try {
      // 1️⃣ Create call history
      await apiClient.post("/calls", {
        leadId: Number(leadId),
        notes: newCallNotes.trim(),
      });

      // 2️⃣ Move to quotation ONLY if employee confirms
      if (moveToQuotationChecked) {
        await apiClient.put(`/leads/${leadId}`, {
          currentStage: "Quotation",
        });
      }

      // reset
      setNewCallNotes("");
      setMoveToQuotationChecked(false);

      await fetchLead();
      await fetchCalls();
    } catch (err) {
      console.error("Create call failed", err);
    }
  };

  const handleSetReminder = () => {
    if (!reminderDate || !reminderTime || !newCallNotes.trim()) {
      alert("Please enter notes, date, and time for the reminder.");
      return;
    }
    const dt = new Date(`${reminderDate}T${reminderTime}`);
    addReminder({
      leadId: leadId || "",
      leadName: lead?.name || "Unknown",
      message: newCallNotes.trim(),
      time: dt.toISOString(),
    });
    alert("Reminder set successfully!");
    setShowReminderPicker(false);
    setReminderDate("");
    setReminderTime("");
    setNewCallNotes("");
  };

  const markCallTaken = async (callId: number) => {
    try {
      await apiClient.patch(`/calls/${callId}/mark-taken`);
      await fetchCalls();
    } catch (err) {
      console.error("Failed to mark call as taken", err);
    }
  };

  /* ---------- STAGE NAV ---------- */
  const handleStageClick = (stage: Stage, index: number) => {
    if (!lead || !leadId) return;

    const currentIndex = STAGES.indexOf(lead.stage);
    if (index > currentIndex) return;

    if (stage === "Quotation") {
      navigate(`/partner/leads/${leadId}/quotation`);
    }

    if (stage === "Confirmation") {
      navigate(`/partner/leads/${leadId}/confirmation`);
    }
  };

  /* ---------- UI STATES ---------- */
  if (loading) return <div className="p-10">Loading lead details…</div>;
  if (!lead) return <div className="p-10">Lead not found</div>;

  const currentIndex = STAGES.indexOf(lead.stage);

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 flex bg-gray-50 overflow-hidden">
      <Sidebar forceOpen />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <div className="flex-1 overflow-y-auto p-2">
            <div className="flex items-center justify-between gap-4">
              {/* Lead Name */}
              <h1 className="text-2xl font-semibold text-gray-900 truncate">
                {lead.name}
              </h1>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!lead.phone || lead.phone === "-") return;
                    window.location.href = `tel:${lead.phone}`;
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4]
                            text-white rounded-md font-medium text-xs
                            hover:from-[#5a2dd4] hover:to-[#4a23c3]
                            transition-all shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </button>

                <button
                  onClick={() => {
                    if (!lead.email || lead.email === "-") return;
                    window.location.href = `mailto:${lead.email}`;
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4]
                            text-white rounded-md font-medium text-xs
                            hover:from-[#5a2dd4] hover:to-[#4a23c3]
                            transition-all shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
              </div>
            </div>
          </div>

          {/* INFO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoCard title="Lead Information">
              <Info label="Source" value={lead.source} />
              <Info label="Event Type" value={lead.eventType} />
              <Info label="Location" value={lead.location} />
              {lead.eventType === 'Wedding' ? (
                <>
                  {lead.weddingDate && <Info label="Wedding Date" value={new Date(lead.weddingDate).toDateString()} />}
                  {lead.receptionDate && <Info label="Reception Date" value={new Date(lead.receptionDate).toDateString()} />}
                </>
              ) : (
                lead.eventDate && <Info label="Event Date" value={new Date(lead.eventDate).toDateString()} />
              )}
            </InfoCard>

            <InfoCard title="Contact Info">
              <Info label="Lead ID" value={lead.leadSerialNumber || "-"} />
              <Info label="Phone" value={lead.phone} />
              <Info label="Email" value={lead.email} />
            </InfoCard>

            <InfoCard title="Status">
              <Info label="Current Stage" value={lead.stage} />
              <Info
                label="Created On"
                value={new Date(lead.createdAt).toDateString()}
              />
            </InfoCard>
          </div>

          {/* TIMELINE */}
          <div className="bg-white rounded-xl shadow p-8">
            <h3 className="font-semibold mb-6 text-gray-800">Lead Progress</h3>
            <div className="flex items-center justify-between">
              {STAGES.map((stage, index) => (
                <div key={stage} className="flex-1 flex items-center">
                  <div
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleStageClick(stage, index)}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${index < currentIndex
                        ? "bg-green-500 text-white"
                        : index === currentIndex
                          ? "bg-purple-600 text-white"
                          : "bg-gray-300 text-gray-600"
                        }`}
                    >
                      {index + 1}
                    </div>
                    <p className="mt-2 text-sm">{stage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CALLS */}
          {(["Lead", "Quotation", "Confirmation"].includes(lead.stage)) && (
            <div className="bg-white rounded-xl shadow p-6 space-y-6">
              {/* Heading + Export button in one row */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Calls</h3>


                <div className="flex items-center gap-2">

                  {/* WhatsApp Button */}
                  <button
                    onClick={() => console.log("Send WhatsApp")}
                    className="p-1 rounded-full hover:scale-110 transition-transform"
                    title="Send WhatsApp"
                  >
                    <img
                      src={whatsappIcon}
                      alt="WhatsApp"
                      className="w-7 h-7"
                    />
                  </button>
                  {/* Export Button */}
                  <button
                    onClick={() => {
                      const allCallsRaw = [...pendingCalls, ...completedCalls];

                      const allCalls = allCallsRaw.map((c, index) => ({
                        callNumber: `Call ${index + 1}`,
                        notes: c.notes || "",
                        status: c.isTaken ? "Attended" : "Not Attended",
                        movedToService: moveToQuotationChecked ? "Yes" : "No",
                      }));

                      if (allCalls.length === 0) {
                        allCalls.push({
                          callNumber: "Call 1",
                          notes: "",
                          status: "Not Attended",
                          movedToService: "No",
                        });
                      }

                      const headers = ["callNumber", "notes", "status", "movedToService"];
                      exportToExcel(
                        allCalls,
                        `Lead_${lead.id}_Calls`,
                        headers,
                        `Call History for ${lead.name}`
                      );
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4]
                              text-white rounded-md font-medium text-xs
                              hover:from-[#5a2dd4] hover:to-[#4a23c3]
                              transition-all shadow-sm"
                  >
                    Export Calls
                  </button>
                </div>
              </div>

              {/* Add Call Notes */}
              <textarea
                value={newCallNotes}
                onChange={(e) => setNewCallNotes(e.target.value)}
                placeholder="Enter call notes / requirements"
                rows={3}
                className="w-full border rounded-lg p-3 text-sm"
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={moveToQuotationChecked}
                  onChange={(e) => setMoveToQuotationChecked(e.target.checked)}
                />
                Customer wants service (move to quotation)
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={createCall}
                  disabled={!newCallNotes.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded font-medium hover:bg-purple-700 transition"
                >
                  + Add Call
                </button>
                <button
                  onClick={() => setShowReminderPicker(!showReminderPicker)}
                  className="px-4 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 transition"
                >
                  Set Reminder
                </button>
              </div>

              {showReminderPicker && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-3 mt-2">
                  <h4 className="text-sm font-semibold text-orange-800">Set a notification reminder for this note</h4>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="border rounded px-3 py-1.5 text-sm"
                    />
                    <input 
                      type="time" 
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="border rounded px-3 py-1.5 text-sm"
                    />
                    <button
                      onClick={handleSetReminder}
                      className="px-3 py-1.5 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700"
                    >
                      Confirm Reminder
                    </button>
                  </div>
                </div>
              )}

              {/* PENDING */}
              <div>
                <h4 className="font-medium mb-2">Pending Calls</h4>
                {pendingCalls.map((call) => (
                  <div key={call.id} className="border-b py-2">
                    <div className="text-sm text-gray-600">{call.notes}</div>
                    <button
                      onClick={() => markCallTaken(call.id)}
                      className="mt-1 text-xs bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Mark Taken
                    </button>
                  </div>
                ))}
              </div>

              {/* COMPLETED */}
              <div>
                <h4 className="font-medium mb-2">Completed Calls</h4>
                {completedCalls.map((call) => (
                  <div key={call.id} className="border-b py-2">
                    <div className="text-sm text-gray-600">{call.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= UI HELPERS ================= */

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-white rounded-xl shadow p-6 space-y-4">
    <h4 className="font-semibold text-gray-800">{title}</h4>
    {children}
  </div>
);

const Info: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-sm text-gray-800 font-medium">{value}</p>
  </div>
);

export default Lead;
