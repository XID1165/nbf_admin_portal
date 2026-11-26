import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Info, Lock, LockOpen, RotateCw, Search } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import { Approvals } from '../dashboard/OverviewCards';
import { ActionModal, type ActionTarget } from './ActionModal';
import { ActionMenu } from './AccountsTab';
import { StatusBadge } from './StatusBadge';
import { FieldError, useMessages } from '../messages/MessageProvider';
import { useAuth } from '../../context/AuthContext';
import type { Approval } from '../../services/dashboard';
import {
  ACTION_LABEL, SEARCH_TYPES, capsFor, controls, maskAccount, userActions,
  type ActionKind, type Customer, type ControlRequest, type SearchType, type TargetKind,
} from '../../services/controls';

type Tab = 'all' | 'active' | 'blocked' | 'pending';
const TABS: [Tab, string][] = [['all', 'All'], ['active', 'Active'], ['blocked', 'Blocked'], ['pending', 'Pending']];
const CARD = 'rounded-card border border-line bg-white shadow-[0_1px_2px_rgb(var(--dark)/0.04),0_8px_24px_-12px_rgb(var(--dark)/0.1)]';
const BLOCKED = new Set(['blocked', 'locked', 'full_block', 'debit_block', 'credit_block']);
const isType = (v: string | null): v is SearchType => SEARCH_TYPES.some((t) => t.value === v);
const money = (n: number, c: string) => `${c} ${n.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`;

interface Row {
  key: string; cif: string; name: string; sub: string; meta: string;
  status: string; detail?: string; pending: boolean;
  customer: Customer; target: ActionTarget; account?: Customer['accounts'][number];
}

export interface ControlsConfig { kind: TargetKind; eyebrow: string; title: string; description: string; noun: string; path: string }

