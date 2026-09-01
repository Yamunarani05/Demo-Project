// src/pages/NotificationsPage.tsx
import { useNotifications } from "../../notifications/NotificationsContext";
import IssueDetailModal from "../../notifications/IssueDetailModal";
import { useState } from "react";
const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    getById,
  } = useNotifications();

const [selectedId, setSelectedId] = useState<number | null>(null);

 const handleOpen = async (id: number) => {
  await markAsRead(id);
  setSelectedId(id);
};

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-600">No notifications yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleOpen(n.id)}
              className={`w-full text-left px-4 py-3 flex items-start justify-between hover:bg-gray-50 ${
                !n.isRead ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex-1">
                <p className={`text-sm ${!n.isRead ? "font-semibold" : ""}`}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && (
                <span className="mt-1 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}

      {selectedId && getById(selectedId) && (
        <IssueDetailModal
          notification={getById(selectedId)!}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
