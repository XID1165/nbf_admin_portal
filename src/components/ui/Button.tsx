import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary'; loading?: boolean; }
export function Button({ variant = 'primary', loading, children, className = '', disabled, ...rest }: Props) {
  const styles = variant === 'primary'
    ? 'bg-primary text-white hover:bg-dark active:bg-dark'
    : 'bg-white text-charcoal border border-charcoal/20 hover:bg-charcoal/5';
  return (
    <button {...rest} disabled={disabled || loading}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-control px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
