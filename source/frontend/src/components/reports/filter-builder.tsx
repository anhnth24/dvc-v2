import { useState } from 'react';
import './filter-builder.css';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: { value: string; label: string }[];
}

export interface FilterCondition {
  field: string;
  operator: string;
  value: any;
  id: string;
}

export interface FilterBuilderProps {
  fields: FilterField[];
  value: FilterCondition[];
  onChange: (filters: FilterCondition[]) => void;
  onApply: () => void;
  onClear: () => void;
}

const operators = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'starts_with', label: 'Starts with' },
    { value: 'ends_with', label: 'Ends with' },
    { value: 'not_empty', label: 'Is not empty' },
    { value: 'empty', label: 'Is empty' }
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'between', label: 'Between' },
    { value: 'not_empty', label: 'Is not empty' },
    { value: 'empty', label: 'Is empty' }
  ],
  date: [
    { value: 'equals', label: 'On date' },
    { value: 'after', label: 'After' },
    { value: 'before', label: 'Before' },
    { value: 'between', label: 'Between' },
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'this_month', label: 'This month' }
  ],
  select: [
    { value: 'equals', label: 'Is' },
    { value: 'not_equals', label: 'Is not' },
    { value: 'in', label: 'Is any of' }
  ],
  boolean: [
    { value: 'equals', label: 'Is' }
  ]
};

export function FilterBuilder({
  fields,
  value,
  onChange,
  onApply,
  onClear
}: FilterBuilderProps) {
  const [showBuilder, setShowBuilder] = useState(false);

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Math.random().toString(36).substring(2, 9),
      field: fields[0]?.key || '',
      operator: 'equals',
      value: ''
    };
    onChange([...value, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    onChange(
      value.map(filter =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };

  const removeFilter = (id: string) => {
    onChange(value.filter(filter => filter.id !== id));
  };

  const getField = (key: string) => fields.find(f => f.key === key);

  const renderValueInput = (filter: FilterCondition) => {
    const field = getField(filter.field);
    if (!field) return null;

    const needsValue = !['empty', 'not_empty', 'last_7_days', 'last_30_days', 'this_month'].includes(filter.operator);

    if (!needsValue) return null;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder="Enter value"
            className="filter-input"
          />
        );

      case 'number':
        if (filter.operator === 'between') {
          return (
            <div className="between-inputs">
              <input
                type="number"
                value={filter.value?.min || ''}
                onChange={(e) => updateFilter(filter.id, {
                  value: { ...filter.value, min: e.target.value }
                })}
                placeholder="Min"
                className="filter-input"
              />
              <span>to</span>
              <input
                type="number"
                value={filter.value?.max || ''}
                onChange={(e) => updateFilter(filter.id, {
                  value: { ...filter.value, max: e.target.value }
                })}
                placeholder="Max"
                className="filter-input"
              />
            </div>
          );
        }
        return (
          <input
            type="number"
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            placeholder="Enter number"
            className="filter-input"
          />
        );

      case 'date':
        if (filter.operator === 'between') {
          return (
            <div className="between-inputs">
              <input
                type="date"
                value={filter.value?.start || ''}
                onChange={(e) => updateFilter(filter.id, {
                  value: { ...filter.value, start: e.target.value }
                })}
                className="filter-input"
              />
              <span>to</span>
              <input
                type="date"
                value={filter.value?.end || ''}
                onChange={(e) => updateFilter(filter.id, {
                  value: { ...filter.value, end: e.target.value }
                })}
                className="filter-input"
              />
            </div>
          );
        }
        return (
          <input
            type="date"
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="filter-input"
          />
        );

      case 'select':
        if (filter.operator === 'in') {
          return (
            <select
              multiple
              value={Array.isArray(filter.value) ? filter.value : []}
              onChange={(e) => {
                const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                updateFilter(filter.id, { value: selectedValues });
              }}
              className="filter-select"
            >
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }
        return (
          <select
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="filter-select"
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <select
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value === 'true' })}
            className="filter-select"
          >
            <option value="">Select...</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="filter-builder">
      <div className="filter-controls">
        <button
          className="filter-toggle"
          onClick={() => setShowBuilder(!showBuilder)}
        >
          🔍 Filters {value.length > 0 && `(${value.length})`}
        </button>

        {value.length > 0 && (
          <div className="filter-actions">
            <button className="filter-btn filter-btn--apply" onClick={onApply}>
              Apply Filters
            </button>
            <button className="filter-btn filter-btn--clear" onClick={onClear}>
              Clear All
            </button>
          </div>
        )}
      </div>

      {showBuilder && (
        <div className="filter-panel">
          <div className="filter-panel-header">
            <h4>Filter Conditions</h4>
            <button className="add-filter-btn" onClick={addFilter}>
              + Add Filter
            </button>
          </div>

          <div className="filter-conditions">
            {value.map((filter, index) => {
              const field = getField(filter.field);
              const availableOperators = field ? operators[field.type] || [] : [];

              return (
                <div key={filter.id} className="filter-condition">
                  {index > 0 && <div className="filter-connector">AND</div>}

                  <div className="filter-row">
                    <select
                      value={filter.field}
                      onChange={(e) => {
                        const newField = getField(e.target.value);
                        updateFilter(filter.id, {
                          field: e.target.value,
                          operator: newField ? operators[newField.type][0]?.value : 'equals',
                          value: ''
                        });
                      }}
                      className="filter-select"
                    >
                      {fields.map(field => (
                        <option key={field.key} value={field.key}>
                          {field.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(filter.id, {
                        operator: e.target.value,
                        value: ''
                      })}
                      className="filter-select"
                    >
                      {availableOperators.map(op => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>

                    <div className="filter-value">
                      {renderValueInput(filter)}
                    </div>

                    <button
                      className="remove-filter-btn"
                      onClick={() => removeFilter(filter.id)}
                      title="Remove filter"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}

            {value.length === 0 && (
              <div className="empty-filters">
                No filters added. Click &quot;Add Filter&quot; to start building your query.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}