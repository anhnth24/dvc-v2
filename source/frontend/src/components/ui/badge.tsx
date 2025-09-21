import type { HTMLAttributes } from 'react';
import './badge.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {}

export function Badge(props: BadgeProps) {
  return <span {...props} className={`badge ${props.className ?? ''}`.trim()} />;
}
