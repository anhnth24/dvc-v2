import type { HTMLAttributes, ReactNode } from 'react';
import './footer.css';

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export function Footer({ children, ...rest }: FooterProps) {
  return (
    <footer {...rest} className={`app-footer ${rest.className ?? ''}`.trim()}>
      {children}
    </footer>
  );
}
