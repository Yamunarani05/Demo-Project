import { useState, useEffect, useMemo, useRef } from "react";
import { Bell } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useNotifications } from "../../notifications/NotificationsContext";
import type { Notification as AppNotification } from "../../notifications/NotificationsContext";
import { tokenService } from "../../Services/tokenService";
import { AuthenticationService } from "../../Services/AuthenticationService";
import IssueDetailModal from "../../notifications/IssueDetailModal";

type UserRole = "admin" | "employee" | "partner" | null;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* ========== AUTH DATA ========== */
  const storedRole = tokenService.getRole() as UserRole | null;
  const storedFullName = tokenService.getFullName();
  const role: UserRole =
    storedRole || (localStorage.getItem("role") as UserRole) || "admin";
  const fullName =
    storedFullName || localStorage.getItem("fullName") || "User";
  const userId = localStorage.getItem("userId") || "-";

  /* ========== STATE ========== */
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<AppNotification | null>(null);

  const { notifications, unreadCount, markAsRead } = useNotifications();

  /* ========== BASE PATH BY ROLE ========== */
  const basePath = useMemo(() => {
    if (role === "partner") return "/partner";
    if (role === "employee") return "/employee";
    return "/admin";
  }, [role]);

  const viewAllPath = `${basePath}/notifications`;

  /* ========== NOTIFICATION LIST (LATEST) ========== */
  const latestNotifications = useMemo(
    () =>
      notifications
        .slice()
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 5),
    [notifications]
  );

  /* ========== LOGIN TIME (WHEN HEADER MOUNTS) ========== */
  const [loginTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

  );

  /* ========== DATE / TIME TICKER ========== */
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      );
      setCurrentTime(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ========== CLOSE POPUPS ON ROUTE CHANGE ========== */
  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* ========== CLOSE POPUPS ON OUTSIDE CLICK ========== */
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (open && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, profileOpen]);

  /* ========== ROLE DISPLAY & INITIALS ========== */
  const prettyRole =
    role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : "User";

  const initials = useMemo(() => {
    const parts = fullName.split(" ").filter(Boolean);
    if (parts.length === 0) return "US";
    return parts
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [fullName]);

  /* ========== LOGOUT ========== */
  const handleLogout = () => {
    AuthenticationService.logout();
    navigate("/", { replace: true });
  };

  /* ========== UI ========== */
  return (
    <header className="relative bg-white border-b border-slate-200 px-6 py-2">
      <div className="flex items-center justify-end gap-6">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setOpen(!open)} className="relative">
            <Bell className="w-5 h-5 text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] px-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="fixed right-6 mt-2 w-72 bg-white border rounded-xl shadow-lg z-50">
              <div className="flex justify-between px-3 py-2 border-b">
                <span className="font-semibold">Notifications</span>
                <Link to={viewAllPath} className="text-xs text-violet-600">
                  View all
                </Link>
              </div>

              <div className="max-h-72 overflow-auto">
                {latestNotifications.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">
                    No notifications
                  </div>
                ) : (
                  latestNotifications.map((n) => {
                    const isIssue =
                      n.issueType === 'InvoiceIssue' ||
                      n.issueType === 'QuotationIssue';
                    const isApproved =
                      (n.issueType === 'QuotationStatus' ||
                        n.issueType === 'InvoiceStatus') &&
                      (n.title.toLowerCase().includes('accepted') ||
                        n.title.toLowerCase().includes('approved'));

                    const borderColor = isIssue
                      ? 'border-l-red-500'
                      : isApproved
                        ? 'border-l-green-500'
                        : 'border-l-gray-300';

                    const titleColor = isIssue
                      ? 'text-red-700'
                      : isApproved
                        ? 'text-green-700'
                        : 'text-gray-900';

                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                          setSelectedNotification(n);
                          setOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 border-l-4 ${borderColor}`}
                      >
                        <p className={`text-sm font-semibold ${titleColor}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="text-xs text-right">
          <div>{currentDate}</div>
          <div>{currentTime}</div>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2"
          >
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-900">
                {fullName}
              </span>
              <span className="text-[11px] text-slate-400">
                {prettyRole} · ID: {userId}
              </span>
            </div>
            <div className="h-9 w-9 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">
                  {fullName}
                </p>
                <p className="text-xs text-slate-500">{prettyRole}</p>
              </div>
              <div className="px-4 py-3 space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">User ID</span>
                  <span className="font-medium">{userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Logged in at</span>
                  <span className="font-medium">{loginTime}</span>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-slate-100">
                <button
                  type="button"
                  className="w-full text-xs font-medium text-red-600 hover:text-red-700 text-left"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedNotification && (
        <IssueDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}

    </header>

  );
};

export default Header;
