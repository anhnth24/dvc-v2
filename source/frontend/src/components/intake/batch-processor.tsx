import type { HTMLAttributes, ReactNode } from 'react';
import './batch-processor.css';

export interface BatchProcessorProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function BatchProcessor({ children, ...rest }: BatchProcessorProps) {
  return (
    <div {...rest} className={`batch-processor ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
