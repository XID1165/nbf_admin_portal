import { useId, useState } from 'react';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { FieldError, ModalError } from '../messages/MessageProvider';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  ACTION_LABEL, BLOCK_REASONS, UNBLOCK_REASONS, ControlsError, controls, isBlockAction, maskAccount,
  type AccountStatus, type ActionKind, type ControlRequest, type Customer, type TargetKind, type UserStatus,
} from '../../services/controls';

export interface ActionTarget { kind: TargetKind; id: string }
interface Props { customer: Customer; target: ActionTarget; action: ActionKind; onClose: () => void; onSubmitted: (r: ControlRequest) => void; onRefresh: () => void }

const MIN = 10, MAX = 250;
const field = 'w-full rounded-control border bg-white px-3 text-sm text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary';

/** Shared block / unblock request dialog for digital users and accounts. */
export function ActionModal({ customer, target, action, onClose, onSubmitted, onRefresh }: Props) {
  const { session } = useAuth();
  const uid = useId();
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [verified, setVerified] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ControlsError | null>(null);

  const unblock = action === 'unblock';
  const acct = target.kind === 'account' ? customer.accounts.find((a) => a.id === target.id) : undefined;
  const label = target.kind === 'user' ? 'Digital user' : `${acct?.type} ${maskAccount(acct?.number ?? '')}`;
  const sub = target.kind === 'user' ? customer.user.username : `${acct?.currency} · ${customer.name}`;
  const fromStatus: UserStatus | AccountStatus = target.kind === 'user' ? customer.user.status : acct!.status;
  const toStatus: UserStatus | AccountStatus = unblock ? 'active' : target.kind === 'user' ? 'blocked' : (action as AccountStatus);
  const reasons = unblock ? UNBLOCK_REASONS : BLOCK_REASONS;
  const full = action === 'full_block';
  const title = target.kind === 'user' ? `${unblock ? 'Unblock' : 'Block'} digital user` : `${ACTION_LABEL[action]} account`;

  const errs = {
    reason: reason ? '' : 'Select a reason.',
    remarks: remarks.trim().length < MIN ? `Enter at least ${MIN} characters.` : remarks.length > MAX ? `Keep remarks within ${MAX} characters.` : '',
    verified: unblock && !verified ? 'Confirm the customer’s identity has been verified.' : '',
    confirm: full && confirmText !== 'BLOCK' ? 'Type BLOCK to confirm.' : '',
  };
  const invalid = Object.values(errs).some(Boolean);
  const show = (k: keyof typeof errs) => (touched ? errs[k] : '');

  async function submit() {
    setTouched(true);
    if (invalid || !session) return;
    setBusy(true); setError(null);
    try {
      const r = await controls.submit({ cif: customer.cif, target, action, reason, remarks: remarks.trim() }, { username: session.user.username, displayName: session.user.displayName, role: session.role });
      onSubmitted(r);
    } catch (e) {
      setError(e instanceof ControlsError ? e : new ControlsError('SERVICE_UNAVAILABLE', 'Something went wrong. Try again.'));
      setBusy(false);
    }
  }

  const danger = isBlockAction(action);
  const errAction = error?.code === 'CORE_TIMEOUT' ? { label: 'Retry', onClick: submit } : error?.code === 'CONCURRENT_CHANGE' ? { label: 'Refresh', onClick: onRefresh } : undefined;
  const kind = error?.code === 'ALREADY_IN_STATE' || error?.code === 'CONCURRENT_CHANGE' ? 'warning' : 'error';

  return (
    <Modal open onClose={onClose} locked={busy} title={title} description={`${customer.name} · CIF ${customer.cif}`}
      footer={(
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs text-muted"><ShieldCheck className="size-4 shrink-0" aria-hidden="true" />A checker must approve before this takes effect.</p>
          <div className="flex items-center gap-2 max-md:w-full max-md:justify-end">
            <button type="button" onClick={onClose} disabled={busy} className="h-10 rounded-control px-4 text-sm font-medium text-charcoal hover:bg-charcoal/5 disabled:opacity-50">Cancel</button>
            <button type="button" onClick={submit} disabled={busy || !reason}
              className={`inline-flex h-10 items-center gap-2 rounded-control px-5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${danger ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-dark'}`}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}{busy ? 'Submitting…' : 'Submit request'}
            </button>
          </div>
        </div>
      )}>
      <div className="space-y-5">
        <div className="rounded-control border border-line bg-surface p-4">
          <p className="text-sm font-medium text-charcoal">{label}</p>
          <p className="mt-0.5 text-xs text-muted">{sub}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2" aria-label={`Status change: ${fromStatus} to ${toStatus}`}>
            <StatusBadge status={fromStatus} /><ArrowRight className="size-4 text-muted rtl:rotate-180" aria-hidden="true" /><StatusBadge status={toStatus} />
          </div>
        </div>

        {error && <ModalError kind={kind} action={errAction && { ...errAction, disabled: busy }}>{error.message}</ModalError>}

        <fieldset aria-describedby={show('reason') ? `${uid}-reason-err` : undefined}>
          <legend className="text-sm font-semibold text-charcoal">Reason for {unblock ? 'unblock' : 'block'} <span aria-hidden="true" className="text-danger">*</span></legend>
          <div role="radiogroup" aria-label="Reason" className="mt-3 flex flex-wrap gap-2">
            {reasons.map((r) => {
              const on = reason === r;
              return (
                <button key={r} type="button" role="radio" aria-checked={on} disabled={busy} onClick={() => setReason(r)}
                  className={`h-9 rounded-full border px-4 text-sm transition-colors disabled:opacity-60 ${on ? 'border-primary bg-primary-50 font-medium text-primary-600 ring-1 ring-primary' : 'border-line bg-white text-charcoal hover:border-charcoal/30'}`}>{r}</button>
              );
            })}
          </div>
          <FieldError id={`${uid}-reason-err`}>{show('reason')}</FieldError>
        </fieldset>

        <div>
          <div className="flex items-baseline justify-between"><label htmlFor={`${uid}-remarks`} className="text-sm font-semibold text-charcoal">Remarks <span aria-hidden="true" className="text-danger">*</span>{reason === 'Other' && <span className="ms-2 text-xs font-normal text-muted">Describe the reason</span>}</label>
            <span className={`text-xs ${remarks.length > MAX ? 'font-semibold text-danger' : 'text-muted'}`} aria-live="polite">{remarks.length}/{MAX}</span></div>
          <textarea id={`${uid}-remarks`} rows={4} value={remarks} disabled={busy} onChange={(e) => setRemarks(e.target.value)} aria-invalid={!!show('remarks') || undefined} aria-describedby={show('remarks') ? `${uid}-remarks-err` : undefined}
            placeholder="Add context for the checker (10–250 characters)" className={`${field} mt-2 resize-none py-2.5 ${show('remarks') ? 'border-danger' : 'border-line'}`} />
          <FieldError id={`${uid}-remarks-err`}>{show('remarks')}</FieldError>
        </div>

        {unblock && (
          <div>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-charcoal">
              <input type="checkbox" checked={verified} disabled={busy} onChange={(e) => setVerified(e.target.checked)} aria-invalid={!!show('verified') || undefined} aria-describedby={show('verified') ? `${uid}-ver-err` : undefined} className="mt-0.5 size-4 rounded border-charcoal/30 accent-[rgb(var(--primary))]" />
              Customer identity verified per KYC procedure
            </label>
            <FieldError id={`${uid}-ver-err`}>{show('verified')}</FieldError>
          </div>
        )}

        {full && (
          <div>
            <label htmlFor={`${uid}-confirm`} className="text-sm font-semibold text-charcoal">Type <span className="font-mono text-danger">BLOCK</span> to confirm <span aria-hidden="true" className="text-danger">*</span></label>
            <input id={`${uid}-confirm`} value={confirmText} disabled={busy} autoComplete="off" onChange={(e) => setConfirmText(e.target.value)} aria-invalid={!!show('confirm') || undefined} aria-describedby={show('confirm') ? `${uid}-conf-err` : undefined}
              className={`${field} mt-2 h-10 font-mono ${show('confirm') ? 'border-danger' : 'border-line'}`} />
            <FieldError id={`${uid}-conf-err`}>{show('confirm')}</FieldError>
          </div>
        )}
      </div>
    </Modal>
  );
}
