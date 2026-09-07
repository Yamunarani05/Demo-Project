import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";

interface AvailableReport {
  id: string;
  reportName: string;
}

const Report = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] =
    useState<string>("employee");

  const [availableReports] = useState<AvailableReport[]>([
    { id: "employee", reportName: "Employee Attendance Report" },
    { id: "client", reportName: "Clients Report" },
    { id: "invoice", reportName: "Invoice" },
  ]);

  useEffect(() => {
    navigate("/admin/report/employee-attendance", { replace: true });
  }, [navigate]);

  const handleReportClick = (reportId: string) => {
    setSelectedReport(reportId);

    if (reportId === "employee") {
      navigate("/admin/report/employee-attendance");
    } else if (reportId === "client") {
      navigate("/admin/report/client");
    } else if (reportId === "invoice") {
      navigate("/admin/report/invoice");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4">
          {/* Title row */}
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Reports</h1>
            </div>
          </div>

          {/* Available Reports dropdown row (like Quotation) */}
          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm font-semibold">
              Available Reports:
            </label>
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

          {/* Placeholder – real report pages render in their own components */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <p className="text-xs text-gray-600">Loading report...</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Report;