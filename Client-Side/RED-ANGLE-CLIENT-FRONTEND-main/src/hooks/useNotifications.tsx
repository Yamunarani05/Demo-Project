import { useState, useEffect, useCallback, useRef } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notification.api';
import { toast } from 'sonner';

export interface NotificationItem {
    id: number;
    notification_id?: number;
    type: string;
    title: string;
    detail: string | null;
    lead_id: number | null;
    from_role: string | null;
    from_name: string | null;
    target_roles: string[];
    is_read: boolean;
    created_at: string;
}

const getNotificationMeta = (type: string) => {
    if (type.includes('assign') || type === 'assignment_accepted') return { emoji: "👤", color: "#6366f1" }; // indigo
    if (type.includes('leave')) return { emoji: "📅", color: "#f59e0b" }; // amber
    if (type.includes('client')) return { emoji: "🤝", color: "#0ea5e9" }; // sky
    if (type.includes('delivery')) return { emoji: "📦", color: "#22c55e" }; // green
    if (type.includes('shoot') || type.includes('raw_data')) return { emoji: "📸", color: "#ec4899" }; // pink
    if (type.includes('query')) return { emoji: "💬", color: "#a855f7" }; // purple
    return { emoji: "🔔", color: "#64748b" }; // slate
};

const showCustomToast = (n: { title: string; detail: string | null; type: string }) => {
    const meta = getNotificationMeta(n.type || 'info');
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
                {n.detail && (
                    <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#64748b", lineHeight: "1.4", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {n.detail}
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

export function useNotifications(role: string) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const prevIds = useRef<Set<number>>(new Set());
    const initialLoad = useRef(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await getNotifications(role);
            if (res.success && res.data) {
                let parsedData = res.data;
                if (role === 'client') {
                    const readIds = JSON.parse(localStorage.getItem('client_read_notifications') || '[]');
                    parsedData = res.data.map((n: any) => ({ ...n, is_read: readIds.includes(n.id) }));
                }
                setNotifications(parsedData);
                
                if (initialLoad.current) {
                    const unread = parsedData.filter((n: NotificationItem) => !n.is_read);
                    if (unread.length > 0) {
                        if (unread.length > 3) {
                            showCustomToast({ title: `You have ${unread.length} unread notifications`, detail: 'Check your notification panel', type: 'info' });
                        } else {
                            unread.forEach((n: NotificationItem) => showCustomToast(n));
                        }
                    }
                    parsedData.forEach((n: NotificationItem) => prevIds.current.add(n.id || n.notification_id as number));
                    initialLoad.current = false;
                } else {
                    parsedData.forEach((n: NotificationItem) => {
                        const id = n.id || n.notification_id as number;
                        if (!prevIds.current.has(id)) {
                            prevIds.current.add(id);
                            if (!n.is_read) {
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
    }, [role]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Compute unread count safely
    const unreadCount = notifications.filter(n => {
        if (role === 'client') {
            const readIds = JSON.parse(localStorage.getItem('client_read_notifications') || '[]');
            return !readIds.includes(n.id);
        }
        return !n.is_read;
    }).length;

    const handleMarkRead = async (id: number) => {
        try {
            if (role === 'client') {
                const readIds = JSON.parse(localStorage.getItem('client_read_notifications') || '[]');
                if (!readIds.includes(id)) {
                    readIds.push(id);
                    localStorage.setItem('client_read_notifications', JSON.stringify(readIds));
                }
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            } else {
                await markNotificationRead(id);
                setNotifications(prev =>
                    prev.map(n => (n.id === id || n.notification_id === id) ? { ...n, is_read: true } : n)
                );
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            if (role === 'client') {
                const allIds = notifications.map(n => n.id);
                localStorage.setItem('client_read_notifications', JSON.stringify(allIds));
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            } else {
                await markAllNotificationsRead(role);
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    return {
        notifications,
        loading,
        unreadCount,
        handleMarkRead,
        handleMarkAllRead,
        refetch: fetchNotifications,
    };
}
