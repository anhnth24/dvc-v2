import type { HTMLAttributes, ReactNode } from 'react';
import './validation-panel.css';

export interface ValidationPanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function ValidationPanel({ children, ...rest }: ValidationPanelProps) {
  return (
    <div {...rest} className={`validation-panel ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
