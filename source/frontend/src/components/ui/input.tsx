import type { InputHTMLAttributes } from 'react';
import './input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  return <input {...props} className={`input ${props.className ?? ''}`.trim()} />;
}
