import React, { useState } from 'react';
import './cost-calculator.css';

export interface ShippingRate {
  service: string;
  cost: number;
  estimatedDays: string;
  features: string[];
}

export interface CostCalculatorProps {
  onCalculate?: (params: CalculationParams) => void;
  rates?: ShippingRate[];
  loading?: boolean;
}

export interface CalculationParams {
  weight: number;
  dimensions: { length: number; width: number; height: number };
  origin: string;
  destination: string;
  serviceType: string;
}

export function CostCalculator({ onCalculate, rates = [], loading = false }: CostCalculatorProps) {
  const [formData, setFormData] = useState<CalculationParams>({
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    origin: '',
    destination: '',
    serviceType: 'standard'
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CalculationParams] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCalculate = () => {
    onCalculate?.(formData);
  };

  const isFormValid = formData.weight > 0 && formData.origin && formData.destination;

  return (
    <div className="cost-calculator">
      <div className="cost-calculator__header">
        <h3>Shipping Cost Calculator</h3>
      </div>

      <div className="calculator-form">
        <div className="form-row">
          <div className="form-group">
            <label>From (Origin)</label>
            <input
              type="text"
              placeholder="Enter origin address"
              value={formData.origin}
              onChange={(e) => handleInputChange('origin', e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>To (Destination)</label>
            <input
              type="text"
              placeholder="Enter destination address"
              value={formData.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.weight || ''}
              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Service Type</label>
            <select
              value={formData.serviceType}
              onChange={(e) => handleInputChange('serviceType', e.target.value)}
              className="form-input"
            >
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="priority">Priority</option>
              <option value="overnight">Overnight</option>
            </select>
          </div>
        </div>

        <div className="dimensions-group">
          <label>Dimensions (cm)</label>
          <div className="dimensions-inputs">
            <input
              type="number"
              placeholder="Length"
              value={formData.dimensions.length || ''}
              onChange={(e) => handleInputChange('dimensions.length', parseFloat(e.target.value) || 0)}
              className="form-input"
            />
            <span>×</span>
            <input
              type="number"
              placeholder="Width"
              value={formData.dimensions.width || ''}
              onChange={(e) => handleInputChange('dimensions.width', parseFloat(e.target.value) || 0)}
              className="form-input"
            />
            <span>×</span>
            <input
              type="number"
              placeholder="Height"
              value={formData.dimensions.height || ''}
              onChange={(e) => handleInputChange('dimensions.height', parseFloat(e.target.value) || 0)}
              className="form-input"
            />
          </div>
        </div>

        <button
          className="calculate-btn"
          onClick={handleCalculate}
          disabled={!isFormValid || loading}
        >
          {loading ? 'Calculating...' : 'Calculate Shipping Cost'}
        </button>
      </div>

      {rates.length > 0 && (
        <div className="shipping-rates">
          <h4>Available Shipping Options</h4>
          <div className="rates-list">
            {rates.map((rate, index) => (
              <div key={index} className="rate-card">
                <div className="rate-info">
                  <div className="rate-service">{rate.service}</div>
                  <div className="rate-time">{rate.estimatedDays}</div>
                </div>
                <div className="rate-cost">${rate.cost.toFixed(2)}</div>
                <div className="rate-features">
                  {rate.features.map((feature, idx) => (
                    <span key={idx} className="feature-tag">{feature}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}