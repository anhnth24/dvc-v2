import './tracking-dashboard.css';

export interface TrackingItem {
  id: string;
  trackingNumber: string;
  status: 'in-transit' | 'delivered' | 'pending' | 'failed';
  destination: string;
  estimatedDelivery: string;
}

export interface TrackingDashboardProps {
  items?: TrackingItem[];
}

export function TrackingDashboard({ items = [] }: TrackingDashboardProps) {
  return (
    <div className="tracking-dashboard">
      <div className="tracking-dashboard__header">
        <h2>Shipment Tracking</h2>
        <div className="tracking-dashboard__stats">
          <div className="stat-card">
            <span className="stat-value">{items.length}</span>
            <span className="stat-label">Total Shipments</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{items.filter(i => i.status === 'in-transit').length}</span>
            <span className="stat-label">In Transit</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{items.filter(i => i.status === 'delivered').length}</span>
            <span className="stat-label">Delivered</span>
          </div>
        </div>
      </div>
      <div className="tracking-dashboard__content">
        {items.length === 0 ? (
          <div className="empty-state">No shipments to track</div>
        ) : (
          <div className="tracking-list">
            {items.map(item => (
              <div key={item.id} className="tracking-item">
                <div className="tracking-item__info">
                  <span className="tracking-number">{item.trackingNumber}</span>
                  <span className="destination">{item.destination}</span>
                </div>
                <div className="tracking-item__status">
                  <span className={`status-badge status-badge--${item.status}`}>
                    {item.status}
                  </span>
                  <span className="estimated-delivery">{item.estimatedDelivery}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}