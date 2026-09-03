import { useState, useEffect, useCallback, useRef } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, clearNotifications } from '../api/notification.api';
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
    target_employee_id?: string | null;
    source_stage?: string | null;
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

const globalToastedIds = new Set<number>();

export function useNotifications(roles: string[], employeeId?: string | null) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const effectiveRoles = roles.filter(Boolean);
    const roleKey = effectiveRoles.join(',');
    const prevIds = useRef<Set<number>>(new Set());
    const initialLoad = useRef(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await getNotifications({ roles: effectiveRoles.length ? effectiveRoles : ['__none__'], employee_id: employeeId });
            if (res.success && res.data) {
                setNotifications(res.data);
                
                if (initialLoad.current) {
                    const unread = res.data.filter((n: NotificationItem) => {
                        const id = n.id || n.notification_id as number;
                        return !n.is_read && !globalToastedIds.has(id);
                    });
                    
                    if (unread.length > 0) {
                        if (unread.length > 3) {
                            showCustomToast({ title: `You have ${unread.length} unread notifications`, detail: 'Check your notification panel', type: 'info' });
                            unread.forEach((n: NotificationItem) => globalToastedIds.add(n.id || n.notification_id as number));
                        } else {
                            unread.forEach((n: NotificationItem) => {
                                showCustomToast(n);
                                globalToastedIds.add(n.id || n.notification_id as number);
                            });
                        }
                    }
                    res.data.forEach((n: NotificationItem) => prevIds.current.add(n.id || n.notification_id as number));
                    initialLoad.current = false;
                } else {
                    res.data.forEach((n: NotificationItem) => {
                        const id = n.id || n.notification_id as number;
                        if (!prevIds.current.has(id)) {
                            prevIds.current.add(id);
                            if (!n.is_read && !globalToastedIds.has(id)) {
                                globalToastedIds.add(id);
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
    }, [roleKey, employeeId]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkRead = async (id: number) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev =>
                prev.map(n => (n.id === id || n.notification_id === id) ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead(effectiveRoles.length ? effectiveRoles : ['__none__'], employeeId);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const handleClearAll = async () => {
        try {
            await clearNotifications(effectiveRoles.length ? effectiveRoles : ['__none__'], employeeId);
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
