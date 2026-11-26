import type { ReactNode } from 'react';
import { AlertCircle, Lock, WifiOff, Ban } from 'lucide-react';

export type AlertKind = 'error' | 'locked' | 'disabled' | 'network';
const ICON = { error: AlertCircle, locked: Lock, disabled: Ban, network: WifiOff };
export function Alert({ kind = 'error', title, children }: { kind?: AlertKind; title?: string; children: ReactNode }) {
  const Icon = ICON[kind];
  const tone = kind === 'error' || kind === 'locked' ? 'bg-danger-50 text-danger' : 'bg-warning-50 text-warning';
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-control p-3 text-sm ${tone}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{title && <p className="font-semibold">{title}</p>}<p>{children}</p></div>
    </div>
  );
}
