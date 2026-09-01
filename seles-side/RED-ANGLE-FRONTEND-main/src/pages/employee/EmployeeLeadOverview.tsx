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

  if (
    value === "lead" ||
    value === "leads" ||
    value === "todo" ||
    value === "to do" ||
    value === "to_do" ||
    value === "assigned" ||
    value === "pending"
  )
    return "Leads";
  if (
    value === "quotation" ||
    value === "inprogress" ||
    value === "in progress" ||
    value === "in_progress"
  )
    return "Quotation";
  if (
    value === "confirmation" ||
    value === "booking confirmation" ||
    value === "inreview" ||
    value === "in review" ||
    value === "in_review"
  )
    return "Confirmation";
  if (
    value === "finalize" ||
    value === "finalized" ||
    value === "finalised" ||
    value === "completed" ||
    value === "approved" ||
    value === "done"
  )
    return "Finalize";

  return "Leads";
};

const formatDueDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const EmployeeLeadOverview = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const navState = location.state as {
    leadSerialNumber?: string;
    taskId?: number;
    taskName?: string;
    dueDate?: string;
  } | null;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<number | undefined>(navState?.taskId);

  const fetchLead = useCallback(async () => {
    if (!leadId) return;

    try {
      const res = await apiClient.get(`/leads/${leadId}`);
      const data = res?.data?.data ?? res?.data;
      if (!data) throw new Error("Invalid API response");

      // Check if task-specific info exists
      const tasks: any[] = data.leadEmployee ?? [];
      setTasksList(tasks);

      let currentTaskName = navState?.taskName;
      let currentDueDate = navState?.dueDate || data.eventDate || data.weddingDate || data.receptionDate;
      let currentTaskStage = "Leads";
      let foundTaskId = navState?.taskId;

      if (navState?.taskId) {
        const found = tasks.find((t: any) => t.leadEmployeeId === navState.taskId);
        if (found) {
          currentTaskName = found.taskName || currentTaskName;
          currentDueDate = found.deadline || currentDueDate;
          currentTaskStage = found.stage || found.status || "Leads";
          foundTaskId = found.leadEmployeeId;
        }
      } else if (currentTaskName) {
        const found = tasks.find((t: any) => t.taskName?.toLowerCase() === currentTaskName?.toLowerCase());
        if (found) {
          currentTaskName = found.taskName || currentTaskName;
          currentDueDate = found.deadline || currentDueDate;
          currentTaskStage = found.stage || found.status || "Leads";
          foundTaskId = found.leadEmployeeId;
        }
      } else if (tasks.length > 0) {
        currentTaskName = tasks[0].taskName || currentTaskName;
        currentDueDate = tasks[0].deadline || currentDueDate;
        currentTaskStage = tasks[0].stage || tasks[0].status || "Leads";
        foundTaskId = tasks[0].leadEmployeeId;
      } else {
        currentTaskStage = data.currentStage || "Leads";
      }

      setActiveTaskId(foundTaskId);

      setLead({
        id: data.leadId,
        name: `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() || `Lead #${data.leadId}`,
        stage: normalizeStage(currentTaskStage),
        eventType: currentTaskName || data.eventType || "Event",
        dueDate: currentDueDate,
        leadSerialNumber: data.leadSerialNumber || navState?.leadSerialNumber,
      });
    } catch (err) {
      console.error("Failed to load lead overview", err);
      setLead(null);
    } finally {
      setLoading(false);
    }
  }, [leadId, navState?.taskId, navState?.taskName, navState?.dueDate, navState?.leadSerialNumber]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead, location.key]);

  if (loading) return <div className="p-10">Loading lead overview…</div>;
  if (!lead) return <div className="p-10">Lead not found</div>;

  const currentStageIndex = STAGES.indexOf(lead.stage);

  return (
    <div className="fixed inset-0 flex bg-gray-50 overflow-hidden">
      <Sidebar forceOpen />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Lead Pipeline
            </h1>
            <p className="text-gray-500">
              {lead.name} {lead.leadSerialNumber ? `• ${lead.leadSerialNumber}` : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STAGES.map((stage, index) => {
              const isCurrent = lead.stage === stage;
              const isCompletedOrCurrent = index <= currentStageIndex;
              const isFinalize = stage === "Finalize";
              const isClickable = !isFinalize;

              const handleClick = (e?: React.MouseEvent) => {
                e?.preventDefault();
                e?.stopPropagation();

                if (!isClickable) return;

                const targetPath =
                  stage === "Leads"
                    ? `/employee/leads/${leadId}/view`
                    : stage === "Quotation"
                      ? `/employee/leads/${leadId}/quotation`
                      : `/employee/leads/${leadId}/confirmation`;
                navigate(targetPath, {
                  state: {
                    leadSerialNumber: lead?.leadSerialNumber,
                    taskId: activeTaskId,
                    taskName: lead.eventType,
                    dueDate: lead.dueDate,
                  },
                });
              };

              return (
                <div
                  key={stage}
                  onClick={(e) => handleClick(e)}
                  className={`rounded-2xl p-5 shadow transition ${isCurrent
                    ? "bg-white ring-2 ring-purple-500"
                    : isClickable
                      ? "bg-white cursor-pointer hover:ring-2 hover:ring-purple-300"
                      : "bg-[#F8F9FD] opacity-40 cursor-default"
                    }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">{stage}</h3>
                    <span className="text-sm text-gray-500">
                      {isCompletedOrCurrent || stage === "Quotation" ? 1 : 0}
                    </span>
                  </div>

                  {(isCompletedOrCurrent || stage === "Quotation") && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </p>
                        <p className="text-xs text-gray-500 font-semibold">
                          {lead.eventType}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          Due: {formatDueDate(lead.dueDate)}
                        </p>

                        <span
                          className={`px-3 py-1 rounded-full text-xs border ${stageStyles[stage]}`}
                        >
                          {stage}
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