/** Shared User controls / Account controls screen. The journey starts here: search, scan the list, act, or open the full profile. */
export function ControlsScreen({ cfg }: { cfg: ControlsConfig }) {
  const { session } = useAuth();
  const { toast } = useMessages();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<{ customers: Customer[]; pending: ControlRequest[] } | null>(null);
  const [tab, setTab] = useState<Tab>('all');
  const [modal, setModal] = useState<{ customer: Customer; target: ActionTarget; action: ActionKind } | null>(null);

  const type: SearchType = isType(params.get('type')) ? (params.get('type') as SearchType) : 'cif';
  const q = params.get('q') ?? '';
  const [draftType, setDraftType] = useState<SearchType>(type);
  const [draft, setDraft] = useState(q);
  const [fieldErr, setFieldErr] = useState('');
  const [found, setFound] = useState<{ s: 'idle' } | { s: 'loading' } | { s: 'done'; cifs: Set<string> } | { s: 'error'; message: string }>({ s: 'idle' });
  const seq = useRef(0);

  const reload = useCallback(() => controls.listAll().then(setData), []);
  useEffect(() => { setData(null); setTab('all'); reload(); }, [reload, cfg.kind]);

  const runSearch = useCallback((t: SearchType, query: string) => {
    const id = ++seq.current;
    setFound({ s: 'loading' });
    controls.search(t, query).then(
      (rows) => id === seq.current && setFound({ s: 'done', cifs: new Set(rows.map((r) => r.cif)) }),
      (e: Error) => id === seq.current && setFound({ s: 'error', message: e.message }),
    );
  }, []);
  useEffect(() => {
    setDraftType(type); setDraft(q);
    if (q.trim()) runSearch(type, q.trim()); else { seq.current++; setFound({ s: 'idle' }); }
  }, [type, q, runSearch, cfg.kind]);

  const caps = session ? capsFor(session.role) : { view: false, initiate: false, decide: false };
  const pendingFor = useMemo(() => new Set((data?.pending ?? []).filter((r) => r.target.kind === cfg.kind).map((r) => `${r.cif}|${r.target.id}`)), [data, cfg.kind]);

  const rows: Row[] = useMemo(() => (data?.customers ?? []).flatMap((c): Row[] => {
    if (cfg.kind === 'user') {
      const p = pendingFor.has(`${c.cif}|user`);
      return [{ key: c.cif, cif: c.cif, name: c.name, sub: `${c.user.username} · CIF ${c.cif}`, meta: `Last login: ${c.user.lastLogin}`, status: p ? 'pending' : c.user.status, detail: c.user.block?.reason, pending: p, customer: c, target: { kind: 'user', id: 'user' } }];
    }
    return c.accounts.map((a) => {
      const p = pendingFor.has(`${c.cif}|${a.id}`);
      return { key: `${c.cif}-${a.id}`, cif: c.cif, name: c.name, sub: `AE07 0380 ${maskAccount(a.number)} · ${a.type}`, meta: money(a.balance, a.currency), status: p ? 'pending' : a.status, detail: a.block?.reason, pending: p, customer: c, target: { kind: 'account', id: a.id }, account: a };
    });
  }), [data, cfg.kind, pendingFor]);

  if (!session) return null;
  const scoped = found.s === 'done' ? rows.filter((r) => found.cifs.has(r.cif)) : rows;
  const count = (t: Tab) => scoped.filter((r) => (t === 'all' ? true : t === 'active' ? r.status === 'active' : t === 'blocked' ? BLOCKED.has(r.status) : r.pending)).length;
  const shown = scoped.filter((r) => (tab === 'all' ? true : tab === 'active' ? r.status === 'active' : tab === 'blocked' ? BLOCKED.has(r.status) : r.pending));
  const stats: [string, number, string][] = [['Active', count('active'), 'bg-success'], ['Blocked', count('blocked'), 'bg-rose'], ['Pending approval', count('pending'), 'bg-gold']];

  const approvals: Approval[] = (data?.pending ?? []).filter((r) => r.target.kind === cfg.kind).map((r) => ({
    id: r.id, title: `${ACTION_LABEL[r.action]} ${cfg.noun} · ${r.customerName}${r.target.kind === 'account' ? ` · ${r.target.label}` : ''}`,
    reason: r.reason, maker: r.makerName, minutesAgo: Math.max(1, Math.round((Date.now() - new Date(r.createdAt).getTime()) / 60000)),
  }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) { setFieldErr('Enter a value to search.'); return; }
    setFieldErr('');
    if (draft.trim() === q && draftType === type) runSearch(type, q.trim());
    else setParams({ type: draftType, q: draft.trim() });
  }
  const clear = () => setParams({});
  const ctl = 'h-11 rounded-control border border-line bg-white px-3 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary';
  const profile = (r: Row) => `${cfg.path}/${r.cif}`;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary-600">{cfg.eyebrow}</p>
      <h1 className="mt-3 text-[28px] font-medium leading-9 text-charcoal">{cfg.title}</h1>
      <p className="mt-2 text-sm text-muted">{cfg.description}</p>
      {!caps.initiate && <p className="mt-2 text-xs font-medium text-muted">View-only access: you can search and review history{caps.decide ? ', and decide requests in the Approval queue' : ''}.</p>}

      <form onSubmit={onSubmit} role="search" aria-label={`Search ${cfg.noun}s`} className={`${CARD} mt-6 p-4 sm:p-5`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start">
          <div className="md:w-[190px]">
            <label htmlFor="search-type" className="sr-only">Search by</label>
            <select id="search-type" value={draftType} onChange={(e) => setDraftType(e.target.value as SearchType)} className={`${ctl} w-full`}>
              {SEARCH_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="search-q" className="sr-only">Search value</label>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted" aria-hidden="true" />
              <input id="search-q" value={draft} onChange={(e) => { setDraft(e.target.value); setFieldErr(''); }} placeholder={SEARCH_TYPES.find((t) => t.value === draftType)!.placeholder} autoComplete="off"
                aria-invalid={!!fieldErr || undefined} aria-describedby={fieldErr ? 'search-err' : undefined} className={`${ctl} w-full ps-10 ${fieldErr ? 'border-danger' : ''}`} />
            </div>
            <FieldError id="search-err">{fieldErr}</FieldError>
          </div>
          <button type="submit" disabled={found.s === 'loading'} className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-primary px-6 text-sm font-semibold text-white hover:bg-dark disabled:opacity-60"><Search className="size-4" aria-hidden="true" />Search</button>
          {q && <button type="button" onClick={clear} className="h-11 rounded-control px-3 text-sm font-medium text-muted hover:text-charcoal">Clear</button>}
        </div>
      </form>

      <dl className="mt-6 grid gap-6 sm:grid-cols-3">
        {stats.map(([label, n, bar]) => (
          <div key={label} className={`${CARD} flex items-center gap-4 px-6 py-5`}>
            <span aria-hidden="true" className={`h-8 w-[3px] rounded-full ${bar}`} />
            <div><dt className="text-xs text-muted">{label}</dt><dd className="text-[28px] font-semibold leading-8 text-charcoal">{data ? n : '–'}</dd></div>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,856fr)_minmax(0,416fr)] lg:items-start">
        <section aria-label={cfg.title} className={CARD}>
          <div className="p-6 pb-4">
            <div role="tablist" aria-label={`Filter ${cfg.noun}s`} className="inline-flex flex-wrap gap-1 rounded-card bg-surface p-1.5">
              {TABS.map(([k, label]) => {
                const on = tab === k;
                return <button key={k} type="button" role="tab" aria-selected={on} onClick={() => setTab(k)} className={`inline-flex h-8 items-center gap-2 rounded-control px-3 text-xs font-medium transition-colors ${on ? 'bg-white text-charcoal shadow-[0_1px_2px_rgb(var(--dark)/0.08)] ring-1 ring-line' : 'text-muted hover:text-charcoal'}`}>{label}<span className="text-muted/80">{data ? count(k) : '–'}</span></button>;
              })}
            </div>
          </div>

          {found.s === 'error' && (
            <div role="alert" className="mx-6 mb-4 flex flex-wrap items-center gap-3 rounded-control border border-danger/30 bg-danger-50 p-4 text-sm text-danger">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" /><p className="min-w-0 flex-1">{found.message}</p>
              <button type="button" onClick={() => runSearch(type, q.trim())} className="inline-flex items-center gap-1.5 rounded-control border border-danger/30 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-surface"><RotateCw className="size-3.5" aria-hidden="true" />Retry</button>
            </div>
          )}
          {found.s === 'done' && found.cifs.size === 0 && (
            <div role="status" className="mx-6 mb-4 flex items-start gap-3 rounded-control border border-primary/30 bg-primary-50 p-4 text-sm text-charcoal"><Info className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden="true" />No customers match &lsquo;{q}&rsquo;. Check the details and try again.</div>
          )}

          <ul aria-live="polite">
            {(!data || found.s === 'loading') && [0, 1, 2, 3].map((i) => <li key={i} className="border-t border-line px-6 py-5"><div className="h-10 animate-pulse rounded-control bg-charcoal/5" /></li>)}
            {data && found.s !== 'loading' && shown.map((r) => {
              const blocked = BLOCKED.has(r.status);
              const action = r.customer && cfg.kind === 'user' ? userActions(r.customer.user)[0] : null;
              const closed = r.account?.status === 'closed';
              const why = r.pending ? `A request is already pending for this ${cfg.noun}.` : undefined;
              return (
                <li key={r.key} className={`flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line px-6 py-4 ${closed ? 'bg-charcoal/[0.03] text-charcoal/50' : ''}`}>
                  <Link to={profile(r)} className="group flex min-w-[170px] flex-1 items-center gap-3 rounded-control" aria-label={`Open ${r.name} profile`}>
                    <Avatar name={r.name} size="xl" />
                    <span className="min-w-0"><span className="block truncate text-sm font-medium text-charcoal group-hover:text-primary-600 group-hover:underline">{r.name}</span><span className="mt-0.5 block truncate text-xs text-muted">{r.sub}</span></span>
                  </Link>
                  <p className="w-[120px] text-xs text-muted">{r.meta}</p>
                  <div className="w-[150px]">
                    <StatusBadge status={r.status as never} />
                    {blocked && r.detail && <p className="mt-1.5 text-[11px] text-muted">{r.detail}</p>}
                  </div>
                  <div className="flex min-w-[88px] items-center justify-end gap-2 max-sm:w-full max-sm:justify-start">
                    {caps.initiate && cfg.kind === 'user' && action && (
                      <Tooltip text={why}>{(p) => (
                        <button type="button" {...p} aria-disabled={r.pending || undefined} onClick={() => !r.pending && setModal({ customer: r.customer, target: r.target, action })}
                          className={`inline-flex h-9 items-center gap-1.5 rounded-control border bg-white px-3 text-sm font-medium aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${action === 'unblock' ? 'border-primary/40 text-primary-600 hover:bg-primary-50' : 'border-danger/40 text-danger hover:bg-danger-50'}`}>
                          {action === 'unblock' ? <LockOpen className="size-4" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}{action === 'unblock' ? 'Unblock' : 'Block'}
                        </button>)}
                      </Tooltip>
                    )}
                    {caps.initiate && cfg.kind === 'account' && r.account && (
                      <ActionMenu account={r.account} label={r.sub} disabledReason={closed ? 'Closed accounts can’t be modified.' : why} onPick={(a) => setModal({ customer: r.customer, target: r.target, action: a })} />
                    )}
                    {!caps.initiate && <Link to={profile(r)} className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-sm font-medium text-charcoal hover:bg-surface">View<ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></Link>}
                  </div>
                </li>
              );
            })}
            {data && found.s !== 'loading' && shown.length === 0 && !(found.s === 'done' && found.cifs.size === 0) && <li className="border-t border-line px-6 py-12 text-center text-sm text-muted">No {cfg.noun}s match this filter.</li>}
          </ul>
        </section>

        <Approvals items={approvals} onDecide={(id) => nav(`/controls/approvals?open=${id}`)} readOnly={!caps.decide}
          title="Pending approvals" subtitle={`${cfg.noun[0].toUpperCase()}${cfg.noun.slice(1)} requests from makers`} badge={false} empty="No requests are waiting for approval." />
      </div>

      {modal && (
        <ActionModal key={`${modal.customer.cif}-${modal.target.id}-${modal.action}`} customer={modal.customer} target={modal.target} action={modal.action} onClose={() => setModal(null)}
          onSubmitted={(r) => { setModal(null); toast(`${ACTION_LABEL[r.action]} request submitted for approval. Reference REQ-${r.id}.`); reload(); }}
          onRefresh={() => { const cif = modal.customer.cif; setModal(null); controls.refresh(cif).then(reload); }} />
      )}
    </div>
  );
}
