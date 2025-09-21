import type { ReactNode } from 'react';
import './shipment-modal.css';

export interface ShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}

export function ShipmentModal({ isOpen, onClose, children }: ShipmentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="shipment-modal-overlay" onClick={onClose}>
      <div className="shipment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shipment-modal__header">
          <h3>Create Shipment</h3>
          <button className="shipment-modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="shipment-modal__content">{children}</div>
      </div>
    </div>
  );
}