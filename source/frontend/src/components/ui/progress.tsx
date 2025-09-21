import './progress.css';

export interface ProgressProps {
  value?: number; // 0-100
}

export function Progress({ value = 0 }: ProgressProps) {
  // width handling should be done via CSS classes or variables set by parent styles
  return (
    <div className="progress" data-value={value}>
      <div className="bar" />
    </div>
  );
}
