import type { HTMLAttributes, ReactNode } from 'react';
import './document-tabs.css';

export interface DocumentTabsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function DocumentTabs({ children, ...rest }: DocumentTabsProps) {
  return (
    <div {...rest} className={`document-tabs ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
