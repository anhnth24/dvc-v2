import type { HTMLAttributes, ReactNode } from 'react';
import './sidebar.css';

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export function Sidebar({ children, ...rest }: SidebarProps) {
  return (
    <aside {...rest} className={`app-sidebar ${rest.className ?? ''}`.trim()}>
      {children}
    </aside>
  );
}
