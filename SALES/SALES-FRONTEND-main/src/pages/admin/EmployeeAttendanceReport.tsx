import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

// Ensure these paths match your project structure
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import api from "../../Services/apiClient";
import { exportToExcel } from "../../utils/excelExport";

interface AvailableReport {
  id: string;
  reportName: string;
}

interface SummaryState {
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  date: string;
}

const EmployeeAttendanceReport = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<string>("employee");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 8;

  const [availableReports] = useState<AvailableReport[]>([
    {
      id: "employee",
      reportName: "Employee Attendance Report",
    },
    { id: "client", reportName: "Clients Report" },
    { id: "invoice", reportName: "Invoice" },
  ]);

  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  const [summary, setSummary] = useState<SummaryState>({
    totalEmployees: 0,
    presentCount: 0,
    absentCount: 0,
    date: "",
  });

  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [exportLoading, setExportLoading] = useState(false);

  const [viewEmployeeId, setViewEmployeeId] = useState<string | null>(null);
  const [viewEmployeeName, setViewEmployeeName] = useState<string>("");
  const [showExportModal, setShowExportModal] = useState(false);

  // Derived state for report type
  const isClientReport = location.pathname.includes("/client");

  const formatDateOnly = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-";

  // Sync dropdown with URL
  useEffect(() => {
    if (location.pathname.includes("client")) {
      setSelectedReport("client");
    } else if (location.pathname.includes("invoice")) {
      setSelectedReport("invoice");
    } else {
      setSelectedReport("employee");
    }
  }, [location.pathname]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setAttendanceRecords([]); // Clear previous data

        if (isClientReport) {
          // --- CASE 1: CLIENT REPORT ---
          console.log("Fetching CLIENT REPORT from: /reports/lead-summary"); 
          
          // This matches your requirement strictly
          const clientRes = await api.get("/reports/lead-summary");
          console.log("RAW RESPONSE:", clientRes.data);

          const clientData = clientRes.data?.data || [];

          const records = clientData.map((client: any, index: number) => ({
  id: client.id || String(index),
  // The report API provides a pre-formatted 'leadName' field
  leadName: client.leadName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || "Unknown",
  phone: client.phone ?? client.contactNumber ?? "-",
  eventType: client.eventType ?? "-",
  totalQuotationValue: client.totalQuotationValue ?? 0,
  totalInvoiceValue: client.totalInvoiceValue ?? 0,
  totalPayments: client.totalPayments ?? 0,
  balance: client.balance ?? 0,
  followUpCount: client.followUpCount ?? 0,
  // Mark deleted leads so the UI can display them as archived/deleted
  isDeleted: client.isDeleted ?? false,
  currentStage: client.currentStage ?? "-",
}));

console.log("CLIENT DATA:", clientData);



          setAttendanceRecords(records);
        } else {
          // --- CASE 2: EMPLOYEE ATTENDANCE REPORT ---
          console.log("Fetching EMPLOYEE REPORT"); 
          const today = new Date();
          const localDateStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          const dailyRes = await api.get(`/employees/report/daily?date=${localDateStr}`);
          const report = dailyRes.data?.report;
          

          setSummary({
            totalEmployees: report?.totalEmployees ?? 0,
            presentCount: report?.presentCount ?? 0,
            absentCount: report?.absentCount ?? 0,
            date: report?.date ?? "",
            
          });
          

          const attendanceRecords = report?.attendanceRecords || [];

          const empRes = await api.get("/employees");
          const empWrapper = empRes.data?.employees;

          const employeesRaw: any[] = Array.isArray(empWrapper?.employees)
            ? empWrapper.employees
            : [];

          const records = employeesRaw.map((emp: any, index: number) => {
            const att = attendanceRecords.find((a: any) => a.employeeId === emp.employeeId);
            const status = att ? att.status || (att.checkIn ? "Present" : "Absent") : "Absent";
            let totalHoursStr = "-";
            
            if (att && att.checkIn && att.checkOut) {
              const start = new Date(att.checkIn).getTime();
              const end = new Date(att.checkOut).getTime();
              const diff = end - start;
              if (diff > 0) {
                const hrs = Math.floor(diff / 3600000);
                const mins = Math.floor((diff % 3600000) / 60000);
                totalHoursStr = `${hrs}h ${mins}m`;
              }
            }
            
            const punchInTime = att?.checkIn ? new Date(att.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "-";
            const punchOutTime = att?.checkOut ? new Date(att.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "-";
            const formattedDate = report?.date ? new Date(report.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
            const formattedMonth = report?.date ? new Date(report.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "-";

            return {
              id: String(emp.employeeId),
              serialNo: index + 1,
              name: `${emp.firstName ?? ""} ${emp.lastName ?? ""}`,
              date: formattedMonth, // mapped to the 'Month' column in TSX implicitly, though often showing full date makes more sense. Let's use formattedMonth 
              month: formattedMonth,
              punchIn: punchInTime,
              punchOut: punchOutTime,
              totalHours: totalHoursStr,
              status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
            };
          });

          setAttendanceRecords(records);
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.pathname, isClientReport]);

  // Filtering
  const filteredRecords = attendanceRecords.filter((record: any) => {
    const text = isClientReport ? record.leadName : record.name;
    return text?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sorting
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const dateA = a.date || "";
    const dateB = b.date || "";
    if (dateA === dateB) return 0;
    return sortOrder === "asc"
      ? dateA.localeCompare(dateB)
      : dateB.localeCompare(dateA);
  });

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = sortedRecords.slice(startIndex, endIndex);

  const handleReportClick = (reportId: string) => {
    setSelectedReport(reportId);
    if (reportId === "client") {
      navigate("/admin/report/client");
    } else if (reportId === "invoice") {
      navigate("/admin/report/invoice");
    } else {
      navigate("/admin/report/employee-attendance");
    }
  };

  const handleSortByDate = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // ---------------------------------------------------------
  // EXPORT FUNCTION (Fixed to use correct API)
  // ---------------------------------------------------------
  const handleExportToExcel = async () => {
    try {
      setExportLoading(true);

      if (isClientReport) {
        if (!attendanceRecords.length) {
          toast.error("No leads to export");
          return;
        }

        const rows = attendanceRecords.map((r: any, index: number) => ({
          "S.No": index + 1,
          "Client Name": r.leadName,
          "Phone": r.phone,
          "Event": r.eventType,
          "Quotation Value": r.totalQuotationValue,
          "Invoice Value": r.totalInvoiceValue,
          "Payments": r.totalPayments,
          "Balance": r.balance,
          "Follow Ups": r.followUpCount,
          "Lead Stage": r.currentStage || "-",
          "Status": r.isDeleted ? `Deleted (at ${r.currentStage || "unknown stage"})` : "Active",
        }));

        exportToExcel(
            rows, 
            "clients_report", 
            ["S.No", "Client Name", "Phone", "Event", "Quotation Value", "Invoice Value", "Payments", "Balance", "Follow Ups", "Lead Stage", "Status"], 
            "Clients Report"
        );
      } else {
        // Open the Export Options modal instead of downloading immediate page data
        setShowExportModal(true);
      }

      toast.success("Downloaded Successfully");
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    } finally {
      setExportLoading(false);
    }
  };

  // ---------------------------------------------------------
  // OPEN MODAL
  // ---------------------------------------------------------
  const handleViewEmployee = (id: string, name: string) => {
    setViewEmployeeId(id);
    setViewEmployeeName(name);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 w-full">
          {/* Title row */}
          <div className="flex justify-between mb-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {isClientReport
                ? "Client Reports"
                : "All Employees Attendance Monthly"}
            </h1>
          </div>

          {/* Available Reports dropdown */}
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm font-semibold">Available Reports:</label>
            <select
              value={selectedReport}
              onChange={(e) => handleReportClick(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-72"
            >
              {availableReports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.reportName}
                </option>
              ))}
            </select>
          </div>

          {/* Daily summary line (Only for Employee Report) */}
          {!isClientReport && summary.date && (
            <p className="text-xs text-gray-600 mb-3">
              Daily summary date:{" "}
              <span className="font-medium">
                {formatDateOnly(summary.date)}
              </span>
            </p>
          )}

          {/* Search and actions */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    isClientReport
                      ? "Search client name"
                      : "Search employee name"
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] text-xs"
                />
              </div>
              <button
                onClick={handleSortByDate}
                className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 text-xs"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort {sortOrder === "asc" ? "↑" : "↓"}
              </button>
              <button
                onClick={handleExportToExcel}
                disabled={exportLoading}
                className="px-2.5 py-1.5 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-md font-medium hover:from-[#5a2dd4] hover:to-[#4a23c3] transition-all shadow-sm text-xs flex items-center gap-1.5 disabled:opacity-70"
              >
                <Download className="w-3.5 h-3.5" />
                {exportLoading ? "Downloading..." : "Download Excel"}
              </button>
            </div>
          </div>

          {/* Summary cards (Only for Employee Report) */}
          {!isClientReport && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
                <p className="text-xs text-gray-600 mb-1">
                  Total Employees (API)
                </p>
                <p className="text-lg font-bold text-[#6938ef]">
                  {summary.totalEmployees}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
                <p className="text-xs text-gray-600 mb-1">
                  Present (daily summary)
                </p>
                <p className="text-lg font-bold text-[#6938ef]">
                  {summary.presentCount}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
                <p className="text-xs text-gray-600 mb-1">
                  Absent (daily summary)
                </p>
                <p className="text-lg font-bold text-[#6938ef]">
                  {summary.absentCount}
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#e6edf5" }}>
                    {(isClientReport
                      ? [
                          "S.No",
                          "Client Name",
                          "Phone",
                          "Event",
                          "Quotation",
                          "Invoice",
                          "Payments",
                          "Balance",
                          "Follow Ups",
                        ]
                      : [
                          "S.No",
                          "Name",
                          "Month",
                          "Punch In",
                          "Punch Out",
                          "Total Hours",
                          "Status",
                          "Action",
                        ]
                    ).map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold text-gray-900"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-6 text-xs text-gray-500"
                      >
                        Loading data...
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    currentRecords.map((record: any, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        {isClientReport ? (
                          <>
                            <td className="px-4 py-3 text-xs">
                              {startIndex + index + 1}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <div className="flex items-center gap-2">
                                {record.leadName}
                                {record.isDeleted && (
                                  <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                                    Deleted
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {record.phone}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {record.eventType}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {record.totalQuotationValue}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {record.totalInvoiceValue}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {record.totalPayments}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {record.balance}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {record.followUpCount}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-xs">
                              {record.serialNo}
                            </td>
                            <td className="px-4 py-3 text-xs">{record.name}</td>
                            <td className="px-4 py-3 text-xs">{record.date}</td>
                            <td className="px-4 py-3 text-xs">
                              {record.punchIn}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {record.punchOut}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {record.totalHours}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <span
                                className={`px-2 py-0.5 rounded ${
                                  record.status === "Present"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {record.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <button
                                onClick={() => handleViewEmployee(record.id, record.name)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 font-medium rounded hover:bg-blue-100 transition-colors"
                              >
                                View
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}

                  {!loading && !currentRecords.length && (
                    <tr>
                      <td
                        colSpan={isClientReport ? 9 : 8}
                        className="text-center py-6 text-xs text-gray-500"
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 mt-4">
              <div className="flex items-center justify-end gap-2">
                <div className="text-xs text-gray-600">
                  {startIndex + 1}-
                  {Math.min(endIndex, sortedRecords.length)} of{" "}
                  {sortedRecords.length}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="text-gray-600 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="text-gray-600 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {viewEmployeeId && (
        <EmployeeAttendanceModal
          employeeId={viewEmployeeId}
          employeeName={viewEmployeeName}
          onClose={() => setViewEmployeeId(null)}
        />
      )}

      {showExportModal && (
        <ExportAttendanceModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

// ---------------------------------------------------------
// Export Attendance Modal Component
// ---------------------------------------------------------
const ExportAttendanceModal = ({ onClose }: { onClose: () => void }) => {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly" | "custom">("monthly");
  
  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  
  // Default bounds for 'custom'
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const [customFrom, setCustomFrom] = useState(firstDay);
  const [customTo, setCustomTo] = useState(todayStr);

  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      let fromDate = customFrom;
      let toDate = customTo;

      const dateOffset = new Date();
      if (period === "weekly") {
        dateOffset.setDate(dateOffset.getDate() - 7);
        fromDate = dateOffset.toISOString().split("T")[0];
        toDate = todayStr;
      } else if (period === "monthly") {
        dateOffset.setDate(dateOffset.getDate() - 30);
        fromDate = dateOffset.toISOString().split("T")[0];
        toDate = todayStr;
      } else if (period === "yearly") {
        dateOffset.setFullYear(dateOffset.getFullYear() - 1);
        fromDate = dateOffset.toISOString().split("T")[0];
        toDate = todayStr;
      }

      const res = await api.get(`/employees/report/export`, {
        params: { from: fromDate, to: toDate },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Employee_Attendance_${period}_${todayStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      toast.success("Excel downloaded securely!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate Excel format");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b p-4 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Export Options</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#6938ef]"
            >
              <option value="weekly">Weekly (Last 7 Days)</option>
              <option value="monthly">Monthly (Last 30 Days)</option>
              <option value="yearly">Yearly (Last 365 Days)</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {period === "custom" && (
            <div className="flex flex-col gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-lg hover:from-[#5a2dd4] hover:to-[#4a23c3] text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
            {loading ? "Generating..." : "Download Excel"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// Employee Attendance Modal Component
// ---------------------------------------------------------
const EmployeeAttendanceModal = ({
  employeeId,
  employeeName,
  onClose,
}: {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Default to current month start and end
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  useEffect(() => {
    fetchEmployeeAttendance();
  }, []);

  const fetchEmployeeAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/${employeeId}`, {
        params: { from: fromDate, to: toDate },
      });
      setRecords(res.data?.attendance || []);
    } catch (err) {
      console.error("Error fetching employee attendance:", err);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  const calculateTotalHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return "-";
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diff = end - start;
    if (diff <= 0) return "-";
    
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold text-gray-900">
            Attendance Report: {employeeName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm bg-white"
            />
          </div>
          <button
            onClick={fetchEmployeeAttendance}
            disabled={loading}
            className="px-4 py-1.5 bg-[#6938ef] text-white rounded-lg text-sm font-medium hover:bg-[#5a2dd4] transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Filter"}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading records...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No attendance records found for the selected period.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-2 text-xs font-bold text-gray-700">Date</th>
                  <th className="px-4 py-2 text-xs font-bold text-gray-700">Check In</th>
                  <th className="px-4 py-2 text-xs font-bold text-gray-700">Check Out</th>
                  <th className="px-4 py-2 text-xs font-bold text-gray-700">Duration</th>
                  <th className="px-4 py-2 text-xs font-bold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{formatDate(r.date)}</td>
                    <td className="px-4 py-2 text-sm">{formatTime(r.checkIn)}</td>
                    <td className="px-4 py-2 text-sm">{formatTime(r.checkOut)}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {calculateTotalHours(r.checkIn, r.checkOut)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          r.status === "present"
                            ? "bg-green-100 text-green-800"
                            : r.status === "absent"
                            ? "bg-red-100 text-red-800"
                            : r.status === "late_in"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {r.status?.replace("_", " ").toUpperCase() || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceReport;