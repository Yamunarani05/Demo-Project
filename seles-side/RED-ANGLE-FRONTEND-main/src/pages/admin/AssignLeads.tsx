import React, { useEffect, useRef, useState } from "react";
import { Upload, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import AssignEmployeeModal from "../../components/AssignEmployeeModal";
import type { AssignEmployeeData } from "../../components/AssignEmployeeModal";
import ViewEmployeeModal from "../../components/ViewEmployeeModal";
import { LeadsAPI } from "../../api/leads.api";
import { EmployeeAPI } from "../../api/employees.api";
import { toast } from "react-hot-toast";

export interface Employee {
  id: string;
  employeeId: string;
  employeeName: string;
  contactNumber: string;
  createdTime: string;
  email: string;
  role: "employee" | "admin" | "partner" | "lead";
  department: {
    type: string;
    manager?: string;
    avatar?: string;
  };
  priority: "High" | "Medium" | "Low";
  status: "Done" | "In Progress" | "To Do" | "In Review";
  taskName?: string;
  taskGroup?: string;
  estimate?: string;
  deadline?: string;
  description?: string;
  firstName?: string;
  lastName?: string;
  assignedEmployeeName?: string;
  assignedTasksSummary?: string;
  assignedTasks?: any[];
  assignedEmployeeId?: number | string;
}

const AssignLeads: React.FC = () => {
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedEmployeeForAssign, setSelectedEmployeeForAssign] =
    useState<Employee | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    priority: "",
    dateRange: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 10;
  const [reloadKey, setReloadKey] = useState(0);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leads, setLeads] = useState<Employee[]>([]);

  const getStatusFromStage = (stage?: string): Employee["status"] => {
    const normalized = stage?.trim().toLowerCase();

    switch (normalized) {
      case "lead":
        return "To Do";
      case "quotation":
        return "In Progress";
      case "confirmation":
        return "In Review";
      case "finalised":
      case "finalized":
        return "Done";
      default:
        return "To Do";
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeeRes = await EmployeeAPI.getEmployees(0, 1000, "");

        const backendEmployees = employeeRes.data.employees.employees;

        const mappedEmployees: Employee[] = backendEmployees
          .filter((e: any) => e.user?.role === "employee" || e.user?.role === "partner")
          .map((e: any) => ({
            id: String(e.employeeId),
            employeeId: e.employeeId,
            employeeName: `${e.firstName} ${e.lastName || ""}`,
            contactNumber: e.contactNumber,
            createdTime: e.dateOfJoin
              ? new Date(e.dateOfJoin).toLocaleDateString("en-GB")
              : "",
            email: e.user?.email || "",
            role: e.user?.role || "employee",
            department: { type: "Assignee" },
            priority: "Low",
            status: "To Do",
            firstName: e.firstName,
            lastName: e.lastName,
          }));

        setEmployees(mappedEmployees);
      } catch (err) {
        console.error("Employee fetch failed", err);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);

      try {
        const leadRes = await LeadsAPI.getLeads(1, 1000, "");

        const backendLeads = leadRes.data.data;
        setTotalLeads(leadRes.data.total);

        const mappedLeads: Employee[] = backendLeads.map((l: any) => {
          const leadEmployees = l.leadEmployee || [];

          // Distinct employee/partner names for outside table display
          const uniqueEmployeeNames = Array.from(
            new Set(
              leadEmployees
                .map((le: any) =>
                  le.employee
                    ? `${le.employee.firstName ?? ""} ${le.employee.lastName ?? ""}`.trim()
                    : ""
                )
                .filter(Boolean)
            )
          ).join(", ");

          // Detailed employee + task list for inside modal display
          const allAssigneesWithTasks = leadEmployees
            .map((le: any) =>
              le.employee
                ? `${le.employee.firstName ?? ""} ${le.employee.lastName ?? ""}`.trim() + (le.taskName ? ` (${le.taskName})` : "")
                : ""
            )
            .filter(Boolean);
          const assignedTasksSummary = allAssigneesWithTasks.length > 0 ? allAssigneesWithTasks.join(", ") : "";

          const lastEmployee = leadEmployees.at(-1);
          const assignee = lastEmployee?.employee ?? null;

          return {
            id: String(l.leadId),
            employeeId: l.leadSerialNumber || `LD${l.leadId}`,
            employeeName: `${l.firstName} ${l.lastName ?? ""}`.trim(),
            contactNumber: l.contactNumber,
            createdTime: l.createdTime
              ? new Date(l.createdTime).toLocaleDateString("en-GB")
              : "",
            email: l.email,
            role: "lead",
            department: {
              type: l.leadSource || "",
              manager: uniqueEmployeeNames || "Unassigned",
            },
            priority: l.priority || "Low",
            status: getStatusFromStage(l.currentStage),
            taskName: l.eventType,
            deadline: l.eventDate,
            description: lastEmployee?.description ?? "N/A",
            estimate: lastEmployee?.EstimatedDuration ?? "N/A",
            firstName: l.firstName,
            lastName: l.lastName,
            assignedEmployeeName: uniqueEmployeeNames,
            assignedTasksSummary: assignedTasksSummary,
            assignedTasks: leadEmployees,
            assignedEmployeeId: assignee?.employeeId,
          };
        });

        setLeads(mappedLeads);

      } catch (err) {
        console.error("Lead fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [reloadKey]);

  const filteredLeads = leads.filter((lead) => {
    const safeLeadName = lead.employeeName ? String(lead.employeeName).toLowerCase() : "";
    const safeLeadId = lead.employeeId ? String(lead.employeeId).toLowerCase() : "";
    const safeEmail = lead.email ? String(lead.email).toLowerCase() : "";
    const safeContact = lead.contactNumber ? String(lead.contactNumber) : "";
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      safeLeadName.includes(searchLower) ||
      safeLeadId.includes(searchLower) ||
      safeEmail.includes(searchLower) ||
      safeContact.includes(searchQuery);

    const matchesStatus = !filters.status || lead.status === filters.status;
    const matchesDepartment =
      !filters.department || lead.department.type === filters.department;
    const matchesPriority = !filters.priority || lead.priority === filters.priority;

    return matchesSearch && matchesStatus && matchesDepartment && matchesPriority;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  const handleToggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const allVisibleSelected =
    currentLeads.length > 0 &&
    currentLeads.every((lead) => selectedLeadIds.includes(lead.id));

  const handleToggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedLeadIds((prev) =>
        prev.filter((id) => !currentLeads.some((lead) => lead.id === id))
      );
    } else {
      const visibleIds = currentLeads.map((lead) => lead.id);
      setSelectedLeadIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee);
  };

  const handleUpdateEmployee = () => {
    setReloadKey((prev) => prev + 1);
    setViewingEmployee(null);
  };

  const handleAssignEmployee = async (data: AssignEmployeeData) => {
    if (selectedLeadIds.length === 0) return;

    const toastId = toast.loading("Assigning employee...");

    try {
      for (const leadId of selectedLeadIds) {
        const lead = leads.find((e) => e.id === leadId);
        if (!lead) continue;

        const payload: any = {
          leadId: Number(lead.id),
          employeeId: Number(data.employeeId),
          priority: data.priority,
        };
        if (data.taskName) payload.taskName = data.taskName;
        if (data.estimate && !isNaN(Number(data.estimate))) {
          payload.EstimatedDuration = Number(data.estimate);
        }
        if (data.deadline) payload.deadline = data.deadline;
        if (data.description) payload.description = data.description;

        await LeadsAPI.assignEmployee(payload);
      }

      toast.success("Lead assigned successfully", { id: toastId });

      setReloadKey((prev) => prev + 1);
      setIsAssignModalOpen(false);
      setSelectedEmployeeForAssign(null);
      setSelectedLeadIds([]);
      setCurrentPage(1);

    } catch (err) {
      console.error("Failed to assign employee", err);

      toast.error("Failed to assign employee. Please try again.", {
        id: toastId,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "To Do":
        return "bg-gray-100 text-gray-800";
      case "In Review":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-orange-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return "↑";
      case "Medium":
        return "↑";
      case "Low":
        return "↓";
      default:
        return "";
    }
  };

  const assignees = employees.filter(
    (e) => e.role === "employee" || e.role === "partner"
  );

  return (
    <div className="p-6">
      <div className="fixed inset-0 w-full h-full bg-gray-50 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 w-full">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                ASSIGN LEADS
              </h1>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      console.log("File selected:", e.target.files[0]);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (selectedLeadIds.length === 0) return;
                    const firstLead = leads.find(
                      (e) => e.id === selectedLeadIds[0]
                    );
                    setSelectedEmployeeForAssign(firstLead || null);
                    setIsAssignModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-md font-medium hover:from-[#5a2dd4] hover:to-[#4a23c3] transition-all shadow-sm text-xs"
                  disabled={selectedLeadIds.length === 0}
                >
                  Assign Employee / Partner
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent text-xs"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 border rounded-lg transition-colors ${showFilters || Object.values(filters).some((f) => f !== "")
                  ? "bg-[#6938ef] text-white border-[#6938ef]"
                  : "border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {showFilters && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h3>
                  <button
                    onClick={() =>
                      setFilters({
                        status: "",
                        department: "",
                        priority: "",
                        dateRange: "",
                      })
                    }
                    className="text-sm text-[#6938ef] hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="Done">Done</option>
                      <option value="In Progress">In Progress</option>
                      <option value="To Do">To Do</option>
                      <option value="In Review">In Review</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={filters.department}
                      onChange={(e) =>
                        setFilters({ ...filters, department: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-sm"
                    >
                      <option value="">All Departments</option>
                      <option value="Assignee">Assignee</option>
                      <option value="Design">Design</option>
                      <option value="Event Management">Event Management</option>
                      <option value="Photography">Photography</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={filters.priority}
                      onChange={(e) =>
                        setFilters({ ...filters, priority: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-sm"
                    >
                      <option value="">All Priorities</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) =>
                        setFilters({ ...filters, dateRange: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-sm"
                    >
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className="border-b-2 border-gray-200"
                      style={{ backgroundColor: "#e6edf5" }}
                    >
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={handleToggleSelectAllVisible}
                          className="w-4 h-4 text-[#6938ef] border-gray-300 focus:ring-[#6938ef] cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">
                        Lead ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">
                        Lead Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">
                        Contact Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">
                        Created time
                      </th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">
                        Employee / Partner
                      </th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase">
                        View
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className={`hover:bg-gray-50 transition-colors ${selectedLeadIds.includes(lead.id) ? "bg-purple-50" : ""
                          }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.includes(lead.id)}
                            onChange={() => handleToggleLeadSelection(lead.id)}
                            className="w-4 h-4 text-[#6938ef] border-gray-300 focus:ring-[#6938ef] cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-900">
                          {lead.employeeId}
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-900">
                          {lead.employeeName}
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-600">
                          {lead.contactNumber}
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-600">
                          {lead.createdTime}
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-600">
                          {lead.email}
                        </td>
                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-900">
                          {lead.assignedEmployeeName || "Unassigned"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs sm:text-sm ${getPriorityColor(
                              lead.priority
                            )}`}
                          >
                            {lead.priority} {getPriorityIcon(lead.priority)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(
                              lead.status
                            )}`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewEmployee(lead)}
                            className="px-2.5 py-1 rounded-md font-medium text-xs transition-all hover:shadow-sm"
                            style={{
                              backgroundColor: "rgba(105, 56, 239, 0.1)",
                              color: "#6938ef",
                              border: "1px solid rgba(105, 56, 239, 0.3)",
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 mt-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-sm text-gray-600">
                    {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} results of {filteredLeads.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="text-gray-600 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="text-gray-600 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {viewingEmployee && (
          <ViewEmployeeModal
            employee={viewingEmployee}
            onClose={() => setViewingEmployee(null)}
            onUpdate={handleUpdateEmployee}
          />
        )}
      </div>

      <AssignEmployeeModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedEmployeeForAssign(null);
        }}
        onSubmit={handleAssignEmployee}
        initialTaskName={selectedEmployeeForAssign?.taskName || ""}
        employees={assignees}
        selectedLeadCount={selectedLeadIds.length}
      />
    </div>
  );
};

export default AssignLeads;