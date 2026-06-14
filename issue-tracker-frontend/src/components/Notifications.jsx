import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '../api';

function Notifications({ user }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            loadNotifications();
        }
    }, [user]);

    const loadNotifications = async () => {
        try {
            const result = await getUserNotifications(user.userId);
            if (result.code === 200) {
                setNotifications(result.notifications || []);
                setUnreadCount(result.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const result = await markNotificationRead(notificationId);
            if (result.code === 200) {
                await loadNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const result = await markAllNotificationsRead(user.userId);
            if (result.code === 200) {
                await loadNotifications();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification._id);
        }
        if (notification.relatedIssueId) {
            navigate(`/issue/${notification.relatedIssueId}`);
        }
    };

    const getNotificationIcon = (type) => {
        switch(type) {
            case 'ISSUE_CREATED': return '📝';
            case 'ISSUE_ASSIGNED': return '👨‍💻';
            case 'STATUS_CHANGED': return '🔄';
            case 'ISSUE_CLOSED': return '✅';
            case 'COMMENT_ADDED': return '💬';
            default: return '🔔';
        }
    };

    const getNotificationColor = (type) => {
        switch(type) {
            case 'ISSUE_CREATED': return '#10b981';
            case 'ISSUE_ASSIGNED': return '#3b82f6';
            case 'STATUS_CHANGED': return '#f59e0b';
            case 'ISSUE_CLOSED': return '#ef4444';
            case 'COMMENT_ADDED': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div className="dashboard">
                <div className="content-card">
                    <p>Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Notifications</h1>
                <p>Stay updated with the latest activities</p>
            </div>

            <div className="content-card">
                <div className="notifications-header">
                    <div className="notifications-title">
                        <span className="notification-badge">{unreadCount}</span>
                        <span>Unread Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} className="btn-secondary-sm">
                            Mark All as Read
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔔</div>
                        <p>No notifications yet</p>
                        <p className="empty-subtext">When you receive notifications, they will appear here</p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map(notif => (
                            <div 
                                key={notif._id} 
                                className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notif)}
                            >
                                <div className="notification-icon" style={{ backgroundColor: getNotificationColor(notif.type) }}>
                                    {getNotificationIcon(notif.type)}
                                </div>
                                <div className="notification-content">
                                    <div className="notification-title">{notif.title}</div>
                                    <div className="notification-message">{notif.message}</div>
                                    {notif.type === 'COMMENT_ADDED' && notif.message.includes('commented') && (
                                        <div className="comment-preview">
                                            💬 "{notif.message.split('"')[1] || notif.message.substring(0, 50)}"
                                        </div>
                                    )}
                                    <div className="notification-time">
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                {!notif.read && <div className="unread-dot"></div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notifications;