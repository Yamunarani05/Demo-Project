import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { api } from '../api'; // assuming api is exported from api.js

const getNotificationMeta = (type) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('assign')) return { emoji: "👤", color: "#6366f1" }; // indigo
    if (t.includes('leave')) return { emoji: "📅", color: "#f59e0b" }; // amber
    if (t.includes('client')) return { emoji: "🤝", color: "#0ea5e9" }; // sky
    if (t.includes('delivery')) return { emoji: "📦", color: "#22c55e" }; // green
    if (t.includes('shoot') || t.includes('raw_data')) return { emoji: "📸", color: "#ec4899" }; // pink
    if (t.includes('query')) return { emoji: "💬", color: "#a855f7" }; // purple
    if (t.includes('complete') || t.includes('status')) return { emoji: "✅", color: "#22c55e" }; // green
    return { emoji: "🔔", color: "#64748b" }; // slate
};

const showCustomToast = (n) => {
    const meta = getNotificationMeta(n.issueType);
    toast.custom((t) => (
        <div
            onClick={() => toast.dismiss(t)}
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
                padding: "14px 16px",
                width: "340px",
                cursor: "pointer",
                borderLeft: `4px solid ${meta.color}`,
            }}
        >
            <span style={{ fontSize: "22px", lineHeight: 1, marginTop: "1px" }}>
                {meta.emoji}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "#0f172a", lineHeight: "1.4" }}>
                    {n.title}
                </p>
                {n.message && (
                    <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b", lineHeight: "1.4", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {n.message}
                    </p>
                )}
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); toast.dismiss(t); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "16px", lineHeight: 1, padding: 0, marginTop: "1px" }}
            >
                ×
            </button>
        </div>
    ), { duration: 4000, position: "top-right" });
};

export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const prevIds = useRef(new Set());
    const initialLoad = useRef(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await api.notifications();
            if (data) {
                setNotifications(data);
                
                if (initialLoad.current) {
                    const unread = data.filter((n) => !n.isRead);
                    if (unread.length > 0) {
                        if (unread.length > 3) {
                            showCustomToast({ title: `You have ${unread.length} unread notifications`, message: 'Check your notification panel', issueType: 'info' });
                        } else {
                            unread.forEach((n) => showCustomToast(n));
                        }
                    }
                    data.forEach((n) => prevIds.current.add(n.notificationId));
                    initialLoad.current = false;
                } else {
                    data.forEach((n) => {
                        if (!prevIds.current.has(n.notificationId)) {
                            prevIds.current.add(n.notificationId);
                            if (!n.isRead) {
                                showCustomToast(n);
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkRead = async (id) => {
        try {
            await api.markNotificationRead(id);
            setNotifications(prev =>
                prev.map(n => (n.notificationId === id) ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const handleClearAll = async () => {
        try {
            await api.clearNotifications();
            setNotifications([]);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    return {
        notifications,
        loading,
        unreadCount,
        handleMarkRead,
        handleMarkAllRead,
        handleClearAll,
        refetch: fetchNotifications,
    };
}
