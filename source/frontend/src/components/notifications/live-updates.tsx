import React, { useState, useEffect, useRef } from 'react';
import './live-updates.css';

export interface LiveUpdate {
  id: string;
  type: 'document' | 'workflow' | 'system' | 'user';
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'failed';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
}

export interface LiveUpdatesProps {
  updates?: LiveUpdate[];
  maxVisible?: number;
  autoScroll?: boolean;
  onUpdateClick?: (update: LiveUpdate) => void;
  showFilters?: boolean;
  showTimestamps?: boolean;
}

export function LiveUpdates({
  updates = [],
  maxVisible = 10,
  autoScroll = true,
  onUpdateClick,
  showFilters = true,
  showTimestamps = true
}: LiveUpdatesProps) {
  const [filter, setFilter] = useState<string>('all');
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef<HTMLDivElement>(null);

  const filteredUpdates = updates.filter(update => {
    if (filter === 'all') return true;
    return update.type === filter;
  }).slice(0, maxVisible);

  return (
    <div className="live-updates">
      <div className="live-updates__header">
        <h3>Live Updates</h3>
      </div>
      <div className="updates-container">
        {filteredUpdates.map((update) => (
          <div key={update.id} className="update-item">
            <span>{update.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}