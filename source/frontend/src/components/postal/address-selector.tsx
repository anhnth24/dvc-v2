import React, { useState } from 'react';
import './address-selector.css';

export interface Address {
  id: string;
  name: string;
  company?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface AddressSelectorProps {
  addresses?: Address[];
  selectedId?: string;
  onSelect?: (address: Address) => void;
  onAddNew?: () => void;
  onEdit?: (address: Address) => void;
  type: 'sender' | 'recipient';
}

export function AddressSelector({
  addresses = [],
  selectedId,
  onSelect,
  onAddNew,
  onEdit,
  type
}: AddressSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredAddresses = addresses.filter(address =>
    address.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    address.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    address.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedAddresses = showAll ? filteredAddresses : filteredAddresses.slice(0, 5);

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
  };

  return (
    <div className="address-selector">
      <div className="address-selector__header">
        <h4>{type === 'sender' ? 'From Address' : 'To Address'}</h4>
        <button className="btn-add-new" onClick={onAddNew}>
          + Add New
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search addresses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="addresses-list">
        {displayedAddresses.map(address => (
          <div
            key={address.id}
            className={`address-card ${
              selectedId === address.id ? 'selected' : ''
            }`}
            onClick={() => onSelect?.(address)}
          >
            <div className="address-card__main">
              <div className="address-name">
                {address.name}
                {address.isDefault && (
                  <span className="default-badge">Default</span>
                )}
              </div>
              {address.company && (
                <div className="address-company">{address.company}</div>
              )}
              <div className="address-details">
                {formatAddress(address)}
              </div>
              {address.phone && (
                <div className="address-phone">{address.phone}</div>
              )}
            </div>

            <div className="address-card__actions">
              <button
                className="btn-edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(address);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}

        {filteredAddresses.length === 0 && (
          <div className="no-addresses">
            {searchTerm ? 'No addresses match your search' : 'No addresses found'}
          </div>
        )}

        {!showAll && filteredAddresses.length > 5 && (
          <button
            className="show-more-btn"
            onClick={() => setShowAll(true)}
          >
            Show {filteredAddresses.length - 5} more addresses
          </button>
        )}
      </div>
    </div>
  );
}