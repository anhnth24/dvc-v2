import type { HTMLAttributes, ReactNode } from 'react';
import './quick-actions.css';

export interface QuickActionsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function QuickActions({ children, ...rest }: QuickActionsProps) {
  return (
    <div {...rest} className={`quick-actions ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
