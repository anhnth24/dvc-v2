import React from 'react';
import './status-badge.css';

export type ShipmentStatus =
  | 'pending'
  | 'processing'
  | 'picked-up'
  | 'in-transit'
  | 'out-for-delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled'
  | 'returned';

export interface StatusBadgeProps {
  status: ShipmentStatus;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'yellow',
    icon: '⏳'
  },
  processing: {
    label: 'Processing',
    color: 'blue',
    icon: '⚙️'
  },
  'picked-up': {
    label: 'Picked Up',
    color: 'indigo',
    icon: '📦'
  },
  'in-transit': {
    label: 'In Transit',
    color: 'purple',
    icon: '🚚'
  },
  'out-for-delivery': {
    label: 'Out for Delivery',
    color: 'orange',
    icon: '🏃'
  },
  delivered: {
    label: 'Delivered',
    color: 'green',
    icon: '✅'
  },
  failed: {
    label: 'Failed',
    color: 'red',
    icon: '❌'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'gray',
    icon: '🚫'
  },
  returned: {
    label: 'Returned',
    color: 'red',
    icon: '↩️'
  }
};

export function StatusBadge({
  status,
  showIcon = false,
  size = 'medium'
}: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return (
      <span className="status-badge status-badge--unknown">
        Unknown
      </span>
    );
  }

  return (
    <span
      className={`status-badge status-badge--${config.color} status-badge--${size}`}
      title={`Status: ${config.label}`}
    >
      {showIcon && (
        <span className="status-badge__icon">{config.icon}</span>
      )}
      <span className="status-badge__label">{config.label}</span>
    </span>
  );
}

// Helper component for status with progress
export interface StatusWithProgressProps {
  status: ShipmentStatus;
  progress?: number; // 0-100
}

export function StatusWithProgress({ status, progress }: StatusWithProgressProps) {
  const config = statusConfig[status];

  return (
    <div className="status-with-progress">
      <StatusBadge status={status} showIcon />
      {progress !== undefined && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}
    </div>
  );
}