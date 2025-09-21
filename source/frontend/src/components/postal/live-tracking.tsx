import React, { useState, useEffect } from 'react';
import './live-tracking.css';

export interface LiveTrackingEvent {
  id: string;
  timestamp: string;
  location: {
    name: string;
    coordinates?: { lat: number; lng: number };
  };
  status: string;
  description: string;
  isLive?: boolean;
}

export interface LiveTrackingProps {
  trackingNumber: string;
  events?: LiveTrackingEvent[];
  refreshInterval?: number; // in seconds
  onRefresh?: () => void;
  isConnected?: boolean;
}

export function LiveTracking({
  trackingNumber,
  events = [],
  refreshInterval = 30,
  onRefresh,
  isConnected = false
}: LiveTrackingProps) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(refreshInterval);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onRefresh?.();
          setLastUpdate(new Date());
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval, onRefresh]);

  const handleManualRefresh = () => {
    onRefresh?.();
    setLastUpdate(new Date());
    setCountdown(refreshInterval);
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

  const latestEvent = events[0];

  return (
    <div className="live-tracking">
      <div className="live-tracking__header">
        <div className="header-info">
          <h3>Live Tracking</h3>
          <div className="tracking-number">{trackingNumber}</div>
        </div>

        <div className="header-controls">
          <div className="connection-status">
            <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>

          <div className="refresh-controls">
            <label className="auto-refresh-toggle">
              <input
                type="checkbox"
                checked={isAutoRefresh}
                onChange={(e) => setIsAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>

            <button
              className="manual-refresh-btn"
              onClick={handleManualRefresh}
              title="Refresh now"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {isAutoRefresh && (
        <div className="refresh-indicator">
          Next update in {countdown}s
          <div
            className="countdown-bar"
            style={{ width: `${(countdown / refreshInterval) * 100}%` }}
          />
        </div>
      )}

      {lastUpdate && (
        <div className="last-update">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {latestEvent && (
        <div className="current-status">
          <div className="status-card">
            <div className="status-main">
              <div className="status-header">
                <span className="status-title">{latestEvent.status}</span>
                {latestEvent.isLive && <span className="live-badge">LIVE</span>}
              </div>
              <div className="status-location">{latestEvent.location.name}</div>
              <div className="status-description">{latestEvent.description}</div>
            </div>
            <div className="status-time">
              {formatTimeAgo(latestEvent.timestamp)}
            </div>
          </div>
        </div>
      )}

      <div className="tracking-timeline">
        <h4>Timeline</h4>
        <div className="timeline-events">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`timeline-event ${event.isLive ? 'live' : ''} ${index === 0 ? 'latest' : ''}`}
            >
              <div className="event-marker" />
              <div className="event-content">
                <div className="event-header">
                  <span className="event-status">{event.status}</span>
                  <span className="event-time">{formatTimeAgo(event.timestamp)}</span>
                </div>
                <div className="event-location">{event.location.name}</div>
                <div className="event-description">{event.description}</div>
                {event.isLive && (
                  <div className="live-indicator">🔴 Live Update</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="no-events">
            No tracking events available
          </div>
        )}
      </div>
    </div>
  );
}