import type { HTMLAttributes, ReactNode } from 'react';
import './header.css';

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export function Header({ children, ...rest }: HeaderProps) {
  return (
    <header {...rest} className={`app-header ${rest.className ?? ''}`.trim()}>
      {children}
    </header>
  );
}
