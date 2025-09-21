import type { HTMLAttributes, ReactNode } from 'react';
import './processing-dashboard.css';

export interface ProcessingDashboardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function ProcessingDashboard({ children, ...rest }: ProcessingDashboardProps) {
  return (
    <section {...rest} className={`processing-dashboard ${rest.className ?? ''}`.trim()}>
      {children}
    </section>
  );
}
