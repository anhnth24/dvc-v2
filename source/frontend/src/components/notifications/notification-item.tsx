import React from 'react';
import Image from 'next/image';
import './notification-item.css';

export interface NotificationItemData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
  link?: string;
}

export interface NotificationItemProps {
  notification: NotificationItemData;
  onClick?: (notification: NotificationItemData) => void;
  onDismiss?: (id: string) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onClick,
  onDismiss,
  compact = false
}: NotificationItemProps) {
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const handleClick = () => {
    onClick?.(notification);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss?.(notification.id);
  };

  return (
    <div
      className={`notification-item-card ${
        !notification.isRead ? 'unread' : ''
      } ${compact ? 'compact' : ''} notification-item-card--${notification.type}`}
      onClick={handleClick}
    >
      <div className="notification-item-card__content">
        <div className="notification-item-card__header">
          <div className="notification-type-indicator">
            {notification.avatar ? (
              <Image
                src={notification.avatar}
                alt="Avatar"
                width={32}
                height={32}
                className="notification-avatar"
              />
            ) : (
              <span className="notification-icon">
                {getTypeIcon(notification.type)}
              </span>
            )}
          </div>

          <div className="notification-main">
            <div className="notification-title-row">
              <h4 className="notification-title">{notification.title}</h4>
              <span className="notification-timestamp">
                {formatTimeAgo(notification.timestamp)}
              </span>
            </div>

            {!compact && (
              <p className="notification-message">{notification.message}</p>
            )}
          </div>

          <div className="notification-actions">
            {!notification.isRead && (
              <div className="unread-dot" />
            )}

            {onDismiss && (
              <button
                className="dismiss-btn"
                onClick={handleDismiss}
                title="Dismiss"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {compact && (
          <p className="notification-message notification-message--compact">
            {notification.message}
          </p>
        )}

        {notification.link && (
          <div className="notification-link">
            <a href={notification.link} className="link-button">
              View Details →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton component for loading states
export function NotificationItemSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`notification-item-card skeleton ${compact ? 'compact' : ''}`}>
      <div className="notification-item-card__content">
        <div className="notification-item-card__header">
          <div className="skeleton-avatar" />
          <div className="notification-main">
            <div className="notification-title-row">
              <div className="skeleton-title" />
              <div className="skeleton-time" />
            </div>
            {!compact && <div className="skeleton-message" />}
          </div>
        </div>
        {compact && <div className="skeleton-message skeleton-message--compact" />}
      </div>
    </div>
  );
}