import type { ButtonHTMLAttributes } from 'react';
import './button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button(props: ButtonProps) {
  return <button {...props} className={`btn ${props.className ?? ''}`.trim()} />;
}
