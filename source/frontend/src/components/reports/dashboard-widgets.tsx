import React from 'react';
import './dashboard-widgets.css';

export interface WidgetData {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export interface MetricWidgetProps {
  data: WidgetData;
  size?: 'small' | 'medium' | 'large';
}

export function MetricWidget({ data, size = 'medium' }: MetricWidgetProps) {
  const getChangeIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getChangeColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'positive';
      case 'down': return 'negative';
      default: return 'neutral';
    }
  };

  return (
    <div className={`metric-widget metric-widget--${size} metric-widget--${data.color || 'blue'}`}>
      <div className="metric-widget__header">
        <div className="metric-title">{data.title}</div>
        {data.icon && <div className="metric-icon">{data.icon}</div>}
      </div>

      <div className="metric-value">{data.value}</div>

      {data.change && (
        <div className={`metric-change metric-change--${getChangeColor(data.change.direction)}`}>
          <span className="change-icon">{getChangeIcon(data.change.direction)}</span>
          <span className="change-value">{data.change.percentage}%</span>
          <span className="change-label">vs last period</span>
        </div>
      )}
    </div>
  );
}

export interface ProgressWidgetProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

export function ProgressWidget({
  title,
  current,
  target,
  unit = '',
  color = 'blue'
}: ProgressWidgetProps) {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  const isOverTarget = current > target;

  return (
    <div className={`progress-widget progress-widget--${color}`}>
      <div className="progress-widget__header">
        <h3 className="progress-title">{title}</h3>
        <div className="progress-values">
          <span className="current-value">{current.toLocaleString()}</span>
          <span className="target-separator">/</span>
          <span className="target-value">{target.toLocaleString()}</span>
          {unit && <span className="value-unit">{unit}</span>}
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className={`progress-fill ${isOverTarget ? 'over-target' : ''}`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
          {isOverTarget && (
            <div
              className="progress-overflow"
              style={{ width: `${Math.min(50, percentage - 100)}%` }}
            />
          )}
        </div>
        <div className="progress-percentage">
          {percentage.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

export interface ActivityWidgetProps {
  title: string;
  activities: {
    id: string;
    description: string;
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }[];
  maxItems?: number;
}

export function ActivityWidget({
  title,
  activities,
  maxItems = 5
}: ActivityWidgetProps) {
  const displayedActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="activity-widget">
      <div className="activity-widget__header">
        <h3 className="activity-title">{title}</h3>
        {activities.length > maxItems && (
          <span className="activity-count">+{activities.length - maxItems} more</span>
        )}
      </div>

      <div className="activity-list">
        {displayedActivities.map((activity) => (
          <div key={activity.id} className={`activity-item activity-item--${activity.type}`}>
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <div className="activity-description">{activity.description}</div>
              <div className="activity-time">{formatTimeAgo(activity.timestamp)}</div>
            </div>
          </div>
        ))}

        {displayedActivities.length === 0 && (
          <div className="activity-empty">
            No recent activities
          </div>
        )}
      </div>
    </div>
  );
}

export interface StatusWidgetProps {
  title: string;
  items: {
    label: string;
    count: number;
    status: 'healthy' | 'warning' | 'critical' | 'offline';
  }[];
}

export function StatusWidget({ title, items }: StatusWidgetProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'warning': return '🟡';
      case 'critical': return '🔴';
      case 'offline': return '⚫';
      default: return '⚪';
    }
  };

  const totalCount = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="status-widget">
      <div className="status-widget__header">
        <h3 className="status-title">{title}</h3>
        <div className="status-total">Total: {totalCount}</div>
      </div>

      <div className="status-list">
        {items.map((item, index) => (
          <div key={index} className={`status-item status-item--${item.status}`}>
            <div className="status-indicator">
              {getStatusIcon(item.status)}
            </div>
            <div className="status-content">
              <div className="status-label">{item.label}</div>
              <div className="status-count">{item.count}</div>
            </div>
            <div className="status-percentage">
              {totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : 0}%
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="status-empty">
            No status data available
          </div>
        )}
      </div>
    </div>
  );
}

export interface WidgetGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
}

export function WidgetGrid({
  children,
  columns = 3,
  gap = 'medium'
}: WidgetGridProps) {
  return (
    <div
      className={`widget-grid widget-grid--${columns}-columns widget-grid--${gap}-gap`}
    >
      {children}
    </div>
  );
}