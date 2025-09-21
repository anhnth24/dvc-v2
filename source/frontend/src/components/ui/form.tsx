import type { FormHTMLAttributes, ReactNode } from 'react';
import './form.css';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children?: ReactNode;
}

export function Form({ children, ...rest }: FormProps) {
  return (
    <form {...rest} className={`form ${rest.className ?? ''}`.trim()}>
      {children}
    </form>
  );
}
