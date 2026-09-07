import React, { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import apiClient from "../../Services/apiClient";
import toast from "react-hot-toast";

/* ================= TYPES ================= */

type LeaveStatus = "Approved" | "Pending" | "Rejected";
type FilterType = "All" | LeaveStatus;

interface LeaveItem {
  id: string;
  type: string;
  fromDate: string;
  toDate: string;
  days: number;
  status: LeaveStatus;
}

interface Summary {
  annualUsed: number;
  approvedThisMonth: number;
  pendingThisMonth: number;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LEAVETYPES = [
  "Casual Leave",
  "Sick Leave",
  "Annual Leave",
  "Work From Home",
];

/* ================= HELPERS ================= */

const calculateSummary = (rows: LeaveItem[]): Summary => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  let annualUsed = 0;              // days (correct)
  let approvedThisMonth = 0;       // requests
  let pendingThisMonth = 0;        // requests

  rows.forEach((l) => {
    const from = new Date(l.fromDate);

    // ✅ Annual used = total approved DAYS
    if (l.status === "Approved") {
      annualUsed += l.days;
    }

    // ✅ Monthly counts = REQUEST COUNT
    if (from.getMonth() === month && from.getFullYear() === year) {
      if (l.status === "Approved") approvedThisMonth += 1;
      if (l.status === "Pending") pendingThisMonth += 1;
    }
  });

  return { annualUsed, approvedThisMonth, pendingThisMonth };
};

/* ================= MAIN ================= */

const LeaveApproval: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>("All");
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [summary, setSummary] = useState<Summary>({
    annualUsed: 0,
    approvedThisMonth: 0,
    pendingThisMonth: 0,
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH LEAVES ---------- */

  const fetchLeaveHistory = useCallback(async () => {
    try {
      setLoading(true);

      const res = await apiClient.get("/employees/leave", {
        params: { page: 0, limit: 50 },
      });

      const rows: any[] = res.data?.leaves?.leaves ?? [];

      const mapped: LeaveItem[] = rows.map((l) => ({
        id: String(l.leaveRequestId),
        type: String(l.leaveType),
        fromDate: String(l.fromDate).split("T")[0],
        toDate: String(l.toDate).split("T")[0],
        days: Number(l.noOfDays),
        status: l.status as LeaveStatus,
      }));

      setLeaves(mapped);
      setSummary(calculateSummary(mapped));
    } catch (err) {
      console.error("Failed to fetch leave history", err);
      setLeaves([]);
      setSummary({ annualUsed: 0, approvedThisMonth: 0, pendingThisMonth: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveHistory();
  }, [fetchLeaveHistory]);

  /* ---------- FILTER ---------- */

  const filteredLeaves = useMemo(() => {
    if (filter === "All") return leaves;
    return leaves.filter((l) => l.status === filter);
  }, [filter, leaves]);

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 flex bg-gray-50 overflow-hidden">
      <Sidebar forceOpen />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-10 py-8 space-y-10">
          {/* SUMMARY */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard title="Annual Leave Used" value={summary.annualUsed} />
            <SummaryCard
              title="Approved This Month"
              value={summary.approvedThisMonth}
            />
            <SummaryCard
              title="Pending This Month"
              value={summary.pendingThisMonth}
            />
          </section>

          {/* HEADER */}
          <section className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Leave History</h2>
            <button
              onClick={() => setOpen(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-xl"
            >
              New Leave
            </button>
          </section>

          {/* TABLE */}
          <section className="bg-white rounded-2xl border overflow-hidden">
            <div className="flex gap-3 px-6 py-4 border-b text-sm">
              {(["All", "Approved", "Pending", "Rejected"] as FilterType[]).map(
                (s) => (
                  <button
                    key={s}
                    className={`px-3 py-1 rounded-full ${filter === s
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600"
                      }`}
                    onClick={() => setFilter(s)}
                  >
                    {s}
                  </button>
                )
              )}
            </div>

            {loading ? (
              <p className="py-10 text-center text-gray-500">
                Loading leave history…
              </p>
            ) : filteredLeaves.length === 0 ? (
              <p className="py-10 text-center text-gray-500">
                No leave records found
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Dates</th>
                    <th className="px-6 py-4 text-center">Days</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="px-6 py-4">{l.type}</td>
                      <td className="px-6 py-4">
                        {l.fromDate} – {l.toDate}
                      </td>
                      <td className="px-6 py-4 text-center">{l.days}</td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>

      <NewLeaveModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchLeaveHistory}
      />
    </div>
  );
};

/* ================= MODAL ================= */

const NewLeaveModal: React.FC<ModalProps> = ({ open, onClose, onSuccess }) => {
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(0);

  // 🔴 Error states
  const [errors, setErrors] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  useEffect(() => {
    if (fromDate && toDate) {
      const diff =
        (new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86400000 +
        1;
      setDays(diff > 0 ? diff : 0);
    } else {
      setDays(0);
    }
  }, [fromDate, toDate]);

  if (!open) return null;

  const validate = () => {
    const newErrors = {
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
    };

    if (!leaveType) newErrors.leaveType = "Leave type is required";
    if (!fromDate) newErrors.fromDate = "From date is required";
    if (!toDate) newErrors.toDate = "To date is required";
    if (!reason.trim()) newErrors.reason = "Reason is required";
    if (days <= 0)
      newErrors.toDate = "To date must be greater than or equal to From date";

    setErrors(newErrors);

    return !Object.values(newErrors).some((e) => e !== "");
  };

  const submit = async () => {
    if (!validate()) return;

    try {
      await apiClient.post("/employees/leave", {
        leaveType,
        fromDate: new Date(fromDate).toISOString(),
        toDate: new Date(toDate).toISOString(),
        noOfDays: days,
        reason,
      });

      toast.success("Leave applied successfully!");

      onSuccess();
      onClose();

      // reset form
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setReason("");
      setDays(0);
      setErrors({
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: "",
      });
    } catch (err) {
      console.error("Failed to apply leave", err);
      toast.error("Failed to apply leave.");
    }
  };


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[640px] rounded-2xl p-8 space-y-6">
        <h3 className="text-xl font-semibold">Apply for Leave</h3>

        {/* Leave Type */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Leave Type <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full p-3 border rounded-xl ${errors.leaveType ? "border-red-500" : ""
              }`}
            value={leaveType}
            onChange={(e) => {
              setLeaveType(e.target.value);
              setErrors({ ...errors, leaveType: "" });
            }}
          >
            <option value="">Select Leave Type</option>
            {LEAVETYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {errors.leaveType && (
            <p className="text-xs text-red-500">{errors.leaveType}</p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          {/* From Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              From Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className={`w-full p-3 border rounded-xl ${errors.fromDate ? "border-red-500" : ""
                }`}
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setErrors({ ...errors, fromDate: "" });
              }}
            />
            {errors.fromDate && (
              <p className="text-xs text-red-500">{errors.fromDate}</p>
            )}
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              To Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className={`w-full p-3 border rounded-xl ${errors.toDate ? "border-red-500" : ""
                }`}
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setErrors({ ...errors, toDate: "" });
              }}
            />
            {errors.toDate && (
              <p className="text-xs text-red-500">{errors.toDate}</p>
            )}
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full p-4 border rounded-xl ${errors.reason ? "border-red-500" : ""
              }`}
            placeholder="Enter reason for leave"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setErrors({ ...errors, reason: "" });
            }}
          />
          {errors.reason && (
            <p className="text-xs text-red-500">{errors.reason}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 border rounded-xl">
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-6 py-2 bg-purple-600 text-white rounded-xl"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};


/* ================= UI HELPERS ================= */

const SummaryCard = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white border rounded-2xl p-6">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="mt-2 text-3xl font-semibold text-purple-600">{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: LeaveStatus }) => {
  const styles: Record<LeaveStatus, string> = {
    Approved: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${styles[status]}`}>
      {status}
    </span>
  );
};

export default LeaveApproval;