import type { FormHTMLAttributes, ReactNode } from 'react';
import './login-form.css';

export interface LoginFormProps extends FormHTMLAttributes<HTMLFormElement> {
  children?: ReactNode;
}

export function LoginForm({ children, ...rest }: LoginFormProps) {
  return (
    <form {...rest} className={`login-form ${rest.className ?? ''}`.trim()}>
      {children}
    </form>
  );
}
