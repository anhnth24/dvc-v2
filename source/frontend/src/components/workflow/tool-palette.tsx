import type { HTMLAttributes, ReactNode } from 'react';
import './tool-palette.css';

export interface ToolPaletteProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function ToolPalette({ children, ...rest }: ToolPaletteProps) {
  return (
    <div {...rest} className={`tool-palette ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
