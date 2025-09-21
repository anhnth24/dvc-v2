import type { HTMLAttributes, ReactNode } from 'react';
import './workflow-designer.css';

export interface WorkflowDesignerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function WorkflowDesigner({ children, ...rest }: WorkflowDesignerProps) {
  return (
    <div {...rest} className={`workflow-designer ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
