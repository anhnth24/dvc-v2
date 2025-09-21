import type { FormHTMLAttributes, ReactNode } from 'react';
import './metadata-form.css';

export interface MetadataFormProps extends FormHTMLAttributes<HTMLFormElement> {
  children?: ReactNode;
}

export function MetadataForm({ children, ...rest }: MetadataFormProps) {
  return (
    <form {...rest} className={`metadata-form ${rest.className ?? ''}`.trim()}>
      {children}
    </form>
  );
}
