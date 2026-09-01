import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import apiClient from "../../Services/apiClient";

/* ================= TYPES ================= */

type LeadStatus = "New" | "Quotation" | "Confirmation" | "Finalized";

interface Lead {
  id: string;
  leadSerialNumber: string;
  leadType: string;
  name: string;
  type: string;
  date: string;
  status: LeadStatus;
}

interface MonthWiseLead {
  month: number;
  total: number;
  inProgress: number;
  finalized: number;
}

interface MonthWiseApiLead {
  month: string;
  totalLeads: number;
  finalizedLeads: number;
}

/* ================= CONSTANTS ================= */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-green-100 text-green-700 border border-green-300",
  Quotation: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  Confirmation: "bg-blue-100 text-blue-700 border border-blue-300",
  Finalized: "bg-purple-100 text-purple-700 border border-purple-300",
};

const mapLeadStatus = (stage?: string): LeadStatus => {
  const v = stage?.toLowerCase();
  switch (v) {
    case "quotation":
      return "Quotation";
    case "confirmation":
      return "Confirmation";
    case "finalised":
    case "finalized":
      return "Finalized";
    default:
      return "New";
  }
};

/* ================= WAVE CHART ================= */

const WaveChart: React.FC<{ data: MonthWiseLead[] }> = ({ data }) => {
  const width = 1000;
  const height = 280;
  const padding = 60;

  const maxValue = Math.max(...data.map(d => d.total), 1);
  const xStep = (width - padding * 2) / (data.length - 1);

  const y = (value: number) =>
    height - padding - (value / maxValue) * (height - padding * 2);

  const buildPath = (key: keyof MonthWiseLead) =>
    data.reduce((path, point, i) => {
      const x = padding + i * xStep;
      const yVal = y(point[key] as number);

      if (i === 0) return `M ${x} ${yVal}`;

      const prevX = padding + (i - 1) * xStep;
      const prevY = y(data[i - 1][key] as number);
      const cx = (prevX + x) / 2;

      return `${path} C ${cx} ${prevY}, ${cx} ${yVal}, ${x} ${yVal}`;
    }, "");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[280px]" preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map(p => (
        <line
          key={p}
          x1={padding}
          x2={width - padding}
          y1={padding + p * (height - padding * 2)}
          y2={padding + p * (height - padding * 2)}
          stroke="#E5E7EB"
        />
      ))}

      <path d={`${buildPath("total")} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`} fill="rgba(34,197,94,0.12)" />
      <path d={`${buildPath("inProgress")} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`} fill="rgba(250,204,21,0.12)" />
      <path d={`${buildPath("finalized")} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`} fill="rgba(168,85,247,0.12)" />

      <path d={buildPath("total")} stroke="#16a34a" strokeWidth="3" fill="none" />
      <path d={buildPath("inProgress")} stroke="#eab308" strokeWidth="3" fill="none" />
      <path d={buildPath("finalized")} stroke="#a855f7" strokeWidth="3" fill="none" />
    </svg>
  );
};

/* ================= COMPONENT ================= */

