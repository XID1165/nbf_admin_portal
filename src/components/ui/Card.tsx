import type { ReactNode } from 'react';
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-card bg-white p-6 shadow-soft ${className}`}>{children}</div>;
}
