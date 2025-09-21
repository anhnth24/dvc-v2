import type { ReactNode } from 'react';
import './protected-route.css';

export interface ProtectedRouteProps {
  children?: ReactNode;
}

// Placeholder wrapper for protecting client-side sections
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;
}
