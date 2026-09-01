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
  import api from "../../Services/apiClient";
  import { exportToExcel } from "../../utils/excelExport";
  import toast from "react-hot-toast";

  interface InvoiceDetail {
  invoiceId: number;
  billingDate: string;
  plan: string;
  status: string;
  totalAmount: number;
  packageTotal: number;
  addonTotal: number;
  paid: number;
  discount: number;
  balance: number;
  eventName: string;
  engagement: string;
  wedding: string;
  reception: string;
  rituals: string;
  location: string;
}

  interface ClientLead {
  id: string;
  leadId: string;
  leadName: string;
  contactNumber: string;
  email: string;
  eventType: string;
  quotationValue: number;
  invoiceValue: number;
  payments: number;
  balance: number;
  followUps: { notes: string; callTime?: string }[];
  invoiceDetails: InvoiceDetail[];
  createdTime?: string;
  status: "Done" | "In Progress";
  isDeleted: boolean;
  currentStage: string;
}


  interface AvailableReport {
    id: string;
    reportName: string;
  }

  const ClientReport = () => {
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReport, setSelectedReport] =
      useState<string>("client");
    const [sortOrder, setSortOrder] =
      useState<"asc" | "desc">("asc");
    const itemsPerPage = 8;

    const [availableReports] = useState<AvailableReport[]>([
      { id: "employee", reportName: "Employee Attendance Report" },
      {
        id: "client",
        reportName: "Clients Report",
      },
      { id: "invoice", reportName: "Invoice" },
    ]);

    const [clientLeads, setClientLeads] = useState<ClientLead[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchLeads = async () => {
        try {
          setLoading(true);
          const res = await api.get("/reports/lead-summary");

          const leadsArray: any[] = Array.isArray(res.data)
  ? res.data
  : res.data.data || [];


      const mapped: ClientLead[] = leadsArray.map((lead: any) => ({
        id: String(lead.id),
        leadId:
          lead.lead_serial_number ||
          lead.leadSerialNumber ||
          `${lead.leadType === "LD" ? "LD" : "RAS"}-${lead.id}`,
        leadName: lead.leadName ?? "Unknown Client",
        contactNumber: lead.phone ?? "-",
        email: lead.email ?? "-",
  eventType: lead.eventType ?? "-",

  quotationValue: lead.totalQuotationValue ?? 0,
  invoiceValue: lead.totalInvoiceValue ?? 0,
  payments: lead.totalPayments ?? 0,
  balance: lead.balance ?? 0,
  followUps: lead.followUps ?? [],
  invoiceDetails: lead.invoiceDetails ?? [],
  createdTime: lead.createdTime ?? "-",
  status: lead.balance === 0 ? "Done" : "In Progress",
  isDeleted: lead.isDeleted ?? false,
  currentStage: lead.currentStage ?? "-",
}));




          setClientLeads(mapped);
          setCurrentPage(1);
        } catch (err) {
          console.error(
            "Failed to fetch leads for client report",
            err
          );
          setClientLeads([]);
        } finally {
          setLoading(false);
        }
      };

      fetchLeads();
    }, []);

    const filteredLeads = clientLeads.filter((lead) =>
      [lead.leadName, lead.leadId, lead.email]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    const sortedLeads = [...filteredLeads].sort((a, b) => {
      // Sort by createdTime for Sort by date functionality
      const dateA = new Date(a.createdTime || "1970-01-01").getTime();
      const dateB = new Date(b.createdTime || "1970-01-01").getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });


    const totalPages = Math.ceil(
      sortedLeads.length / itemsPerPage
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLeads = sortedLeads.slice(startIndex, endIndex);

    const totalClients = clientLeads.length;
    const completedLeads = clientLeads.filter(
      (l) => l.status === "Done"
    ).length;
    const inProgressLeads = clientLeads.filter(
      (l) => l.status === "In Progress"
    ).length;

    const handleReportClick = (reportId: string) => {
      setSelectedReport(reportId);

      if (reportId === "employee") {
        navigate("/admin/report/employee-attendance");
      } else if (reportId === "invoice") {
        navigate("/admin/report/invoice");
      } else {
        navigate("/admin/report/client");
      }
    };

    const getStatusColor = (status: string) => {
      if (status === "Done")
        return "bg-green-100 text-green-800";
      return "bg-blue-100 text-blue-800";
    };

    const handleSortByDate = () => {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    const handleExportToExcel = () => {
      if (!sortedLeads || sortedLeads.length === 0) {
        toast.error("No leads to export");
        return;
      }

      toast.success("Export started...");

      try {
        const rows = sortedLeads.flatMap((lead) => {
          if (lead.invoiceDetails.length === 0) {
            return [{
              "Lead ID": lead.leadId,
              "Lead Name": lead.leadName,
              "Contact Number": lead.contactNumber,
              Email: lead.email,
              "Event Type": lead.eventType,
              "Invoice ID": "-",
              "Invoice Status": "-",
              "Billing Date": "-",
              "Event Name": "-",
              "Engagement": "-",
              "Wedding": "-",
              "Reception": "-",
              "Rituals": "-",
              "Location": "-",
              "Total Amount": "-",
              "Paid": "-",
              "Balance": "-",
              Status: lead.status,
              "Lead Status": lead.isDeleted ? "Deleted" : "Active",
            }];
          }
          return lead.invoiceDetails.map((inv) => ({
            "Lead ID": lead.leadId,
            "Lead Name": lead.leadName,
            "Contact Number": lead.contactNumber,
            Email: lead.email,
            "Event Type": lead.eventType,
            "Invoice ID": `INV${inv.invoiceId}`,
            "Invoice Status": inv.status,
            "Billing Date": inv.billingDate ? new Date(inv.billingDate).toLocaleDateString() : "-",
            "Event Name": inv.eventName || "-",
            "Engagement": inv.engagement || "-",
            "Wedding": inv.wedding || "-",
            "Reception": inv.reception || "-",
            "Rituals": inv.rituals || "-",
            "Location": inv.location || "-",
            "Total Amount": inv.totalAmount != null ? String(inv.totalAmount) : "-",
            "Paid": inv.paid != null ? String(inv.paid) : "-",
            "Balance": inv.balance != null ? String(inv.balance) : "-",
            Status: lead.status,
            "Lead Status": lead.isDeleted ? "Deleted" : "Active",
          }));
        });

        exportToExcel(
  rows,
  `clients_report-${new Date().toISOString().split("T")[0]}`,
  [
    "Lead ID",
    "Lead Name",
    "Contact Number",
    "Email",
    "Event Type",
    "Invoice ID",
    "Invoice Status",
    "Billing Date",
    "Event Name",
    "Engagement",
    "Wedding",
    "Reception",
    "Rituals",
    "Location",
    "Total Amount",
    "Paid",
    "Balance",
    "Status",
    "Lead Status",
  ],
  "Clients Report"
);



      } catch (error) {
        console.error("Export failed", error);
        toast.error("Failed to export clients report");
      }
    };

    return (
      <div className="fixed inset-0 w-full h-full bg-gray-50 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
          <Header />

          <main className="flex-1 overflow-y-auto p-3 sm:p-4 w-full">
            {/* Title row */}
            <div className="flex justify-between mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Overall Client Report
              </h1>
            </div>

            {/* Available Reports dropdown row (like Quotation) */}
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
                  Sort by date{" "}
                  {sortOrder === "asc" ? "↑" : "↓"}
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
                  Total Clients
                </p>
                <p className="text-lg font-bold text-[#6938ef]">
                  {totalClients}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
                <p className="text-xs text-gray-600 mb-1">
                  Completed leads
                </p>
                <p className="text-lg font-bold text-[#6938ef]">
                  {completedLeads}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3">
                <p className="text-xs text-gray-600 mb-1">
                  Inprogress
                </p>
                <p className="text-lg font-bold text-[#6938ef]">
                  {inProgressLeads}
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
                        "Lead ID",
                        "Lead Name",
                        "Contact Number",
                        "Email",
                        "Invoice ID",
                        "Invoice Status",
                        "Billing Date",
                        "Event Name",
                        "Engagement",
                        "Wedding",
                        "Reception",
                        "Rituals",
                        "Location",
                        "Total Amount",
                        "Paid",
                        "Balance",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-bold text-gray-900 whitespace-nowrap"
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
                          Loading leads...
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      currentLeads.flatMap((lead) => {
                        if (lead.invoiceDetails.length === 0) {
                          // Lead has no invoices — show one row with dashes
                          return [
                            <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3 text-xs text-gray-900">{lead.leadId}</td>
                              <td className="px-4 py-3 text-xs text-gray-900">
                                <div className="flex items-center gap-1.5">
                                  {lead.leadName}
                                  {lead.isDeleted && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-100 text-red-600 rounded">
                                      Deleted
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-900">{lead.contactNumber}</td>
                              <td className="px-4 py-3 text-xs text-gray-900">{lead.email}</td>
                              <td className="px-4 py-3 text-xs text-gray-500">-</td>
                              <td className="px-4 py-3 text-xs text-gray-500">-</td>
                              <td className="px-4 py-3 text-xs text-gray-500">-</td>
                              <td className="px-4 py-3 text-xs text-gray-500">-</td>
                              <td className="px-4 py-3 text-xs text-gray-500">-</td>
                              <td className="px-4 py-3 text-xs text-gray-500">-</td>
                              <td className="px-4 py-3 text-xs text-gray-500">-</td>
                              <td className="px-4 py-3 text-xs text-gray-500">-</td>
                              <td className="px-4 py-3 text-xs text-gray-500">-</td>
                              <td className="px-4 py-3 text-xs text-gray-500">-</td>
                              <td className="px-4 py-3 text-xs text-gray-500">-</td>
                              <td className="px-4 py-3 text-xs text-gray-500">-</td>
                              <td className="px-4 py-3">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(lead.status)}`}>
                                  {lead.status}
                                </span>
                              </td>
                            </tr>,
                          ];
                        }
                        return lead.invoiceDetails.map((inv) => (
                          <tr key={`${lead.id}-inv-${inv.invoiceId}`} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-xs text-gray-900">{lead.leadId}</td>
                            <td className="px-4 py-3 text-xs text-gray-900">
                              <div className="flex items-center gap-1.5">
                                {lead.leadName}
                                {lead.isDeleted && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-100 text-red-600 rounded">
                                    Deleted
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-900">{lead.contactNumber}</td>
                            <td className="px-4 py-3 text-xs text-gray-900">{lead.email}</td>
                            <td className="px-4 py-3 text-xs text-blue-700 font-medium">INV{inv.invoiceId}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                                inv.status === "Approved" ? "bg-green-100 text-green-800" :
                                inv.status === "Sent" ? "bg-blue-100 text-blue-800" :
                                inv.status === "Rejected" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-700"
                              }`}>{inv.status}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-900 whitespace-nowrap">
                              {inv.billingDate ? new Date(inv.billingDate).toLocaleDateString() : "-"}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-900">{inv.eventName || "-"}</td>
                            <td className="px-4 py-3 text-xs text-gray-900">{inv.engagement || "-"}</td>
                            <td className="px-4 py-3 text-xs text-gray-900">{inv.wedding || "-"}</td>
                            <td className="px-4 py-3 text-xs text-gray-900">{inv.reception || "-"}</td>
                            <td className="px-4 py-3 text-xs text-gray-900">{inv.rituals || "-"}</td>
                            <td className="px-4 py-3 text-xs text-gray-900">{inv.location || "-"}</td>
                            <td className="px-4 py-3 text-xs text-gray-900">
                              {inv.totalAmount != null ? `₹${Number(inv.totalAmount).toLocaleString("en-IN")}` : "-"}
                            </td>
                            <td className="px-4 py-3 text-xs text-green-700 font-medium">
                              {inv.paid != null ? `₹${Number(inv.paid).toLocaleString("en-IN")}` : "-"}
                            </td>
                            <td className="px-4 py-3 text-xs text-red-600 font-medium">
                              {inv.balance != null ? `₹${Number(inv.balance).toLocaleString("en-IN")}` : "-"}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(lead.status)}`}>
                                {lead.status}
                              </span>
                            </td>
                          </tr>
                        ));
                      })}
                    {!loading && !currentLeads.length && (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-6 text-sm text-gray-500"
                        >
                          No leads found
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
                      sortedLeads.length
                    )}{" "}
                    of {sortedLeads.length}
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

  export default ClientReport;