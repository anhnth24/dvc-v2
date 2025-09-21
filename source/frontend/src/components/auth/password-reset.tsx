import type { FormHTMLAttributes, ReactNode } from 'react';
import './password-reset.css';

export interface PasswordResetProps extends FormHTMLAttributes<HTMLFormElement> {
  children?: ReactNode;
}

export function PasswordReset({ children, ...rest }: PasswordResetProps) {
  return (
    <form {...rest} className={`password-reset ${rest.className ?? ''}`.trim()}>
      {children}
    </form>
  );
}
