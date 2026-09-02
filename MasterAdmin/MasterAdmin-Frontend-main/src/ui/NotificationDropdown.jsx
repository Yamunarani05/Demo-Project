import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const timeAgo = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 5) return 'just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
};

export default function NotificationDropdown() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const dropdownRef = useRef(null);
    const { notifications, loading, unreadCount, handleMarkRead, handleMarkAllRead } = useNotifications();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (showDropdown) setActiveTab('all');
    }, [showDropdown]);

    const filtered = activeTab === 'unread' 
        ? notifications.filter(n => !n.isRead)
        : notifications;

    return (
        <div className="notification-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
                className="bell-button" 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Bell size={20} color="#64748b" />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '2px 5px',
                        borderRadius: '10px',
                        minWidth: '16px',
                        textAlign: 'center'
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div style={{
                    position: 'absolute',
                    top: '45px',
                    right: '-10px',
                    width: '360px',
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    border: '1px solid #e2e8f0',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '480px',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Notifications</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAllRead}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '12px',
                                        color: '#3b82f6',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Check size={14} /> Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
                        <button
                            onClick={() => setActiveTab('all')}
                            style={{
                                flex: 1,
                                padding: '10px 0',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'all' ? '2px solid #3b82f6' : '2px solid transparent',
                                color: activeTab === 'all' ? '#3b82f6' : '#64748b',
                                fontWeight: activeTab === 'all' ? 600 : 500,
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab('unread')}
                            style={{
                                flex: 1,
                                padding: '10px 0',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'unread' ? '2px solid #3b82f6' : '2px solid transparent',
                                color: activeTab === 'unread' ? '#3b82f6' : '#64748b',
                                fontWeight: activeTab === 'unread' ? 600 : 500,
                                cursor: 'pointer',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span style={{
                                    background: activeTab === 'unread' ? '#3b82f6' : '#e2e8f0',
                                    color: activeTab === 'unread' ? 'white' : '#64748b',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    fontSize: '10px'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                        {loading ? (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Loading...</div>
                        ) : filtered.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                <Bell size={32} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No notifications</p>
                                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>You're all caught up!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {filtered.map(notification => (
                                    <div 
                                        key={notification.notificationId}
                                        onClick={() => {
                                            if (!notification.isRead) handleMarkRead(notification.notificationId);
                                        }}
                                        style={{
                                            padding: '16px',
                                            borderBottom: '1px solid #f8fafc',
                                            background: notification.isRead ? '#fff' : '#f0f9ff',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            display: 'flex',
                                            gap: '12px'
                                        }}
                                    >
                                        {!notification.isRead && (
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px', flexShrink: 0 }} />
                                        )}
                                        <div style={{ flex: 1, minWidth: 0, paddingLeft: notification.isRead ? '20px' : '0' }}>
                                            <p style={{ margin: 0, fontSize: '13px', fontWeight: notification.isRead ? 500 : 600, color: '#0f172a' }}>
                                                {notification.title}
                                            </p>
                                            {notification.message && (
                                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                                                    {notification.message}
                                                </p>
                                            )}
                                            <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                                                {timeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
