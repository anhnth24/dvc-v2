import type { ReactNode } from 'react';
import './modal.css';

export interface ModalProps {
  open?: boolean;
  children?: ReactNode;
}

export function Modal({ open = false, children }: ModalProps) {
  if (!open) return null;
  return <div className="modal">{children}</div>;
}
