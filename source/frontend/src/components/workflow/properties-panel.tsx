import type { HTMLAttributes, ReactNode } from 'react';
import './properties-panel.css';

export interface PropertiesPanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function PropertiesPanel({ children, ...rest }: PropertiesPanelProps) {
  return (
    <aside {...rest} className={`properties-panel ${rest.className ?? ''}`.trim()}>
      {children}
    </aside>
  );
}
