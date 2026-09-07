// src/pages/employee/EmployeeAttendance.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import apiClient from "../../Services/apiClient";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import toast from "react-hot-toast";

/* ================= TYPES ================= */

interface AttendanceApiItem {
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status?: string;
}

interface AttendanceRow {
  inTime: string;
  outTime: string;
  hours: string;
  status: "In Progress" | "Completed";
  badgeClass: string;
}

/* ================= HELPERS ================= */

const formatTime = (time?: string | null): string => {
  if (!time) return "--:--";
  return new Date(time).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const calculateDuration = (start?: string | null, end?: string | null) => {
  if (!start) return "--";
  const startMs = new Date(start).getTime();
  const endMs = end ? new Date(end).getTime() : Date.now();
  const diff = endMs - startMs;
  if (diff <= 0) return "--";

  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return `${hrs.toString().padStart(2, "0")}h ${mins
    .toString()
    .padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
};

const getMonthRange = (year: number, month: number) => {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
};

/* ================= COMPONENT ================= */

const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState<AttendanceApiItem[]>([]);
  const [punchIn, setPunchIn] = useState<string | null>(null);
  const [punchOut, setPunchOut] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [, tick] = useState(0);

  const todayKey = new Date().toISOString().split("T")[0];

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  /* ================= FETCH ATTENDANCE ================= */

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/attendance/me", {
        params: { from: fromDate, to: toDate },
      });

      const records: AttendanceApiItem[] = res.data?.attendance ?? [];
      setAttendance(records);

      const today = records.find((r) => r.date.startsWith(todayKey));
      setPunchIn(today?.checkIn ?? null);
      setPunchOut(today?.checkOut ?? null);
    } catch {
      setAttendance([]);
      setPunchIn(null);
      setPunchOut(null);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, todayKey]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    if (!punchIn || punchOut) return;
    const id = setInterval(() => tick((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [punchIn, punchOut]);

  /* ================= ACTIONS ================= */

  const handlePunchIn = async () => {
    if (actionLoading || punchIn) return;
    setActionLoading(true);
    await apiClient.post("/attendance/checkin", {
      timestamp: new Date().toISOString(),
    });
    await fetchAttendance();
    setActionLoading(false);
  };

  const handlePunchOut = async () => {
    if (actionLoading || !punchIn || punchOut) return;
    setActionLoading(true);
    await apiClient.post("/attendance/checkout", {
      timestamp: new Date().toISOString(),
    });
    await fetchAttendance();
    setActionLoading(false);
  };

  /* ================= EXCEL DOWNLOAD ================= */
  const downloadAttendanceExcel = async () => {
    const toastId = toast.loading("Preparing attendance report...");

    try {
      const res = await apiClient.get("/attendance/me/download", {
        params: { from: fromDate, to: toDate },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-${fromDate}-to-${toDate}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Attendance report downloaded successfully", {
        id: toastId,
      });
    } catch (err) {
      console.error(err);

      toast.error("Failed to download attendance report", {
        id: toastId,
      });
    }
  };


  /* ================= TODAY ROW ================= */

  const todayRow: AttendanceRow | null = useMemo(() => {
    if (!punchIn) return null;
    const inProgress = punchIn && !punchOut;

    return {
      inTime: formatTime(punchIn),
      outTime: formatTime(punchOut),
      hours: calculateDuration(punchIn, punchOut),
      status: inProgress ? "In Progress" : "Completed",
      badgeClass: inProgress
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-slate-100 text-slate-700 border-slate-300",
    };
  }, [punchIn, punchOut]);

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 flex bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-10 py-8 space-y-10">

          {/* FILTER + DOWNLOAD */}
          <div className="flex justify-between items-end gap-3 mb-6">
            <div className="flex gap-4 items-center bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 px-2">
                <label className="text-sm font-semibold text-slate-600">From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-2 py-1 text-sm bg-transparent outline-none text-slate-800"
                />
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              <div className="flex items-center gap-2 px-2">
                <label className="text-sm font-semibold text-slate-600">To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-2 py-1 text-sm bg-transparent outline-none text-slate-800"
                />
              </div>
            </div>

            <button
              onClick={downloadAttendanceExcel}
              className="px-5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium hover:bg-slate-100"
            >
              Download Attendance Report
            </button>
          </div>

          {/* ACTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ActionCard title="Punch In" time={formatTime(punchIn)}>
              {!punchIn && (
                <button
                  onClick={handlePunchIn}
                  disabled={actionLoading}
                  className="px-8 py-3 rounded-lg bg-blue-600 text-white"
                >
                  Punch In
                </button>
              )}
            </ActionCard>

            <ActionCard title="Punch Out" time={formatTime(punchOut)}>
              {punchIn && !punchOut && (
                <button
                  onClick={handlePunchOut}
                  disabled={actionLoading}
                  className="px-8 py-3 rounded-lg bg-slate-800 text-white"
                >
                  Punch Out
                </button>
              )}
            </ActionCard>
          </div>

          {/* ATTENDANCE HISTORY TABLE */}
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Attendance History
            </h2>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="grid grid-cols-5 px-6 py-3 bg-slate-100 text-sm font-semibold text-slate-700">
                <span>Date</span>
                <span>In</span>
                <span>Out</span>
                <span>Hours</span>
                <span className="text-right">Status</span>
              </div>

              {loading ? (
                <div className="px-6 py-8 text-center text-sm text-slate-500">
                  Loading attendance records...
                </div>
              ) : attendance.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-500">
                  No attendance records found for the selected dates.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {attendance.slice().reverse().map((r, i) => {
                    const dateObj = new Date(r.date);
                    const formattedDate = dateObj.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    });
                    
                    const inTime = formatTime(r.checkIn);
                    const outTime = formatTime(r.checkOut);
                    const hours = calculateDuration(r.checkIn, r.checkOut);
                    
                    const statusStr = (r.status || "absent").toLowerCase();
                    const inProgress = r.checkIn && !r.checkOut && r.date.startsWith(todayKey);
                    
                    let displayStatus = statusStr.replace("_", " ").toUpperCase();
                    if (inProgress) displayStatus = "IN PROGRESS";

                    let badgeClass = "bg-slate-100 text-slate-700 border-slate-300";
                    if (inProgress) badgeClass = "bg-blue-50 border-blue-200 text-blue-700";
                    else if (statusStr === "present" || statusStr === "completed") badgeClass = "bg-green-50 text-green-700 border-green-200";
                    else if (statusStr === "absent") badgeClass = "bg-red-50 text-red-700 border-red-200";
                    else if (statusStr === "late_in") badgeClass = "bg-yellow-50 text-yellow-700 border-yellow-200";

                    return (
                      <div key={i} className="grid grid-cols-5 px-6 py-4 text-sm items-center hover:bg-slate-50 transition-colors">
                        <span className="font-medium text-slate-800">{formattedDate}</span>
                        <span className="text-slate-600">{inTime}</span>
                        <span className="text-slate-600">{outTime}</span>
                        <span className="text-slate-600 font-medium">{hours}</span>
                        <span className="justify-self-end">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${badgeClass}`}>
                            {displayStatus}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

/* ================= UI PART ================= */

const ActionCard = ({
  title,
  time,
  children,
}: {
  title: string;
  time: string;
  children?: React.ReactNode;
}) => (
  <div className="rounded-xl border bg-white p-6 shadow-sm">
    <p className="text-sm uppercase text-slate-500">{title}</p>
    <h2 className="text-3xl font-semibold mt-4">{time}</h2>
    {children && <div className="mt-6">{children}</div>}
  </div>
);

export default EmployeeAttendance;
