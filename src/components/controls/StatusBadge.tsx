import { Ban, CheckCircle2, ArrowDownToLine, ArrowUpFromLine, Clock, Lock, Moon, ShieldAlert, XCircle, type LucideIcon } from 'lucide-react';
import { ACCOUNT_STATUS_LABEL, USER_STATUS_LABEL, type AccountStatus, type UserStatus } from '../../services/controls';

/** Never colour alone: each status carries an icon and a text label. */
type Key = UserStatus | AccountStatus | 'pending' | 'compliance';
const STYLE: Record<Key, { cls: string; icon: LucideIcon }> = {
  active: { cls: 'bg-success-50 text-success ring-success/25', icon: CheckCircle2 },
  blocked: { cls: 'bg-danger-50 text-danger ring-danger/25', icon: Ban },
  full_block: { cls: 'bg-danger-50 text-danger ring-danger/25', icon: Ban },
  debit_block: { cls: 'bg-danger-50 text-danger ring-danger/25', icon: ArrowUpFromLine },
  credit_block: { cls: 'bg-danger-50 text-danger ring-danger/25', icon: ArrowDownToLine },
  locked: { cls: 'bg-warning-50 text-warning ring-gold/40', icon: Lock },
  dormant: { cls: 'bg-charcoal/5 text-charcoal/70 ring-charcoal/20', icon: Moon },
  closed: { cls: 'bg-charcoal/5 text-charcoal/60 ring-charcoal/20', icon: XCircle },
  pending: { cls: 'bg-white text-primary-600 ring-primary', icon: Clock },
  compliance: { cls: 'bg-danger-50 text-danger ring-danger/25', icon: ShieldAlert },
};
const LABEL: Partial<Record<Key, string>> = { pending: 'Pending approval', compliance: 'Compliance hold' };

export function StatusBadge({ status, className = '' }: { status: Key; className?: string }) {
  const { cls, icon: Icon } = STYLE[status];
  const label = LABEL[status] ?? (USER_STATUS_LABEL as Record<string, string>)[status] ?? (ACCOUNT_STATUS_LABEL as Record<string, string>)[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${cls} ${className}`}>
      <Icon className="size-3.5" aria-hidden="true" />{label}
    </span>
  );
}
