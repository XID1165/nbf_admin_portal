import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Check, Loader2, RotateCw, X } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { RT } from '../components/ui/responsiveTable';
import { StatusBadge } from '../components/controls/StatusBadge';
import { useActor } from '../components/controls/useActor';
import { FieldError, ModalError, useMessages } from '../components/messages/MessageProvider';
import { ACTION_LABEL, ControlsError, controls, isBlockAction, type ControlRequest } from '../services/controls';

const age = (iso: string) => {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  return m < 60 ? `${m} min` : m < 1440 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${Math.floor(m / 1440)} d`;
};
const statusKey = (label: string) => ({ Active: 'active', Blocked: 'blocked', Dormant: 'dormant', 'Debit block': 'debit_block', 'Credit block': 'credit_block', 'Full block': 'full_block', 'Locked – failed attempts': 'locked' } as const)[label as 'Active'] ?? 'active';

function Detail({ r, onClose, onDone }: { r: ControlRequest; onClose: () => void; onDone: () => void }) {
  const actor = useActor();
  const { toast } = useMessages();
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<ControlsError | null>(null);
  const commentErr = touched && !comment.trim() ? 'Enter a comment explaining the rejection.' : '';

  async function run(kind: 'approve' | 'reject') {
    if (!actor) return;
    if (kind === 'reject') { setTouched(true); if (!comment.trim()) return; }
    setBusy(kind); setError(null);
    try {
      if (kind === 'approve') {
        await controls.approve(r.id, actor);
        toast(`${r.target.kind === 'user' ? 'Digital user' : r.target.label.replace(/^./, (c) => c.toUpperCase())} ${r.action === 'unblock' ? 'unblocked' : 'blocked'} successfully. Reference REQ-${r.id}.`);
      } else {
        await controls.reject(r.id, comment, actor);
        toast(`Request REQ-${r.id} rejected. The maker has been notified.`);
      }
      onDone();
    } catch (e) { setError(e instanceof ControlsError ? e : new ControlsError('SERVICE_UNAVAILABLE', 'Something went wrong. Try again.')); setBusy(null); }
  }

  const rows: [string, string][] = [['Customer', `${r.customerName} · CIF ${r.cif}`], ['Target', r.target.label], ['Reason', r.reason], ['Raised by', r.makerName], ['Submitted', `${age(r.createdAt)} ago`]];
  return (
    <Modal open variant="drawer" onClose={onClose} locked={!!busy} title={`REQ-${r.id}`} description={`${ACTION_LABEL[r.action]} request`}
      footer={rejecting ? (
        <div className="flex justify-end gap-2">
          <button type="button" disabled={!!busy} onClick={() => { setRejecting(false); setTouched(false); }} className="h-10 rounded-control px-4 text-sm font-medium text-charcoal hover:bg-charcoal/5 disabled:opacity-50">Back</button>
          <button type="button" disabled={!!busy} onClick={() => run('reject')} className="inline-flex h-10 items-center gap-2 rounded-control bg-danger px-5 text-sm font-semibold text-white hover:bg-danger/90 disabled:opacity-60">{busy === 'reject' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}Confirm rejection</button>
        </div>
      ) : (
        <div className="flex justify-end gap-2">
          <button type="button" disabled={!!busy} onClick={() => { setRejecting(true); setError(null); }} className="inline-flex h-10 items-center gap-2 rounded-control border border-danger/40 bg-white px-4 text-sm font-semibold text-danger hover:bg-danger-50 disabled:opacity-50"><X className="size-4" aria-hidden="true" />Reject</button>
          <button type="button" disabled={!!busy} onClick={() => run('approve')} className="inline-flex h-10 items-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-dark disabled:opacity-60">{busy === 'approve' ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}Approve</button>
        </div>
      )}>
      <div className="space-y-5">
        <div className="rounded-control border border-line bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">Change</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={statusKey(r.from)} /><ArrowRight className="size-4 text-muted rtl:rotate-180" aria-hidden="true" /><StatusBadge status={statusKey(r.to)} />
          </div>
        </div>
        {error && <ModalError kind={error.code === 'ALREADY_IN_STATE' ? 'warning' : 'error'}>{error.message}</ModalError>}
        <dl className="grid gap-4 sm:grid-cols-2">{rows.map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="mt-1 text-sm font-medium text-charcoal">{v}</dd></div>)}</dl>
        <div><p className="text-xs text-muted">Maker remarks</p><p className="mt-1 whitespace-pre-wrap rounded-control border border-line p-3 text-sm text-charcoal">{r.remarks}</p></div>
        <Link to={`/${r.target.kind === 'user' ? 'user' : 'account'}-controls/${r.cif}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-dark hover:underline">Open customer profile<ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></Link>
        {rejecting && (
          <div>
            <label htmlFor="reject-comment" className="text-sm font-semibold text-charcoal">Rejection comment <span aria-hidden="true" className="text-danger">*</span></label>
            <textarea id="reject-comment" data-autofocus rows={3} value={comment} disabled={!!busy} onChange={(e) => setComment(e.target.value)} aria-invalid={!!commentErr || undefined} aria-describedby={commentErr ? 'reject-err' : undefined}
              placeholder="Tell the maker why this was rejected" className={`mt-2 w-full resize-none rounded-control border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${commentErr ? 'border-danger' : 'border-line'}`} />
            <FieldError id="reject-err">{commentErr}</FieldError>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function ApprovalQueuePage() {
  const [rows, setRows] = useState<ControlRequest[] | null>(null);
  const [error, setError] = useState('');
  const [params, setParams] = useSearchParams();
  const openId = params.get('open');

  const load = useCallback(() => controls.listPending().then((r) => { setRows(r); setError(''); }, (e: Error) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const open = rows?.find((r) => r.id === openId) ?? null;
  const close = () => { const p = new URLSearchParams(params); p.delete('open'); setParams(p, { replace: true }); };

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary-600">Customer controls</p>
      <h1 className="mt-3 text-[28px] font-medium leading-9 text-charcoal">Approval queue</h1>
      <p className="mt-2 text-sm text-muted">Review block and unblock requests raised by makers. You can&rsquo;t approve a request you initiated.</p>

      <section aria-label="Pending requests" className="mt-6 rounded-card border border-line bg-white shadow-soft max-md:border-0 max-md:bg-transparent max-md:p-0 max-md:shadow-none">
        {error && (
          <div role="alert" className="m-4 flex flex-wrap items-center gap-3 rounded-control border border-danger/30 bg-danger-50 p-4 text-sm text-danger"><AlertCircle className="size-4" aria-hidden="true" /><p className="flex-1">{error}</p>
            <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-control border border-danger/30 bg-white px-3 py-1.5 text-xs font-semibold"><RotateCw className="size-3.5" aria-hidden="true" />Retry</button></div>
        )}
        {!rows && !error && <div role="status" className="space-y-3 p-6 max-md:p-0"><span className="sr-only">Loading requests…</span>{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-control bg-charcoal/5" />)}</div>}
        {rows && rows.length === 0 && <p className="px-6 py-14 text-center text-sm text-muted">No pending requests. You&rsquo;re all caught up.</p>}
        {rows && rows.length > 0 && (
          <table className={RT.table}>
            <caption className="sr-only">Pending approval requests</caption>
            <thead className={RT.thead}><tr className="border-b border-line">{['Request', 'Age', 'Maker', 'Action', 'Target', 'Reason', ''].map((h, i) => <th key={i} scope="col" className={RT.th}>{h || <span className="sr-only">Review</span>}</th>)}</tr></thead>
            <tbody className={RT.tbody}>
              {rows.map((r) => (
                <tr key={r.id} className={`${RT.tr} hover:bg-surface/60`}>
                  <td className={`${RT.tdMain} font-mono text-xs font-medium text-dark`}>REQ-{r.id}</td>
                  <td data-label="Age" className={RT.td}>{age(r.createdAt)}</td>
                  <td data-label="Maker" className={RT.td}><span className="inline-flex items-center gap-2"><Avatar name={r.makerName} size="sm" />{r.makerName}</span></td>
                  <td data-label="Action" className={RT.td}><span className={`font-medium ${isBlockAction(r.action) ? 'text-danger' : 'text-primary-600'}`}>{ACTION_LABEL[r.action]}</span></td>
                  <td data-label="Target" className={RT.td}><span className="md:block"><span className="block font-medium text-charcoal md:text-start">{r.customerName}</span><span className="block text-xs text-muted">{r.target.label}</span></span></td>
                  <td data-label="Reason" className={RT.td}>{r.reason}</td>
                  <td className={`${RT.tdMain} max-md:pb-0 max-md:pt-2 md:text-end`}>
                    <button type="button" onClick={() => setParams({ open: r.id })} aria-label={`Review REQ-${r.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-sm font-medium text-charcoal hover:bg-surface max-md:w-full max-md:justify-center">Review<ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      {open && <Detail key={open.id} r={open} onClose={close} onDone={() => { close(); load(); }} />}
    </div>
  );
}
