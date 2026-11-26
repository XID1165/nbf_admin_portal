import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode;
  /** While true the dialog can't be closed (Esc, backdrop and close button are disabled). */
  locked?: boolean; variant?: 'center' | 'drawer'; width?: string;
}
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Accessible dialog: focus trap, Esc to close, full-screen sheet on mobile; `drawer` slides in from the end edge. */
export function Modal({ open, onClose, title, description, children, footer, locked, variant = 'center', width = 'md:max-w-[560px]' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId(), descId = useId();
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => (ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current?.querySelector<HTMLElement>(FOCUSABLE))?.focus(), 30);
    return () => { window.clearTimeout(t); document.body.style.overflow = prev; (opener.current as HTMLElement | null)?.focus?.(); };
  }, [open]);

  if (!open) return null;
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !locked) { e.stopPropagation(); onClose(); return; }
    if (e.key !== 'Tab') return;
    const els = [...(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter((el) => el.offsetParent !== null);
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const drawer = variant === 'drawer';
  return (
    <div className={`fixed inset-0 z-50 flex ${drawer ? 'justify-end' : 'items-stretch justify-center md:items-center md:p-6'}`} onKeyDown={onKey}>
      <div aria-hidden="true" className="absolute inset-0 bg-ink/50" onClick={() => !locked && onClose()} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descId : undefined} aria-busy={locked || undefined}
        className={`relative flex max-h-full w-full flex-col bg-white shadow-card max-md:h-full ${drawer ? 'md:max-w-[520px] motion-safe:animate-slide-fwd' : `${width} md:rounded-card motion-safe:animate-card-in`}`}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-charcoal">{title}</h2>
            {description && <p id={descId} className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} disabled={locked} aria-label="Close dialog" className="-me-2 rounded-control p-2 text-muted hover:bg-surface hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-40"><X className="size-5" aria-hidden="true" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-line bg-surface/50 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
