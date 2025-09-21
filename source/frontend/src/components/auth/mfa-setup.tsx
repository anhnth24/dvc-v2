import type { HTMLAttributes, ReactNode } from 'react';
import './mfa-setup.css';

export interface MfaSetupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function MfaSetup({ children, ...rest }: MfaSetupProps) {
  return (
    <div {...rest} className={`mfa-setup ${rest.className ?? ''}`.trim()}>
      {children}
    </div>
  );
}
