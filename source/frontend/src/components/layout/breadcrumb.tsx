import type { HTMLAttributes, ReactNode } from 'react';
import './breadcrumb.css';

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export function Breadcrumb({ children, ...rest }: BreadcrumbProps) {
  return (
    <nav {...rest} className={`breadcrumb ${rest.className ?? ''}`.trim()}>
      {children}
    </nav>
  );
}
