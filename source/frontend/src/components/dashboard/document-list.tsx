import type { HTMLAttributes, ReactNode } from 'react';
import './document-list.css';

export interface DocumentListProps extends HTMLAttributes<HTMLUListElement> {
  children?: ReactNode;
}

export function DocumentList({ children, ...rest }: DocumentListProps) {
  return (
    <ul {...rest} className={`document-list ${rest.className ?? ''}`.trim()}>
      {children}
    </ul>
  );
}
