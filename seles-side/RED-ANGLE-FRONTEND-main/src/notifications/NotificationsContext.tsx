import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";

/* ================= TYPES ================= */

export interface Notification {
  id: number;
  title: string;
  message?: string;
  issueType:
    | "InvoiceIssue"
    | "QuotationIssue"
    | "InvoiceStatus"
    | "QuotationStatus"
    | "LeadAssignment"
    | "QuotationSent";
  createdAt: string;
  isRead: boolean;
  invoiceIssueId?: number;
  quotationIssueId?: number;
}

/* ================= TOAST HELPERS ================= */

const ISSUE_TYPE_META: Record<
  Notification["issueType"],
  { emoji: string; color: string }
> = {
  LeadAssignment:  { emoji: "👤", color: "#6366f1" }, // indigo
  QuotationSent:   { emoji: "📄", color: "#0ea5e9" }, // sky
  QuotationStatus: { emoji: "✅", color: "#22c55e" }, // green
  QuotationIssue:  { emoji: "⚠️", color: "#f59e0b" }, // amber
  InvoiceStatus:   { emoji: "🧾", color: "#8b5cf6" }, // violet
  InvoiceIssue:    { emoji: "❗", color: "#ef4444" }, // red
};

function showNotificationToast(n: Notification) {
  const meta = ISSUE_TYPE_META[n.issueType] ?? { emoji: "🔔", color: "#64748b" };

  toast.custom(
    (t) => (
      <div
        onClick={() => toast.dismiss(t.id)}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
          padding: "14px 16px",
          maxWidth: "340px",
          cursor: "pointer",
          borderLeft: `4px solid ${meta.color}`,
          opacity: t.visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {/* Icon */}
        <span style={{ fontSize: "22px", lineHeight: 1, marginTop: "1px" }}>
          {meta.emoji}
        </span>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: "13px",
              color: "#0f172a",
              lineHeight: "1.4",
            }}
          >
            {n.title}
          </p>
          {n.message && (
            <p
              style={{
                margin: "3px 0 0",
                fontSize: "12px",
                color: "#64748b",
                lineHeight: "1.4",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {n.message}
            </p>
          )}
        </div>

        {/* Dismiss × */}
        <button
          onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#94a3b8",
            fontSize: "16px",
            lineHeight: 1,
            padding: 0,
            marginTop: "1px",
          }}
        >
          ×
        </button>
      </div>
    ),
    { duration: 3000, position: "top-right" }
  );
}

/* ================= CONTEXT ================= */

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  getById: (id: number) => Notification | undefined;
}

const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

/* ================= PROVIDER ================= */

const POLL_INTERVAL_MS = 10_000; // 10 seconds

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const seenIdsRef = useRef<Set<number>>(new Set());
  const isFirstLoadRef = useRef(true);

  const apiBase =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:9000/api";

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";

  /* -------- FETCH + DETECT NEW NOTIFICATIONS -------- */

  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setNotifications([]);
      return;
    }

    try {
      const res = await axios.get(`${apiBase}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped: Notification[] = (res.data.data || []).map((n: any) => ({
        id: n.notificationId,
        title: n.title,
        message: n.message ?? "",
        issueType: n.issueType,
        createdAt: n.createdAt,
        isRead: n.isRead,
        invoiceIssueId: n.invoiceIssueId ?? undefined,
        quotationIssueId: n.quotationIssueId ?? undefined,
      }));

      // Detect genuinely new notifications (not seen before)
      if (isFirstLoadRef.current) {
        const unread = mapped.filter((n) => !n.isRead);
        if (unread.length > 0) {
          if (unread.length > 3) {
            toast(`You have ${unread.length} unread notifications`, { position: 'top-right' });
          } else {
            unread.forEach((n) => showNotificationToast(n));
          }
        }
        mapped.forEach((n) => seenIdsRef.current.add(n.id));
        isFirstLoadRef.current = false;
      } else {
        const newOnes = mapped.filter((n) => !seenIdsRef.current.has(n.id));
        newOnes.forEach((n) => {
          seenIdsRef.current.add(n.id);
          showNotificationToast(n);
        });
      }

      setNotifications(mapped);
    } catch (error: any) {
      // Handle network errors silently on notifications (non-critical)
      if (error?.message === 'Network Error') {
        console.warn('Network error - notifications unavailable');
      } else {
        console.error("Failed to fetch notifications:", error?.message || error);
      }
      setNotifications([]);
    }
  }, [apiBase]);

  /* -------- INITIAL LOAD + POLLING -------- */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();

    const interval = setInterval(() => {
      if (getToken()) fetchNotifications();
    }, POLL_INTERVAL_MS);

    // Refresh immediately when admin switches back to the tab
    const onVisibility = () => {
      if (document.visibilityState === "visible" && getToken()) {
        fetchNotifications();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchNotifications]);

  /* -------- DERIVED -------- */

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  /* -------- ACTIONS -------- */

  const markAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await axios.patch(
      `${apiBase}/notifications/${id}/mark-read`,
      {},
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await axios.patch(
      `${apiBase}/notifications/mark-all-read`,
      {},
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
  };

  const deleteNotification = async (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await axios.delete(`${apiBase}/notifications/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  };

  const getById = (id: number) => notifications.find((n) => n.id === id);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        markAsRead,
        deleteNotification,
        getById,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

/* ================= HOOK ================= */

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider"
    );
  }
  return ctx;
}
