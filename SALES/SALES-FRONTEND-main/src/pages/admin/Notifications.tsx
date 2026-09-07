import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useNotifications, type Notification } from "../../notifications/NotificationsContext";
import IssueDetailModal from "../../notifications/IssueDetailModal";

type InvoiceStatus = "APPROVED" | "REJECTED" | "NEUTRAL";

function getInvoiceStatus(n: Notification): InvoiceStatus {
  if (n.issueType !== "InvoiceIssue") return "NEUTRAL";
  const txt = (n.title + " " + (n.message ?? "")).toLowerCase();
  if (txt.includes("approved") || txt.includes("invoiceapproved") || txt.includes("approved invoice")) return "APPROVED";
  if (txt.includes("rejected") || txt.includes("invoicerejected") || txt.includes("rejected invoice")) return "REJECTED";
  return "NEUTRAL";
}

function timeAgo(iso: string) {
  try {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} d ago`;
  } catch {
    return iso;
  }
}

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, deleteNotification } = useNotifications();

  const [selected, setSelected] = useState<Notification | null>(null);
  const [search, setSearch] = useState("");

  const handleDone = async (id: number) => {
    await deleteNotification(id);
  };

  const handleDoneAllInvoices = async () => {
    const invoiceIds = notifications
      .filter((n) => n.issueType === "InvoiceIssue")
      .map((n) => n.id);

    for (const id of invoiceIds) {
      await deleteNotification(id);
    }
  };

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return notifications
      .filter((n) => {
        if (!term) return true;
        const hay = (n.title + " " + (n.message ?? "")).toLowerCase();
        return hay.includes(term);
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [notifications, search]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* header */}
      <div className="px-6 pt-4 pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Modern Back Button */}
            <div className="flex items-center gap-4">
            {/* Back Button */}
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {/* Back */}
              </button>

              <div>
                <h1 className="text-xl font-semibold text-slate-900">Notifications</h1>
                <p className="text-xs text-slate-500 mt-1">Total: {notifications.length}</p>
              </div>
            </div>
          </div>
          </div>

          <button
            type="button"
            onClick={handleDoneAllInvoices}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100"
          >
            Done for all invoices
          </button>
        </div>

        <div className="mt-3 max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="w-full rounded-full border border-slate-200 px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* list */}
      <div className="flex-1 px-6 pb-6">
        <div className="mt-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col h-full">
          <div className="flex-1 overflow-auto space-y-2">
            {rows.length === 0 ? (
              <div className="text-xs text-slate-600">
                No notifications to show.
              </div>
            ) : (
              rows.map((n) => {
                const status = getInvoiceStatus(n);
                const isInvoice = n.issueType === "InvoiceIssue";

                return (
                  <div
                    key={n.id}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 flex justify-between gap-3"
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(n)}
                      className="flex-1 text-left"
                    >
                      <div className="text-xs font-semibold">{n.title}</div>
                      <div className="text-[11px] text-slate-600 mt-1">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDone(n.id)}
                      className="rounded-full bg-slate-900 text-white text-[11px] px-3 py-1"
                    >
                      Done
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selected && (
        <IssueDetailModal
          notification={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