const EmployeeProfile: React.FC = () => {
  const navigate = useNavigate();

  /* ✅ SAME logic as Admin Dashboard */
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const year = useMemo(
    () => selectedMonth.getFullYear(),
    [selectedMonth]
  );

  const monthInputValue = `${selectedMonth.getFullYear()}-${String(
    selectedMonth.getMonth() + 1
  ).padStart(2, "0")}`;

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [y, m] = e.target.value.split("-");
    if (!y || !m) return;
    setSelectedMonth(new Date(Number(y), Number(m) - 1, 1));
  };

  const [chartData, setChartData] = useState<MonthWiseLead[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  const handleView = useCallback(
    (leadId: string, leadSerialNumber?: string) => navigate(`/employee/leads/${leadId}/overview`, { state: { leadSerialNumber } }),
    [navigate]
  );

  const fetchMonthWiseLeads = useCallback(async (selectedYear: number) => {
    setChartLoading(true);
    try {
      const res = await apiClient.get("/leads/channel/month-wise", {
        params: {
          startDate: `${selectedYear}-01-01`,
          endDate: `${selectedYear}-12-31`,
        },
      });

      const apiData: MonthWiseApiLead[] = res.data?.data ?? [];

      setChartData(
        apiData.map(item => ({
          month: Number(item.month.split("-")[1]),
          total: item.totalLeads,
          finalized: item.finalizedLeads,
          inProgress: item.totalLeads - item.finalizedLeads,
        }))
      );
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const res = await apiClient.get("/leads/tasks/my");
      const tasks = res.data?.data ?? [];

      const map = new Map<string, Lead>();

      tasks.forEach((task: any) => {
        const lead = task?.lead;
        if (!lead?.leadId || map.has(String(lead.leadId))) return;

        map.set(String(lead.leadId), {
          id: String(lead.leadId),
          leadSerialNumber: lead.leadSerialNumber || String(lead.leadId),
          leadType: lead.leadType ?? "",
          name: `${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim() || "-",
          type: task.taskName ?? "-",
          date: (() => {
            const raw =
              task?.dueDate ||
              lead.eventDate ||
              lead.weddingDate ||
              lead.receptionDate;
            if (!raw) return "-";
            const d = new Date(raw);
            return !isNaN(d.getTime())
              ? d.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-";
          })(),
          status: mapLeadStatus(lead.currentStage),
        });
      });

      setLeads([...map.values()]);
    } catch {
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonthWiseLeads(year);
  }, [year, fetchMonthWiseLeads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const normalizedChartData = useMemo(() => {
    const map = new Map(chartData.map(d => [d.month, d]));
    return Array.from({ length: 12 }, (_, i) =>
      map.get(i + 1) || { month: i + 1, total: 0, inProgress: 0, finalized: 0 }
    );
  }, [chartData]);

  return (
    <div className="fixed inset-0 bg-[#f6f4ff] flex overflow-hidden">
      <Sidebar forceOpen />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* ================= CHART ================= */}
          <section className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Month-wise Leads
              </h2>

              {/* ✅ SAME INPUT AS ADMIN */}
              <input
                type="month"
                value={monthInputValue}
                onChange={handleMonthChange}
                className="px-2 py-1 border border-gray-300 rounded-md
                           text-xs sm:text-sm focus:outline-none
                           focus:ring-1 focus:ring-[#6938ef]"
              />
            </div>

            <div className="flex gap-6 text-sm mb-4">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full" /> Total
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-400 rounded-full" /> In Progress
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full" /> Finalized
              </span>
            </div>

            {chartLoading ? (
              <p className="text-gray-400">Loading chart…</p>
            ) : (
              <>
                <WaveChart data={normalizedChartData} />
                <div className="grid grid-cols-12 mt-3 text-xs text-gray-500">
                  {MONTHS.map(m => (
                    <span key={m} className="text-center">{m}</span>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* ================= RECENT LEADS TABLE ================= */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Recent Leads
            </h2>

            <div className="bg-[#EEF3F9] rounded-xl px-6 py-3 grid grid-cols-12 text-sm font-semibold text-gray-700">
              <span className="col-span-2">Lead ID</span>
              <span className="col-span-3">Name</span>
              <span className="col-span-2">Task</span>
              <span className="col-span-3">Due Date</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-1 text-right">Action</span>
            </div>

            {leadsLoading ? (
              <p className="text-center text-gray-400 py-6">
                Loading recent leads…
              </p>
            ) : leads.length === 0 ? (
              <p className="text-center text-gray-400 py-6">
                No recent leads found
              </p>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white rounded-xl px-6 py-4 grid grid-cols-12 items-center border shadow-sm hover:shadow-md transition"
                  >
                    <span className="col-span-2 font-medium flex items-center gap-1.5">
                      <span>{lead.leadSerialNumber}</span>
                      {lead.leadType && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${lead.leadType === "RAS"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {lead.leadType}
                        </span>
                      )}
                    </span>
                    <span className="col-span-3">{lead.name}</span>
                    <span className="col-span-2 text-sm text-gray-600">
                      {lead.type}
                    </span>
                    <span className="col-span-3 text-sm">{lead.date}</span>
                    <span className="col-span-1">
                      <span className={`px-3 py-1 rounded-full text-xs ${STATUS_STYLES[lead.status]}`}>
                        {lead.status}
                      </span>
                    </span>
                    <span className="col-span-1 text-right">
                      <button
                        onClick={() => handleView(lead.id, lead.leadSerialNumber)}
                        className="text-purple-600 hover:underline text-sm font-medium"
                      >
                        View
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default EmployeeProfile;
