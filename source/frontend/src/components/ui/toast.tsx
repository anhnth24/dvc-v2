import type { HTMLAttributes, ReactNode } from 'react';
import './toast.css';

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function Toast({ children, ...rest }: ToastProps) {
  return (
    <div {...rest} className={`toast ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
