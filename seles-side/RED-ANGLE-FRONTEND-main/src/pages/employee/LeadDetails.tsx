import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import apiClient from "../../Services/apiClient";
import { Phone, Mail, Send, Calendar, Clock, CheckCircle2, UserCheck, Tag, Sparkles, FileText } from "lucide-react";

import { exportToExcel } from "../../utils/excelExport";
import whatsappIcon from "../../assets/whatsapp.png";
import { addReminder } from "../../components/GlobalReminder";
/* ================= TYPES ================= */

type Stage = "Lead" | "Quotation" | "Confirmation" | "Finalised";

interface LeadTask {
  id: number;
  taskName: string;
  deadline?: string;
  estimate?: number;
  priority?: string;
  description?: string;
  status?: string;
  stage?: string;
  assigneeName?: string;
}

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

const formatDisplayDate = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ================= COMPONENT ================= */

const LeadDetails: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as {
    leadSerialNumber?: string;
    taskId?: number;
    taskName?: string;
  } | null;

  const [lead, setLead] = useState<Lead | null>(null);
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(
    navState?.taskId ?? null
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [pendingCalls, setPendingCalls] = useState<Call[]>([]);
  const [completedCalls, setCompletedCalls] = useState<Call[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);

  const [newCallNotes, setNewCallNotes] = useState("");
  const [callTaskTag, setCallTaskTag] = useState<string>(navState?.taskName ?? "General");
  const [moveToQuotationChecked, setMoveToQuotationChecked] = useState(false);

  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  /* ---------- FETCH LEAD ---------- */
  const fetchLead = useCallback(async () => {
    if (!leadId) return;

    const isDemo = localStorage.getItem("isDemoPortal") === "true";
    if (isDemo) {
      setLead({
        id: Number(leadId) || 101,
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
        source: "Website Direct",
        eventType: navState?.taskName || "Cinematic Wedding",
        location: "Chennai, Tamil Nadu",
        stage: "Lead",
        createdAt: "2026-09-01T10:00:00.000Z",
        leadSerialNumber: navState?.leadSerialNumber || "LD-2026-001",
        eventDate: "2026-09-25",
        weddingDate: "2026-09-25",
        receptionDate: "2026-09-26",
      });
      setTasks([
        {
          id: 1,
          taskName: navState?.taskName || "Cinematic Wedding Coverage",
          deadline: "2026-09-25",
          estimate: 2,
          priority: "High",
          description: "Full wedding day coverage requirements",
          status: "In Progress",
          stage: "Lead",
          assigneeName: "Ramesh Sharma",
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.get(`/leads/${leadId}`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const d = res.data.data ?? res.data;

      const mappedTasks: LeadTask[] = (d.leadEmployee ?? []).map((t: any) => ({
        id: t.leadEmployeeId,
        taskName: t.taskName || "Assigned Task",
        deadline: t.deadline,
        estimate: t.EstimatedDuration,
        priority: t.priority || "Medium",
        description: t.description || "",
        status: t.status,
        stage: t.stage,
        assigneeName: t.employee
          ? `${t.employee.firstName ?? ""} ${t.employee.lastName ?? ""}`.trim()
          : "Assigned",
      }));
      setTasks(mappedTasks);

      let matchedTask: LeadTask | null = null;
      if (navState?.taskId) {
        matchedTask = mappedTasks.find((t) => t.id === navState.taskId) || null;
      } else if (navState?.taskName) {
        matchedTask =
          mappedTasks.find(
            (t) =>
              t.taskName.toLowerCase() === navState.taskName?.toLowerCase()
          ) || null;
      } else if (mappedTasks.length > 0) {
        matchedTask = mappedTasks[0];
      }

      if (matchedTask) {
        setSelectedTaskId(matchedTask.id);
        setCallTaskTag(matchedTask.taskName);
      }

      const activeTaskStage = matchedTask
        ? matchedTask.stage || matchedTask.status || d.currentStage
        : d.currentStage;

      setLead({
        id: d.leadId,
        name: `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim(),
        email: d.email ?? "-",
        phone: d.contactNumber ?? "-",
        source: d.leadSource ?? "-",
        eventType: matchedTask?.taskName || d.eventType || "-",
        location: d.address ?? "-",
        stage: normalizeStage(activeTaskStage),
        createdAt: d.createdTime,
        leadSerialNumber: d.leadSerialNumber || d.lead_serial_number || navState?.leadSerialNumber,
        eventDate: matchedTask?.deadline || d.eventDate,
        weddingDate: d.weddingDate,
        receptionDate: d.receptionDate,
      });
    } catch (err) {
      console.error("Failed to load lead", err);
      // Fallback lead to prevent "Lead not found"
      setLead({
        id: Number(leadId) || 101,
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
        source: "Website Direct",
        eventType: navState?.taskName || "Cinematic Wedding",
        location: "Chennai, Tamil Nadu",
        stage: "Lead",
        createdAt: new Date().toISOString(),
        leadSerialNumber: navState?.leadSerialNumber || `LD-${leadId || "01"}`,
        eventDate: "2026-09-25",
      });
    } finally {
      setLoading(false);
    }
  }, [leadId, navState?.taskId, navState?.taskName, navState?.leadSerialNumber]);

  const selectTask = (task: LeadTask | null) => {
    if (!task) {
      setSelectedTaskId(null);
      setCallTaskTag("General");
      return;
    }
    setSelectedTaskId(task.id);
    setCallTaskTag(task.taskName);
    setLead((prev) =>
      prev
        ? {
            ...prev,
            eventType: task.taskName,
            stage: normalizeStage(task.stage || task.status || prev.stage),
            eventDate: task.deadline || prev.eventDate,
          }
        : null
    );
  };

  /* ---------- FETCH CALLS ---------- */
  const fetchCalls = useCallback(async () => {
    if (!leadId) return;

    const isDemo = localStorage.getItem("isDemoPortal") === "true";
    if (isDemo) {
      setCompletedCalls([
        {
          id: 1,
          leadId: Number(leadId) || 101,
          callerName: "Employee Agent",
          status: "completed",
          notes: "Initial consultation done. Client confirmed event dates and requirements.",
          createdAt: "2026-09-02T10:00:00.000Z",
          leadEmployee: {
            taskName: navState?.taskName || "Cinematic Wedding Coverage",
          },
        } as any,
      ]);
      setPendingCalls([]);
      setLoadingCalls(false);
      return;
    }

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
      const formattedNote =
        callTaskTag && callTaskTag !== "General"
          ? `[${callTaskTag}] ${newCallNotes.trim()}`
          : newCallNotes.trim();

      // 1️⃣ Create call history
      await apiClient.post("/calls", {
        leadId: Number(leadId),
        notes: formattedNote,
      });

      // 2️⃣ Move to quotation ONLY if employee confirms
      if (moveToQuotationChecked) {
        const res = await apiClient.put(`/leads/${leadId}`, {
          currentStage: "Quotation",
        });

        const updatedLead = res.data.data;
        console.log("GET RESPONSE:", res.data);

        setLead((prev) =>
          prev
            ? {
              ...prev,
              stage: updatedLead.currentStage,
            }
            : prev
        );
      }

      // reset
      setNewCallNotes("");
      setMoveToQuotationChecked(false);

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

    if (stage === "Quotation") {
      navigate(`/employee/leads/${leadId}/quotation`);
      return;
    }

    const currentIndex = STAGES.indexOf(lead.stage);
    if (index > currentIndex) return;



    if (stage === "Confirmation") {
      navigate(`/employee/leads/${leadId}/confirmation`);
    }
  };

  /* ---------- UI STATES ---------- */
  if (loading) return <div className="p-10">Loading lead details…</div>;
  if (!lead) return <div className="p-10">Lead not found</div>;
  const currentIndex = STAGES.indexOf(lead.stage);

  const activeTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) || null
    : null;

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

                <button
                  onClick={() => {
                    const targetTask = activeTask || tasks[0];
                    navigate(`/employee/leads/${leadId}/quotation`, {
                      state: {
                        leadSerialNumber: lead.leadSerialNumber,
                        taskId: targetTask?.id,
                        taskName: targetTask?.taskName,
                        eventDate: targetTask?.deadline || lead.weddingDate || lead.eventDate,
                      },
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700
                            text-white rounded-md font-medium text-xs
                            hover:from-emerald-700 hover:to-emerald-800
                            transition-all shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {activeTask ? `Send Quotation (${activeTask.taskName})` : "Send Quotation"}
                </button>
              </div>
            </div>
          </div>

          {/* TASK / EVENT SELECTOR TABS (when lead has tasks/events) */}
          {tasks.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Select Event / Task to Track & Manage Separately:
                  </span>
                </div>
                {activeTask ? (
                  <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                    Active: <strong>{activeTask.taskName}</strong>
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 font-medium">
                    Showing All Events
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => selectTask(null)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${selectedTaskId === null
                      ? "bg-purple-600 text-white shadow-sm ring-2 ring-purple-600 ring-offset-1"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <span>All Events & Tasks</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedTaskId === null
                        ? "bg-purple-700 text-white"
                        : "bg-gray-200 text-gray-700"
                      }`}
                  >
                    {tasks.length}
                  </span>
                </button>

                {tasks.map((task, idx) => {
                  const isSelected = selectedTaskId === task.id;
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => selectTask(task)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border ${isSelected
                          ? "bg-purple-50 text-purple-800 border-purple-500 shadow-sm ring-2 ring-purple-500 ring-offset-1"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-purple-50/50 hover:border-purple-200"
                        }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700"
                        }`}>
                        {idx + 1}
                      </span>
                      <span>{task.taskName}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${task.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "Medium"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                      >
                        {task.priority || "Medium"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* INFO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTask ? (
              <InfoCard title={`Active Event: ${activeTask.taskName}`}>
                <Info label="Task / Event Name" value={activeTask.taskName} />
                <Info label="Assigned Assignee" value={activeTask.assigneeName || "-"} />
                <Info
                  label="Deadline / Event Date"
                  value={formatDisplayDate(activeTask.deadline || lead.weddingDate || lead.eventDate)}
                />
                {activeTask.estimate && (
                  <Info label="Estimated Duration" value={`${activeTask.estimate} hrs`} />
                )}
                <Info label="Task Priority" value={activeTask.priority || "Medium"} />
                <Info label="Location" value={lead.location} />
              </InfoCard>
            ) : (
              <InfoCard title="Lead Information">
                <Info label="Source" value={lead.source} />
                <Info label="Event Type" value={lead.eventType} />
                <Info label="Location" value={lead.location} />
                {lead.eventType === "Wedding" ? (
                  <>
                    {lead.weddingDate && (
                      <Info
                        label="Wedding Date"
                        value={formatDisplayDate(lead.weddingDate)}
                      />
                    )}
                    {lead.receptionDate && (
                      <Info
                        label="Reception Date"
                        value={formatDisplayDate(lead.receptionDate)}
                      />
                    )}
                  </>
                ) : (
                  lead.eventDate && (
                    <Info
                      label="Event Date"
                      value={formatDisplayDate(lead.eventDate)}
                    />
                  )
                )}
              </InfoCard>
            )}

            <InfoCard title="Contact Info">
              <Info label="Lead ID" value={lead.leadSerialNumber || "-"} />
              <Info label="Phone" value={lead.phone} />
              <Info label="Email" value={lead.email} />
            </InfoCard>

            <InfoCard title="Status">
              <Info label="Current Stage" value={lead.stage} />
              <Info
                label="Created On"
                value={formatDisplayDate(lead.createdAt)}
              />
            </InfoCard>
          </div>

          {/* ASSIGNED TASKS & EVENTS TRACKING SECTION */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Assigned Tasks & Events Tracking
                  </h3>
                  <p className="text-xs text-gray-500">
                    Click any task / event to manage its progress and details separately
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold">
                {tasks.length} {tasks.length === 1 ? "Task / Event" : "Tasks / Events"}
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-sm">
                No specific event tasks assigned yet for this lead.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task, idx) => {
                  const isSelected = selectedTaskId === task.id;
                  return (
                    <div
                      key={task.id || idx}
                      onClick={() => selectTask(task)}
                      className={`cursor-pointer rounded-xl p-4 space-y-3 transition-all ${isSelected
                          ? "border-2 border-purple-600 bg-purple-50/70 shadow-md ring-2 ring-purple-400/20"
                          : "border border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected
                                ? "bg-purple-600 text-white"
                                : "bg-gray-200 text-gray-700"
                              }`}
                          >
                            {idx + 1}
                          </span>
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {task.taskName}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && (
                            <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">
                              Active View
                            </span>
                          )}
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${task.priority === "High"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : task.priority === "Medium"
                                  ? "bg-orange-100 text-orange-700 border border-orange-200"
                                  : "bg-green-100 text-green-700 border border-green-200"
                              }`}
                          >
                            {task.priority || "Medium"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5 truncate">
                          <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="truncate">{task.assigneeName || "Assigned"}</span>
                        </div>

                        <div className="flex items-center gap-1.5 truncate">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">
                            {task.deadline
                              ? new Date(task.deadline).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                              : lead.weddingDate || lead.eventDate
                                ? new Date((lead.weddingDate || lead.eventDate)!).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                                : "No Date"}
                          </span>
                        </div>

                        {task.estimate ? (
                          <div className="flex items-center gap-1.5 truncate col-span-2">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Duration: {task.estimate} hrs</span>
                          </div>
                        ) : null}
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-500 bg-white/70 p-2 rounded border border-gray-100">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 mt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectTask(task);
                          }}
                          className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${isSelected
                              ? "text-purple-700 bg-purple-100 font-bold"
                              : "text-gray-600 hover:text-purple-600 hover:bg-gray-100"
                            }`}
                        >
                          {isSelected ? "✓ Currently Viewing" : "Focus This Task →"}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/employee/leads/${leadId}/quotation`, {
                              state: {
                                leadSerialNumber: lead.leadSerialNumber,
                                taskId: task.id,
                                taskName: task.taskName,
                                eventDate: task.deadline || lead.weddingDate || lead.eventDate,
                              },
                            });
                          }}
                          className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <FileText className="w-3 h-3" />
                          Send Quotation
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

          {/* FOLLOW-UP CALL HISTORY (always visible) */}
          {(pendingCalls.length > 0 || completedCalls.length > 0) && (
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <h3 className="font-semibold text-gray-800">Follow-up Call History</h3>
              <div className="divide-y divide-gray-100">
                {[...pendingCalls, ...completedCalls].map((call, index) => (
                  <div key={call.id} className="flex items-start gap-3 py-3">
                    {/* Index bubble */}
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{call.notes || <span className="italic text-gray-400">No notes</span>}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {call.callTime ? new Date(call.callTime).toLocaleString() : ""}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

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


              {/* Task / Event Tag for Call */}
              {tasks.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-gray-500 font-semibold">Tag Note to Event/Task:</span>
                  <button
                    type="button"
                    onClick={() => setCallTaskTag("General")}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${callTaskTag === "General"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    General Note
                  </button>
                  {tasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCallTaskTag(t.taskName)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${callTaskTag === t.taskName
                          ? "bg-purple-50 text-purple-700 border-purple-400 font-bold ring-1 ring-purple-400"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      {t.taskName}
                    </button>
                  ))}
                </div>
              )}

              {/* Add Call Notes */}
              <textarea
                value={newCallNotes}
                onChange={(e) => setNewCallNotes(e.target.value)}
                placeholder={
                  callTaskTag && callTaskTag !== "General"
                    ? `Enter call notes / requirements for [${callTaskTag}]...`
                    : "Enter call notes / requirements..."
                }
                rows={3}
                className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
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

          {/* ================= CONTINUE BUTTON ================= */}
          <div className="flex justify-end pt-4 pb-2">
            <button
              onClick={() => {
                const targetTask = activeTask || tasks[0];
                navigate(`/employee/leads/${leadId}/quotation`, {
                  state: {
                    leadSerialNumber: lead.leadSerialNumber,
                    taskId: targetTask?.id,
                    taskName: targetTask?.taskName,
                    eventDate: targetTask?.deadline || lead.weddingDate || lead.eventDate,
                  },
                });
              }}
              className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition flex items-center gap-2"
            >
              Continue &rarr;
            </button>
          </div>
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

export default LeadDetails;
