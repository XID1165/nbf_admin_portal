import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

/**
 * One provider for every message pattern in the portal:
 *  - toast: success confirmations only, auto-dismiss after 5 s
 *  - <InlineBanner>: persistent, dismissible (info / warning / error)
 *  - <ModalError>: failure inside a modal, keeps the user's input
 *  - <FieldError>: validation text under a field
 */
type Kind = 'info' | 'warning' | 'error';
interface Toast { id: number; text: string }
interface Ctx {
  toast: (text: string) => void;
  isDismissed: (id: string) => boolean;
  dismiss: (id: string) => void;
  reset: (id: string) => void;
}
const MessageCtx = createContext<Ctx | null>(null);
export const TOAST_MS = 5000;

export function MessageProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const seq = useRef(0);
  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((text: string) => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, text }]);
    window.setTimeout(() => remove(id), TOAST_MS);
  }, [remove]);
  const value = useMemo<Ctx>(() => ({
    toast,
    isDismissed: (id) => dismissed.has(id),
    dismiss: (id) => setDismissed((s) => new Set(s).add(id)),
    reset: (id) => setDismissed((s) => { const n = new Set(s); n.delete(id); return n; }),
  }), [toast, dismissed]);

  return (
    <MessageCtx.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:end-6 sm:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-[420px] items-start gap-3 rounded-card border border-success/25 bg-white p-4 text-sm text-charcoal shadow-card motion-safe:animate-card-in">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
            <p className="flex-1">{t.text}</p>
            <button type="button" onClick={() => remove(t.id)} aria-label="Dismiss notification" className="rounded p-0.5 text-muted hover:text-charcoal"><X className="size-4" aria-hidden="true" /></button>
          </div>
        ))}
      </div>
    </MessageCtx.Provider>
  );
}

export function useMessages() {
  const c = useContext(MessageCtx);
  if (!c) throw new Error('useMessages must be used within MessageProvider');
  return c;
}

const TONE: Record<Kind, { box: string; icon: typeof Info }> = {
  info: { box: 'border-primary/30 bg-primary-50 text-charcoal', icon: Info },
  warning: { box: 'border-gold/40 bg-warning-50 text-warning', icon: AlertTriangle },
  error: { box: 'border-danger/30 bg-danger-50 text-danger', icon: XCircle },
};

interface BannerProps { id: string; kind?: Kind; children: ReactNode; action?: { label: string; onClick: () => void }; dismissible?: boolean; onDismiss?: () => void }
/** Persistent banner. Dismissal is remembered by `id` for the rest of the session. */
export function InlineBanner({ id, kind = 'info', children, action, dismissible = true, onDismiss }: BannerProps) {
  const { isDismissed, dismiss } = useMessages();
  if (isDismissed(id)) return null;
  const { box, icon: Icon } = TONE[kind];
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} data-banner={id} className={`flex items-start gap-3 rounded-control border p-3.5 text-sm ${box}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1">{children}</p>
      {action && <button type="button" onClick={action.onClick} className="shrink-0 rounded-control border border-current/30 bg-white px-3 py-1 text-xs font-semibold hover:bg-surface">{action.label}</button>}
      {dismissible && <button type="button" onClick={() => { dismiss(id); onDismiss?.(); }} aria-label="Dismiss message" className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"><X className="size-4" aria-hidden="true" /></button>}
    </div>
  );
}

/** Failure shown inside a modal/drawer; the form stays filled in. */
export function ModalError({ kind = 'error', children, action }: { kind?: Exclude<Kind, 'info'>; children: ReactNode; action?: { label: string; onClick: () => void; disabled?: boolean } }) {
  const { box, icon: Icon } = TONE[kind];
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-control border p-3.5 text-sm ${box}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1">{children}</p>
      {action && <button type="button" disabled={action.disabled} onClick={action.onClick} className="shrink-0 rounded-control border border-current/30 bg-white px-3 py-1 text-xs font-semibold hover:bg-surface disabled:opacity-50">{action.label}</button>}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger"><XCircle className="size-3.5 shrink-0" aria-hidden="true" />{children}</p>;
}

/** Clears a banner's dismissed state when `deps` change (e.g. a new request arrives). */
export function useResetBanner(id: string, dep: unknown) {
  const { reset } = useMessages();
  useEffect(() => { reset(id); }, [dep]); // eslint-disable-line react-hooks/exhaustive-deps
}
