import { Lock, LockOpen } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Tooltip } from '../ui/Tooltip';
import { InlineBanner } from '../messages/MessageProvider';
import { userActions, type ActionKind, type Customer } from '../../services/controls';

interface Props { customer: Customer; pending: boolean; canInitiate: boolean; onAction: (a: ActionKind) => void }
const fmt = (d: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));

export function UserControlsTab({ customer, pending, canInitiate, onAction }: Props) {
  const u = customer.user;
  const status = pending ? 'pending' : u.status;
  const [action] = userActions(u);
  const rows: [string, string][] = [['Username', u.username], ['Last login', u.lastLogin], ['Registered devices', String(u.devices)], ['Failed attempts', `${u.failedAttempts} of 5`]];
  const unblock = action === 'unblock';
  return (
    <div className="space-y-5">
      {u.status === 'locked' && !pending && (
        <InlineBanner id={`locked-${customer.cif}`} kind="info">This user is locked after 5 failed login attempts. Unblocking will also reset the attempt counter.</InlineBanner>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="text-sm text-muted">Status</span><StatusBadge status={status} /></div>
        {canInitiate && (
          <Tooltip text={pending ? 'A request is already pending for this user.' : undefined}>
            {(p) => (
              <button type="button" {...p} aria-disabled={pending || undefined} onClick={() => !pending && onAction(action)}
                className={`inline-flex h-10 items-center gap-2 rounded-control border bg-white px-4 text-sm font-semibold aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${unblock ? 'border-primary/40 text-primary-600 hover:bg-primary-50' : 'border-danger/40 text-danger hover:bg-danger-50'}`}>
                {unblock ? <LockOpen className="size-4" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}{unblock ? 'Unblock user' : 'Block user'}
              </button>
            )}
          </Tooltip>
        )}
      </div>
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {rows.map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="mt-1 text-sm font-medium text-charcoal">{v}</dd></div>)}
      </dl>
      {u.status === 'blocked' && u.block && (
        <div className="rounded-control border border-danger/20 bg-danger-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-danger">Block details</p>
          <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-3">
            {([['Reason', u.block.reason], ['Blocked on', fmt(u.block.date)], ['Blocked by', u.block.by]] as const).map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="mt-1 text-sm font-medium text-charcoal">{v}</dd></div>)}
          </dl>
        </div>
      )}
    </div>
  );
}
