import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../../Services/apiClient";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";

type Stage = "Lead" | "Quotation" | "Confirmation" | "Finalised";

interface LeadDetails {
  leadId: number;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  eventType: string;
  location?: string;
  address?: string;
  eventDate?: string;
  createdAt?: string;
  currentStage: Stage;
  leadSerialNumber?: string;
  lead_serial_number?: string;
}

const STAGES: Stage[] = ["Lead", "Quotation", "Confirmation", "Finalised"];

const EmployeeConfirmationPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();

  const location = useLocation();
  const navState = location.state as {
    leadSerialNumber?: string;
    taskId?: number;
    taskName?: string;
  } | null;

  const [lead, setLead] = useState<LeadDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const normalizeStage = (stage?: string): Stage => {
    if (!stage) return "Lead";

    const value = stage.toLowerCase().trim();

    if (value === "lead" || value === "leads" || value === "todo" || value === "to do" || value === "assigned") return "Lead";
    if (value === "quotation" || value === "inprogress" || value === "in progress") return "Quotation";
    if (value === "confirmation" || value === "inreview" || value === "in review") return "Confirmation";
    if (value === "finalised" || value === "finalized" || value === "finalize" || value === "approved" || value === "completed" || value === "done")
      return "Finalised";

    return "Lead";
  };

  useEffect(() => {
    if (!leadId) return;

    const fetchLead = async () => {
      try {
        const res = await apiClient.get(`/leads/${leadId}`);
        const data = res.data?.data ?? null;
        if (!data) {
          setLead(null);
          return;
        }

        const tasks = data.leadEmployee ?? [];
        let taskStage = "Lead";
        if (navState?.taskId) {
          const found = tasks.find((t: any) => t.leadEmployeeId === navState.taskId);
          if (found) {
            taskStage = found.stage || found.status || "Lead";
          }
        } else if (tasks.length > 0) {
          taskStage = tasks[0].stage || tasks[0].status || "Lead";
        } else {
          taskStage = data.currentStage || "Lead";
        }

        setLead({
          ...data,
          currentStage: normalizeStage(taskStage),
          eventType: navState?.taskName || data.eventType,
        });
      } catch {
        setLead(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId, navState?.taskId, navState?.taskName]);

  if (loading) return <div className="p-10">Loading…</div>;
  if (!lead) return <div className="p-10">Lead not found</div>;

  const currentIndex = STAGES.indexOf(lead.currentStage);
  const isFinalised = lead.currentStage === "Finalised";
  const fullName = `${lead.firstName} ${lead.lastName}`;

  /* ================= TIMELINE CLICK ================= */
  const handleStageClick = (stage: Stage, index: number) => {
    if (index > currentIndex) return; // ❌ future blocked
    if (stage === "Finalised") return; // ❌ not clickable

    const statePayload = {
      leadSerialNumber: lead?.leadSerialNumber,
      taskId: navState?.taskId,
      taskName: navState?.taskName,
    };

    if (stage === "Lead") {
      navigate(`/employee/leads/${leadId}/view`, { state: statePayload });
    } else if (stage === "Quotation") {
      navigate(`/employee/leads/${leadId}/quotation`, { state: statePayload });
    } else if (stage === "Confirmation") {
      navigate(`/employee/leads/${leadId}/confirmation`, { state: statePayload });
    }
  };

  const moveToFinalize = async () => {
    try {
      setUpdating(true);
      setError("");

      if (navState?.taskId) {
        await apiClient.patch(`/leads/tasks/${navState.taskId}/status`, {
          status: "Approved",
          stage: "Finalised",
        }).catch((e) => console.warn("Failed to update task status:", e));
      }

      await apiClient.put(`/leads/${leadId}`, {
        currentStage: "Finalised",
      });

      setLead((prev) =>
        prev ? { ...prev, currentStage: "Finalised" } : prev
      );
    } catch {
      setError("Failed to move lead to Finalised stage");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          {/* HEADER */}
          <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{fullName}</h2>
              <p className="text-gray-500">{lead.eventType}</p>
            </div>
          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-2 gap-6 bg-white rounded-2xl shadow p-6">
            <Info label="Lead ID" value={lead.leadSerialNumber || lead.lead_serial_number || `RAS - ${lead.leadId}`} />
            <Info label="Email" value={lead.email} />
            <Info label="Contact" value={lead.contactNumber} />
            <Info label="Location" value={lead.address || lead.location || "—"} />
            <Info label="Current Stage" value={lead.currentStage} />
          </div>

          {/* ================= TIMELINE (ONLY THIS CHANGED) ================= */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold mb-6">Status Timeline</h3>

            <div className="flex items-center justify-between">
              {STAGES.map((stage, index) => {
                const completed = index < currentIndex;
                const active = index === currentIndex;
                const clickable =
                  index <= currentIndex && stage !== "Finalised";

                return (
                  <div key={stage} className="flex-1 flex items-center">
                    <div
                      onClick={() =>
                        clickable && handleStageClick(stage, index)
                      }
                      className={`flex flex-col items-center min-w-[90px] ${clickable ? "cursor-pointer" : "cursor-default"
                        }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full ${completed
                            ? "bg-green-500"
                            : active
                              ? "bg-purple-600"
                              : "bg-gray-400"
                          }`}
                      />
                      <p
                        className={`text-sm mt-2 ${completed
                            ? "text-green-600"
                            : active
                              ? "text-purple-600"
                              : "text-gray-500"
                          }`}
                      >
                        {stage}
                      </p>
                    </div>

                    {index !== STAGES.length - 1 && (
                      <div
                        className={`flex-1 h-[2px] mx-2 ${index < currentIndex
                            ? "bg-green-500"
                            : "bg-gray-300"
                          }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIONS */}
          {error && (
            <div className="text-red-600 bg-red-50 p-4 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            {isFinalised ? (
              <button
                disabled
                className="px-8 py-3 rounded-xl bg-green-600 text-white opacity-80"
              >
                Completed
              </button>
            ) : (
              <button
                onClick={moveToFinalize}
                disabled={updating}
                className="px-8 py-3 rounded-xl bg-purple-600 text-white"
              >
                {updating ? "Updating…" : "Move to Finalize"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeConfirmationPage;

/* ================= UI HELPERS (UNCHANGED) ================= */

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="border rounded-xl p-4 bg-gray-50">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);
