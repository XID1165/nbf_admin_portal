import { useId, type ReactNode } from 'react';

/** Hover/focus tooltip for controls that are disabled with a reason. Child receives `aria-describedby`. */
export function Tooltip({ text, children, className = '' }: { text?: string; children: (props: { 'aria-describedby'?: string }) => ReactNode; className?: string }) {
  const id = useId();
  return (
    <span className={`group relative inline-flex ${className}`}>
      {children(text ? { 'aria-describedby': id } : {})}
      {text && <span id={id} role="tooltip" className="pointer-events-none absolute end-0 top-full z-30 mt-1.5 hidden w-max max-w-[240px] rounded-control bg-charcoal px-3 py-2 text-xs font-normal leading-4 text-white shadow-soft group-focus-within:block group-hover:block">{text}</span>}
    </span>
  );
}
