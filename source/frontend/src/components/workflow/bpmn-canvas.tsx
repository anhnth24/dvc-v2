import type { HTMLAttributes, ReactNode } from 'react';
import './bpmn-canvas.css';

export interface BpmnCanvasProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function BpmnCanvas({ children, ...rest }: BpmnCanvasProps) {
  return (
    <div {...rest} className={`bpmn-canvas ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
