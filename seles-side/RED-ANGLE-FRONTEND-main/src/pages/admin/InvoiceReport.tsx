import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import invoiceService from "../../Services/invoiceService";
import { exportToExcel } from "../../utils/excelExport";
import toast from "react-hot-toast";

interface Invoice {
  id: string;
  leadId: string;
  leadName: string;
  contactId: string;
  invoiceId: string;
  billingDate: string;
  employeeAssigned: {
    name: string;
    avatar: string;
  };
  status: "Paid" | "Unpaid" | "Sent";
}

interface AvailableReport {
  id: string;
  reportName: string;
}

const InvoiceReport = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] =
    useState<string>("invoice");
  const [sortOrder, setSortOrder] =
    useState<"asc" | "desc">("asc");
  const itemsPerPage = 8;

  const [availableReports] = useState<AvailableReport[]>([
    {
      id: "employee",
      reportName: "Employee Attendance Report",
    },
    { id: "client", reportName: "Clients Report" },
    { id: "invoice", reportName: "Invoice" },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  // ========== LOAD INVOICES ==========
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);

        // FIX: pass params object expected by invoiceService.getInvoices
        const res = (await invoiceService.getInvoices({
          page: 1,
          limit: 100,
        })) as any;

        const payload = res.data;
        const leadsArray: any[] = Array.isArray(payload.data)
          ? payload.data
          : [];

        const flattened: Invoice[] = leadsArray.flatMap(
          (lead: any) => {
            const rawLeadId = lead.leadId;
            const leadName =
              `${lead.firstName ?? ""} ${lead.lastName ?? ""
                }`.trim() || "NA";
            const contactId = lead.contactNumber ?? "";

            const employee = Array.isArray(lead.leadEmployee)
              ? lead.leadEmployee.length > 0
                ? lead.leadEmployee[0].employee
                : null
              : null;
            const employeeName = employee
              ? `${employee.firstName ?? ""} ${employee.lastName ?? ""
                }`.trim() || "Assignee"
              : "Assignee";
            const employeeAvatar = `https://ui-avatars.com/api?name=${encodeURIComponent(
              employeeName
            )}&background=6938ef&color=fff`;

            if (
              !Array.isArray(lead.invoices) ||
              lead.invoices.length === 0
            ) {
              return [];
            }

            return lead.invoices.map((inv: any) => ({
              id: String(inv.invoiceId),
              leadId: lead.leadSerialNumber || `LD${rawLeadId}`,
              leadName,
              contactId: String(contactId),
              invoiceId: `INV${inv.invoiceId}`,
              billingDate: inv.billingDate
                ? new Date(
                  inv.billingDate
                ).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "-",
              employeeAssigned: {
                name: employeeName,
                avatar: employeeAvatar,
              },
              status: inv.status as "Paid" | "Unpaid" | "Sent",
            }));
          }
        );

        setInvoices(flattened);
        setCurrentPage(1);
      } catch (err) {
        console.error("Failed to fetch invoices", err);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // ========== FILTER / SORT / PAGINATION ==========
  const filteredInvoices = invoices.filter((invoice) =>
    [invoice.leadName, invoice.invoiceId, invoice.leadId]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    const dateA = new Date(a.billingDate).getTime();
    const dateB = new Date(b.billingDate).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const totalInvoice = sortedInvoices.length;
  const totalPages = Math.ceil(
    totalInvoice / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = sortedInvoices.slice(
    startIndex,
    endIndex
  );

  const completedPayments = invoices.filter(
    (i) => i.status === "Paid"
  ).length;
  const pendingPayments = invoices.filter(
    (i) => i.status === "Unpaid"
  ).length;

  // ========== REPORT SWITCH DROPDOWN ==========
  const handleReportClick = (reportId: string) => {
    setSelectedReport(reportId);

    if (reportId === "employee") {
      navigate("/admin/report/employee-attendance");
    } else if (reportId === "client") {
      navigate("/admin/report/client");
    } else {
      navigate("/admin/report/invoice");
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "Paid")
      return "bg-green-100 text-green-800";
    if (status === "Unpaid")
      return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const handleSortByDate = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };


  const handleExportToExcel = () => {
    if (!sortedInvoices || sortedInvoices.length === 0) {
      toast.error("No invoices to export");
      return;
    }

    const loadingToast = toast.loading("Exporting invoice report...");

    try {
      const rows = sortedInvoices.map((invoice, index) => ({
        "S.No": index + 1,
        "Lead ID": invoice.leadId,
        "Lead Name": invoice.leadName,
        "Contact ID": invoice.contactId,
        "Invoice ID": invoice.invoiceId,
        "Billing Date": invoice.billingDate,
        "Employee Assigned": invoice.employeeAssigned.name,
        Status: invoice.status,
      }));

      exportToExcel(
        rows,
        `invoice_report-${new Date().toISOString().split("T")[0]}`,
        [
          "S.No",
          "Lead ID",
          "Lead Name",
          "Contact ID",
          "Invoice ID",
          "Billing Date",
          "Employee Assigned",
          "Status",
        ],
        "Invoice Report"
      );

      toast.success("Invoice report exported successfully", { id: loadingToast });
    } catch (error) {
      console.error("Invoice export failed", error);
      toast.error("Failed to export invoice report", { id: loadingToast });
    }
  };


  // ========== UI ==========
  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 w-full">
          {/* Title row */}
          <div className="flex justify-between mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Overall Invoice Report
            </h1>
          </div>

          {/* Available Reports dropdown row */}
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm font-semibold">
              Available Reports:
            </label>
            <select
              value={selectedReport}
              onChange={(e) =>
                handleReportClick(e.target.value)
              }
              className="border rounded px-3 py-2 text-sm w-72"
            >
              {availableReports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.reportName}
                </option>
              ))}
            </select>
          </div>

          {/* Search and actions */}
          <div className="bg-white rounded-xl shadow-md p-3 border border-gray-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
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
                Sort by date {sortOrder === "asc" ? "↑" : "↓"}
              </button>
              <button
                onClick={handleExportToExcel}
                className="px-2.5 py-1.5 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-md font-medium hover:from-[#5a2dd4] hover:to-[#4a23c3] transition-all shadow-sm text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Excel
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
              <p className="text-xs text-gray-600 mb-1">
                Total Invoice
              </p>
              <p className="text-lg font-bold text-[#6938ef]">
                {totalInvoice}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
              <p className="text-xs text-gray-600 mb-1">
                Completed Payments
              </p>
              <p className="text-lg font-bold text-[#6938ef]">
                {completedPayments}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
              <p className="text-xs text-gray-600 mb-1">
                Pending Payments
              </p>
              <p className="text-lg font-bold text-[#6938ef]">
                {pendingPayments}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#e6edf5" }}>
                    {[
                      "Lead Id",
                      "Lead Name",
                      "Contact Id",
                      "Invoice Id",
                      "Billing date",
                      "Employee Assigned",
                      "Status",
                    ].map((h) => (
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
                        colSpan={7}
                        className="text-center py-6 text-sm text-gray-500"
                      >
                        Loading invoices...
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    currentInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-xs text-gray-900">
                          {invoice.leadId}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900">
                          {invoice.leadName}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900">
                          {invoice.contactId}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900">
                          {invoice.invoiceId}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900">
                          {invoice.billingDate}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={invoice.employeeAssigned.avatar}
                              alt={invoice.employeeAssigned.name}
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="text-xs text-gray-900">
                              {invoice.employeeAssigned.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {!loading && !currentInvoices.length && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-6 text-sm text-gray-500"
                      >
                        No invoices found
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
                  {Math.min(
                    endIndex,
                    totalInvoice
                  )}{" "}
                  of {totalInvoice}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.max(1, prev - 1)
                    )
                  }
                  disabled={currentPage === 1}
                  className="text-gray-600 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(totalPages, prev + 1)
                    )
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
    </div>
  );
};

export default InvoiceReport;