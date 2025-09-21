import { useState } from 'react';
import './export-button.css';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  columns?: string[];
}

export interface ExportButtonProps {
  data: any[];
  onExport: (options: ExportOptions) => Promise<void>;
  availableFormats?: ('csv' | 'excel' | 'pdf' | 'json')[];
  defaultFilename?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function ExportButton({
  data,
  onExport,
  availableFormats = ['csv', 'excel', 'pdf'],
  defaultFilename = 'export',
  loading = false,
  disabled = false
}: ExportButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: availableFormats[0] || 'csv',
    filename: defaultFilename,
    includeHeaders: true
  });

  const formatLabels = {
    csv: 'CSV',
    excel: 'Excel',
    pdf: 'PDF',
    json: 'JSON'
  };

  const formatIcons = {
    csv: '📊',
    excel: '📗',
    pdf: '📄',
    json: '🔧'
  };

  const handleQuickExport = async (format: ExportOptions['format']) => {
    if (disabled || loading) return;

    await onExport({
      ...exportOptions,
      format,
      filename: `${defaultFilename}.${format}`
    });
  };

  const handleCustomExport = async () => {
    if (disabled || loading) return;

    await onExport(exportOptions);
    setShowOptions(false);
  };

  const updateOption = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  if (data.length === 0) {
    return (
      <button className="export-btn export-btn--disabled" disabled>
        📤 No data to export
      </button>
    );
  }

  return (
    <div className="export-button-container">
      <div className="export-quick-actions">
        {availableFormats.map(format => (
          <button
            key={format}
            className={`export-btn export-btn--${format}`}
            onClick={() => handleQuickExport(format)}
            disabled={disabled || loading}
            title={`Export as ${formatLabels[format]}`}
          >
            {formatIcons[format]} {formatLabels[format]}
          </button>
        ))}

        <button
          className="export-btn export-btn--options"
          onClick={() => setShowOptions(!showOptions)}
          disabled={disabled || loading}
          title="Export options"
        >
          ⚙️ Options
        </button>
      </div>

      {showOptions && (
        <div className="export-options-modal">
          <div className="export-options-overlay" onClick={() => setShowOptions(false)} />
          <div className="export-options-panel">
            <div className="export-options-header">
              <h3>Export Options</h3>
              <button
                className="close-btn"
                onClick={() => setShowOptions(false)}
              >
                ×
              </button>
            </div>

            <div className="export-options-content">
              <div className="option-group">
                <label className="option-label">Format</label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => updateOption('format', e.target.value)}
                  className="option-select"
                >
                  {availableFormats.map(format => (
                    <option key={format} value={format}>
                      {formatIcons[format]} {formatLabels[format]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="option-group">
                <label className="option-label">Filename</label>
                <input
                  type="text"
                  value={exportOptions.filename || ''}
                  onChange={(e) => updateOption('filename', e.target.value)}
                  placeholder="Enter filename"
                  className="option-input"
                />
              </div>

              <div className="option-group">
                <label className="option-checkbox">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeHeaders}
                    onChange={(e) => updateOption('includeHeaders', e.target.checked)}
                  />
                  Include headers
                </label>
              </div>

              <div className="option-group">
                <label className="option-label">Date Range (optional)</label>
                <div className="date-range-inputs">
                  <input
                    type="date"
                    value={exportOptions.dateRange?.start || ''}
                    onChange={(e) => updateOption('dateRange', {
                      ...exportOptions.dateRange,
                      start: e.target.value
                    })}
                    className="option-input"
                    placeholder="Start date"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={exportOptions.dateRange?.end || ''}
                    onChange={(e) => updateOption('dateRange', {
                      ...exportOptions.dateRange,
                      end: e.target.value
                    })}
                    className="option-input"
                    placeholder="End date"
                  />
                </div>
              </div>

              <div className="export-info">
                <div className="info-item">
                  <span className="info-label">Records:</span>
                  <span className="info-value">{data.length.toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Format:</span>
                  <span className="info-value">{formatLabels[exportOptions.format]}</span>
                </div>
              </div>
            </div>

            <div className="export-options-footer">
              <button
                className="export-btn export-btn--cancel"
                onClick={() => setShowOptions(false)}
              >
                Cancel
              </button>
              <button
                className="export-btn export-btn--primary"
                onClick={handleCustomExport}
                disabled={loading || !exportOptions.filename}
              >
                {loading ? 'Exporting...' : '📤 Export'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="export-loading">
          <div className="loading-spinner" />
          <span>Preparing export...</span>
        </div>
      )}
    </div>
  );
}

// Quick export button for simple use cases
export function QuickExportButton({
  format,
  data,
  onExport,
  filename = 'export',
  disabled = false
}: {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  data: any[];
  onExport: (options: ExportOptions) => Promise<void>;
  filename?: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (disabled || loading || data.length === 0) return;

    setLoading(true);
    try {
      await onExport({
        format,
        filename: `${filename}.${format}`,
        includeHeaders: true
      });
    } finally {
      setLoading(false);
    }
  };

  const formatLabels = {
    csv: 'CSV',
    excel: 'Excel',
    pdf: 'PDF',
    json: 'JSON'
  };

  const formatIcons = {
    csv: '📊',
    excel: '📗',
    pdf: '📄',
    json: '🔧'
  };

  return (
    <button
      className={`export-btn export-btn--${format} ${loading ? 'loading' : ''}`}
      onClick={handleExport}
      disabled={disabled || loading || data.length === 0}
    >
      {loading ? (
        <>
          <div className="btn-spinner" />
          Exporting...
        </>
      ) : (
        <>
          {formatIcons[format]} Export {formatLabels[format]}
        </>
      )}
    </button>
  );
}