import type { HTMLAttributes, ReactNode } from 'react';
import './workspace-menu.css';

export interface WorkspaceMenuProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function WorkspaceMenu({ children, ...rest }: WorkspaceMenuProps) {
  return (
    <div {...rest} className={`workspace-menu ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
