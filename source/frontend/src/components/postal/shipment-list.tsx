import './shipment-list.css';

export interface Shipment {
  id: string;
  trackingNumber: string;
  recipient: string;
  destination: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  cost: number;
}

export interface ShipmentListProps {
  shipments?: Shipment[];
  onViewDetails?: (id: string) => void;
  onEditShipment?: (id: string) => void;
}

export function ShipmentList({
  shipments = [],
  onViewDetails,
  onEditShipment
}: ShipmentListProps) {
  return (
    <div className="shipment-list">
      <div className="shipment-list__header">
        <h3>Shipments</h3>
        <div className="shipment-list__filters">
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="shipment-table">
        <div className="table-header">
          <div className="table-cell">Tracking #</div>
          <div className="table-cell">Recipient</div>
          <div className="table-cell">Destination</div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Cost</div>
          <div className="table-cell">Date</div>
          <div className="table-cell">Actions</div>
        </div>

        {shipments.map(shipment => (
          <div key={shipment.id} className="table-row">
            <div className="table-cell">
              <span className="tracking-code">{shipment.trackingNumber}</span>
            </div>
            <div className="table-cell">{shipment.recipient}</div>
            <div className="table-cell">{shipment.destination}</div>
            <div className="table-cell">
              <span className={`status-indicator status-indicator--${shipment.status}`}>
                {shipment.status}
              </span>
            </div>
            <div className="table-cell">${shipment.cost.toFixed(2)}</div>
            <div className="table-cell">
              {new Date(shipment.createdAt).toLocaleDateString()}
            </div>
            <div className="table-cell">
              <div className="action-buttons">
                <button
                  className="btn-action btn-action--view"
                  onClick={() => onViewDetails?.(shipment.id)}
                >
                  View
                </button>
                <button
                  className="btn-action btn-action--edit"
                  onClick={() => onEditShipment?.(shipment.id)}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}

        {shipments.length === 0 && (
          <div className="empty-state">
            No shipments found
          </div>
        )}
      </div>
    </div>
  );
}