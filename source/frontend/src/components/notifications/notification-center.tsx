import React, { useState } from 'react';
import './notification-center.css';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationCenterProps {
  notifications?: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (id: string) => void;
}

export function NotificationCenter({
  notifications = [],
  isOpen,
  onClose,
  onMarkAsRead
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.isRead;
    }
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center" onClick={(e) => e.stopPropagation()}>
        <div className="notification-center__header">
          <h3>Notifications</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="notifications-list">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => onMarkAsRead?.(notification.id)}
            >
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}