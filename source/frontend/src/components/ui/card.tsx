import type { HTMLAttributes, ReactNode } from 'react';
import './card.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function Card({ children, ...rest }: CardProps) {
  return (
    <div {...rest} className={`card ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
