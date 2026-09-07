import { useEffect, useMemo, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import { AdminAttendanceAPI } from "../../api/adminAttendance.api";
import toast from "react-hot-toast";
import { Filter } from "lucide-react";

/* ================= TYPES ================= */

interface AttendanceApiItem {
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
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

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState<AttendanceApiItem[]>([]);
  const [punchIn, setPunchIn] = useState<string | null>(null);
  const [punchOut, setPunchOut] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [, tick] = useState(0);

  const todayKey = new Date().toISOString().split("T")[0];

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [showFilters, setShowFilters] = useState(false);

  const filteredAttendance = useMemo(() => {
    let data = [...attendance];

    // 📅 Last 7 days (default view)
    if (!fromDate && !toDate) {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 6);

      data = data.filter((a) => new Date(a.date) >= lastWeek);
    }

    // 📆 Custom date range
    if (fromDate) {
      data = data.filter(
        (a) => new Date(a.date) >= new Date(fromDate)
      );
    }

    if (toDate) {
      data = data.filter(
        (a) => new Date(a.date) <= new Date(toDate)
      );
    }

    return data;
  }, [attendance, fromDate, toDate]);

  const attendanceRows = useMemo(() => {
    return filteredAttendance.map((row) => {
      const inProgress = row.checkIn && !row.checkOut;

      return {
        date: new Date(row.date).toLocaleDateString("en-IN"),
        inTime: formatTime(row.checkIn),
        outTime: formatTime(row.checkOut),
        hours: calculateDuration(row.checkIn, row.checkOut),
        status: row.checkIn
          ? inProgress
            ? "In Progress"
            : "Completed"
          : "Absent",
        badgeClass: row.checkIn
          ? inProgress
            ? "bg-blue-50 text-blue-500 "
            : "bg-emerald-50 text-emerald-500 "
          : "bg-rose-50 text-rose-500 ",
      };
    });
  }, [filteredAttendance]);


  /* ================= FETCH ATTENDANCE ================= */

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminAttendanceAPI.getMyAttendance(
        0, // backend should resolve admin user from token
        "2026-01-01",
        todayKey
      );

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
  }, [todayKey]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  /* ================= LIVE TIMER ================= */

  useEffect(() => {
    if (!punchIn || punchOut) return;
    const id = setInterval(() => tick((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [punchIn, punchOut]);

  /* ================= ACTIONS ================= */

  const handlePunchIn = async () => {
    if (actionLoading || punchIn) return;
    setActionLoading(true);
    await AdminAttendanceAPI.checkIn(new Date().toISOString());
    await fetchAttendance();
    setActionLoading(false);
  };

  const handlePunchOut = async () => {
    if (actionLoading || !punchIn || punchOut) return;
    setActionLoading(true);
    await AdminAttendanceAPI.checkOut(new Date().toISOString());
    await fetchAttendance();
    setActionLoading(false);
  };

  /* ================= DOWNLOAD ================= */

  const downloadAttendanceExcel = async () => {
    const toastId = toast.loading("Preparing attendance report...");

    try {
      const { from, to } = getMonthRange(selectedYear, selectedMonth);

      const res = await AdminAttendanceAPI.download(from, to);

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-${selectedYear}-${selectedMonth}.xlsx`;
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
          <div className="flex justify-end gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border rounded px-3 py-2 text-sm"
            >
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                .map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border rounded px-3 py-2 text-sm"
            >
              {[0, 1, 2, 3, 4].map((i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>

            <button
              onClick={downloadAttendanceExcel}
              className="px-5 py-2 rounded-lg border bg-white text-sm font-medium hover:bg-slate-100"
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

          {/* TODAY TABLE */}
          <section>
<div className="flex items-center justify-between mb-4">
  <h2 className="text-lg font-semibold">Attendance</h2>

  <button
    onClick={() => setShowFilters((v) => !v)}
    className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white hover:bg-slate-100"
  >
    <Filter size={16} />
    <span className="text-sm">Filter</span>
  </button>
</div>

            {showFilters && (
              <div className="mb-6 bg-white border rounded-xl px-5 py-4 shadow-sm">
                <div className="flex items-end justify-between gap-6">

                  {/* LEFT: FROM + TO */}
                  <div className="flex items-end gap-4">
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-slate-500 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="
                          h-9 px-3 text-sm rounded-lg
                          border border-slate-300
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                        "
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-slate-500 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="
                          h-9 px-3 text-sm rounded-lg
                          border border-slate-300
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                        "
                      />
                    </div>
                  </div>

                  {/* RIGHT: RESET */}
                  <button
                    onClick={() => {
                      setFromDate("");
                      setToDate("");
                    }}
                    className="
                      h-9 px-4 text-sm font-medium
                      rounded-lg border border-slate-300
                      bg-slate-50 text-slate-700
                      hover:bg-slate-100 transition
                    "
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-5 px-6 py-4 bg-slate-50 border-b text-xs font-semibold text-slate-600 uppercase tracking-wide">
              <span>Date</span>
              <span>In</span>
              <span>Out</span>
              <span>Hours</span>
              <span className="text-right">Status</span>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="py-14 text-center">
                <p className="text-sm text-slate-500">Loading attendance...</p>
              </div>
            ) : attendanceRows.length === 0 ? (
              /* Empty state */
              <div className="py-14 text-center">
                <p className="text-base font-semibold text-slate-700">
                  No attendance data found
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Try selecting a different date range.
                </p>
              </div>
            ) : (
              /* Rows */
              attendanceRows.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-5 px-6 py-4 text-sm border-b border-slate-100
                    hover:bg-slate-50 transition
                    ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                  `}
                >
                  {/* Date */}
                  <span className="font-semibold text-slate-900">
                    {row.date}
                  </span>

                  {/* In */}
                  <span className="text-slate-700">{row.inTime}</span>

                  {/* Out */}
                  <span className="text-slate-700">{row.outTime}</span>

                  {/* Hours */}
                  <span className="text-slate-700">
                    {row.hours}
                  </span>

                  {/* Status */}
                  <span className="justify-self-end">
                    <span
                      className={`px-4 py-1 rounded-full border text-xs font-semibold ${row.badgeClass}`}
                    >
                      {row.status}
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
          </section>

        </main>
      </div>
    </div>
  );
};

/* ================= ACTION CARD ================= */

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

export default AdminAttendance;
