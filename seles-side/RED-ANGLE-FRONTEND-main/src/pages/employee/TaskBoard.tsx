import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import apiClient from "../../Services/apiClient";

/* ================= TYPES ================= */

type TaskStatus = "ToDo" | "InProgress" | "InReview" | "Approved";

interface TaskItem {
  id: string;
  leadId?: number | string;
  leadSerialNumber?: string;
  leadType?: string;
  leadName?: string;
  sno: string;
  task: string;
  assignee: string;
  avatar: string;
  due: string;
  dueStatus?: "normal" | "soon" | "today" | "overdue";
  diffDays?: number;
  estimate: string;
  status: TaskStatus;
  rawDue?: string;
}

/* ================= HELPERS ================= */

const mapStageToStatus = (statusOrStage?: string): TaskStatus => {
  if (!statusOrStage) return "ToDo";

  switch (statusOrStage.toLowerCase().trim()) {
    case "todo":
    case "to do":
    case "to_do":
    case "lead":
    case "assigned":
    case "pending":
      return "ToDo";
    case "inprogress":
    case "in progress":
    case "in_progress":
    case "quotation":
      return "InProgress";
    case "inreview":
    case "in review":
    case "in_review":
    case "confirmation":
      return "InReview";
    case "approved":
    case "finalised":
    case "finalized":
    case "completed":
    case "done":
      return "Approved";
    default:
      return "ToDo";
  }
};

/* ================= COMPONENT ================= */

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleView = useCallback(
    (leadId?: number | string, taskId?: string | number, taskName?: string, rawDue?: string) => {
      if (!leadId) return;
      navigate(`/employee/leads/${leadId}/overview`, {
        state: {
          taskId: taskId ? Number(taskId) : undefined,
          taskName: taskName || undefined,
          dueDate: rawDue || undefined,
        },
      });
    },
    [navigate]
  );
  const ITEMS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTasks = async () => {
      try {
        const response = await apiClient.get("/leads/tasks/my", {
          signal: controller.signal as any,
        });

        const data: any[] = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const mappedTasks: TaskItem[] = data.map(
          (task: any, index: number) => {
            let dueStatus: "normal" | "soon" | "today" | "overdue" = "normal";
            let diffDays = -1;
            const status = mapStageToStatus(task.status || task.stage);
            const rawDue =
              task.dueDate ||
              task.lead?.eventDate ||
              task.lead?.weddingDate ||
              task.lead?.receptionDate;

            if (rawDue && status === "ToDo") {
              const dDate = new Date(rawDue);
              if (!isNaN(dDate.getTime())) {
                dDate.setHours(0, 0, 0, 0);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const diffTime = dDate.getTime() - now.getTime();
                diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                  dueStatus = "overdue";
                } else if (diffDays === 0) {
                  dueStatus = "today";
                } else if (diffDays <= 2) {
                  dueStatus = "soon";
                }
              }
            }

            let formattedDue = "-";
            if (rawDue) {
              const d = new Date(rawDue);
              if (!isNaN(d.getTime())) {
                formattedDue = d.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
              }
            }

            return {
              id: String(task.taskId ?? index),
              leadId: task.lead?.leadId,
              leadSerialNumber:
                task.lead?.leadSerialNumber || String(task.lead?.leadId ?? ""),
              leadType: task.lead?.leadType ?? "",
              leadName:
                `${task.lead?.firstName ?? ""} ${task.lead?.lastName ?? ""}`.trim() ||
                "—",
              sno: String(index + 1).padStart(2, "0."),
              task: task.taskName ?? "",
              assignee: task.assignee?.fullName ?? "-",
              avatar: "https://i.pravatar.cc/150?img=12",
              due: formattedDue,
              dueStatus,
              diffDays,
              estimate: task.estimatedDuration
                ? `${task.estimatedDuration}h`
                : "-",
              status,
              rawDue: rawDue || undefined,
            };
          }
        );

        setTasks(mappedTasks);
        setCurrentPage(1);

      } catch (err: any) {
        if (err.name === "CanceledError") {
          // request was intentionally aborted
          return;
        }
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    return () => controller.abort();
  }, []);


  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);

  const paginatedTasks = tasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  return (
    <div className="fixed inset-0 flex bg-white overflow-hidden">
      <Sidebar forceOpen />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-10 space-y-8">

          {/* ================= HEADER ================= */}
          <div className="bg-[#EEF3F9] rounded-full px-6 py-3">
            <div className="grid grid-cols-12 text-sm font-semibold text-gray-700">
              <div className="col-span-1">LEAD ID</div>
              <div className="col-span-3">Lead Name</div>
              <div className="col-span-3">Task</div>
              <div className="col-span-2">Assigned By</div>
              <div className="col-span-1">Due</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-10 text-gray-500">
              Loading tasks
            </div>
          )}

          {!loading && tasks.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No tasks assigned
            </div>
          )}

          {/* ================= ROWS ================= */}
          <div className="space-y-6">
            {!loading &&
              paginatedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`grid grid-cols-12 items-center rounded-2xl px-6 py-4 shadow transition-all ${task.dueStatus === "today"
                    ? "bg-red-50 border border-red-200"
                    : task.dueStatus === "soon"
                      ? "bg-orange-50 border border-orange-200"
                      : task.dueStatus === "overdue"
                        ? "bg-red-100 border border-red-300 opacity-90"
                        : "bg-white"
                    }`}
                >
                  <div className="col-span-1 font-semibold flex items-center gap-1.5 min-w-0">
                    <span className="whitespace-nowrap truncate">{task.leadSerialNumber || task.leadId}</span>
                    {task.leadType && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${task.leadType === "RAS"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {task.leadType}
                      </span>
                    )}
                  </div>

                  <div className="col-span-3 font-medium text-gray-800 truncate">
                    {task.leadName}
                  </div>

                  <div className="col-span-3 font-medium truncate">
                    {task.task}
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    {/* <img
                      src={task.avatar}
                      alt="avatar"
                      className="w-7 h-7 rounded-full"
                    /> */}
                    <span className="text-sm truncate">
                      {task.assignee}
                    </span>
                  </div>

                  <div className="col-span-1 flex flex-col gap-1 items-start">
                    <span className="text-sm">{task.due}</span>
                    {task.dueStatus === "today" && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-sm">
                        Due Today
                      </span>
                    )}
                    {task.dueStatus === "soon" && (
                      <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                        Due in {task.diffDays} day{task.diffDays! > 1 ? "s" : ""}
                      </span>
                    )}
                    {task.dueStatus === "overdue" && (
                      <span className="px-2 py-0.5 bg-red-700 text-white text-[10px] font-bold rounded-full shadow-sm">
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs border ${task.status === "ToDo"
                        ? "border-gray-400 text-gray-600"
                        : task.status === "InProgress"
                          ? "border-yellow-400 text-yellow-600"
                          : task.status === "InReview"
                            ? "border-orange-400 text-orange-600"
                            : "border-green-400 text-green-600"
                        }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => handleView(task.leadId, task.id, task.task, task.rawDue)}
                      className="text-purple-600 hover:underline font-medium text-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
          </div>
          {!loading && tasks.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-4 pt-8">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-2 border rounded-md text-sm disabled:opacity-40"
              >
                Prev
              </button>

              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 border rounded-md text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TaskBoard;
