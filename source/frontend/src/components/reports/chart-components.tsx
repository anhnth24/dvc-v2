import './chart-components.css';

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartProps {
  data: ChartData[];
  title: string;
  height?: number;
}

export function LineChart({ data, title, height = 300 }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="line-chart" style={{ height }}>
        <div className="chart-grid">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid-line" style={{ bottom: `${i * 25}%` }}>
              <span className="grid-label">{Math.round((maxValue * i) / 4)}</span>
            </div>
          ))}
        </div>
        <svg className="chart-svg" viewBox={`0 0 ${data.length * 50} ${height}`}>
          <polyline
            points={data.map((point, index) =>
              `${index * 50 + 25},${height - (point.value / maxValue) * height * 0.8}`
            ).join(' ')}
            className="chart-line"
          />
          {data.map((point, index) => (
            <circle
              key={index}
              cx={index * 50 + 25}
              cy={height - (point.value / maxValue) * height * 0.8}
              r="4"
              className="chart-point"
            >
              <title>{`${point.label}: ${point.value}`}</title>
            </circle>
          ))}
        </svg>
        <div className="chart-labels">
          {data.map((point, index) => (
            <span key={index} className="chart-label">
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface BarChartProps {
  data: ChartData[];
  title: string;
  height?: number;
}

export function BarChart({ data, title, height = 300 }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="bar-chart" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="bar-item">
            <div
              className="bar"
              style={{
                height: `${(item.value / maxValue) * 80}%`,
                backgroundColor: item.color || '#3b82f6'
              }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="bar-label">{item.label}</span>
            <span className="bar-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface PieChartProps {
  data: ChartData[];
  title: string;
  size?: number;
}

export function PieChart({ data, title, size = 200 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle,
      color: item.color || `hsl(${index * 360 / data.length}, 70%, 60%)`
    };
  });

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="pie-chart">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, index) => {
            const radius = size / 2 - 10;
            const centerX = size / 2;
            const centerY = size / 2;

            const startX = centerX + radius * Math.cos((slice.startAngle - 90) * Math.PI / 180);
            const startY = centerY + radius * Math.sin((slice.startAngle - 90) * Math.PI / 180);
            const endX = centerX + radius * Math.cos((slice.endAngle - 90) * Math.PI / 180);
            const endY = centerY + radius * Math.sin((slice.endAngle - 90) * Math.PI / 180);

            const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;

            return (
              <path
                key={index}
                d={`M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`}
                fill={slice.color}
                className="pie-slice"
              >
                <title>{`${slice.label}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}</title>
              </path>
            );
          })}
        </svg>
        <div className="pie-legend">
          {slices.map((slice, index) => (
            <div key={index} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: slice.color }}
              />
              <span className="legend-label">
                {slice.label}: {slice.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}