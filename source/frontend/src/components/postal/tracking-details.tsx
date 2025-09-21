import React from 'react';
import './tracking-details.css';

export interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export interface TrackingDetailsProps {
  trackingNumber: string;
  currentStatus: 'pending' | 'picked-up' | 'in-transit' | 'delivered' | 'failed';
  estimatedDelivery?: string;
  events?: TrackingEvent[];
}

export function TrackingDetails({
  trackingNumber,
  currentStatus,
  estimatedDelivery,
  events = []
}: TrackingDetailsProps) {
  const getStatusStep = (status: string) => {
    const steps = ['pending', 'picked-up', 'in-transit', 'delivered'];
    return steps.indexOf(status);
  };

  const currentStep = getStatusStep(currentStatus);

  return (
    <div className="tracking-details">
      <div className="tracking-details__header">
        <h2>Tracking Details</h2>
        <div className="tracking-number">
          Tracking #: <span>{trackingNumber}</span>
        </div>
        {estimatedDelivery && (
          <div className="estimated-delivery">
            Estimated Delivery: {estimatedDelivery}
          </div>
        )}
      </div>

      <div className="tracking-progress">
        <div className="progress-steps">
          <div className={`step ${currentStep >= 0 ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <div className="step-label">Order Placed</div>
          </div>
          <div className={`step ${currentStep >= 1 ? 'completed' : ''}`}>
            <div className="step-circle">2</div>
            <div className="step-label">Picked Up</div>
          </div>
          <div className={`step ${currentStep >= 2 ? 'completed' : ''}`}>
            <div className="step-circle">3</div>
            <div className="step-label">In Transit</div>
          </div>
          <div className={`step ${currentStep >= 3 ? 'completed' : ''}`}>
            <div className="step-circle">4</div>
            <div className="step-label">Delivered</div>
          </div>
        </div>
      </div>

      <div className="tracking-events">
        <h3>Tracking History</h3>
        <div className="events-timeline">
          {events.map(event => (
            <div key={event.id} className="timeline-event">
              <div className="event-time">
                {new Date(event.timestamp).toLocaleString()}
              </div>
              <div className="event-details">
                <div className="event-status">{event.status}</div>
                <div className="event-location">{event.location}</div>
                <div className="event-description">{event.description}</div>
              </div>
            </div>
          ))}
        </div>
        {events.length === 0 && (
          <div className="no-events">No tracking events available</div>
        )}
      </div>
    </div>
  );
}