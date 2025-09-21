import type { HTMLAttributes, ReactNode } from 'react';
import './stats-cards.css';

export interface StatsCardsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function StatsCards({ children, ...rest }: StatsCardsProps) {
  return (
    <div {...rest} className={`stats-cards ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
