import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Tooltip } from '../ui/Tooltip';
import { RT } from '../ui/responsiveTable';
import { ACTION_LABEL, accountActions, maskAccount, type Account, type ActionKind, type Customer } from '../../services/controls';

const MENU: ActionKind[] = ['full_block', 'debit_block', 'credit_block', 'unblock'];
const money = (n: number, c: string) => `${c} ${n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function ActionMenu({ account, label, disabledReason, onPick }: { account: Account; label: string; disabledReason?: string; onPick: (a: ActionKind) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const allowed = accountActions(account);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', away);
    root.current?.querySelector<HTMLElement>('[role=menuitem]:not([aria-disabled])')?.focus();
    return () => document.removeEventListener('mousedown', away);
  }, [open]);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); root.current?.querySelector<HTMLElement>('button')?.focus(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = [...root.current!.querySelectorAll<HTMLElement>('[role=menuitem]:not([aria-disabled])')];
      const i = items.indexOf(document.activeElement as HTMLElement);
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    }
  };
  return (
    <div ref={root} className="relative" onKeyDown={onKey}>
      <Tooltip text={disabledReason}>
        {(p) => (
          <button type="button" {...p} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} aria-disabled={!!disabledReason || undefined} aria-label={`Actions for ${label}`}
            onClick={() => !disabledReason && setOpen((o) => !o)}
            className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-sm font-medium text-charcoal hover:bg-surface aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
            Actions<ChevronDown className="size-4" aria-hidden="true" />
          </button>
        )}
      </Tooltip>
      {open && (
        <ul id={id} role="menu" aria-label={`Actions for ${label}`} className="absolute end-0 z-20 mt-1.5 w-44 rounded-control border border-line bg-white p-1 shadow-card">
          {MENU.map((a) => {
            const ok = allowed.includes(a);
            return (
              <li key={a} role="none">
                <button type="button" role="menuitem" aria-disabled={!ok || undefined} onClick={() => { if (ok) { setOpen(false); onPick(a); } }}
                  className={`flex h-9 w-full items-center rounded px-3 text-sm ${ok ? (a === 'unblock' ? 'text-primary-600 hover:bg-primary-50' : 'text-danger hover:bg-danger-50') : 'cursor-not-allowed text-charcoal/40'}`}>{ACTION_LABEL[a]}</button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface Props { customer: Customer; pendingIds: Set<string>; canInitiate: boolean; onAction: (accountId: string, a: ActionKind) => void }

export function AccountsTab({ customer, pendingIds, canInitiate, onAction }: Props) {
  const heads = ['Account', 'Currency', 'Balance', 'Status', ...(canInitiate ? ['Actions'] : [])];
  return (
    <table className={RT.table}>
      <caption className="sr-only">Accounts for {customer.name}</caption>
      <thead className={RT.thead}><tr>{heads.map((h) => <th key={h} scope="col" className={RT.th}>{h}</th>)}</tr></thead>
      <tbody className={RT.tbody}>
        {customer.accounts.map((a) => {
          const closed = a.status === 'closed', pending = pendingIds.has(a.id);
          const label = `${a.type} ${maskAccount(a.number)}`;
          const why = closed ? 'Closed accounts can’t be modified.' : pending ? 'A request is already pending for this account.' : undefined;
          return (
            <tr key={a.id} className={`${RT.tr} ${closed ? 'bg-charcoal/[0.03] text-charcoal/50 max-md:bg-charcoal/[0.03]' : ''}`}>
              <td className={`${RT.tdMain} md:min-w-[150px]`}><p className={`font-medium ${closed ? '' : 'text-charcoal'}`}>{a.type}</p><p className="mt-0.5 font-mono text-xs text-muted">{maskAccount(a.number)}</p></td>
              <td data-label="Currency" className={RT.td}>{a.currency}</td>
              <td data-label="Balance" className={`${RT.td} whitespace-nowrap tabular-nums`}>{money(a.balance, a.currency)}</td>
              <td data-label="Status" className={RT.td}>
                <span className="flex flex-wrap justify-end gap-1.5 md:justify-start">
                  {pending ? <StatusBadge status="pending" /> : <StatusBadge status={a.status} />}
                  {a.complianceHold && <StatusBadge status="compliance" />}
                </span>
              </td>
              {canInitiate && <td data-label="Actions" className={RT.td}><ActionMenu account={a} label={label} disabledReason={why} onPick={(act) => onAction(a.id, act)} /></td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
