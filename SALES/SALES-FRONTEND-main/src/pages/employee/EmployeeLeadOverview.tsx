import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import apiClient from "../../Services/apiClient";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";

type Stage = "Leads" | "Quotation" | "Confirmation" | "Finalize";

interface Lead {
  id: number;
  name: string;
  stage: Stage;
  eventType: string;
  dueDate?: string;
  leadSerialNumber?: string;
}

const STAGES: Stage[] = ["Leads", "Quotation", "Confirmation", "Finalize"];

const stageStyles: Record<Stage, string> = {
  Leads: "text-blue-600 border-blue-300",
  Quotation: "text-orange-600 border-orange-300",
  Confirmation: "text-pink-600 border-pink-300",
  Finalize: "text-green-600 border-green-300",
};

const normalizeStage = (stage?: string): Stage => {
  if (!stage) return "Leads";

  const value = stage.toLowerCase().trim();

  if (value === "lead" || value === "leads") return "Leads";
  if (value === "quotation") return "Quotation";
  if (value === "confirmation" || value === "booking confirmation")
    return "Confirmation";
  if (
    value === "finalize" ||
    value === "finalized" ||
    value === "finalised" ||
    value === "completed"
  )
    return "Finalize";

  return "Leads";
};

const EmployeeLeadOverview = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const navState = location.state as { leadSerialNumber?: string } | null;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLead = useCallback(async () => {
    if (!leadId) return;

    try {
      const res = await apiClient.get(`/leads/${leadId}`);
      const data = res?.data?.data;
      if (!data) throw new Error("Invalid API response");

      setLead({
        id: data.leadId,
        name: `${data.firstName} ${data.lastName}`,
        stage: normalizeStage(data.currentStage),
        eventType: data.eventType,
        dueDate: data.eventDate,
        leadSerialNumber: data.leadSerialNumber || navState?.leadSerialNumber,
      });
    } catch {
      setLead(null);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead, location.key]);

  if (loading) return <div className="p-10">Loading lead overview…</div>;
  if (!lead) return <div className="p-10">Lead not found</div>;

  const currentStageIndex = STAGES.indexOf(lead.stage);

  return (
    <div className="fixed inset-0 flex bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Lead Pipeline
            </h1>
            <p className="text-gray-500">{lead.name}</p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {STAGES.map((stage, index) => {
              const isCurrent = lead.stage === stage;
              const isCompletedOrCurrent = index <= currentStageIndex;
              const isFinalize = stage === "Finalize";

const handleClick = (e?: React.MouseEvent) => {
  e?.preventDefault();
  e?.stopPropagation();

  if (isFinalize) return;
  if (!isCompletedOrCurrent) return;

  const targetPath = stage === "Leads"
      ? `/employee/leads/${leadId}/view`
      : stage === "Quotation"
      ? `/employee/leads/${leadId}/quotation`
      : `/employee/leads/${leadId}/confirmation`;
  navigate(targetPath, { state: { leadSerialNumber: lead?.leadSerialNumber } });
};

              return (
                <div
                  key={stage}
                  onClick={(e) => handleClick(e)}
                  className={`rounded-2xl p-5 shadow transition ${
                    isCurrent
                      ? "bg-white ring-2 ring-purple-500"
                      : "bg-[#F8F9FD]"
                  } ${
                    isCompletedOrCurrent && !isFinalize
                      ? "cursor-pointer hover:ring-2 hover:ring-purple-300"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">{stage}</h3>
                    <span className="text-sm text-gray-500">
                      {isCompletedOrCurrent ? 1 : 0}
                    </span>
                  </div>

                  {isCurrent && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lead.eventType}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400">
                          {isFinalize
                            ? "Waiting for Admin Approval"
                            : lead.dueDate
                            ? `Due: ${new Date(
                                lead.dueDate
                              ).toDateString()}`
                            : "—"}
                        </p>

                        <span
                          className={`px-3 py-1 rounded-full text-xs border ${stageStyles[stage]}`}
                        >
                          {isFinalize ? "Pending" : stage}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeadOverview;