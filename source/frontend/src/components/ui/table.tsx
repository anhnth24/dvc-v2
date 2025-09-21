import type { HTMLAttributes, ReactNode } from 'react';
import './table.css';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children?: ReactNode;
}

export function Table({ children, ...rest }: TableProps) {
  return (
    <table {...rest} className={`table ${rest.className ?? ''}`.trim()}>
      {children}
    </table>
  );
}
