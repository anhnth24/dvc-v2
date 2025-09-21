import React from 'react';
import './label-printer.css';

export interface ShippingLabel {
  id: string;
  trackingNumber: string;
  sender: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
  };
  recipient: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
  };
  service: string;
  weight: number;
}

export interface LabelPrinterProps {
  labels?: ShippingLabel[];
  onPrint?: (labelIds: string[]) => void;
  onPreview?: (labelId: string) => void;
}

export function LabelPrinter({ labels = [], onPrint, onPreview }: LabelPrinterProps) {
  const selectedLabels = new Set<string>();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      labels.forEach(label => selectedLabels.add(label.id));
    } else {
      selectedLabels.clear();
    }
  };

  const handlePrintSelected = () => {
    onPrint?.(Array.from(selectedLabels));
  };

  return (
    <div className="label-printer">
      <div className="label-printer__header">
        <h3>Shipping Labels</h3>
        <div className="label-printer__actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            Select All
          </label>
          <button
            className="btn btn-primary"
            onClick={handlePrintSelected}
            disabled={selectedLabels.size === 0}
          >
            Print Selected ({selectedLabels.size})
          </button>
        </div>
      </div>

      <div className="labels-grid">
        {labels.map(label => (
          <div key={label.id} className="label-card">
            <div className="label-card__header">
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    selectedLabels.add(label.id);
                  } else {
                    selectedLabels.delete(label.id);
                  }
                }}
              />
              <span className="tracking-number">{label.trackingNumber}</span>
            </div>

            <div className="label-preview">
              <div className="address-section">
                <div className="address-label">From:</div>
                <div className="address">
                  <div>{label.sender.name}</div>
                  <div>{label.sender.address}</div>
                  <div>{label.sender.city} {label.sender.postalCode}</div>
                </div>
              </div>

              <div className="address-section">
                <div className="address-label">To:</div>
                <div className="address">
                  <div className="recipient-name">{label.recipient.name}</div>
                  <div>{label.recipient.address}</div>
                  <div>{label.recipient.city} {label.recipient.postalCode}</div>
                </div>
              </div>

              <div className="label-details">
                <div>Service: {label.service}</div>
                <div>Weight: {label.weight}kg</div>
              </div>
            </div>

            <div className="label-card__actions">
              <button
                className="btn btn-secondary"
                onClick={() => onPreview?.(label.id)}
              >
                Preview
              </button>
              <button
                className="btn btn-primary"
                onClick={() => onPrint?.([label.id])}
              >
                Print
              </button>
            </div>
          </div>
        ))}
      </div>

      {labels.length === 0 && (
        <div className="empty-state">
          No labels ready for printing
        </div>
      )}
    </div>
  );
}