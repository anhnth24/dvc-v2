import type { HTMLAttributes, ReactNode } from 'react';
import './document-scanner.css';

export interface DocumentScannerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function DocumentScanner({ children, ...rest }: DocumentScannerProps) {
  return (
    <div {...rest} className={`document-scanner ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
