import type { HTMLAttributes, ReactNode } from 'react';
import './navigation.css';

export interface NavigationProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export function Navigation({ children, ...rest }: NavigationProps) {
  return (
    <nav {...rest} className={`app-nav ${rest.className ?? ''}`.trim()}>
      {children}
    </nav>
  );
}
